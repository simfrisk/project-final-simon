// The mirror stops copying instead of filling the backup drive: MIRROR_MAX_BYTES caps the backup bucket.
import assert from "node:assert/strict"
import crypto from "crypto"
import { after, before, describe, it } from "node:test"
import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { dropDatabase, haveBackupEnv, haveS3Env, MIB, RUN_ID, startServer, testPrefix } from "./helpers"

const PREFIX = testPrefix("spacetest")
const BACKUP_PREFIX = `spacetest-${RUN_ID}`
const ENABLED = haveS3Env() && haveBackupEnv()

describe("media mirror storage limit", { skip: !ENABLED && "S3 settings are not set" }, () => {
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
  const small = crypto.randomBytes(100 * 1024)
  const big = crypto.randomBytes(3 * MIB)

  before(async () => {
    await media.send(new PutObjectCommand({ Bucket: mediaBucket, Key: `${PREFIX}a-small.jpg`, Body: small, ContentType: "image/jpeg" }))
    await media.send(new PutObjectCommand({ Bucket: mediaBucket, Key: `${PREFIX}b-big.mp4`, Body: big, ContentType: "video/mp4" }))
    // Only needed so the server started below finds the stored status.
    process.env.BACKUP_PREFIX = BACKUP_PREFIX
    process.env.MEDIA_MIRROR_ENABLED = "true"
  })

  after(async () => {
    for (const key of [`${PREFIX}a-small.jpg`, `${PREFIX}b-big.mp4`]) {
      await media.send(new DeleteObjectCommand({ Bucket: mediaBucket, Key: key })).catch(() => undefined)
      await backups.send(new DeleteObjectCommand({ Bucket: backupBucket, Key: `media-mirror/${key}` })).catch(() => undefined)
    }
    for (const name of ["media-mirror-status.json", "media-mirror-missing.json"]) {
      await backups.send(new DeleteObjectCommand({ Bucket: backupBucket, Key: `${BACKUP_PREFIX}/${name}` })).catch(() => undefined)
    }
  })

  it("copies what fits, skips the rest and says so in the status and in /health", async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { runMediaMirror, mediaMirrorStatus } = require("../dist/ops/mediaMirror") as typeof import("../src/ops/mediaMirror")
    // The limit is measured over this test's own copies, so it leaves room for the small object and not for the big one.
    const report = await runMediaMirror({ scope: PREFIX, maxBytes: small.length + 1024 })
    assert.ok(report.skippedForSpace >= 1)
    assert.equal(report.failed, 0)

    const listed = await backups.send(new ListObjectsV2Command({ Bucket: backupBucket, Prefix: `media-mirror/${PREFIX}` }))
    const keys = (listed.Contents ?? []).map((item) => item.Key)
    assert.deepEqual(keys, [`media-mirror/${PREFIX}a-small.jpg`])

    assert.equal(mediaMirrorStatus.lastStatus, "failed")
    assert.match(mediaMirrorStatus.note ?? "", /MIRROR_MAX_BYTES/)

    // A server booting afterwards shows the same note from the stored status.
    const server = await startServer({ MEDIA_STORAGE: "cloudinary", MEDIA_MIRROR_ENABLED: "true", BACKUP_PREFIX })
    try {
      let body: any
      for (let i = 0; i < 20; i++) {
        body = await (await fetch(`${server.url}/health`)).json()
        if (body.media.mirror.note) break
        await new Promise((resolve) => setTimeout(resolve, 150))
      }
      assert.equal(body.media.mirror.lastStatus, "failed")
      assert.match(body.media.mirror.note, /MIRROR_MAX_BYTES/)
    } finally {
      await server.stop()
      await dropDatabase(server.mongoUrl)
    }
  })
})
