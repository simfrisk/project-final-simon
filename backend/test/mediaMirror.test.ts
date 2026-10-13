// The nightly media mirror: media bucket to <backup bucket>/media-mirror/ (local MinIO, two scoped users).
import assert from "node:assert/strict"
import crypto from "crypto"
import { after, before, describe, it } from "node:test"
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { dropDatabase, haveBackupEnv, haveS3Env, MIB, RUN_ID, startServer, testPrefix } from "./helpers"

const PREFIX = testPrefix("mirrortest")
const BACKUP_PREFIX = `mirrortest-${RUN_ID}`
const ENABLED = haveS3Env() && haveBackupEnv()

// config reads the environment once, when it is first imported, so these are set before the dynamic require below.
process.env.BACKUP_PREFIX = BACKUP_PREFIX
process.env.MEDIA_MIRROR_ENABLED = "true"
process.env.BACKUP_RETENTION_DAYS = "30"

describe("media mirror", { skip: !ENABLED && "S3 settings are not set" }, () => {
  const client = (endpoint: string, accessKeyId: string, secretAccessKey: string): S3Client =>
    new S3Client({
      endpoint,
      region: "us-east-1",
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    })
  const media = ENABLED
    ? client(process.env.MEDIA_S3_ENDPOINT as string, process.env.MEDIA_S3_ACCESS_KEY as string, process.env.MEDIA_S3_SECRET_KEY as string)
    : (null as unknown as S3Client)
  const backups = ENABLED
    ? client(process.env.BACKUP_S3_ENDPOINT as string, process.env.BACKUP_S3_ACCESS_KEY as string, process.env.BACKUP_S3_SECRET_KEY as string)
    : (null as unknown as S3Client)
  const mediaBucket = process.env.MEDIA_S3_BUCKET as string
  const backupBucket = process.env.BACKUP_S3_BUCKET as string

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mirrorModule = (): typeof import("../src/ops/mediaMirror") => require("../dist/ops/mediaMirror")

  const small = crypto.randomBytes(100 * 1024)
  const large = crypto.randomBytes(20 * MIB)
  const sha = (data: Buffer): string => crypto.createHash("sha256").update(data).digest("hex")

  const readMirror = async (key: string): Promise<Buffer | null> => {
    try {
      const object = await backups.send(new GetObjectCommand({ Bucket: backupBucket, Key: `media-mirror/${key}` }))
      return Buffer.from((await object.Body?.transformToByteArray()) ?? [])
    } catch {
      return null
    }
  }

  before(async () => {
    await media.send(
      new PutObjectCommand({ Bucket: mediaBucket, Key: `${PREFIX}small.jpg`, Body: small, ContentType: "image/jpeg", CacheControl: "public, max-age=31536000, immutable" })
    )
    // Uploaded in parts, so its ETag is not an md5 and the mirror cannot rely on ETags.
    await new Upload({
      client: media,
      params: { Bucket: mediaBucket, Key: `${PREFIX}large.mp4`, Body: large, ContentType: "video/mp4" },
      partSize: 8 * MIB,
    }).done()
  })

  after(async () => {
    for (const key of [`${PREFIX}small.jpg`, `${PREFIX}large.mp4`, `${PREFIX}later.png`, `${PREFIX}back.png`]) {
      await media.send(new DeleteObjectCommand({ Bucket: mediaBucket, Key: key })).catch(() => undefined)
      await backups.send(new DeleteObjectCommand({ Bucket: backupBucket, Key: `media-mirror/${key}` })).catch(() => undefined)
    }
    for (const name of ["media-mirror-status.json", "media-mirror-missing.json"]) {
      await backups.send(new DeleteObjectCommand({ Bucket: backupBucket, Key: `${BACKUP_PREFIX}/${name}` })).catch(() => undefined)
    }
  })

  it("copies every object, byte for byte, with its content type", async () => {
    const { runMediaMirror, mediaMirrorStatus } = mirrorModule()
    const report = await runMediaMirror({ scope: PREFIX })
    assert.equal(report.failed, 0)
    assert.ok(report.copied >= 2)
    assert.equal(sha((await readMirror(`${PREFIX}small.jpg`)) as Buffer), sha(small))
    assert.equal(sha((await readMirror(`${PREFIX}large.mp4`)) as Buffer), sha(large))

    const copy = await backups.send(new HeadObjectCommand({ Bucket: backupBucket, Key: `media-mirror/${PREFIX}small.jpg` }))
    assert.equal(copy.ContentType, "image/jpeg")
    assert.equal(copy.CacheControl, "public, max-age=31536000, immutable")

    assert.equal(mediaMirrorStatus.lastStatus, "ok")
    assert.ok(mediaMirrorStatus.lastSuccessAt)
    assert.equal(mediaMirrorStatus.objects, report.mediaObjects)
    assert.ok(mediaMirrorStatus.bytes >= small.length + large.length)
  })

  it("a second run copies nothing and a new object is picked up", async () => {
    const { runMediaMirror } = mirrorModule()
    const again = await runMediaMirror({ scope: PREFIX })
    assert.equal(again.copied, 0)
    assert.equal(again.alreadyMirrored, again.mediaObjects)

    await media.send(new PutObjectCommand({ Bucket: mediaBucket, Key: `${PREFIX}later.png`, Body: Buffer.from("png"), ContentType: "image/png" }))
    const third = await runMediaMirror({ scope: PREFIX })
    assert.equal(third.copied, 1)
    assert.equal((await readMirror(`${PREFIX}later.png`))?.toString(), "png")
  })

  it("an object deleted from media is kept for the full retention window counted from the run that saw it missing", async () => {
    const { runMediaMirror } = mirrorModule()
    const day = 24 * 3600 * 1000
    const t0 = Date.now()
    // Mirrored long ago (the first run), and only deleted from media much later.
    await media.send(new PutObjectCommand({ Bucket: mediaBucket, Key: `${PREFIX}later.png`, Body: Buffer.from("png"), ContentType: "image/png" }))
    await runMediaMirror({ scope: PREFIX, now: t0 })
    assert.ok(await readMirror(`${PREFIX}later.png`))

    await media.send(new DeleteObjectCommand({ Bucket: mediaBucket, Key: `${PREFIX}later.png` }))

    // 40 days after it was mirrored it is first seen missing. Its age as a mirror copy must not matter.
    const first = await runMediaMirror({ scope: PREFIX, now: t0 + 40 * day })
    assert.equal(first.pruned, 0)
    assert.ok(await readMirror(`${PREFIX}later.png`), "still mirrored right after the delete")

    assert.equal((await runMediaMirror({ scope: PREFIX, now: t0 + 69 * day })).pruned, 0, "29 days after it went missing")
    assert.ok(await readMirror(`${PREFIX}later.png`))

    // The clock is stored, so a fresh process would see the same date.
    const stored = await backups.send(new GetObjectCommand({ Bucket: backupBucket, Key: `${BACKUP_PREFIX}/media-mirror-missing.json` }))
    assert.ok(JSON.parse((await stored.Body?.transformToString()) ?? "{}").since[`${PREFIX}later.png`])

    const last = await runMediaMirror({ scope: PREFIX, now: t0 + 71 * day })
    assert.equal(last.pruned, 1, "past the window")
    assert.equal(await readMirror(`${PREFIX}later.png`), null)
    assert.ok(await readMirror(`${PREFIX}small.jpg`), "present in media, so kept")
  })

  it("an object that comes back into media stops its clock", async () => {
    const { runMediaMirror } = mirrorModule()
    const day = 24 * 3600 * 1000
    const t0 = Date.now()
    await media.send(new PutObjectCommand({ Bucket: mediaBucket, Key: `${PREFIX}back.png`, Body: Buffer.from("b"), ContentType: "image/png" }))
    await runMediaMirror({ scope: PREFIX, now: t0 })
    await media.send(new DeleteObjectCommand({ Bucket: mediaBucket, Key: `${PREFIX}back.png` }))
    await runMediaMirror({ scope: PREFIX, now: t0 + 10 * day })
    await media.send(new PutObjectCommand({ Bucket: mediaBucket, Key: `${PREFIX}back.png`, Body: Buffer.from("b"), ContentType: "image/png" }))
    await runMediaMirror({ scope: PREFIX, now: t0 + 20 * day })
    await media.send(new DeleteObjectCommand({ Bucket: mediaBucket, Key: `${PREFIX}back.png` }))
    await runMediaMirror({ scope: PREFIX, now: t0 + 21 * day })
    // 31 days after the first miss but only 10 after the second, so it must still be there.
    assert.equal((await runMediaMirror({ scope: PREFIX, now: t0 + 31 * day })).pruned, 0)
    assert.ok(await readMirror(`${PREFIX}back.png`))
    assert.equal((await runMediaMirror({ scope: PREFIX, now: t0 + 52 * day })).pruned, 1)
  })

  it("health shows the mirror state loaded from the status file at boot", async () => {
    const server = await startServer({
      MEDIA_STORAGE: "cloudinary",
      MEDIA_MIRROR_ENABLED: "true",
      BACKUP_PREFIX,
    })
    try {
      let body: any
      for (let i = 0; i < 20; i++) {
        body = await (await fetch(`${server.url}/health`)).json()
        if (body.media.mirror.lastStatus === "ok") break
        await new Promise((resolve) => setTimeout(resolve, 150))
      }
      assert.equal(body.media.provider, "cloudinary")
      assert.equal(body.media.mirror.enabled, true)
      assert.equal(body.media.mirror.lastStatus, "ok")
      assert.equal(body.media.mirror.note, null)
      assert.ok(body.media.mirror.objects >= 2)
    } finally {
      await server.stop()
      await dropDatabase(server.mongoUrl)
    }
  })

  it("never lists more than the app needs: the backup user cannot read the media bucket", async () => {
    await assert.rejects(
      backups.send(new ListObjectsV2Command({ Bucket: mediaBucket })),
      (error: { name?: string }) => error.name === "AccessDenied"
    )
  })
})
