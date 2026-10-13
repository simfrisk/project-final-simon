// Mac side. Copies the Cloudinary assets listed in inventory.json into the media bucket, proves every copy
// through its public URL, and writes the mapping that /ops/rewrite-media-urls uses.
//
// What it reads: public Cloudinary delivery URLs (plain downloads). What it writes: new objects in the media
// bucket (never overwrites one), local files, and the report files in the backup bucket under phase2/<timestamp>/.
// It never touches Cloudinary beyond downloading, and never touches a database.

import crypto from "crypto"
import fs from "fs"
import os from "os"
import path from "path"
import { Readable } from "stream"
import { pipeline } from "stream/promises"
import { spawn } from "child_process"
import { HeadObjectCommand } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { config, DEFAULT_PROFILE_IMAGE_KEY, LEGACY_DEFAULT_PROFILE_IMAGE_URL } from "../config"
import { getMediaS3, mediaBucket } from "../media/s3Client"
import { matchesMagicBytes } from "../media/sniff"
import { timestampFolder } from "./bsonTools"
import { deliveryUrl, mp4RenditionUrl, parseCloudinaryUrl } from "./cloudinary"
import { Inventory, InventoryItem } from "./mediaInventory"
import { putObject } from "./s3"
import { MediaMapping, MediaMappingEntry } from "./types"

const PART_SIZE_BYTES = 8 * 1024 * 1024
const CACHE_CONTROL = "public, max-age=31536000, immutable"

const CONTENT_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/mp4", // never stored as a .mov: videos are copied as MP4 and labelled video/mp4
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
}

export interface StreamInfo {
  codec_type?: string
  codec_name?: string
  width?: number
  height?: number
}

export interface CopiedItemReport {
  key: string
  fields: string[]
  kind: InventoryItem["kind"]
  sourceUrl: string
  renditionUsed: boolean
  renditionReason?: string
  bytes: number
  sha256: string
  contentType: string
  faststart?: boolean
  status: "uploaded" | "already-there" | "dry-run" | "failed"
  verified?: { sha256: boolean; contentType: boolean; range?: boolean; codecs?: string }
  error?: string
}

export interface CopyReport {
  version: 1
  dryRun: boolean
  startedAt: string
  finishedAt: string
  mediaBaseUrl: string
  sourceBackup: string
  objects: number
  bytes: number
  renditions: number
  failures: number
  items: CopiedItemReport[]
  handover: { defaultProfile?: string; demo?: string; demoError?: string }
}

// ---------------------------------------------------------------------------------------------------------
// small helpers

const run = (command: string, args: string[], timeoutMs = 120000): Promise<{ code: number | null; stdout: string; stderr: string }> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args)
    let stdout = ""
    let stderr = ""
    const timer = setTimeout(() => child.kill("SIGKILL"), timeoutMs)
    child.stdout.on("data", (chunk) => (stdout += chunk))
    child.stderr.on("data", (chunk) => (stderr += chunk))
    child.on("error", (error) => {
      clearTimeout(timer)
      reject(new Error(`${command} could not be started: ${error.message}`))
    })
    child.on("close", (code) => {
      clearTimeout(timer)
      resolve({ code, stdout, stderr })
    })
  })

/** Streams of a local file or a public URL, from ffprobe. Throws when ffprobe cannot read it. */
export const probeStreams = async (target: string): Promise<StreamInfo[]> => {
  const result = await run("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", target])
  if (result.code !== 0) throw new Error(`ffprobe could not read the file: ${result.stderr.trim().slice(0, 200)}`)
  return (JSON.parse(result.stdout) as { streams?: StreamInfo[] }).streams ?? []
}

/** True when every video is H.264 and every audio track is AAC (or there is none). */
export const isBrowserSafe = (streams: StreamInfo[]): boolean => {
  const video = streams.filter((stream) => stream.codec_type === "video" && stream.codec_name !== "mjpeg" && stream.codec_name !== "png")
  const audio = streams.filter((stream) => stream.codec_type === "audio")
  return video.length > 0 && video.every((stream) => stream.codec_name === "h264") && audio.every((stream) => stream.codec_name === "aac")
}

const describeStreams = (streams: StreamInfo[]): string =>
  streams.map((stream) => `${stream.codec_type}:${stream.codec_name}`).join(",")

/** True when the moov box comes before the mdat box, so playback can start before the whole file is there. */
export const isFastStart = (file: string): boolean => {
  const fd = fs.openSync(file, "r")
  try {
    const size = fs.fstatSync(fd).size
    let offset = 0
    const header = Buffer.alloc(16)
    while (offset + 8 <= size) {
      fs.readSync(fd, header, 0, 16, offset)
      let boxSize = header.readUInt32BE(0)
      const type = header.toString("ascii", 4, 8)
      if (type === "moov") return true
      if (type === "mdat") return false
      if (boxSize === 1) boxSize = Number(header.readBigUInt64BE(8))
      else if (boxSize === 0) boxSize = size - offset
      if (boxSize < 8) return false
      offset += boxSize
    }
    return false
  } finally {
    fs.closeSync(fd)
  }
}

export interface Downloaded {
  bytes: number
  sha256: string
  contentType: string
}

/** Downloads a public URL to a file while hashing it. Anything but a 200 is an error. */
export const downloadTo = async (url: string, file: string): Promise<Downloaded> => {
  const response = await fetch(url)
  if (response.status !== 200 || !response.body) throw new Error(`Download answered ${response.status}`)
  const hash = crypto.createHash("sha256")
  let bytes = 0
  const source = Readable.fromWeb(response.body as unknown as import("stream/web").ReadableStream)
  source.on("data", (chunk: Buffer) => {
    hash.update(chunk)
    bytes += chunk.length
  })
  await pipeline(source, fs.createWriteStream(file))
  const declared = Number(response.headers.get("content-length") ?? "")
  if (Number.isFinite(declared) && declared > 0 && declared !== bytes) {
    throw new Error(`Download was cut short (${bytes} of ${declared} bytes)`)
  }
  return { bytes, sha256: hash.digest("hex"), contentType: (response.headers.get("content-type") ?? "").split(";")[0].trim() }
}

const extOf = (item: InventoryItem): string => (item.format || "").toLowerCase()

// ---------------------------------------------------------------------------------------------------------
// planning

interface PlannedObject {
  key: string
  kind: InventoryItem["kind"]
  contentType: string
  items: InventoryItem[]
  primary: InventoryItem
}

const keyFor = (item: InventoryItem): { key: string; contentType: string } => {
  const prefix = config.mediaFolderPrefix
  const ext = extOf(item)
  switch (item.kind) {
    case "video":
      // Always an MP4: either the original was one, or the rendition is.
      return { key: `${prefix}migrated/${item.publicId}.mp4`, contentType: CONTENT_TYPES.mp4 }
    case "thumbnail":
      if (!CONTENT_TYPES[ext]) throw new Error(`Unknown thumbnail format "${ext}" for ${item.publicId}`)
      return { key: `${prefix}migrated/thumbnails/${item.publicId}.${ext}`, contentType: CONTENT_TYPES[ext] }
    case "profile":
      if (!CONTENT_TYPES[ext]) throw new Error(`Unknown image format "${ext}" for ${item.publicId}`)
      return { key: `${prefix}migrated/${item.publicId}.${ext}`, contentType: CONTENT_TYPES[ext] }
    case "default":
      if (ext !== "png") throw new Error("The default avatar is expected to be a PNG")
      return { key: `${prefix}${DEFAULT_PROFILE_IMAGE_KEY}`, contentType: CONTENT_TYPES.png }
  }
}

export const planObjects = (inventory: Inventory): PlannedObject[] => {
  const byKey = new Map<string, PlannedObject>()
  for (const item of inventory.items) {
    const { key, contentType } = keyFor(item)
    const existing = byKey.get(key)
    if (existing) {
      if (existing.primary.storedUrl !== item.storedUrl) {
        throw new Error(`Two different Cloudinary URLs would be copied to the same key ${key}`)
      }
      existing.items.push(item)
    } else {
      byKey.set(key, { key, kind: item.kind, contentType, items: [item], primary: item })
    }
  }
  return [...byKey.values()]
}

// ---------------------------------------------------------------------------------------------------------
// one object

const requireEnv = (names: string[]): void => {
  const missing = names.filter((name) => !process.env[name])
  if (missing.length > 0) throw new Error(`Missing ${missing.join(", ")} in the environment`)
}

const publicUrlOf = (key: string): string => `${config.mediaPublicBaseUrl}/${key}`

/** Fetches an object through its public URL, with no credentials, and compares it with what was uploaded. */
export const verifyPublic = async (input: {
  key: string
  sha256: string
  bytes: number
  contentType: string
  isVideo: boolean
}): Promise<NonNullable<CopiedItemReport["verified"]>> => {
  const url = publicUrlOf(input.key)
  const response = await fetch(url)
  if (response.status !== 200 || !response.body) throw new Error(`Public URL answered ${response.status}`)
  const hash = crypto.createHash("sha256")
  let bytes = 0
  for await (const chunk of Readable.fromWeb(response.body as unknown as import("stream/web").ReadableStream)) {
    hash.update(chunk as Buffer)
    bytes += (chunk as Buffer).length
  }
  const verified: NonNullable<CopiedItemReport["verified"]> = {
    sha256: hash.digest("hex") === input.sha256 && bytes === input.bytes,
    contentType: (response.headers.get("content-type") ?? "").split(";")[0].trim() === input.contentType,
  }
  if (!verified.sha256) throw new Error("The public copy does not match the source (sha256)")
  if (!verified.contentType) throw new Error("The public copy has the wrong content type")

  if (input.isVideo) {
    const range = await fetch(url, { headers: { Range: "bytes=0-1023" } })
    await range.arrayBuffer()
    verified.range = range.status === 206
    if (!verified.range) throw new Error(`A range request answered ${range.status}, not 206`)
    const streams = await probeStreams(url)
    verified.codecs = describeStreams(streams)
    if (!isBrowserSafe(streams)) throw new Error(`The public video is not H.264 + AAC (${verified.codecs})`)
  }
  return verified
}

/** Uploads a file under a key that must not hold different content. Returns whether anything was written. */
const putIfAbsent = async (input: { key: string; file: string; sha256: string; bytes: number; contentType: string }): Promise<"uploaded" | "already-there"> => {
  const s3 = getMediaS3()
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: mediaBucket(), Key: input.key }))
    if (head.Metadata?.sha256 === input.sha256 && head.ContentLength === input.bytes) return "already-there"
    // Objects are immutable. A different file under a taken key is a problem to look at, never to overwrite.
    throw new Error(`Key ${input.key} already holds different content`)
  } catch (error) {
    const e = error as { name?: string; $metadata?: { httpStatusCode?: number } }
    if (!(e.name === "NotFound" || e.name === "NoSuchKey" || e.$metadata?.httpStatusCode === 404)) throw error
  }

  await new Upload({
    client: s3,
    params: {
      Bucket: mediaBucket(),
      Key: input.key,
      Body: fs.createReadStream(input.file),
      ContentType: input.contentType,
      CacheControl: CACHE_CONTROL,
      Metadata: { sha256: input.sha256 },
    },
    partSize: PART_SIZE_BYTES,
    queueSize: 2,
  }).done()
  return "uploaded"
}

interface CopiedFile {
  file: string
  download: Downloaded
  sourceUrl: string
  renditionUsed: boolean
  renditionReason?: string
  faststart?: boolean
}

/** Gets the file that goes into the bucket for one object: the original, or an MP4 rendition when it has to be. */
const fetchSource = async (obj: PlannedObject, workDir: string): Promise<CopiedFile> => {
  const item = obj.primary
  const file = path.join(workDir, crypto.randomBytes(6).toString("hex"))

  if (obj.kind !== "video") {
    const download = await downloadTo(deliveryUrl(item.storedUrl), file)
    if (download.bytes === 0) throw new Error("The download is empty")
    const head = fs.readFileSync(file).subarray(0, 16)
    if (!matchesMagicBytes("image", extOf(item) === "jpeg" ? "jpg" : extOf(item), head)) {
      throw new Error("The downloaded image does not look like its format")
    }
    // An original can be compared with the size the Admin API reports. A rendition cannot.
    if (!item.transformation && download.bytes !== item.bytes) {
      throw new Error(`Size differs from the Admin API (${download.bytes} against ${item.bytes})`)
    }
    return { file, download, sourceUrl: item.storedUrl, renditionUsed: false }
  }

  let reason: string | undefined
  // The stored file is used as it is only when it is an MP4. A .mov always goes through the rendition.
  if (extOf(item) === "mp4") {
    const download = await downloadTo(deliveryUrl(item.storedUrl), file)
    if (!item.transformation && download.bytes !== item.bytes) {
      throw new Error(`Size differs from the Admin API (${download.bytes} against ${item.bytes})`)
    }
    const streams = await probeStreams(file)
    if (isBrowserSafe(streams)) {
      return { file, download, sourceUrl: item.storedUrl, renditionUsed: false, faststart: isFastStart(file) }
    }
    reason = `original is ${describeStreams(streams)}`
  } else {
    reason = `stored as .${extOf(item) || "unknown"}`
  }

  const renditionUrl = mp4RenditionUrl(item.storedUrl)
  const download = await downloadTo(deliveryUrl(renditionUrl), file)
  const streams = await probeStreams(file)
  if (!isBrowserSafe(streams)) throw new Error(`The MP4 rendition is not H.264 + AAC either (${describeStreams(streams)})`)
  return { file, download, sourceUrl: renditionUrl, renditionUsed: true, renditionReason: reason, faststart: isFastStart(file) }
}

const copyObject = async (obj: PlannedObject, options: { dryRun: boolean; workDir: string }): Promise<CopiedItemReport> => {
  const base: CopiedItemReport = {
    key: obj.key,
    fields: obj.items.map((item) => item.field),
    kind: obj.kind,
    sourceUrl: obj.primary.storedUrl,
    renditionUsed: false,
    bytes: 0,
    sha256: "",
    contentType: obj.contentType,
    status: "failed",
  }
  let source: CopiedFile | null = null
  try {
    source = await fetchSource(obj, options.workDir)
    const report: CopiedItemReport = {
      ...base,
      sourceUrl: source.sourceUrl,
      renditionUsed: source.renditionUsed,
      renditionReason: source.renditionReason,
      bytes: source.download.bytes,
      sha256: source.download.sha256,
      faststart: source.faststart,
    }
    if (options.dryRun) return { ...report, status: "dry-run" }

    report.status = await putIfAbsent({
      key: obj.key,
      file: source.file,
      sha256: source.download.sha256,
      bytes: source.download.bytes,
      contentType: obj.contentType,
    })
    report.verified = await verifyPublic({
      key: obj.key,
      sha256: source.download.sha256,
      bytes: source.download.bytes,
      contentType: obj.contentType,
      isVideo: obj.kind === "video",
    })
    return report
  } catch (error) {
    return { ...base, status: "failed", error: error instanceof Error ? error.message : String(error) }
  } finally {
    if (source) fs.rmSync(source.file, { force: true })
  }
}

// ---------------------------------------------------------------------------------------------------------
// handover files for the frontend

const writeHandover = async (input: {
  outDir: string
  defaultFile?: string
  demoUrl?: string
  workDir: string
}): Promise<CopyReport["handover"]> => {
  const handoverDir = path.join(input.outDir, "handover")
  fs.mkdirSync(handoverDir, { recursive: true })
  const handover: CopyReport["handover"] = {}

  if (input.defaultFile) {
    const target = path.join(handoverDir, "default-profile.png")
    fs.copyFileSync(input.defaultFile, target)
    handover.defaultProfile = target
  }

  if (input.demoUrl) {
    const tmp = path.join(input.workDir, "demo.mp4")
    try {
      let streams: StreamInfo[] = []
      let used = input.demoUrl
      await downloadTo(deliveryUrl(used), tmp)
      streams = await probeStreams(tmp).catch(() => [])
      if (!isBrowserSafe(streams)) {
        // The stored URL asks for f_mp4 on a .mov. If what came back is not an H.264 + AAC MP4, ask for one outright.
        used = mp4RenditionUrl(input.demoUrl)
        await downloadTo(deliveryUrl(used), tmp)
        streams = await probeStreams(tmp)
        if (!isBrowserSafe(streams)) throw new Error(`The demo rendition is ${describeStreams(streams)}`)
      }
      const target = path.join(handoverDir, "demo-timeline.mp4")
      fs.copyFileSync(tmp, target)
      handover.demo = target
    } catch (error) {
      handover.demoError = error instanceof Error ? error.message : String(error)
    } finally {
      fs.rmSync(tmp, { force: true })
    }
  }
  return handover
}

// ---------------------------------------------------------------------------------------------------------
// commands

const MEDIA_ENV = ["MEDIA_S3_ENDPOINT", "MEDIA_S3_BUCKET", "MEDIA_S3_ACCESS_KEY", "MEDIA_S3_SECRET_KEY", "MEDIA_PUBLIC_BASE_URL"]
const BACKUP_ENV = ["BACKUP_S3_ENDPOINT", "BACKUP_S3_BUCKET", "BACKUP_S3_ACCESS_KEY", "BACKUP_S3_SECRET_KEY"]

const toMappingEntries = (obj: PlannedObject, report: CopiedItemReport): MediaMappingEntry[] =>
  obj.items.map((item) => ({
    field: item.field,
    oldUrl: item.storedUrl,
    sourceUrl: report.sourceUrl,
    key: obj.key,
    newUrl: publicUrlOf(obj.key),
    bytes: report.bytes,
    sha256: report.sha256,
    contentType: report.contentType,
    docIds: item.docIds,
  }))

export interface CopyResult {
  report: CopyReport
  mapping: MediaMapping | null // null when anything failed or in a dry run
  mappingFile: string | null
  backupFolder: string | null
}

/** media-copy <outDir> [dry-run] */
export const runCopy = async (input: { outDir: string; dryRun: boolean }): Promise<CopyResult> => {
  requireEnv(MEDIA_ENV)
  if (!input.dryRun) requireEnv(BACKUP_ENV)

  const inventoryFile = path.join(input.outDir, "inventory.json")
  const inventory = JSON.parse(fs.readFileSync(inventoryFile, "utf8")) as Inventory
  if (inventory.version !== 1) throw new Error("inventory.json is not a version 1 inventory")

  const startedAt = new Date().toISOString()
  const planned = planObjects(inventory)
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "classync-media-copy-"))

  try {
    const results: { obj: PlannedObject; report: CopiedItemReport }[] = []
    let defaultFile: string | undefined
    for (const obj of planned) {
      const report = await copyObject(obj, { dryRun: input.dryRun, workDir })
      results.push({ obj, report })
      console.log(`${report.status.padEnd(12)} ${obj.key}${report.error ? `  ${report.error}` : ""}`)
      if (obj.kind === "default" && !defaultFile && report.status !== "failed") {
        // Re-fetch the default avatar for the handover, the working copy was already removed.
        const file = path.join(workDir, "default-avatar.png")
        await downloadTo(deliveryUrl(obj.primary.storedUrl), file)
        defaultFile = file
      }
    }

    const handover = await writeHandover({ outDir: input.outDir, defaultFile, demoUrl: inventory.demo.url, workDir })

    const failures = results.filter((entry) => entry.report.status === "failed").length
    const finishedAt = new Date().toISOString()
    const report: CopyReport = {
      version: 1,
      dryRun: input.dryRun,
      startedAt,
      finishedAt,
      mediaBaseUrl: config.mediaPublicBaseUrl,
      sourceBackup: inventory.sourceBackup,
      objects: results.length,
      bytes: results.reduce((sum, entry) => sum + entry.report.bytes, 0),
      renditions: results.filter((entry) => entry.report.renditionUsed).length,
      failures,
      items: results.map((entry) => entry.report),
      handover,
    }
    fs.writeFileSync(path.join(input.outDir, "copy-report.json"), JSON.stringify(report, null, 2))

    if (failures > 0) return { report, mapping: null, mappingFile: null, backupFolder: null }

    const mapping: MediaMapping = {
      version: 1,
      createdAt: finishedAt,
      sourceBackup: inventory.sourceBackup,
      mediaBaseUrl: config.mediaPublicBaseUrl,
      entries: results.flatMap((entry) => toMappingEntries(entry.obj, entry.report)),
    }

    if (input.dryRun) {
      // Named differently on purpose, so it is never mistaken for the real mapping.
      const dryFile = path.join(input.outDir, "mapping.dry-run.json")
      fs.writeFileSync(dryFile, JSON.stringify(mapping, null, 2))
      return { report, mapping, mappingFile: dryFile, backupFolder: null }
    }

    const mappingFile = path.join(input.outDir, "mapping.json")
    fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2))

    const folder = `phase2/${timestampFolder()}`
    for (const name of ["inventory.json", "orphans.json", "mapping.json", "copy-report.json"]) {
      const file = path.join(input.outDir, name)
      if (fs.existsSync(file)) await putObject(`${folder}/${name}`, fs.readFileSync(file), "application/json")
    }
    return { report, mapping, mappingFile, backupFolder: folder }
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true })
  }
}

/** media-default-avatar <outDir> [dry-run]: only the default avatar, so it exists before code that points at it is deployed. */
export const runDefaultAvatar = async (input: { outDir: string; dryRun: boolean }): Promise<CopyReport> => {
  requireEnv(MEDIA_ENV)
  const parsed = parseCloudinaryUrl(LEGACY_DEFAULT_PROFILE_IMAGE_URL)
  if (!parsed) throw new Error("The default avatar URL could not be parsed")

  const item: InventoryItem = {
    field: "code.defaultProfileImage",
    kind: "default",
    storedUrl: LEGACY_DEFAULT_PROFILE_IMAGE_URL,
    docIds: [],
    resourceType: "image",
    publicId: parsed.publicId,
    format: parsed.format,
    transformation: parsed.transformation,
    bytes: 0,
  }
  const obj = planObjects({ version: 1, createdAt: "", sourceBackup: "", listing: { listedAt: "", images: 0, videos: 0 }, items: [item], notCloudinary: [], demo: { url: "", publicId: "", bytes: 0 } })[0]

  const startedAt = new Date().toISOString()
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "classync-media-copy-"))
  try {
    const report = await copyObject(obj, { dryRun: input.dryRun, workDir })
    console.log(`${report.status.padEnd(12)} ${obj.key}${report.error ? `  ${report.error}` : ""}`)
    let handover: CopyReport["handover"] = {}
    if (report.status !== "failed") {
      const file = path.join(workDir, "default-avatar.png")
      await downloadTo(deliveryUrl(item.storedUrl), file)
      handover = await writeHandover({ outDir: input.outDir, defaultFile: file, workDir })
    }
    return {
      version: 1,
      dryRun: input.dryRun,
      startedAt,
      finishedAt: new Date().toISOString(),
      mediaBaseUrl: config.mediaPublicBaseUrl,
      sourceBackup: "",
      objects: 1,
      bytes: report.bytes,
      renditions: 0,
      failures: report.status === "failed" ? 1 : 0,
      items: [report],
      handover,
    }
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true })
  }
}

export interface VerifyReport {
  checked: number
  failed: { key: string; error: string }[]
}

/** media-verify: downloads every mapped object through its public URL and compares it with the mapping. */
export const verifyMapping = async (mapping: MediaMapping): Promise<VerifyReport> => {
  requireEnv(["MEDIA_PUBLIC_BASE_URL"])
  const seen = new Set<string>()
  const report: VerifyReport = { checked: 0, failed: [] }
  for (const entry of mapping.entries) {
    if (seen.has(entry.key)) continue
    seen.add(entry.key)
    report.checked++
    try {
      const url = entry.newUrl
      if (!url.startsWith(`${config.mediaPublicBaseUrl}/`)) throw new Error("newUrl is outside MEDIA_PUBLIC_BASE_URL")
      await verifyPublic({
        key: url.slice(config.mediaPublicBaseUrl.length + 1),
        sha256: entry.sha256,
        bytes: entry.bytes,
        contentType: entry.contentType,
        isVideo: entry.field === "projects.video",
      })
    } catch (error) {
      report.failed.push({ key: entry.key, error: error instanceof Error ? error.message : String(error) })
    }
  }
  return report
}

