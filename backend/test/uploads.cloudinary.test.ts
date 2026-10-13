// With MEDIA_STORAGE=cloudinary (the rollback state) Phase 1 behaviour stays and the new routes refuse politely.
import assert from "node:assert/strict"
import { after, before, describe, it } from "node:test"
import { call, dropDatabase, makeClass, MIB, RunningServer, signUp, startServer, TestUser } from "./helpers"

describe("cloudinary provider", () => {
  let server: RunningServer
  let alice: TestUser & { profileImage: string }

  before(async () => {
    // The media settings are deliberately blanked: this state must work without them.
    server = await startServer({
      MEDIA_STORAGE: "cloudinary",
      MEDIA_S3_ENDPOINT: "",
      MEDIA_PUBLIC_BASE_URL: "",
      CLOUDINARY_CLOUD_NAME: "demo",
      CLOUDINARY_API_KEY: "key",
      CLOUDINARY_API_SECRET: "secret",
    })
    alice = await signUp(server, "alice")
  })
  after(async () => {
    await server?.stop()
    if (server) await dropDatabase(server.mongoUrl)
  })

  it("reports cloudinary limits with no thumbnail support", async () => {
    const { body } = await call(server, "GET", "/uploads/limits")
    assert.equal(body.response.provider, "cloudinary")
    assert.equal(body.response.videoMaxBytes, 100 * MIB)
    assert.equal(body.response.thumbnailMaxBytes, 0)
    assert.deepEqual(body.response.videoFormats, ["mp4", "mov", "avi"])
  })

  it("keeps the Cloudinary default avatar when no media base url is set", () => {
    assert.match(alice.profileImage, /^https:\/\/res\.cloudinary\.com\//)
  })

  it("rejects the thumbnail purpose", async () => {
    const { status, body } = await call(server, "POST", "/uploads", {
      token: alice.token,
      body: { purpose: "thumbnail", fileName: "t.jpg", contentType: "image/jpeg", sizeBytes: 100 },
    })
    assert.equal(status, 400)
    assert.equal(body.message, "Invalid purpose")
  })

  it("answers POST /uploads/parts with 400 Not used by this provider", async () => {
    const { status, body } = await call(server, "POST", "/uploads/parts", {
      token: alice.token,
      body: { key: `videos/${alice.id}/123e4567-e89b-42d3-a456-426614174000`, uploadId: "x", partNumbers: [1] },
    })
    assert.equal(status, 400)
    assert.equal(body.message, "Not used by this provider")
  })

  it("still creates a signed ticket for a video", async () => {
    const { status, body } = await call(server, "POST", "/uploads", {
      token: alice.token,
      body: { purpose: "video", fileName: "v.mp4", contentType: "video/mp4", sizeBytes: 5 * MIB },
    })
    assert.equal(status, 200)
    assert.equal(body.response.provider, "cloudinary")
    assert.match(body.response.key, new RegExp(`^videos/${alice.id}/`))
  })

  it("a project with a thumbnail reference but no usable one is still created", async () => {
    const classId = await makeClass(server)
    const { status, body } = await call(server, "POST", `/classes/${classId}/projects`, {
      token: alice.token,
      body: { projectName: "P", thumbnail: { key: "x", uploadId: "y" } },
    })
    assert.equal(status, 201)
    assert.equal(body.response.thumbnail, "")
  })
})
