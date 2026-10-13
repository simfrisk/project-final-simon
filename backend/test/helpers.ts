// Shared helpers for the integration tests. The tests run against a local MongoDB and a local S3 compatible
// server (MinIO). Nothing here touches OSC, Cloudinary or any production data. They read their settings from
// the environment and skip themselves when the S3 settings are missing:
//   TEST_MONGO_BASE      e.g. mongodb://127.0.0.1:27017 (a throwaway database is created per run)
//   MEDIA_S3_ENDPOINT, MEDIA_S3_BUCKET, MEDIA_S3_ACCESS_KEY, MEDIA_S3_SECRET_KEY, MEDIA_PUBLIC_BASE_URL
//   BACKUP_S3_ENDPOINT, BACKUP_S3_BUCKET, BACKUP_S3_ACCESS_KEY, BACKUP_S3_SECRET_KEY (for the ops tests)

import { ChildProcess, spawn, spawnSync } from "child_process"
import crypto from "crypto"
import fs from "fs"
import net from "net"
import os from "os"
import path from "path"
import { AbortMultipartUploadCommand, S3Client } from "@aws-sdk/client-s3"
import { MongoClient } from "mongodb"

export const BACKEND_DIR = path.resolve(__dirname, "..")
export const MIB = 1024 * 1024

// The tests write and delete objects and drop databases, so they only ever run against a server on this machine.
// A remote endpoint (a real MinIO, a real database) makes the suites skip instead of touching it.
const isLocal = (value: string | undefined): boolean => {
  try {
    return ["127.0.0.1", "localhost", "[::1]"].includes(new URL(value as string).hostname)
  } catch {
    return false
  }
}

export const haveS3Env = (): boolean =>
  ["MEDIA_S3_ENDPOINT", "MEDIA_S3_BUCKET", "MEDIA_S3_ACCESS_KEY", "MEDIA_S3_SECRET_KEY", "MEDIA_PUBLIC_BASE_URL"].every(
    (name) => Boolean(process.env[name])
  ) && isLocal(process.env.MEDIA_S3_ENDPOINT)

export const haveBackupEnv = (): boolean =>
  ["BACKUP_S3_ENDPOINT", "BACKUP_S3_BUCKET", "BACKUP_S3_ACCESS_KEY", "BACKUP_S3_SECRET_KEY"].every((name) =>
    Boolean(process.env[name])
  ) && isLocal(process.env.BACKUP_S3_ENDPOINT)

// Every test file runs in its own process, so this is unique per file and per run. All keys and prefixes a test
// writes carry it, and cleanup removes only those, which keeps parallel files and shared buckets apart.
export const RUN_ID = crypto.randomBytes(4).toString("hex")
export const testPrefix = (name: string): string => `${name}-${RUN_ID}/`

export const mongoBase = (): string => {
  const base = process.env.TEST_MONGO_BASE || "mongodb://127.0.0.1:27017"
  if (!isLocal(base)) throw new Error("TEST_MONGO_BASE must point at this machine")
  return base
}

export const freshMongoUrl = (): string => `${mongoBase()}/classync-test-${crypto.randomBytes(4).toString("hex")}`

export const dropDatabase = async (url: string): Promise<void> => {
  const client = new MongoClient(url)
  await client.connect()
  try {
    await client.db().dropDatabase()
  } finally {
    await client.close()
  }
}

const freePort = (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = net.createServer()
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as net.AddressInfo
      server.close(() => resolve(port))
    })
    server.on("error", reject)
  })

export interface RunningServer {
  url: string
  mongoUrl: string
  stop: () => Promise<void>
  logs: () => string
}

/** Starts the built backend (dist/server.js) on a free port. Run `npm run build` first. */
export const startServer = async (extraEnv: Record<string, string>): Promise<RunningServer> => {
  const port = await freePort()
  const mongoUrl = extraEnv.MONGO_URL || freshMongoUrl()
  // APP_URL is left unset on purpose: that is the local development mode, not the OSC mode.
  const env: NodeJS.ProcessEnv = {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    PORT: String(port),
    MONGO_URL: mongoUrl,
    ...Object.fromEntries(
      [
        "MEDIA_S3_ENDPOINT",
        "MEDIA_S3_BUCKET",
        "MEDIA_S3_ACCESS_KEY",
        "MEDIA_S3_SECRET_KEY",
        "MEDIA_PUBLIC_BASE_URL",
        "BACKUP_S3_ENDPOINT",
        "BACKUP_S3_BUCKET",
        "BACKUP_S3_ACCESS_KEY",
        "BACKUP_S3_SECRET_KEY",
      ]
        .filter((name) => process.env[name])
        .map((name) => [name, process.env[name]])
    ),
    ...extraEnv,
  }
  const child: ChildProcess = spawn(process.execPath, [path.join(BACKEND_DIR, "dist/server.js")], {
    cwd: BACKEND_DIR,
    env,
  })
  let output = ""
  child.stdout?.on("data", (chunk) => (output += chunk))
  child.stderr?.on("data", (chunk) => (output += chunk))

  const url = `http://127.0.0.1:${port}`
  for (let i = 0; i < 100; i++) {
    try {
      const response = await fetch(`${url}/health`)
      if (response.status === 200) break
    } catch {
      // not up yet
    }
    if (child.exitCode !== null) throw new Error(`server exited early:\n${output}`)
    await new Promise((resolve) => setTimeout(resolve, 150))
  }

  return {
    url,
    mongoUrl,
    logs: () => output,
    stop: async () => {
      child.kill("SIGTERM")
      await new Promise((resolve) => child.once("exit", resolve))
    },
  }
}

export interface Json {
  status: number
  body: any
}

export const call = async (
  server: RunningServer,
  method: string,
  route: string,
  options: { token?: string; body?: unknown } = {}
): Promise<Json> => {
  const response = await fetch(`${server.url}${route}`, {
    method,
    headers: {
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(options.token ? { Authorization: options.token } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })
  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    body = null
  }
  return { status: response.status, body }
}

export interface TestUser {
  id: string
  token: string
}

export const signUp = async (server: RunningServer, label: string, role: "teacher" | "student" = "teacher"): Promise<TestUser & { profileImage: string }> => {
  const email = `${label}-${crypto.randomBytes(3).toString("hex")}@example.test`
  const { status, body } = await call(server, "POST", "/users", {
    body: { name: `Test ${label}`, email, password: "test-password-1", role },
  })
  if (status !== 201) throw new Error(`sign up failed: ${status} ${JSON.stringify(body)}`)
  return { id: body.userId, token: body.accessToken, profileImage: body.profileImage }
}

export const makeClass = async (server: RunningServer): Promise<string> => {
  const workspaceId = crypto.randomBytes(12).toString("hex")
  const { status, body } = await call(server, "POST", `/workspace/${workspaceId}/classes`, { body: { classTitle: "Test class" } })
  if (status !== 201) throw new Error(`class failed: ${status}`)
  return body.response._id
}

export const makeScratchDir = (): string => fs.mkdtempSync(path.join(os.tmpdir(), "classync-test-"))

/** A real, playable H.264 + AAC faststart MP4 made with ffmpeg. */
export const makeRealMp4 = (dir: string, name = "real.mp4", seconds = 2): string => {
  const file = path.join(dir, name)
  const result = spawnSync("ffmpeg", [
    "-y", "-loglevel", "error",
    "-f", "lavfi", "-i", `testsrc=duration=${seconds}:size=320x240:rate=15`,
    "-f", "lavfi", "-i", `sine=frequency=440:duration=${seconds}`,
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-movflags", "+faststart", "-shortest", file,
  ])
  if (result.status !== 0) throw new Error(`ffmpeg failed: ${result.stderr}`)
  return file
}

export const makeRealJpeg = (dir: string, name = "thumb.jpg"): string => {
  const file = path.join(dir, name)
  const result = spawnSync("ffmpeg", [
    "-y", "-loglevel", "error", "-f", "lavfi", "-i", "testsrc=duration=1:size=600x400:rate=1", "-frames:v", "1", file,
  ])
  if (result.status !== 0) throw new Error(`ffmpeg failed: ${result.stderr}`)
  return file
}

export const makeRealPng = (dir: string, name = "pic.png"): string => {
  const file = path.join(dir, name)
  const result = spawnSync("ffmpeg", [
    "-y", "-loglevel", "error", "-f", "lavfi", "-i", "testsrc=duration=1:size=100x100:rate=1", "-frames:v", "1", file,
  ])
  if (result.status !== 0) throw new Error(`ffmpeg failed: ${result.stderr}`)
  return file
}

/** Starts like an MP4 (an ftyp box) and is then random bytes: enough for size and format checks, not playable. */
export const makeFakeMp4 = (dir: string, bytes: number, name = "fake.mp4"): string => {
  const file = path.join(dir, name)
  const head = Buffer.alloc(16)
  head.writeUInt32BE(16, 0)
  head.write("ftyp", 4, "ascii")
  head.write("isom", 8, "ascii")
  fs.writeFileSync(file, Buffer.concat([head, crypto.randomBytes(bytes - 16)]))
  return file
}

export interface UploadTicket {
  provider: "s3"
  key: string
  uploadId: string
  partSizeBytes: number
  partCount: number
  expiresAt: string
}

// Every ticket this process created, so cleanup can abort exactly those uploads. MinIO only lists unfinished
// uploads by their full key, so there is no way to find them again by prefix.
export const openedUploads: { key: string; uploadId: string }[] = []

export const abortOpened = async (client: S3Client, bucket: string): Promise<void> => {
  for (const upload of openedUploads) {
    await client.send(new AbortMultipartUploadCommand({ Bucket: bucket, Key: upload.key, UploadId: upload.uploadId })).catch(() => undefined)
  }
}

export const createTicket = async (
  server: RunningServer,
  user: TestUser,
  purpose: string,
  contentType: string,
  sizeBytes: number
): Promise<UploadTicket> => {
  const { status, body } = await call(server, "POST", "/uploads", {
    token: user.token,
    body: { purpose, fileName: "x", contentType, sizeBytes },
  })
  if (status !== 200) throw new Error(`ticket failed: ${status} ${JSON.stringify(body)}`)
  openedUploads.push({ key: body.response.key, uploadId: body.response.uploadId })
  return body.response
}

/** Signs and PUTs every part of a file. Part URLs are used exactly as given, with no request headers added. */
export const uploadFile = async (
  server: RunningServer,
  user: TestUser,
  ticket: UploadTicket,
  file: string,
  options: { useCurl?: boolean } = {}
): Promise<void> => {
  const size = fs.statSync(file).size
  const partNumbers = Array.from({ length: Math.ceil(size / ticket.partSizeBytes) }, (_, i) => i + 1)
  const { status, body } = await call(server, "POST", "/uploads/parts", {
    token: user.token,
    body: { key: ticket.key, uploadId: ticket.uploadId, partNumbers },
  })
  if (status !== 200) throw new Error(`sign failed: ${status} ${JSON.stringify(body)}`)

  const fd = fs.openSync(file, "r")
  try {
    for (const part of body.response.parts as { partNumber: number; url: string }[]) {
      const start = (part.partNumber - 1) * ticket.partSizeBytes
      const length = Math.min(ticket.partSizeBytes, size - start)
      const buffer = Buffer.alloc(length)
      fs.readSync(fd, buffer, 0, length, start)

      if (options.useCurl) {
        const partFile = path.join(path.dirname(file), `part-${part.partNumber}.bin`)
        fs.writeFileSync(partFile, buffer)
        const result = spawnSync("curl", ["-sS", "-f", "-X", "PUT", "-T", partFile, part.url])
        fs.unlinkSync(partFile)
        if (result.status !== 0) throw new Error(`curl part ${part.partNumber} failed: ${result.stderr}`)
      } else {
        const response = await fetch(part.url, { method: "PUT", body: buffer })
        if (response.status !== 200) throw new Error(`part ${part.partNumber} failed: ${response.status}`)
      }
    }
  } finally {
    fs.closeSync(fd)
  }
}
