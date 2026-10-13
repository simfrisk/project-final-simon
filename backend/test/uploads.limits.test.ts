// Per user limits on the S3 provider: unfinished uploads, bytes per day, abandoned uploads, failed completes.
import assert from "node:assert/strict"
import fs from "fs"
import { after, before, describe, it } from "node:test"
import { DeleteObjectCommand, ListMultipartUploadsCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3"
import {
  abortOpened,
  call,
  createTicket,
  openedUploads,
  dropDatabase,
  haveS3Env,
  makeFakeMp4,
  makeRealJpeg,
  makeScratchDir,
  MIB,
  RunningServer,
  signUp,
  startServer,
  testPrefix,
  TestUser,
  uploadFile,
} from "./helpers"

const PREFIX = testPrefix("limittest")

describe("per user upload limits", { skip: !haveS3Env() && "MEDIA_S3_* is not set" }, () => {
  let server: RunningServer
  let alice: TestUser
  let bob: TestUser
  let dir: string
  let s3: S3Client
  const bucket = process.env.MEDIA_S3_BUCKET as string

  const ticket = async (user: TestUser, purpose: string, contentType: string, sizeBytes: number) => {
    const result = await call(server, "POST", "/uploads", { token: user.token, body: { purpose, fileName: "x", contentType, sizeBytes } })
    if (result.status === 200) openedUploads.push({ key: result.body.response.key, uploadId: result.body.response.uploadId })
    return result
  }
  const stillOpen = async (key: string): Promise<boolean> =>
    ((await s3.send(new ListMultipartUploadsCommand({ Bucket: bucket, Prefix: key }))).Uploads ?? []).some((upload) => upload.Key === key)
  const cancel = (user: TestUser, t: { key: string; uploadId: string }) =>
    call(server, "DELETE", "/uploads", { token: user.token, body: { key: t.key, uploadId: t.uploadId } })
  before(async () => {
    server = await startServer({
      MEDIA_STORAGE: "s3",
      MEDIA_FOLDER_PREFIX: PREFIX,
      MAX_ACTIVE_UPLOADS: "3",
      MAX_DAILY_UPLOAD_MB: "30",
      UPLOAD_STALE_SECONDS: "2",
    })
    alice = await signUp(server, "alice")
    bob = await signUp(server, "bob")
    dir = makeScratchDir()
    s3 = new S3Client({
      endpoint: process.env.MEDIA_S3_ENDPOINT,
      region: "us-east-1",
      forcePathStyle: true,
      credentials: { accessKeyId: process.env.MEDIA_S3_ACCESS_KEY as string, secretAccessKey: process.env.MEDIA_S3_SECRET_KEY as string },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    })
  })

  after(async () => {
    await server?.stop()
    await abortOpened(s3, bucket)
    const listed = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: PREFIX }))
    for (const item of listed.Contents ?? []) await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: item.Key as string })).catch(() => undefined)
    if (server) await dropDatabase(server.mongoUrl)
    fs.rmSync(dir, { recursive: true, force: true })
  })

  it("allows the configured number of unfinished uploads and answers 429 for the next one", async () => {
    const first = [] as { key: string; uploadId: string }[]
    for (let i = 0; i < 3; i++) {
      const r = await ticket(alice, "video", "video/mp4", 1 * MIB)
      assert.equal(r.status, 200)
      first.push(r.body.response)
    }
    const blocked = await ticket(alice, "video", "video/mp4", 1 * MIB)
    assert.equal(blocked.status, 429)
    assert.equal(blocked.body.success, false)
    assert.match(blocked.body.message, /Too many uploads in progress/)
    assert.deepEqual(blocked.body.response, { reason: "active_uploads", maxActive: 3 })

    // A profile image counts too, someone else is not affected, and a thumbnail is never counted.
    assert.equal((await ticket(alice, "image", "image/png", 1000)).status, 429)
    assert.equal((await ticket(bob, "video", "video/mp4", 1 * MIB)).status, 200)
    assert.equal((await ticket(alice, "thumbnail", "image/jpeg", 1000)).status, 200)

    // Cancelling one frees a place straight away.
    assert.equal((await cancel(alice, first[0])).status, 200)
    assert.equal((await ticket(alice, "video", "video/mp4", 1 * MIB)).status, 200)

    for (const t of first.slice(1)) await cancel(alice, t)
  })

  it("aborts uploads that were abandoned hours ago when the owner starts a new one", async () => {
    const carol = await signUp(server, "carol")
    const abandoned = [] as { key: string; uploadId: string }[]
    for (let i = 0; i < 3; i++) {
      const r = await ticket(carol, "video", "video/mp4", 1 * MIB)
      assert.equal(r.status, 200)
      abandoned.push(r.body.response)
    }
    assert.equal((await ticket(carol, "video", "video/mp4", 1 * MIB)).status, 429)

    // In this test the stale time is 2 seconds. Real use is 3 hours.
    await new Promise((resolve) => setTimeout(resolve, 3500))
    const fresh = await ticket(carol, "video", "video/mp4", 1 * MIB)
    assert.equal(fresh.status, 200)
    for (const old of abandoned) {
      const gone = await call(server, "POST", "/uploads/parts", { token: carol.token, body: { key: old.key, uploadId: old.uploadId, partNumbers: [1] } })
      assert.equal(gone.status, 404, "the abandoned upload was aborted")
    }
    const stillThere = await call(server, "POST", "/uploads/parts", { token: carol.token, body: { key: fresh.body.response.key, uploadId: fresh.body.response.uploadId, partNumbers: [1] } })
    assert.equal(stillThere.status, 200)
    await cancel(carol, fresh.body.response)
  })

  it("limits the bytes a user may start per day and says when to retry", async () => {
    const dave = await signUp(server, "dave")
    const a = await ticket(dave, "video", "video/mp4", 20 * MIB)
    assert.equal(a.status, 200)
    const blocked = await ticket(dave, "video", "video/mp4", 20 * MIB)
    assert.equal(blocked.status, 429)
    assert.match(blocked.body.message, /Daily upload limit reached/)
    assert.equal(blocked.body.response.reason, "daily_bytes")
    assert.equal(blocked.body.response.maxBytes, 30 * MIB)
    assert.equal(blocked.body.response.usedBytes, 20 * MIB)
    const seconds = blocked.body.response.retryAfterSeconds
    assert.ok(seconds > 23 * 3600 && seconds <= 24 * 3600, `retryAfterSeconds ${seconds}`)

    // Under the cap still works, and the thumbnail is outside the limit.
    assert.equal((await ticket(dave, "video", "video/mp4", 10 * MIB)).status, 200)
    assert.equal((await ticket(dave, "thumbnail", "image/jpeg", 1000)).status, 200)
    // Too large is still a 413, checked before the daily limit.
    assert.equal((await ticket(dave, "image", "image/png", 11 * MIB)).status, 413)
  })

  it("a complete that fails aborts the upload instead of leaving its parts", async () => {
    const erin = await signUp(server, "erin")
    // Two parts of 1 MiB each: S3 refuses to join parts under 5 MiB (except the last), so Complete fails.
    const file = makeFakeMp4(dir, 2 * MIB, "tiny-parts.mp4")
    const made = await ticket(erin, "video", "video/mp4", 12 * MIB)
    assert.equal(made.status, 200)
    const t = made.body.response
    const signed = await call(server, "POST", "/uploads/parts", { token: erin.token, body: { key: t.key, uploadId: t.uploadId, partNumbers: [1, 2] } })
    const bytes = fs.readFileSync(file)
    for (const [i, part] of signed.body.response.parts.entries()) {
      const slice = bytes.subarray(i * MIB, (i + 1) * MIB)
      assert.equal((await fetch(part.url, { method: "PUT", body: slice })).status, 200)
    }
    assert.equal(await stillOpen(t.key), true, "it is open before the complete")
    const classId = (await call(server, "POST", `/workspace/${"a".repeat(24)}/classes`, { body: { classTitle: "c" } })).body.response._id
    const done = await call(server, "POST", `/classes/${classId}/projects`, { token: erin.token, body: { projectName: "P", video: { key: t.key, uploadId: t.uploadId } } })
    assert.equal(done.status, 400)
    assert.equal(done.body.message, "Upload is incomplete")
    assert.equal(await stillOpen(t.key), false, "aborted")
  })

  it("a user with room can still upload and complete a real file", async () => {
    const frank = await signUp(server, "frank")
    const jpg = makeRealJpeg(dir, "ok.jpg")
    const made = await ticket(frank, "image", "image/jpeg", fs.statSync(jpg).size)
    await uploadFile(server, frank, made.body.response, jpg)
    const done = await call(server, "POST", `/users/${frank.id}/profile-image`, { token: frank.token, body: { key: made.body.response.key, uploadId: made.body.response.uploadId } })
    assert.equal(done.status, 200)
  })
})
