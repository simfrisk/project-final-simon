// Boot time configuration rules (blueprint B2-1) and key ownership rules (B2-2).
import assert from "node:assert/strict"
import path from "path"
import { describe, it } from "node:test"
import { spawnSync } from "child_process"
import { BACKEND_DIR } from "./helpers"

const bootWith = (env: Record<string, string>): { status: number | null; out: string } => {
  // The built config module, started the way the server starts it: with APP_URL set it behaves as on OSC.
  const result = spawnSync(
    process.execPath,
    ["-e", `require(${JSON.stringify(path.join(BACKEND_DIR, "dist/config"))}).reportConfig()`],
    { cwd: BACKEND_DIR, env: { PATH: process.env.PATH, ...env } }
  )
  return { status: result.status, out: `${result.stdout}${result.stderr}` }
}

const OSC_BASE = { APP_URL: "https://example.test", MONGO_URL: "mongodb://x", FRONTEND_URL: "https://f.test" }
const S3_KEYS = {
  MEDIA_S3_ENDPOINT: "https://m.test",
  MEDIA_S3_BUCKET: "classync-media",
  MEDIA_S3_ACCESS_KEY: "ak",
  MEDIA_S3_SECRET_KEY: "sk",
  MEDIA_PUBLIC_BASE_URL: "https://m.test/classync-media",
}

describe("configuration on OSC", () => {
  it("s3 without a secret key exits 1 and names the key", () => {
    const { MEDIA_S3_SECRET_KEY: _omit, ...rest } = S3_KEYS
    const { status, out } = bootWith({ ...OSC_BASE, MEDIA_STORAGE: "s3", ...rest })
    assert.equal(status, 1)
    assert.match(out, /MEDIA_S3_SECRET_KEY is missing/)
  })

  it("s3 does not require the Cloudinary keys", () => {
    const { status, out } = bootWith({ ...OSC_BASE, MEDIA_STORAGE: "s3", ...S3_KEYS })
    assert.equal(status, 0, out)
    assert.ok(!out.includes("CLOUDINARY_CLOUD_NAME is missing"))
  })

  it("cloudinary still requires the Cloudinary keys and not the media keys", () => {
    const missing = bootWith({ ...OSC_BASE, MEDIA_STORAGE: "cloudinary" })
    assert.equal(missing.status, 1)
    assert.match(missing.out, /CLOUDINARY_API_SECRET is missing/)
    assert.ok(!missing.out.includes("MEDIA_S3_ENDPOINT is missing"))

    const ok = bootWith({
      ...OSC_BASE,
      MEDIA_STORAGE: "cloudinary",
      CLOUDINARY_CLOUD_NAME: "c",
      CLOUDINARY_API_KEY: "k",
      CLOUDINARY_API_SECRET: "s",
    })
    assert.equal(ok.status, 0, ok.out)
  })

  it("the media mirror needs the media keys and the backup keys, even on cloudinary", () => {
    const { status, out } = bootWith({
      ...OSC_BASE,
      MEDIA_STORAGE: "cloudinary",
      CLOUDINARY_CLOUD_NAME: "c",
      CLOUDINARY_API_KEY: "k",
      CLOUDINARY_API_SECRET: "s",
      MEDIA_MIRROR_ENABLED: "true",
    })
    assert.equal(status, 1)
    assert.match(out, /MEDIA_S3_ENDPOINT is missing/)
    assert.match(out, /BACKUP_S3_ACCESS_KEY is missing/)
  })

  it("a masked secret is refused", () => {
    const { status, out } = bootWith({ ...OSC_BASE, MEDIA_STORAGE: "s3", ...S3_KEYS, MEDIA_S3_SECRET_KEY: "***" })
    assert.equal(status, 1)
    assert.match(out, /MEDIA_S3_SECRET_KEY arrived masked/)
  })

  it("an unknown provider is refused", () => {
    const { status, out } = bootWith({ ...OSC_BASE, MEDIA_STORAGE: "gcs" })
    assert.equal(status, 1)
    assert.match(out, /MEDIA_STORAGE must be/)
  })

  it("boot logs show presence and length but never a value", () => {
    const { out } = bootWith({ ...OSC_BASE, MEDIA_STORAGE: "s3", ...S3_KEYS, MEDIA_S3_SECRET_KEY: "super-secret-value" })
    assert.match(out, /MEDIA_S3_SECRET_KEY present=true len=18 masked=false/)
    assert.ok(!out.includes("super-secret-value"))
  })
})

describe("derived configuration", () => {
  const show = (env: Record<string, string>, expr: string): string =>
    spawnSync(process.execPath, ["-e", `console.log(${expr})`.replace("config", `require(${JSON.stringify(path.join(BACKEND_DIR, "dist/config"))}).config`)], {
      cwd: BACKEND_DIR,
      env: { PATH: process.env.PATH, ...env },
    })
      .stdout.toString()
      .trim()

  it("the default avatar follows MEDIA_PUBLIC_BASE_URL", () => {
    assert.equal(show({ MEDIA_PUBLIC_BASE_URL: "https://m.test/classync-media/" }, "config.defaultProfileImageUrl"), "https://m.test/classync-media/defaults/avatar-100.png")
    assert.match(show({}, "config.defaultProfileImageUrl"), /^https:\/\/res\.cloudinary\.com\//)
  })

  it("the video cap defaults to 100 MB on cloudinary and 400 MB on s3, and MAX_VIDEO_MB wins", () => {
    assert.equal(show({}, "config.maxVideoBytes"), String(100 * 1024 * 1024))
    assert.equal(show({ MEDIA_STORAGE: "s3" }, "config.maxVideoBytes"), String(400 * 1024 * 1024))
    assert.equal(show({ MEDIA_STORAGE: "s3", MAX_VIDEO_MB: "250" }, "config.maxVideoBytes"), String(250 * 1024 * 1024))
  })
})

describe("object keys", () => {
  const user = "6ac4c0a9c5d63389c5e1c90b"
  const other = "6ac4c0a9c5d63389c5e1c90c"
  const uuid = "123e4567-e89b-42d3-a456-426614174000"
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { parseOwnedKey, buildKey } = require(path.join(BACKEND_DIR, "dist/media/keys"))
  const { UploadError } = require(path.join(BACKEND_DIR, "dist/media/types"))

  it("accepts the caller's own thumbnail key for purpose thumbnail only", () => {
    const key = `thumbnails/${user}/${uuid}.jpg`
    assert.deepEqual(parseOwnedKey(user, key, "thumbnail"), { purpose: "thumbnail", uuid, extension: "jpg" })
    assert.throws(() => parseOwnedKey(other, key, "thumbnail"), UploadError)
    assert.throws(() => parseOwnedKey(user, key, "video"), (error: { status: number }) => error.status === 400)
    assert.throws(() => parseOwnedKey(user, key, "image"), UploadError)
  })

  it("builds keys that parse back, with and without an extension", () => {
    assert.deepEqual(parseOwnedKey(user, buildKey(user, "video", uuid, "mp4"), "video"), { purpose: "video", uuid, extension: "mp4" })
    assert.deepEqual(parseOwnedKey(user, buildKey(user, "image", uuid), "image"), { purpose: "image", uuid, extension: "" })
  })

  it("refuses keys outside the user's folders", () => {
    for (const key of [`migrated/videos/${uuid}.mp4`, `videos/${other}/${uuid}.mp4`, `videos/${user}/${uuid}.mp4/x`, `videos/${user}/../${other}/${uuid}.mp4`, "", `videos/${user}/${uuid.toUpperCase()}.mp4`]) {
      assert.throws(() => parseOwnedKey(user, key), UploadError, key)
    }
  })
})
