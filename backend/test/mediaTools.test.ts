// The Mac side media tooling (media-inventory, media-copy, media-default-avatar, media-verify) against a fake
// Cloudinary served from this file and the local MinIO. Cloudinary itself is never contacted.
import assert from "node:assert/strict"
import crypto from "crypto"
import fs from "fs"
import http from "http"
import path from "path"
import zlib from "zlib"
import { after, before, describe, it } from "node:test"
import { execFile, spawnSync } from "child_process"
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { BSON, ObjectId } from "mongodb"
import { BACKEND_DIR, haveBackupEnv, haveS3Env, makeRealJpeg, makeRealMp4, makeRealPng, makeScratchDir } from "./helpers"

const ENABLED = haveS3Env() && haveBackupEnv()
const PREFIX = "copytest/"
const CLOUD = "dgr7l5nsx"
const API_KEY = "fake-key"
const API_SECRET = "fake-secret"

// config reads the environment once, so everything is set before the first require of anything in dist.
process.env.CLOUDINARY_CLOUD_NAME = CLOUD
process.env.CLOUDINARY_API_KEY = API_KEY
process.env.CLOUDINARY_API_SECRET = API_SECRET
process.env.MEDIA_FOLDER_PREFIX = PREFIX
process.env.BACKUP_PREFIX = "copytest-backups"

interface Asset {
  publicId: string
  type: "image" | "video"
  format: string
  created: string
  width?: number
  height?: number
  original: Buffer
  // What a transformation request returns: keyed by a marker found in the URL.
  renditions?: Record<string, Buffer>
}

const sh = (command: string, args: string[]): void => {
  const result = spawnSync(command, args)
  if (result.status !== 0) throw new Error(`${command} failed: ${result.stderr}`)
}

describe("media tooling", { skip: !ENABLED && "S3 settings are not set" }, () => {
  const dir = ENABLED ? makeScratchDir() : ""
  const dumpDir = path.join(dir, "dump")
  const outDir = path.join(dir, "out")
  const registry = new Map<string, Asset>()
  const requests: { method: string; url: string }[] = []
  let server: http.Server
  let base = ""
  let s3: S3Client
  let backups: S3Client
  const bucket = process.env.MEDIA_S3_BUCKET as string
  const backupBucket = process.env.BACKUP_S3_BUCKET as string
  const mediaBase = process.env.MEDIA_PUBLIC_BASE_URL as string

  const videoUrl = (publicId: string, ext = "mp4"): string => `https://res.cloudinary.com/${CLOUD}/video/upload/v1700000000/${publicId}.${ext}`
  const thumbUrl = (publicId: string): string => `https://res.cloudinary.com/${CLOUD}/video/upload/so_3,w_600,h_400,c_fill/v1700000000/${publicId}.jpg`
  const imageUrl = (publicId: string, ext: string): string => `https://res.cloudinary.com/${CLOUD}/image/upload/v1700000000/${publicId}.${ext}`
  const DEFAULT_URL = `https://res.cloudinary.com/${CLOUD}/image/upload/w_100,h_100,c_fill/v1754899421/profile_pictures/wtvbkvjnxrbdzfvjcmbi.png`
  const DEMO_ID = "videos/yhzdf7phuo0a0udgm40d"

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const inventoryModule = () => require("../dist/ops/mediaInventory") as typeof import("../src/ops/mediaInventory")
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const copyModule = () => require("../dist/ops/mediaCopy") as typeof import("../src/ops/mediaCopy")
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const cloudinaryModule = () => require("../dist/ops/cloudinary") as typeof import("../src/ops/cloudinary")

  const add = (asset: Asset): void => void registry.set(`${asset.type}/${asset.publicId}`, asset)

  const writeBson = (name: string, docs: Record<string, unknown>[]): void => {
    const body = Buffer.concat(docs.map((doc) => Buffer.from(BSON.serialize(doc))))
    fs.writeFileSync(path.join(dumpDir, `${name}.bson.gz`), zlib.gzipSync(body))
  }

  const sha = (data: Buffer): string => crypto.createHash("sha256").update(data).digest("hex")

  const startFakeCloudinary = (): Promise<void> =>
    new Promise((resolve) => {
      server = http.createServer((req, res) => {
        requests.push({ method: req.method ?? "", url: req.url ?? "" })
        const url = new URL(req.url ?? "/", "http://fake")

        if (url.pathname.startsWith(`/v1_1/${CLOUD}/resources/`)) {
          const expected = `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString("base64")}`
          if (req.headers.authorization !== expected) {
            res.writeHead(401).end("{}")
            return
          }
          const type = url.pathname.split("/")[4]
          const all = [...registry.values()].filter((asset) => asset.type === type).sort((a, b) => (a.publicId < b.publicId ? -1 : 1))
          const start = Number(url.searchParams.get("next_cursor") || 0)
          const pageSize = 4
          const page = all.slice(start, start + pageSize).map((asset) => ({
            public_id: asset.publicId,
            resource_type: asset.type,
            type: "upload",
            format: asset.format,
            bytes: asset.original.length,
            created_at: asset.created,
            width: asset.width,
            height: asset.height,
            secure_url: `https://res.cloudinary.com/${CLOUD}/${asset.type}/upload/v1700000000/${asset.publicId}.${asset.format}`,
          }))
          const body: Record<string, unknown> = { resources: page }
          if (start + pageSize < all.length) body.next_cursor = String(start + pageSize)
          res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(body))
          return
        }

        // Delivery: /<cloud>/<resource type>/upload/...
        const parsed = cloudinaryModule().parseCloudinaryUrl(`https://res.cloudinary.com${url.pathname}`)
        const asset = parsed ? registry.get(`${parsed.resourceType}/${parsed.publicId}`) : undefined
        if (!parsed || !asset) {
          res.writeHead(404).end()
          return
        }
        let body = asset.original
        for (const [marker, rendition] of Object.entries(asset.renditions ?? {})) {
          if (parsed.transformation.includes(marker)) body = rendition
        }
        const contentType =
          parsed.resourceType === "video" ? (parsed.transformation.includes("so_3") || parsed.format === "jpg" ? "image/jpeg" : "video/mp4") : parsed.format === "png" ? "image/png" : parsed.format === "webp" ? "image/webp" : "image/jpeg"
        res.writeHead(200, { "Content-Type": contentType, "Content-Length": body.length }).end(body)
      })
      server.listen(0, "127.0.0.1", () => {
        base = `http://127.0.0.1:${(server.address() as { port: number }).port}`
        process.env.CLOUDINARY_API_BASE = base
        process.env.CLOUDINARY_DELIVERY_OVERRIDE = base
        resolve()
      })
    })

  const deleteAll = async (client: S3Client, name: string, prefix: string): Promise<void> => {
    const listed = await client.send(new ListObjectsV2Command({ Bucket: name, Prefix: prefix }))
    for (const item of listed.Contents ?? []) await client.send(new DeleteObjectCommand({ Bucket: name, Key: item.Key as string })).catch(() => undefined)
  }

  const projects: Record<string, unknown>[] = []
  const users: Record<string, unknown>[] = []
  const files: Record<string, Buffer> = {}

  before(async () => {
    fs.mkdirSync(dumpDir, { recursive: true })
    fs.mkdirSync(outDir, { recursive: true })
    s3 = new S3Client({
      endpoint: process.env.MEDIA_S3_ENDPOINT,
      region: "us-east-1",
      forcePathStyle: true,
      credentials: { accessKeyId: process.env.MEDIA_S3_ACCESS_KEY as string, secretAccessKey: process.env.MEDIA_S3_SECRET_KEY as string },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    })
    backups = new S3Client({
      endpoint: process.env.BACKUP_S3_ENDPOINT,
      region: "us-east-1",
      forcePathStyle: true,
      credentials: { accessKeyId: process.env.BACKUP_S3_ACCESS_KEY as string, secretAccessKey: process.env.BACKUP_S3_SECRET_KEY as string },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    })

    // Source videos, each a different codec situation.
    const plain = makeRealMp4(dir, "a.mp4", 2) // H.264 + AAC with faststart
    const noFast = path.join(dir, "b.mp4") // H.264 + AAC, moov at the end
    sh("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "testsrc=duration=2:size=320x240:rate=15", "-f", "lavfi", "-i", "sine=frequency=330:duration=2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", noFast])
    const pcmMov = path.join(dir, "c.mov") // H.264 + PCM audio
    sh("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "testsrc=duration=2:size=320x240:rate=15", "-f", "lavfi", "-i", "sine=frequency=550:duration=2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", "-shortest", pcmMov])
    const hevc = path.join(dir, "d.mp4") // HEVC + AAC
    sh("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "testsrc=duration=2:size=320x240:rate=15", "-f", "lavfi", "-i", "sine=frequency=660:duration=2", "-c:v", "libx265", "-tag:v", "hvc1", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", hevc])
    const converted = (name: string, input: string): Buffer => {
      const out = path.join(dir, `${name}-rendition.mp4`)
      sh("ffmpeg", ["-y", "-loglevel", "error", "-i", input, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart", out])
      return fs.readFileSync(out)
    }
    const jpg = fs.readFileSync(makeRealJpeg(dir, "thumb.jpg"))
    const png = fs.readFileSync(makeRealPng(dir, "pic.png"))
    const png2 = fs.readFileSync(makeRealPng(dir, "pic2.png"))
    const jpgPic = fs.readFileSync(makeRealJpeg(dir, "pic.jpg"))
    const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.from([0x24, 0, 0, 0]), Buffer.from("WEBPVP8 "), crypto.randomBytes(40)])
    const orphanVideo = fs.readFileSync(plain)
    files.a = fs.readFileSync(plain)
    files.b = fs.readFileSync(noFast)
    files.demoRendition = converted("demo", pcmMov)

    add({ publicId: "videos/aaaa", type: "video", format: "mp4", created: "2026-01-01T10:00:00Z", width: 320, height: 240, original: files.a, renditions: { so_3: jpg } })
    add({ publicId: "videos/bbbb", type: "video", format: "mp4", created: "2026-01-02T10:00:00Z", width: 320, height: 240, original: files.b, renditions: { so_3: jpg } })
    add({ publicId: "videos/cccc", type: "video", format: "mov", created: "2026-01-03T10:00:00Z", width: 320, height: 240, original: fs.readFileSync(pcmMov), renditions: { so_3: jpg, f_mp4: converted("c", pcmMov) } })
    add({ publicId: "videos/dddd", type: "video", format: "mp4", created: "2026-01-04T10:00:00Z", width: 320, height: 240, original: fs.readFileSync(hevc), renditions: { so_3: jpg, f_mp4: converted("d", hevc) } })
    add({ publicId: DEMO_ID, type: "video", format: "mov", created: "2025-08-12T10:00:00Z", original: fs.readFileSync(pcmMov), renditions: { f_mp4: files.demoRendition } })
    add({ publicId: "profile_pictures/pic1", type: "image", format: "png", created: "2026-02-01T10:00:00Z", width: 100, height: 100, original: png })
    add({ publicId: "profile_pictures/pic2", type: "image", format: "jpg", created: "2026-02-02T10:00:00Z", width: 600, height: 400, original: jpgPic })
    add({ publicId: "profile_pictures/pic3", type: "image", format: "webp", created: "2026-02-03T10:00:00Z", original: webp })
    add({ publicId: "profile_pictures/wtvbkvjnxrbdzfvjcmbi", type: "image", format: "png", created: "2025-08-11T10:00:00Z", width: 400, height: 400, original: png2, renditions: { w_100: png } })
    // Orphans, in several groups.
    add({ publicId: "videos/old1", type: "video", format: "mp4", created: "2025-07-01T10:00:00Z", width: 320, height: 240, original: orphanVideo })
    add({ publicId: "root-clip", type: "video", format: "mov", created: "2026-01-29T10:00:00Z", original: fs.readFileSync(pcmMov) })
    add({ publicId: "profile_pictures/old", type: "image", format: "png", created: "2025-09-01T10:00:00Z", width: 100, height: 100, original: png })
    add({ publicId: "samples/sample1", type: "image", format: "jpg", created: "2025-01-01T10:00:00Z", original: jpgPic })
    add({ publicId: "truckhero/t1", type: "image", format: "jpg", created: "2025-05-01T10:00:00Z", original: jpgPic })
    add({ publicId: "osctest/x", type: "image", format: "png", created: "2026-10-06T14:46:00Z", original: png })

    const owner = new ObjectId()
    const projectDoc = (name: string, id: string, ext = "mp4") => ({ _id: new ObjectId(), projectName: name, video: videoUrl(id, ext), thumbnail: thumbUrl(id), projectCreatedBy: owner })
    projects.push(projectDoc("A", "videos/aaaa"), projectDoc("B", "videos/bbbb"), projectDoc("C", "videos/cccc", "mov"), projectDoc("D", "videos/dddd"))
    projects.push({ _id: new ObjectId(), projectName: "Empty", video: "", thumbnail: "", projectCreatedBy: owner })
    users.push(
      { _id: new ObjectId(), name: "U1", profileImage: imageUrl("profile_pictures/pic1", "png"), email: "u1@example.test" },
      { _id: new ObjectId(), name: "U2", profileImage: imageUrl("profile_pictures/pic2", "jpg"), email: "u2@example.test" },
      { _id: new ObjectId(), name: "U3", profileImage: imageUrl("profile_pictures/pic3", "webp"), email: "u3@example.test" },
      { _id: new ObjectId(), name: "U4", profileImage: DEFAULT_URL, email: "u4@example.test" },
      { _id: new ObjectId(), name: "U5", profileImage: DEFAULT_URL, email: "u5@example.test" },
      { _id: new ObjectId(), name: "U6", profileImage: `${mediaBase}/already/there.png`, email: "u6@example.test" }
    )
    writeBson("projects", projects)
    writeBson("users", users)
    fs.writeFileSync(path.join(dumpDir, "manifest.json"), "{}")

    await startFakeCloudinary()
  })

  after(async () => {
    server?.close()
    if (ENABLED) {
      await deleteAll(s3, bucket, PREFIX)
      await deleteAll(backups, backupBucket, "phase2/")
      await deleteAll(backups, backupBucket, "copytest-backups/")
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })

  describe("cloudinary url parsing", () => {
    it("reads originals, transformations, versions and folders", () => {
      const { parseCloudinaryUrl, mp4RenditionUrl } = cloudinaryModule()
      assert.deepEqual(parseCloudinaryUrl("https://res.cloudinary.com/dgr7l5nsx/video/upload/v1754899421/videos/ee3c3zr5vvyd7rcec9u3.mp4"), {
        resourceType: "video", deliveryType: "upload", transformation: "", version: "v1754899421", publicId: "videos/ee3c3zr5vvyd7rcec9u3", format: "mp4",
      })
      assert.deepEqual(parseCloudinaryUrl("https://res.cloudinary.com/dgr7l5nsx/video/upload/so_3,w_600,h_400,c_fill/v17/videos/x.jpg"), {
        resourceType: "video", deliveryType: "upload", transformation: "so_3,w_600,h_400,c_fill", version: "v17", publicId: "videos/x", format: "jpg",
      })
      assert.deepEqual(parseCloudinaryUrl(DEFAULT_URL), {
        resourceType: "image", deliveryType: "upload", transformation: "w_100,h_100,c_fill", version: "v1754899421", publicId: "profile_pictures/wtvbkvjnxrbdzfvjcmbi", format: "png",
      })
      assert.equal(parseCloudinaryUrl("https://res.cloudinary.com/dgr7l5nsx/video/upload/f_mp4/v1754990343/videos/yhzdf7phuo0a0udgm40d.mov")?.publicId, "videos/yhzdf7phuo0a0udgm40d")
      // No version, nested folders and a transformation chain.
      assert.equal(parseCloudinaryUrl("https://res.cloudinary.com/c/image/upload/f_auto/q_auto/a/b/c.jpg")?.transformation, "f_auto/q_auto")
      assert.equal(parseCloudinaryUrl("https://res.cloudinary.com/c/image/upload/profile_pictures/x.png")?.publicId, "profile_pictures/x")
      assert.equal(parseCloudinaryUrl("https://example.com/video/upload/v1/x.mp4"), null)
      assert.equal(parseCloudinaryUrl("not a url"), null)
      assert.equal(
        mp4RenditionUrl("https://res.cloudinary.com/c/video/upload/v1/videos/x.mov"),
        "https://res.cloudinary.com/c/video/upload/f_mp4,vc_h264,ac_aac/v1/videos/x.mp4"
      )
    })
  })

  describe("media-inventory", () => {
    it("lists referenced assets and orphans, paging through the account", async () => {
      const { inventory, orphans, files: written } = await inventoryModule().runInventory({
        dumpDir,
        outDir,
        sourceBackup: "prod/2026-10-20T08-00-00Z",
      })
      assert.equal(inventory.sourceBackup, "prod/2026-10-20T08-00-00Z")
      assert.equal(inventory.listing.videos + inventory.listing.images, registry.size, "all pages were read")
      // 4 videos, 4 thumbnails, 3 own profile images, the default avatar for users and for the code.
      assert.equal(inventory.items.length, 13)
      const byField = (field: string) => inventory.items.filter((item) => item.field === field)
      assert.equal(byField("projects.video").length, 4)
      assert.equal(byField("projects.thumbnail").length, 4)
      assert.equal(byField("users.profileImage").length, 4)
      assert.equal(byField("code.defaultProfileImage").length, 1)
      const dflt = byField("users.profileImage").find((item) => item.kind === "default")
      assert.deepEqual(dflt?.docIds.length, 2, "two users hold the default avatar")
      assert.equal(dflt?.transformation, "w_100,h_100,c_fill")
      assert.equal(byField("projects.video").find((item) => item.publicId === "videos/aaaa")?.bytes, files.a.length)
      assert.deepEqual(inventory.notCloudinary.map((entry) => entry.value), [`${mediaBase}/already/there.png`])
      assert.equal(inventory.demo.publicId, DEMO_ID)

      const groups = new Set(orphans.map((orphan) => orphan.group))
      assert.deepEqual([...groups].sort(), ["(root)", "osctest", "profile_pictures", "samples", "truckhero", "videos"])
      assert.equal(orphans.length, 6)
      assert.ok(!orphans.some((orphan) => orphan.public_id === "videos/aaaa" || orphan.public_id === DEMO_ID), "referenced assets are not orphans")
      assert.ok(orphans.every((orphan, i) => i === 0 || orphans[i - 1].bytes >= orphan.bytes), "largest first")

      const markdown = fs.readFileSync(written[2], "utf8")
      assert.match(markdown, /truckhero/)
      assert.match(markdown, /\| Group \| Type \| Count \| MB \| Simon's call \|/)
      assert.match(markdown, /prod\/2026-10-20T08-00-00Z/)
      assert.match(markdown, /\[open\]\(https:\/\/res\.cloudinary\.com\//)
      assert.ok(!markdown.includes("example.test"), "no emails")
      assert.ok(!markdown.includes("U1"), "no user names")
    })

    it("fails when a referenced asset is missing from the account", async () => {
      const gone = registry.get("video/videos/bbbb") as Asset
      registry.delete("video/videos/bbbb")
      try {
        await assert.rejects(inventoryModule().runInventory({ dumpDir, outDir: path.join(dir, "out-missing") }), /missing in the Cloudinary account[\s\S]*videos\/bbbb/)
      } finally {
        add(gone)
      }
    })

    it("fails clearly on a Cloudinary URL it cannot read", async () => {
      const other = path.join(dir, "dump-odd")
      fs.mkdirSync(other, { recursive: true })
      fs.writeFileSync(path.join(other, "projects.bson"), Buffer.concat([Buffer.from(BSON.serialize({ _id: new ObjectId(), video: "https://res.cloudinary.com/x" }))]))
      fs.writeFileSync(path.join(other, "users.bson"), Buffer.alloc(0))
      await assert.rejects(inventoryModule().runInventory({ dumpDir: other, outDir: path.join(dir, "out-odd") }), /cannot read/)
    })
  })

  describe("media-copy", () => {
    it("a dry run downloads and probes but writes nothing to the bucket", async () => {
      const result = await copyModule().runCopy({ outDir, dryRun: true })
      assert.equal(result.report.failures, 0)
      assert.equal(result.report.objects, 12, "the default avatar is one object for two fields")
      assert.equal(result.report.renditions, 2, "the PCM .mov and the HEVC mp4")
      assert.equal(result.mappingFile, path.join(outDir, "mapping.dry-run.json"))
      assert.ok(!fs.existsSync(path.join(outDir, "mapping.json")))
      assert.ok(fs.existsSync(path.join(outDir, "handover/demo-timeline.mp4")))
      assert.ok(fs.existsSync(path.join(outDir, "handover/default-profile.png")))
      assert.ok(result.report.items.every((item) => item.status === "dry-run"))

      const listed = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: PREFIX }))
      assert.equal((listed.Contents ?? []).length, 0)

      const byKey = (suffix: string) => result.report.items.find((item) => item.key.endsWith(suffix))
      assert.equal(byKey("migrated/videos/aaaa.mp4")?.faststart, true)
      assert.equal(byKey("migrated/videos/bbbb.mp4")?.faststart, false)
      assert.equal(byKey("migrated/videos/cccc.mp4")?.renditionUsed, true)
      assert.match(byKey("migrated/videos/cccc.mp4")?.renditionReason ?? "", /stored as \.mov/)
      assert.match(byKey("migrated/videos/dddd.mp4")?.renditionReason ?? "", /hevc/)
      assert.equal(byKey("migrated/videos/aaaa.mp4")?.renditionUsed, false)
    })

    it("copies, proves each copy through its public url and writes the mapping", async () => {
      const result = await copyModule().runCopy({ outDir, dryRun: false })
      assert.equal(result.report.failures, 0, JSON.stringify(result.report.items.filter((item) => item.error)))
      assert.ok(result.mapping && result.mappingFile && result.backupFolder)
      assert.ok(result.report.items.every((item) => item.status === "uploaded"))
      assert.ok(result.report.items.every((item) => item.verified?.sha256 && item.verified.contentType))
      assert.ok(result.report.items.filter((item) => item.kind === "video").every((item) => item.verified?.range && /h264/.test(item.verified.codecs ?? "")))

      const mapping = result.mapping
      assert.equal(mapping.entries.length, 13)
      assert.equal(mapping.mediaBaseUrl, mediaBase)
      const entry = (field: string, oldUrl: string) => mapping.entries.find((e) => e.field === field && e.oldUrl === oldUrl)
      const video = entry("projects.video", videoUrl("videos/aaaa"))
      assert.equal(video?.key, `${PREFIX}migrated/videos/aaaa.mp4`)
      assert.equal(video?.newUrl, `${mediaBase}/${PREFIX}migrated/videos/aaaa.mp4`)
      assert.equal(video?.sha256, sha(files.a))
      assert.equal(video?.bytes, files.a.length)
      assert.equal(video?.contentType, "video/mp4")
      assert.equal(video?.docIds.length, 1)
      assert.equal(entry("projects.video", videoUrl("videos/cccc", "mov"))?.key, `${PREFIX}migrated/videos/cccc.mp4`)
      assert.ok(entry("projects.video", videoUrl("videos/cccc", "mov"))?.sourceUrl.includes("f_mp4,vc_h264,ac_aac"))
      assert.equal(entry("projects.thumbnail", thumbUrl("videos/aaaa"))?.key, `${PREFIX}migrated/thumbnails/videos/aaaa.jpg`)
      assert.equal(entry("users.profileImage", imageUrl("profile_pictures/pic3", "webp"))?.contentType, "image/webp")
      assert.equal(entry("users.profileImage", DEFAULT_URL)?.key, `${PREFIX}defaults/avatar-100.png`)
      assert.equal(entry("code.defaultProfileImage", DEFAULT_URL)?.key, `${PREFIX}defaults/avatar-100.png`)
      assert.equal(entry("users.profileImage", DEFAULT_URL)?.docIds.length, 2)

      // The object is public, immutable and carries its hash as metadata.
      const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: `${PREFIX}migrated/videos/aaaa.mp4` }))
      assert.equal(head.CacheControl, "public, max-age=31536000, immutable")
      assert.equal(head.Metadata?.sha256, sha(files.a))
      assert.equal((await fetch(`${mediaBase}/${PREFIX}migrated/videos/aaaa.mp4`, { headers: { Range: "bytes=0-9" } })).status, 206)

      // Reports and the mapping are in the backup bucket under phase2/<timestamp>/.
      const names = (await backups.send(new ListObjectsV2Command({ Bucket: backupBucket, Prefix: `${result.backupFolder}/` }))).Contents?.map((item) => path.basename(item.Key as string)).sort()
      assert.deepEqual(names, ["copy-report.json", "inventory.json", "mapping.json", "orphans.json"])
      const stored = await backups.send(new GetObjectCommand({ Bucket: backupBucket, Key: `${result.backupFolder}/mapping.json` }))
      assert.equal(JSON.parse((await stored.Body?.transformToString()) ?? "{}").entries.length, 13)
      assert.ok(!fs.readFileSync(path.join(outDir, "copy-report.json"), "utf8").includes(API_SECRET))
    })

    it("is rerunnable: a second run finds everything already there", async () => {
      const second = await copyModule().runCopy({ outDir, dryRun: false })
      assert.equal(second.report.failures, 0)
      assert.ok(second.report.items.every((item) => item.status === "already-there"))
      assert.equal(second.mapping?.entries.length, 13)
    })

    it("refuses to overwrite a key that holds different content", async () => {
      const key = `${PREFIX}migrated/profile_pictures/pic2.jpg`
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
      await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: Buffer.from("something else"), ContentType: "image/jpeg" }))
      const result = await copyModule().runCopy({ outDir, dryRun: false })
      assert.equal(result.report.failures, 1)
      assert.equal(result.mapping, null, "no mapping when anything failed")
      assert.match(result.report.items.find((item) => item.status === "failed")?.error ?? "", /already holds different content/)
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
      const healed = await copyModule().runCopy({ outDir, dryRun: false })
      assert.equal(healed.report.failures, 0)
    })

    it("fails an item whose size differs from the Admin API", async () => {
      const asset = registry.get("image/profile_pictures/pic1") as Asset
      const real = asset.original
      asset.original = Buffer.concat([real, Buffer.from("x")])
      await inventoryModule().runInventory({ dumpDir, outDir: path.join(dir, "out-size") })
      asset.original = real // the account now says one byte more than the delivery serves
      const result = await copyModule().runCopy({ outDir: path.join(dir, "out-size"), dryRun: true })
      assert.equal(result.report.failures, 1)
      assert.match(result.report.items.find((item) => item.status === "failed")?.error ?? "", /Size differs/)
    })

    it("fails when a rendition is still not H.264 + AAC", async () => {
      const asset = registry.get("video/videos/dddd") as Asset
      const good = asset.renditions
      asset.renditions = { ...asset.renditions, f_mp4: asset.original } // the "rendition" is the HEVC file again
      try {
        const result = await copyModule().runCopy({ outDir, dryRun: true })
        assert.equal(result.report.failures, 1)
        assert.match(result.report.items.find((item) => item.status === "failed")?.error ?? "", /not H\.264 \+ AAC either/)
      } finally {
        asset.renditions = good
      }
    })
  })

  describe("media-default-avatar", () => {
    it("copies only the default avatar", async () => {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: `${PREFIX}defaults/avatar-100.png` }))
      const outOnly = path.join(dir, "out-default")
      fs.mkdirSync(outOnly, { recursive: true })
      const report = await copyModule().runDefaultAvatar({ outDir: outOnly, dryRun: false })
      assert.equal(report.failures, 0)
      assert.equal(report.items.length, 1)
      assert.equal(report.items[0].status, "uploaded")
      assert.equal((await fetch(`${mediaBase}/${PREFIX}defaults/avatar-100.png`)).headers.get("content-type"), "image/png")
      assert.ok(fs.existsSync(path.join(outOnly, "handover/default-profile.png")))
    })
  })

  describe("media-verify", () => {
    it("passes on a good mapping and names the object that does not match", async () => {
      const mapping = JSON.parse(fs.readFileSync(path.join(outDir, "mapping.json"), "utf8"))
      const ok = await copyModule().verifyMapping(mapping)
      assert.equal(ok.failed.length, 0)
      assert.equal(ok.checked, 12)

      mapping.entries[0].sha256 = "0".repeat(64)
      const bad = await copyModule().verifyMapping(mapping)
      assert.equal(bad.failed.length, 1)
      assert.equal(bad.failed[0].key, mapping.entries[0].key)
      assert.match(bad.failed[0].error, /does not match/)
    })

    it("fails for a missing object", async () => {
      const mapping = JSON.parse(fs.readFileSync(path.join(outDir, "mapping.json"), "utf8"))
      mapping.entries[1].newUrl = `${mediaBase}/${PREFIX}nope.mp4`
      mapping.entries[1].key = `${PREFIX}nope.mp4`
      const bad = await copyModule().verifyMapping(mapping)
      assert.equal(bad.failed.length, 1)
    })
  })

  describe("command line", () => {
    // Asynchronous on purpose: the fake Cloudinary lives in this process and has to keep answering while the command runs.
    const cli = (...args: string[]): Promise<{ status: number; stdout: string; stderr: string }> =>
      new Promise((resolve) => {
        execFile(process.execPath, [path.join(BACKEND_DIR, "dist/ops/cli.js"), ...args], { cwd: BACKEND_DIR, env: process.env }, (error, stdout, stderr) => {
          resolve({ status: error ? ((error as { code?: number }).code ?? 1) : 0, stdout, stderr })
        })
      })

    it("media-inventory and media-copy dry-run work through the command line", async () => {
      const out = path.join(dir, "out-cli")
      const inventory = await cli("media-inventory", dumpDir, out, "prod/x", path.join(dir, "orphans-cli.md"))
      assert.equal(inventory.status, 0, inventory.stderr)
      assert.match(inventory.stdout, /referenced items: 13, orphans: 6/)
      assert.ok(fs.existsSync(path.join(dir, "orphans-cli.md")))

      const copy = await cli("media-copy", out, "dry-run")
      assert.equal(copy.status, 0, copy.stderr)
      assert.match(copy.stdout, /dry run: 12 objects/)

      const unknown = await cli("media-copy", out, "whatever")
      assert.equal(unknown.status, 1)
    })

    it("reports missing arguments without printing anything secret", async () => {
      const result = await cli("media-inventory")
      assert.equal(result.status, 1)
      const text = `${result.stdout}${result.stderr}`
      assert.match(text, /needs <dumpDir> <outDir>/)
      assert.ok(!text.includes(API_SECRET))
    })

    it("media-verify takes a local mapping file", async () => {
      const result = await cli("media-verify", path.join(outDir, "mapping.json"))
      assert.equal(result.status, 0, result.stderr)
      assert.match(result.stdout, /verified 12 of 12 objects/)
    })
  })

  describe("what it asks of Cloudinary", () => {
    it("only ever sends GET requests", () => {
      assert.ok(requests.length > 20)
      assert.deepEqual([...new Set(requests.map((request) => request.method))], ["GET"])
      // The Admin API is only ever asked to list resources. Everything else is a plain delivery download.
      for (const request of requests.filter((r) => r.url.startsWith("/v1_1/"))) {
        assert.ok(request.url.startsWith(`/v1_1/${CLOUD}/resources/`), request.url)
      }
    })
  })
})
