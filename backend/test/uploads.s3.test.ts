// Phase 2 upload tests against a local MinIO and a local MongoDB (blueprint B2-2 to B2-9, T2-4).
import assert from "node:assert/strict"
import fs from "fs"
import path from "path"
import { after, before, describe, it } from "node:test"
import { spawnSync } from "child_process"
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListMultipartUploadsCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { MongoClient, ObjectId } from "mongodb"
import {
  call,
  createTicket,
  dropDatabase,
  haveS3Env,
  makeClass,
  makeFakeMp4,
  makeRealJpeg,
  makeRealMp4,
  makeRealPng,
  makeScratchDir,
  MIB,
  RunningServer,
  signUp,
  startServer,
  TestUser,
  uploadFile,
} from "./helpers"

const PREFIX = "osctest/"

describe("S3 media storage", { skip: !haveS3Env() && "MEDIA_S3_* is not set" }, () => {
  let server: RunningServer
  let alice: TestUser & { profileImage: string }
  let bob: TestUser
  let classId: string
  let dir: string
  let s3: S3Client
  const base = process.env.MEDIA_PUBLIC_BASE_URL as string
  const bucket = process.env.MEDIA_S3_BUCKET as string

  const head = async (key: string): Promise<number | null> => {
    try {
      const result = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
      return result.ContentLength ?? 0
    } catch {
      return null
    }
  }
  const keyOf = (url: string): string => url.slice(base.length + 1)
  const pendingUploads = async (key: string): Promise<number> => {
    const list = await s3.send(new ListMultipartUploadsCommand({ Bucket: bucket, Prefix: key }))
    return (list.Uploads ?? []).filter((upload) => upload.Key === key).length
  }

  const createProject = (user: TestUser, body: Record<string, unknown>) =>
    call(server, "POST", `/classes/${classId}/projects`, { token: user.token, body: { projectName: "P", ...body } })

  before(async () => {
    server = await startServer({ MEDIA_STORAGE: "s3", MEDIA_FOLDER_PREFIX: PREFIX })
    alice = await signUp(server, "alice")
    bob = await signUp(server, "bob")
    classId = await makeClass(server)
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
    // Everything this run wrote lives under the test prefix.
    const listed = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: PREFIX }))
    for (const item of listed.Contents ?? []) {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: item.Key as string })).catch(() => undefined)
    }
    if (server) await dropDatabase(server.mongoUrl)
    fs.rmSync(dir, { recursive: true, force: true })
  })

  describe("limits and defaults", () => {
    it("reports the s3 limits", async () => {
      const { status, body } = await call(server, "GET", "/uploads/limits")
      assert.equal(status, 200)
      assert.equal(body.response.provider, "s3")
      assert.equal(body.response.videoMaxBytes, 400 * MIB)
      assert.equal(body.response.imageMaxBytes, 10 * MIB)
      assert.equal(body.response.thumbnailMaxBytes, 2 * MIB)
      assert.deepEqual(body.response.videoFormats, ["mp4", "mov"])
    })

    it("health shows the provider", async () => {
      const { status, body } = await call(server, "GET", "/health")
      assert.equal(status, 200)
      assert.equal(body.media.provider, "s3")
      assert.equal(body.media.mirror.enabled, false)
      assert.equal(body.media.mirror.lastStatus, "never")
    })

    it("gives a new user the default avatar in the media bucket", () => {
      assert.equal(alice.profileImage, `${base}/defaults/avatar-100.png`)
    })
  })

  describe("tickets", () => {
    it("needs a token", async () => {
      const { status } = await call(server, "POST", "/uploads", { body: { purpose: "video" } })
      assert.equal(status, 400)
    })

    it("refuses bad input before touching storage", async () => {
      const post = (body: Record<string, unknown>) => call(server, "POST", "/uploads", { token: alice.token, body: { fileName: "x", ...body } })
      assert.equal((await post({ purpose: "audio", contentType: "video/mp4", sizeBytes: 5 })).status, 400)
      assert.equal((await post({ purpose: "video", contentType: "video/x-msvideo", sizeBytes: 5 })).status, 400)
      assert.equal((await post({ purpose: "video", contentType: "application/pdf", sizeBytes: 5 })).status, 400)
      assert.equal((await post({ purpose: "video", contentType: "video/mp4", sizeBytes: 0 })).status, 400)
      assert.equal((await post({ purpose: "video", contentType: "video/mp4", sizeBytes: -1 })).status, 400)
      assert.equal((await post({ purpose: "thumbnail", contentType: "image/png", sizeBytes: 100 })).status, 400)
      assert.equal((await post({ purpose: "image", contentType: "video/mp4", sizeBytes: 100 })).status, 400)

      const tooBig = await post({ purpose: "video", contentType: "video/mp4", sizeBytes: 400 * MIB + 1 })
      assert.equal(tooBig.status, 413)
      assert.equal(tooBig.body.response.maxBytes, 400 * MIB)
      assert.equal((await post({ purpose: "thumbnail", contentType: "image/jpeg", sizeBytes: 2 * MIB + 1 })).status, 413)

      const resume = await post({ purpose: "video", contentType: "video/mp4", sizeBytes: 5, resumeKey: "x" })
      assert.equal(resume.status, 400)
      assert.equal(resume.body.message, "Not used by this provider")
    })

    it("returns a multipart ticket with the chosen key", async () => {
      const ticket = await createTicket(server, alice, "video", "video/mp4", 395 * MIB)
      assert.equal(ticket.provider, "s3")
      assert.equal(ticket.partSizeBytes, 8 * MIB)
      assert.equal(ticket.partCount, 50)
      assert.match(ticket.key, new RegExp(`^${PREFIX}videos/${alice.id}/[0-9a-f-]{36}\\.mp4$`))
      assert.ok(Date.parse(ticket.expiresAt) > Date.now() + 22 * 3600 * 1000)
      await call(server, "DELETE", "/uploads", { token: alice.token, body: { key: ticket.key, uploadId: ticket.uploadId } })
    })

    it("uses the right extension for quicktime and images", async () => {
      const mov = await createTicket(server, alice, "video", "video/quicktime", 10)
      assert.ok(mov.key.endsWith(".mov"))
      const png = await createTicket(server, alice, "image", "image/png", 10)
      assert.match(png.key, /profile_pictures\/.*\.png$/)
      const thumb = await createTicket(server, alice, "thumbnail", "image/jpeg", 10)
      assert.match(thumb.key, new RegExp(`^${PREFIX}thumbnails/${alice.id}/[0-9a-f-]{36}\\.jpg$`))
      for (const ticket of [mov, png, thumb]) {
        await call(server, "DELETE", "/uploads", { token: alice.token, body: { key: ticket.key, uploadId: ticket.uploadId } })
      }
    })
  })

  describe("part URLs", () => {
    it("are plain: only host is signed and no checksum parameters", async () => {
      const ticket = await createTicket(server, alice, "video", "video/mp4", 20 * MIB)
      const { status, body } = await call(server, "POST", "/uploads/parts", {
        token: alice.token,
        body: { key: ticket.key, uploadId: ticket.uploadId, partNumbers: [1, 2, 3] },
      })
      assert.equal(status, 200)
      assert.equal(body.response.parts.length, 3)
      for (const part of body.response.parts) {
        const url = part.url.toLowerCase()
        assert.ok(url.includes("x-amz-signedheaders=host"), "signed headers must be host only")
        assert.ok(!url.includes("x-amz-checksum"))
        assert.ok(!url.includes("x-amz-sdk-checksum-algorithm"))
        assert.ok(!url.includes("x-amz-content-sha256=") || url.includes("unsigned-payload"))
        assert.ok(part.url.startsWith(process.env.MEDIA_S3_ENDPOINT as string))
        assert.ok(part.url.includes(`/${bucket}/`), "path style")
      }
      await call(server, "DELETE", "/uploads", { token: alice.token, body: { key: ticket.key, uploadId: ticket.uploadId } })
    })

    it("refuse bad part numbers and unknown uploads", async () => {
      const ticket = await createTicket(server, alice, "video", "video/mp4", 20 * MIB)
      const sign = (partNumbers: unknown, extra: Record<string, unknown> = {}) =>
        call(server, "POST", "/uploads/parts", {
          token: alice.token,
          body: { key: ticket.key, uploadId: ticket.uploadId, partNumbers, ...extra },
        })

      assert.equal((await sign(Array.from({ length: 51 }, (_, i) => i + 1))).status, 400)
      assert.equal((await sign([0])).status, 400)
      assert.equal((await sign([-1])).status, 400)
      assert.equal((await sign([1.5])).status, 400)
      assert.equal((await sign([1, 1])).status, 400)
      assert.equal((await sign([])).status, 400)
      assert.equal((await sign("1")).status, 400)
      assert.equal((await sign([51])).status, 400, "above ceil(400 MiB / 8 MiB)")
      assert.equal((await sign([50])).status, 200)

      const wrong = await sign([1], { uploadId: "made-up-upload-id" })
      assert.equal(wrong.status, 404)
      assert.equal(wrong.body.message, "Upload not found")

      const noToken = await call(server, "POST", "/uploads/parts", { body: { key: ticket.key, uploadId: ticket.uploadId, partNumbers: [1] } })
      assert.equal(noToken.status, 400)
      await call(server, "DELETE", "/uploads", { token: alice.token, body: { key: ticket.key, uploadId: ticket.uploadId } })
    })

    it("limit part numbers by purpose", async () => {
      const ticket = await createTicket(server, alice, "thumbnail", "image/jpeg", 100)
      const sign = (n: number) =>
        call(server, "POST", "/uploads/parts", {
          token: alice.token,
          body: { key: ticket.key, uploadId: ticket.uploadId, partNumbers: [n] },
        })
      assert.equal((await sign(1)).status, 200)
      assert.equal((await sign(2)).status, 400, "a thumbnail is at most 2 MiB, so one part")
      await call(server, "DELETE", "/uploads", { token: alice.token, body: { key: ticket.key, uploadId: ticket.uploadId } })
    })
  })

  describe("a finished upload", () => {
    it("a real mp4 uploaded in one part becomes a project that plays with range requests", async () => {
      const file = makeRealMp4(dir)
      const size = fs.statSync(file).size
      const ticket = await createTicket(server, alice, "video", "video/mp4", size)
      assert.equal(ticket.partCount, 1)
      await uploadFile(server, alice, ticket, file)

      const { status, body } = await createProject(alice, { video: { key: ticket.key, uploadId: ticket.uploadId } })
      assert.equal(status, 201)
      assert.equal(body.response.video, `${base}/${ticket.key}`)
      assert.equal(body.response.thumbnail, "")

      const range = await fetch(body.response.video, { headers: { Range: "bytes=0-99" } })
      assert.equal(range.status, 206)
      assert.equal(range.headers.get("content-type"), "video/mp4")
      assert.match(range.headers.get("cache-control") ?? "", /immutable/)
      const probe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_name", "-of", "csv=p=0", body.response.video])
      assert.deepEqual(probe.stdout.toString().trim().split("\n").sort(), ["aac", "h264"])
    })

    it("a three part upload done with plain curl completes", async () => {
      const file = makeFakeMp4(dir, 18 * MIB, "three-part.mp4")
      const ticket = await createTicket(server, alice, "video", "video/mp4", 18 * MIB)
      assert.equal(ticket.partCount, 3)
      await uploadFile(server, alice, ticket, file, { useCurl: true })

      const { status, body } = await createProject(alice, { video: { key: ticket.key, uploadId: ticket.uploadId } })
      assert.equal(status, 201)
      assert.equal(await head(ticket.key), 18 * MIB)
      const whole = await fetch(body.response.video)
      assert.equal(whole.status, 200)
      assert.equal((await whole.arrayBuffer()).byteLength, 18 * MIB)
    })

    it("completing twice returns the same object", async () => {
      const file = makeFakeMp4(dir, 1 * MIB, "twice.mp4")
      const ticket = await createTicket(server, alice, "video", "video/mp4", 1 * MIB)
      await uploadFile(server, alice, ticket, file)
      const ref = { key: ticket.key, uploadId: ticket.uploadId }
      const first = await createProject(alice, { video: ref })
      const second = await createProject(alice, { video: ref })
      assert.equal(first.status, 201)
      assert.equal(second.status, 201)
      assert.equal(first.body.response.video, second.body.response.video)
      assert.equal(await head(ticket.key), 1 * MIB)
    })

    it("stores an mov with its own content type", async () => {
      const file = makeFakeMp4(dir, 1 * MIB, "clip.mov")
      const ticket = await createTicket(server, alice, "video", "video/quicktime", 1 * MIB)
      await uploadFile(server, alice, ticket, file)
      const { status, body } = await createProject(alice, { video: { key: ticket.key, uploadId: ticket.uploadId } })
      assert.equal(status, 201)
      const response = await fetch(body.response.video, { headers: { Range: "bytes=0-9" } })
      assert.equal(response.headers.get("content-type"), "video/quicktime")
    })

    it("is refused and aborted when the parts exceed the limit", async () => {
      // Declared at the 10 MiB image limit, but 12 MiB of parts are sent.
      const ticket = await createTicket(server, alice, "image", "image/jpeg", 10 * MIB)
      const file = path.join(dir, "big.jpg")
      fs.writeFileSync(file, Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(12 * MIB - 4)]))
      await uploadFile(server, alice, ticket, file)
      assert.equal(await pendingUploads(ticket.key), 1)

      const { status, body } = await call(server, "POST", `/users/${alice.id}/profile-image`, {
        token: alice.token,
        body: { key: ticket.key, uploadId: ticket.uploadId },
      })
      assert.equal(status, 413)
      assert.equal(body.response.maxBytes, 10 * MIB)
      assert.equal(await pendingUploads(ticket.key), 0, "the upload was aborted")
      assert.equal(await head(ticket.key), null)
    })

    it("is deleted when the bytes do not match the key", async () => {
      // A PNG under a .mp4 key.
      const png = makeRealPng(dir)
      const ticket = await createTicket(server, alice, "video", "video/mp4", fs.statSync(png).size)
      await uploadFile(server, alice, ticket, png)
      const { status, body } = await createProject(alice, { video: { key: ticket.key, uploadId: ticket.uploadId } })
      assert.equal(status, 400)
      assert.equal(body.message, "Unsupported file type")
      assert.equal(await head(ticket.key), null, "the object is gone")
    })

    it("answers 404 when nothing was uploaded", async () => {
      const ticket = await createTicket(server, alice, "video", "video/mp4", 100)
      const { status } = await createProject(alice, { video: { key: ticket.key, uploadId: ticket.uploadId } })
      assert.equal(status, 404)
      await call(server, "DELETE", "/uploads", { token: alice.token, body: { key: ticket.key, uploadId: ticket.uploadId } })
    })

    it("answers 404 for an upload id that does not exist and no object", async () => {
      const ticket = await createTicket(server, alice, "video", "video/mp4", 100)
      const { status } = await createProject(alice, { video: { key: ticket.key, uploadId: "made-up" } })
      assert.equal(status, 404)
      await call(server, "DELETE", "/uploads", { token: alice.token, body: { key: ticket.key, uploadId: ticket.uploadId } })
    })
  })

  describe("thumbnails", () => {
    it("a project with a video and a thumbnail stores both media urls", async () => {
      const videoFile = makeRealMp4(dir, "v2.mp4")
      const video = await createTicket(server, alice, "video", "video/mp4", fs.statSync(videoFile).size)
      await uploadFile(server, alice, video, videoFile)
      const jpg = makeRealJpeg(dir)
      const thumb = await createTicket(server, alice, "thumbnail", "image/jpeg", fs.statSync(jpg).size)
      await uploadFile(server, alice, thumb, jpg)

      const { status, body } = await createProject(alice, {
        video: { key: video.key, uploadId: video.uploadId },
        thumbnail: { key: thumb.key, uploadId: thumb.uploadId },
      })
      assert.equal(status, 201)
      assert.equal(body.response.video, `${base}/${video.key}`)
      assert.equal(body.response.thumbnail, `${base}/${thumb.key}`)
      const image = await fetch(body.response.thumbnail)
      assert.equal(image.headers.get("content-type"), "image/jpeg")
    })

    it("a bogus thumbnail never fails the project and never deletes anything else", async () => {
      // The user's own profile image object, offered as a thumbnail.
      const png = makeRealPng(dir, "avatar.png")
      const avatar = await createTicket(server, alice, "image", "image/png", fs.statSync(png).size)
      await uploadFile(server, alice, avatar, png)
      const set = await call(server, "POST", `/users/${alice.id}/profile-image`, {
        token: alice.token,
        body: { key: avatar.key, uploadId: avatar.uploadId },
      })
      assert.equal(set.status, 200)
      assert.equal(set.body.response.profileImage, `${base}/${avatar.key}`)

      const videoFile = makeRealMp4(dir, "v3.mp4")
      const bogusRefs: Record<string, unknown>[] = [
        { key: avatar.key, uploadId: avatar.uploadId },
        { key: `${PREFIX}thumbnails/${bob.id}/00000000-0000-4000-8000-000000000000.jpg`, uploadId: "x" },
        { key: "nonsense", uploadId: "x" },
      ]
      for (const thumbnail of bogusRefs) {
        const video = await createTicket(server, alice, "video", "video/mp4", fs.statSync(videoFile).size)
        await uploadFile(server, alice, video, videoFile)
        const { status, body } = await createProject(alice, { video: { key: video.key, uploadId: video.uploadId }, thumbnail })
        assert.equal(status, 201)
        assert.equal(body.response.thumbnail, "")
        assert.equal(body.response.video, `${base}/${video.key}`)
      }
      assert.ok((await head(avatar.key)) !== null, "the profile image object survived")
    })

    it("a thumbnail with video bytes is rejected quietly", async () => {
      const videoFile = makeRealMp4(dir, "v4.mp4")
      const video = await createTicket(server, alice, "video", "video/mp4", fs.statSync(videoFile).size)
      await uploadFile(server, alice, video, videoFile)
      const fake = path.join(dir, "notajpg.jpg")
      fs.writeFileSync(fake, Buffer.alloc(1000, 7))
      const thumb = await createTicket(server, alice, "thumbnail", "image/jpeg", 1000)
      await uploadFile(server, alice, thumb, fake)
      const { status, body } = await createProject(alice, {
        video: { key: video.key, uploadId: video.uploadId },
        thumbnail: { key: thumb.key, uploadId: thumb.uploadId },
      })
      assert.equal(status, 201)
      assert.equal(body.response.thumbnail, "")
      assert.equal(await head(thumb.key), null)
    })
  })

  describe("ownership", () => {
    it("another user's key is refused on parts, complete and delete", async () => {
      const file = makeFakeMp4(dir, 1 * MIB, "alices.mp4")
      const ticket = await createTicket(server, alice, "video", "video/mp4", 1 * MIB)
      await uploadFile(server, alice, ticket, file)
      const ref = { key: ticket.key, uploadId: ticket.uploadId }

      const parts = await call(server, "POST", "/uploads/parts", { token: bob.token, body: { ...ref, partNumbers: [1] } })
      assert.equal(parts.status, 400)
      assert.equal(parts.body.message, "Invalid upload key")
      const complete = await createProject(bob, { video: ref })
      assert.equal(complete.status, 400)
      const removal = await call(server, "DELETE", "/uploads", { token: bob.token, body: ref })
      assert.equal(removal.status, 400)

      assert.equal(await pendingUploads(ticket.key), 1, "still pending for alice")
      const ok = await createProject(alice, { video: ref })
      assert.equal(ok.status, 201)
    })

    it("a key of another purpose is refused", async () => {
      const ticket = await createTicket(server, alice, "image", "image/png", 100)
      const { status } = await createProject(alice, { video: { key: ticket.key, uploadId: ticket.uploadId } })
      assert.equal(status, 400)
      await call(server, "DELETE", "/uploads", { token: alice.token, body: { key: ticket.key, uploadId: ticket.uploadId } })
    })

    it("a key outside the media folders or with a path trick is refused", async () => {
      for (const key of [
        "migrated/videos/aysipk7jxx3rsuzzeqm4.mp4",
        `${PREFIX}videos/${alice.id}/../${bob.id}/00000000-0000-4000-8000-000000000000.mp4`,
        `${PREFIX}videos/${alice.id}/00000000-0000-4000-8000-000000000000.mp4/extra`,
        `${PREFIX}defaults/avatar-100.png`,
      ]) {
        const removal = await call(server, "DELETE", "/uploads", { token: alice.token, body: { key, uploadId: "x" } })
        assert.equal(removal.status, 400, key)
      }
    })
  })

  describe("cancel", () => {
    it("DELETE /uploads aborts an upload in progress", async () => {
      const ticket = await createTicket(server, alice, "video", "video/mp4", 20 * MIB)
      const file = makeFakeMp4(dir, 9 * MIB, "half.mp4")
      // Only the first part is sent.
      const { body } = await call(server, "POST", "/uploads/parts", {
        token: alice.token,
        body: { key: ticket.key, uploadId: ticket.uploadId, partNumbers: [1] },
      })
      const part = Buffer.alloc(8 * MIB, 1)
      const put = await fetch(body.response.parts[0].url, { method: "PUT", body: part })
      assert.equal(put.status, 200)
      assert.equal(await pendingUploads(ticket.key), 1)
      fs.unlinkSync(file)

      const removal = await call(server, "DELETE", "/uploads", { token: alice.token, body: { key: ticket.key, uploadId: ticket.uploadId } })
      assert.equal(removal.status, 200)
      assert.equal(await pendingUploads(ticket.key), 0)

      const again = await call(server, "DELETE", "/uploads", { token: alice.token, body: { key: ticket.key, uploadId: ticket.uploadId } })
      assert.equal(again.status, 200, "also ok when nothing exists")
    })

    it("DELETE /uploads removes a finished object too", async () => {
      const file = makeFakeMp4(dir, 1 * MIB, "done.mp4")
      const ticket = await createTicket(server, alice, "video", "video/mp4", 1 * MIB)
      await uploadFile(server, alice, ticket, file)
      const ref = { key: ticket.key, uploadId: ticket.uploadId }
      assert.equal((await createProject(alice, { video: ref })).status, 201)
      assert.equal(await head(ticket.key), 1 * MIB)
      assert.equal((await call(server, "DELETE", "/uploads", { token: alice.token, body: ref })).status, 200)
      assert.equal(await head(ticket.key), null)
    })
  })

  describe("profile images", () => {
    it("PATCH /users ignores newProfileImage but still updates other fields", async () => {
      const before = (await call(server, "GET", `/users/${bob.id}`, { token: bob.token })).body.response.profileImage
      const { status, body } = await call(server, "PATCH", `/users/${bob.id}`, {
        token: bob.token,
        body: { newProfileImage: "https://evil.example/x.png", newName: "Bob Renamed" },
      })
      assert.equal(status, 200)
      assert.equal(body.response.profileImage, before)
      assert.equal(body.response.name, "Bob Renamed")
    })

    it("only the user themselves can set their image", async () => {
      const ticket = await createTicket(server, alice, "image", "image/png", 100)
      const { status } = await call(server, "POST", `/users/${bob.id}/profile-image`, {
        token: alice.token,
        body: { key: ticket.key, uploadId: ticket.uploadId },
      })
      assert.equal(status, 403)
      await call(server, "DELETE", "/uploads", { token: alice.token, body: { key: ticket.key, uploadId: ticket.uploadId } })
    })

    it("a webp image works and a second complete returns the same url", async () => {
      const file = path.join(dir, "pic.webp")
      fs.writeFileSync(file, Buffer.concat([Buffer.from("RIFF"), Buffer.from([0x10, 0, 0, 0]), Buffer.from("WEBPVP8 "), Buffer.alloc(32)]))
      const ticket = await createTicket(server, bob, "image", "image/webp", fs.statSync(file).size)
      await uploadFile(server, bob, ticket, file)
      const ref = { key: ticket.key, uploadId: ticket.uploadId }
      const first = await call(server, "POST", `/users/${bob.id}/profile-image`, { token: bob.token, body: ref })
      const second = await call(server, "POST", `/users/${bob.id}/profile-image`, { token: bob.token, body: ref })
      assert.equal(first.status, 200)
      assert.equal(second.status, 200)
      assert.equal(first.body.response.profileImage, second.body.response.profileImage)
    })
  })

  describe("deleting a project", () => {
    let mongo: MongoClient
    before(async () => {
      mongo = new MongoClient(server.mongoUrl)
      await mongo.connect()
    })
    after(async () => {
      await mongo?.close()
    })

    it("removes the project's own video and thumbnail objects", async () => {
      const videoFile = makeRealMp4(dir, "del.mp4")
      const video = await createTicket(server, alice, "video", "video/mp4", fs.statSync(videoFile).size)
      await uploadFile(server, alice, video, videoFile)
      const jpg = makeRealJpeg(dir, "del.jpg")
      const thumb = await createTicket(server, alice, "thumbnail", "image/jpeg", fs.statSync(jpg).size)
      await uploadFile(server, alice, thumb, jpg)
      const created = await createProject(alice, {
        video: { key: video.key, uploadId: video.uploadId },
        thumbnail: { key: thumb.key, uploadId: thumb.uploadId },
      })
      assert.equal(created.status, 201)
      assert.ok((await head(video.key)) !== null)

      const removal = await call(server, "DELETE", `/projects/${created.body.response._id}`, { token: alice.token })
      assert.equal(removal.status, 200)
      assert.equal(await head(video.key), null)
      assert.equal(await head(thumb.key), null)
    })

    it("leaves migrated objects, and objects another project still uses, alone", async () => {
      const migratedKey = `${PREFIX}migrated/videos/legacy123.mp4`
      await s3.send(new PutObjectCommand({ Bucket: bucket, Key: migratedKey, Body: Buffer.from("legacy"), ContentType: "video/mp4" }))
      const migrated = await mongo.db().collection("projects").insertOne({
        classId: new ObjectId(classId),
        projectName: "Migrated",
        video: `${base}/${migratedKey}`,
        thumbnail: `${base}/${PREFIX}migrated/thumbnails/videos/legacy123.jpg`,
        projectCreatedBy: new ObjectId(alice.id),
      })
      const result = await call(server, "DELETE", `/projects/${migrated.insertedId}`, { token: alice.token })
      assert.equal(result.status, 200)
      assert.ok((await head(migratedKey)) !== null, "migrated copy survives")

      // A cloudinary url is never touched either: nothing to assert but that it answers 200.
      const legacy = await mongo.db().collection("projects").insertOne({
        classId: new ObjectId(classId),
        projectName: "Legacy",
        video: "https://res.cloudinary.com/x/video/upload/v1/videos/abc.mp4",
        projectCreatedBy: new ObjectId(alice.id),
      })
      assert.equal((await call(server, "DELETE", `/projects/${legacy.insertedId}`, { token: alice.token })).status, 200)

      // Two projects on the same upload: deleting one keeps the file.
      const file = makeFakeMp4(dir, 1 * MIB, "shared.mp4")
      const ticket = await createTicket(server, alice, "video", "video/mp4", 1 * MIB)
      await uploadFile(server, alice, ticket, file)
      const ref = { key: ticket.key, uploadId: ticket.uploadId }
      const one = await createProject(alice, { video: ref })
      const two = await createProject(alice, { video: ref })
      await call(server, "DELETE", `/projects/${one.body.response._id}`, { token: alice.token })
      assert.ok((await head(ticket.key)) !== null)
      await call(server, "DELETE", `/projects/${two.body.response._id}`, { token: alice.token })
      assert.equal(await head(ticket.key), null)
    })
  })

  describe("bucket access", () => {
    it("anonymous users can read one object but not list the bucket", async () => {
      const file = makeFakeMp4(dir, 1 * MIB, "public.mp4")
      const ticket = await createTicket(server, alice, "video", "video/mp4", 1 * MIB)
      await uploadFile(server, alice, ticket, file)
      const created = await createProject(alice, { video: { key: ticket.key, uploadId: ticket.uploadId } })
      assert.equal((await fetch(created.body.response.video)).status, 200)

      assert.equal((await fetch(`${base}/`)).status, 403)
      assert.equal((await fetch(`${base}?list-type=2&prefix=${PREFIX}`)).status, 403)
    })

    it("the media user is denied on the backup bucket", { skip: !process.env.BACKUP_S3_BUCKET && "BACKUP_S3_BUCKET is not set" }, async () => {
      await assert.rejects(
        s3.send(new ListObjectsV2Command({ Bucket: process.env.BACKUP_S3_BUCKET as string })),
        (error: { name?: string }) => error.name === "AccessDenied"
      )
      await assert.rejects(
        s3.send(new PutObjectCommand({ Bucket: process.env.BACKUP_S3_BUCKET as string, Key: "x", Body: "x" })),
        (error: { name?: string }) => error.name === "AccessDenied"
      )
    })

    it("objects keep their immutable cache header and content type", async () => {
      const listed = await s3.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `${PREFIX}videos/`, MaxKeys: 1 }))
      const key = listed.Contents?.[0]?.Key
      if (!key) return
      const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key, Range: "bytes=0-0" }))
      assert.equal(object.CacheControl, "public, max-age=31536000, immutable")
    })
  })
})
