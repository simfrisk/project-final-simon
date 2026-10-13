// URL rewrite (blueprint B2-10): forward, reverse, idempotent, dry run, edited values left alone.
// Local MongoDB and a local MinIO for the mapping and the pre-rewrite backups.
import assert from "node:assert/strict"
import crypto from "crypto"
import { after, before, describe, it } from "node:test"
import { spawnSync } from "child_process"
import path from "path"
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { MongoClient, ObjectId } from "mongodb"
import { BACKEND_DIR, dropDatabase, freshMongoUrl, haveBackupEnv, startServer } from "./helpers"

const ENABLED = haveBackupEnv()
const BASE = "https://media.example.test/classync-media"
const MONGO_URL = freshMongoUrl()
const PREFIX = "rewritetest"

// config reads the environment once, when it is first imported.
process.env.MONGO_URL = MONGO_URL
process.env.MEDIA_PUBLIC_BASE_URL = BASE
process.env.BACKUP_PREFIX = PREFIX

const cloud = (kind: string, rest: string): string => `https://res.cloudinary.com/demo/${kind}/upload/${rest}`

const videos = [0, 1, 2].map((i) => cloud("video", `v17000000${i}/videos/vid${i}.mp4`))
const thumbs = [0, 1, 2].map((i) => cloud("video", `so_3,w_600,h_400,c_fill/v17000000${i}/videos/vid${i}.jpg`))
const avatars = [0, 1].map((i) => cloud("image", `v18000000${i}/profile_pictures/pic${i}.png`))
const defaultAvatar = cloud("image", "w_100,h_100,c_fill/v1754899421/profile_pictures/default.png")

const entry = (field: string, oldUrl: string, key: string) => ({
  field,
  oldUrl,
  sourceUrl: oldUrl,
  key,
  newUrl: `${BASE}/${key}`,
  bytes: 1,
  sha256: "0".repeat(64),
  contentType: "x/y",
  docIds: [],
})

const mapping = {
  version: 1,
  createdAt: "2026-10-20T08:00:00.000Z",
  sourceBackup: "prod/2026-10-20T07-00-00Z",
  mediaBaseUrl: BASE,
  entries: [
    ...videos.map((url, i) => entry("projects.video", url, `migrated/videos/vid${i}.mp4`)),
    ...thumbs.map((url, i) => entry("projects.thumbnail", url, `migrated/thumbnails/videos/vid${i}.jpg`)),
    ...avatars.map((url, i) => entry("users.profileImage", url, `migrated/profile_pictures/pic${i}.png`)),
    entry("users.profileImage", defaultAvatar, "defaults/avatar-100.png"),
    entry("code.defaultProfileImage", defaultAvatar, "defaults/avatar-100.png"),
  ],
}

describe("rewrite media urls", { skip: !ENABLED && "BACKUP_S3_* is not set" }, () => {
  const s3 = ENABLED
    ? new S3Client({
        endpoint: process.env.BACKUP_S3_ENDPOINT,
        region: "us-east-1",
        forcePathStyle: true,
        credentials: { accessKeyId: process.env.BACKUP_S3_ACCESS_KEY as string, secretAccessKey: process.env.BACKUP_S3_SECRET_KEY as string },
        requestChecksumCalculation: "WHEN_REQUIRED",
        responseChecksumValidation: "WHEN_REQUIRED",
      })
    : (null as unknown as S3Client)
  const bucket = process.env.BACKUP_S3_BUCKET as string
  const mappingPath = `phase2/rewrite-test-${crypto.randomBytes(3).toString("hex")}/mapping.json`
  let mongo: MongoClient
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ops = () => require("../dist/ops/rewriteMedia") as typeof import("../src/ops/rewriteMedia")
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bson = () => require("../dist/ops/bsonTools") as typeof import("../src/ops/bsonTools")

  const putMapping = async (value: unknown, key = mappingPath): Promise<void> => {
    await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: JSON.stringify(value), ContentType: "application/json" }))
  }

  const canonicalHash = async (collection: string): Promise<string> => {
    const raw = (await mongo.db().collection(collection).find({}, { raw: true }).sort({ _id: 1 }).toArray()) as unknown as Buffer[]
    return crypto.createHash("sha256").update(raw.map((doc) => bson().canonicalJson(doc)).join("\n")).digest("hex")
  }

  const seed = async (): Promise<void> => {
    const db = mongo.db()
    await db.dropDatabase()
    const owner = new ObjectId()
    await db.collection("projects").insertMany(
      videos.map((video, i) => ({ _id: new ObjectId(), projectName: `P${i}`, video, thumbnail: thumbs[i], projectCreatedBy: owner }))
    )
    // Two projects share a video url as well, and one project has no media at all.
    await db.collection("projects").insertOne({ _id: new ObjectId(), projectName: "Shared", video: videos[0], thumbnail: thumbs[0], projectCreatedBy: owner })
    await db.collection("projects").insertOne({ _id: new ObjectId(), projectName: "Empty", video: "", thumbnail: "", projectCreatedBy: owner })
    await db.collection("users").insertMany([
      { _id: new ObjectId(), name: "A", profileImage: avatars[0] },
      { _id: new ObjectId(), name: "B", profileImage: avatars[1] },
      ...[0, 1, 2, 3, 4].map((i) => ({ _id: new ObjectId(), name: `D${i}`, profileImage: defaultAvatar })),
    ])
    await db.collection("comments").insertMany([
      { _id: new ObjectId(), text: "plain" },
      { _id: new ObjectId(), text: `look at ${videos[0]}` },
    ])
  }

  before(async () => {
    mongo = new MongoClient(MONGO_URL)
    await mongo.connect()
    await seed()
    await putMapping(mapping)
  })

  after(async () => {
    await mongo?.close()
    await dropDatabase(MONGO_URL)
    const listed = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: "phase2/rewrite-test-" }))
    for (const item of listed.Contents ?? []) await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: item.Key as string }))
    for (const prefix of [`${PREFIX}/`]) {
      const reports = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }))
      for (const item of reports.Contents ?? []) await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: item.Key as string }))
    }
  })

  const field = (report: any, name: string) => report.fields.find((f: any) => f.field === name)

  it("a dry run counts matches, changes nothing and writes no backup", async () => {
    const before = [await canonicalHash("projects"), await canonicalHash("users"), await canonicalHash("comments")]
    const report = await ops().rewriteMediaUrls({ mapping: mappingPath, direction: "forward", dryRun: true })

    assert.equal(report.dryRun, true)
    assert.equal(report.preRewriteBackup, null)
    assert.equal(field(report, "projects.video").matched, 4, "three projects plus the shared one")
    assert.equal(field(report, "projects.thumbnail").matched, 4)
    assert.equal(field(report, "users.profileImage").matched, 7)
    for (const f of report.fields) {
      assert.equal(f.changed, 0)
      assert.equal(f.alreadyDone, 0)
      assert.deepEqual(f.unmapped, [])
    }
    assert.deepEqual(report.cloudinaryStringsLeft, { comments: 1, projects: 4, users: 7 })
    assert.deepEqual(before, [await canonicalHash("projects"), await canonicalHash("users"), await canonicalHash("comments")])

    const folders = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: mappingPath.replace("mapping.json", "") }))
    assert.deepEqual((folders.Contents ?? []).map((item) => item.Key), [mappingPath], "no pre-rewrite folder")
  })

  it("a real forward run rewrites, backs up first, and a second run changes nothing", async () => {
    const dir = mappingPath.replace("mapping.json", "")
    const report = await ops().rewriteMediaUrls({ mapping: mappingPath, direction: "forward", dryRun: false })

    assert.equal(report.preRewriteBackup, `${dir}pre-rewrite`)
    assert.equal(field(report, "projects.video").changed, 4)
    assert.equal(field(report, "projects.thumbnail").changed, 4)
    assert.equal(field(report, "users.profileImage").changed, 7)
    assert.deepEqual(report.cloudinaryStringsLeft, { comments: 1, projects: 0, users: 0 }, "the comment text is not a media field")

    const projects = await mongo.db().collection("projects").find({}).toArray()
    assert.ok(projects.every((p) => !String(p.video).includes("cloudinary") && !String(p.thumbnail).includes("cloudinary")))
    assert.ok(projects.some((p) => p.video === `${BASE}/migrated/videos/vid0.mp4`))
    const dflt = await mongo.db().collection("users").countDocuments({ profileImage: `${BASE}/defaults/avatar-100.png` })
    assert.equal(dflt, 5)

    // The pre-rewrite backup has a manifest and the data as it was before.
    const backup = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `${dir}pre-rewrite/` }))
    const names = (backup.Contents ?? []).map((item) => item.Key as string)
    assert.ok(names.includes(`${dir}pre-rewrite/manifest.json`))
    assert.ok(names.includes(`${dir}pre-rewrite/projects.bson.gz`))
    const latest = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `${PREFIX}/latest.json` }))
    assert.equal((latest.Contents ?? []).length, 0, "latest.json is not pointed at a pre-rewrite backup")

    const second = await ops().rewriteMediaUrls({ mapping: mappingPath, direction: "forward", dryRun: false })
    for (const f of second.fields) {
      assert.equal(f.matched, 0)
      assert.equal(f.changed, 0)
    }
    assert.equal(field(second, "projects.video").alreadyDone, 4)
    assert.equal(field(second, "users.profileImage").alreadyDone, 7)
    assert.notEqual(second.preRewriteBackup, `${dir}pre-rewrite`, "the first backup is never overwritten")
    assert.match(second.preRewriteBackup as string, new RegExp(`^${dir}pre-rewrite-forward-`))
  })

  it("reverse restores byte identical documents", async () => {
    await seed()
    const before = [await canonicalHash("projects"), await canonicalHash("users"), await canonicalHash("comments")]
    await ops().rewriteMediaUrls({ mapping: mappingPath, direction: "forward", dryRun: false })
    assert.notEqual(before[0], await canonicalHash("projects"))

    const reverse = await ops().rewriteMediaUrls({ mapping: mappingPath, direction: "reverse", dryRun: false })
    assert.equal(field(reverse, "projects.video").changed, 4)
    assert.equal(field(reverse, "users.profileImage").changed, 7)
    assert.deepEqual(before, [await canonicalHash("projects"), await canonicalHash("users"), await canonicalHash("comments")])

    const again = await ops().rewriteMediaUrls({ mapping: mappingPath, direction: "reverse", dryRun: true })
    assert.equal(field(again, "projects.video").matched, 0)
    assert.equal(field(again, "projects.video").alreadyDone, 4, "already holding the old value")
  })

  it("a document edited in the meantime is left alone and shows up as unmapped when it is a Cloudinary url", async () => {
    await seed()
    const projects = mongo.db().collection("projects")
    const edited = cloud("video", "v1999999999/videos/edited-by-hand.mp4")
    await projects.updateOne({ projectName: "P1" }, { $set: { video: edited } })
    await projects.updateOne({ projectName: "P2" }, { $set: { video: "https://elsewhere.example/clip.mp4" } })

    const report = await ops().rewriteMediaUrls({ mapping: mappingPath, direction: "forward", dryRun: false })
    const video = field(report, "projects.video")
    assert.equal(video.matched, 2, "P0 and the shared project only")
    assert.equal(video.changed, 2)
    assert.deepEqual(video.unmapped, [edited])
    assert.equal((await projects.findOne({ projectName: "P1" }))?.video, edited)
    assert.equal((await projects.findOne({ projectName: "P2" }))?.video, "https://elsewhere.example/clip.mp4")
    assert.deepEqual(field(report, "projects.thumbnail").unmapped, [])
  })

  it("refuses a bad mapping", async () => {
    const bad = async (value: unknown, expected: RegExp, key = `phase2/rewrite-test-bad-${crypto.randomBytes(3).toString("hex")}/mapping.json`) => {
      await putMapping(value, key)
      await assert.rejects(ops().rewriteMediaUrls({ mapping: key, direction: "forward", dryRun: true }), expected)
    }
    await bad({ ...mapping, version: 2 }, /version 1/)
    await bad({ ...mapping, entries: [entry("projects.video", videos[0], "k.mp4"), { ...entry("projects.video", videos[0], "k2.mp4") }] }, /duplicate oldUrl/)
    await bad({ ...mapping, entries: [entry("projects.video", videos[0], "k.mp4"), entry("projects.video", videos[1], "k.mp4")] }, /duplicate newUrl/)
    await bad({ ...mapping, entries: [{ ...entry("projects.video", videos[0], "k.mp4"), newUrl: "https://evil.example/k.mp4" }] }, /outside MEDIA_PUBLIC_BASE_URL/)
    await bad({ ...mapping, entries: [{ ...entry("projects.video", `${BASE}/already.mp4`, "k.mp4") }] }, /already a media URL/)

    await assert.rejects(ops().rewriteMediaUrls({ mapping: "somewhere/mapping.json", direction: "forward", dryRun: true }), /under phase2/)
    await assert.rejects(ops().rewriteMediaUrls({ mapping: "phase2/../x.json", direction: "forward", dryRun: true }), /valid backup path/)
    await assert.rejects(ops().rewriteMediaUrls({ mapping: "phase2/missing/mapping.json", direction: "forward", dryRun: true }))
  })

  it("refuses to run against an Atlas connection string", () => {
    const script = `require(${JSON.stringify(path.join(BACKEND_DIR, "dist/ops/rewriteMedia"))}).rewriteMediaUrls({ mapping: ${JSON.stringify(mappingPath)}, direction: "forward", dryRun: true }).then(() => process.exit(0), (e) => { console.log(e.message); process.exit(3) })`
    const result = spawnSync(process.execPath, ["-e", script], {
      cwd: BACKEND_DIR,
      env: { ...process.env, MONGO_URL: "mongodb+srv://user:pw@cluster0.mongodb.net/final-project" },
    })
    assert.equal(result.status, 3)
    assert.match(result.stdout.toString(), /Atlas/)
  })

  describe("the ops route", () => {
    const token = "t".repeat(64)
    let server: Awaited<ReturnType<typeof startServer>>
    before(async () => {
      await seed()
      server = await startServer({ MONGO_URL, OPS_ENABLED: "true", OPS_TOKEN: token, BACKUP_PREFIX: PREFIX, MEDIA_PUBLIC_BASE_URL: BASE, MEDIA_STORAGE: "cloudinary" })
    })
    after(async () => {
      await server?.stop()
    })

    const post = async (body: unknown, headers: Record<string, string> = { "x-ops-token": token }) => {
      const response = await fetch(`${server.url}/ops/rewrite-media-urls`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
      })
      return { status: response.status, body: (await response.json()) as any }
    }

    it("needs the ops token", async () => {
      assert.equal((await post({}, {})).status, 401)
      assert.equal((await post({}, { "x-ops-token": "wrong" })).status, 401)
    })

    it("validates its body and demands a confirmation for a real run", async () => {
      const ok = { mapping: mappingPath, direction: "forward", dryRun: true, targetUrlEnv: "MONGO_URL" }
      assert.equal((await post({ ...ok, mapping: undefined })).status, 400)
      assert.equal((await post({ ...ok, direction: "sideways" })).status, 400)
      assert.equal((await post({ ...ok, dryRun: "true" })).status, 400)
      assert.equal((await post({ ...ok, targetUrlEnv: "MONGO_URL_PROD" })).status, 400)
      const unconfirmed = await post({ ...ok, dryRun: false })
      assert.equal(unconfirmed.status, 400)
      assert.match(unconfirmed.body.message, /confirm/)
      assert.equal((await post({ ...ok, dryRun: false, confirm: "yes" })).status, 400)
    })

    it("a dry run answers 200 with the report and stores it next to the backups", async () => {
      const { status, body } = await post({ mapping: mappingPath, direction: "forward", dryRun: true, targetUrlEnv: "MONGO_URL" })
      assert.equal(status, 200)
      assert.equal(body.response.command, "rewrite-media-urls")
      assert.equal(body.response.ok, true)
      assert.equal(body.response.details.fields.length, 3)
      assert.equal(body.response.details.fields[0].matched, 4)
      const reports = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `${PREFIX}/reports/` }))
      assert.ok((reports.Contents ?? []).some((item) => item.Key?.endsWith("-rewrite-media-urls.json")))
    })

    it("a real run with the confirmation changes the data", async () => {
      const { status, body } = await post({ mapping: mappingPath, direction: "forward", dryRun: false, targetUrlEnv: "MONGO_URL", confirm: "rewrite-media-urls" })
      assert.equal(status, 200)
      assert.equal(body.response.details.fields[0].changed, 4)
      assert.equal(await mongo.db().collection("projects").countDocuments({ video: `${BASE}/migrated/videos/vid0.mp4` }), 2)
    })

    it("a missing mapping is a 500 with ok false", async () => {
      const { status, body } = await post({ mapping: "phase2/nothing-here/mapping.json", direction: "forward", dryRun: true, targetUrlEnv: "MONGO_URL" })
      assert.equal(status, 500)
      assert.equal(body.response.ok, false)
    })
  })

  it("the report names no connection string", async () => {
    const reports = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `${PREFIX}/reports/` }))
    for (const item of reports.Contents ?? []) {
      const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: item.Key as string }))
      const text = await object.Body?.transformToString()
      assert.ok(!/mongodb(\+srv)?:\/\//i.test(text ?? ""))
    }
  })
})
