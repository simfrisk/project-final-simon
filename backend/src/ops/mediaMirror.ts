import { Readable } from "stream"
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, _Object } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { config, scrubSecrets } from "../config"
import { getMediaS3, mediaBucket } from "../media/s3Client"
import { backupBucket, getObjectIfExists, getS3, putObject } from "./s3"
import { MirrorStatus } from "./types"

// A copy of every media object in the backup bucket, so media exists on two volumes (two MinIO instances).
// It is a safety net, not a sync: an object that disappears from the media bucket stays in the mirror
// until the backup retention window has passed, which covers an accidental or malicious delete.
export const MIRROR_PREFIX = "media-mirror/"

const FIRST_CHECK_DELAY_MS = 5 * 60 * 1000
const CHECK_INTERVAL_MS = 60 * 60 * 1000
const DUE_AFTER_MS = 24 * 60 * 60 * 1000
const PART_SIZE_BYTES = 8 * 1024 * 1024

// In memory, rebuilt at boot from the status file in the bucket.
export const mediaMirrorStatus: MirrorStatus = {
  enabled: false,
  lastSuccessAt: null,
  lastStatus: "never",
  objects: 0,
  bytes: 0,
}

export interface MirrorReport {
  mediaObjects: number
  copied: number
  failed: number
  alreadyMirrored: number
  pruned: number
  objects: number
  bytes: number
}

const statusKey = (): string => `${config.backup.prefix}/media-mirror-status.json`

// One run at a time, whether it came from the schedule or the command line.
let running: Promise<MirrorReport> | null = null

const listAll = async (
  send: (token: string | undefined) => Promise<{ items: _Object[]; next?: string }>
): Promise<_Object[]> => {
  const all: _Object[] = []
  let token: string | undefined
  do {
    const page = await send(token)
    all.push(...page.items)
    token = page.next
  } while (token)
  return all
}

const listMedia = (): Promise<_Object[]> =>
  listAll(async (token) => {
    const page = await getMediaS3().send(new ListObjectsV2Command({ Bucket: mediaBucket(), ContinuationToken: token }))
    return { items: page.Contents ?? [], next: page.IsTruncated ? page.NextContinuationToken : undefined }
  })

const listMirror = (): Promise<_Object[]> =>
  listAll(async (token) => {
    const page = await getS3().send(
      new ListObjectsV2Command({ Bucket: backupBucket(), Prefix: MIRROR_PREFIX, ContinuationToken: token })
    )
    return { items: page.Contents ?? [], next: page.IsTruncated ? page.NextContinuationToken : undefined }
  })

/** Streams one object from the media bucket into the mirror. Nothing is held in memory beyond a few parts. */
const copyObject = async (key: string): Promise<void> => {
  const source = await getMediaS3().send(new GetObjectCommand({ Bucket: mediaBucket(), Key: key }))
  if (!source.Body) throw new Error("empty body")
  const upload = new Upload({
    client: getS3(),
    params: {
      Bucket: backupBucket(),
      Key: `${MIRROR_PREFIX}${key}`,
      Body: source.Body as Readable,
      ContentType: source.ContentType,
      CacheControl: source.CacheControl,
    },
    partSize: PART_SIZE_BYTES,
    queueSize: 2,
    leavePartsOnError: false,
  })
  await upload.done()
}

const doMirror = async (now: number): Promise<MirrorReport> => {
  const media = await listMedia()
  const mirror = await listMirror()
  const mirrored = new Map(mirror.map((item) => [(item.Key as string).slice(MIRROR_PREFIX.length), item]))
  const mediaKeys = new Set<string>()

  const report: MirrorReport = {
    mediaObjects: media.length,
    copied: 0,
    failed: 0,
    alreadyMirrored: 0,
    pruned: 0,
    objects: 0,
    bytes: 0,
  }

  for (const item of media) {
    const key = item.Key as string
    mediaKeys.add(key)
    const existing = mirrored.get(key)
    if (existing && existing.Size === item.Size) {
      report.alreadyMirrored++
      report.objects++
      report.bytes += item.Size ?? 0
      continue
    }
    try {
      await copyObject(key)
      report.copied++
      report.objects++
      report.bytes += item.Size ?? 0
    } catch (error) {
      report.failed++
      console.error(
        `[mirror] copy failed name=${(error as { name?: string })?.name ?? "unknown"} ${scrubSecrets(error instanceof Error ? error.message : "")}`
      )
    }
  }

  // Prune only when the media listing is trustworthy (not empty) and only objects older than the retention window.
  if (media.length > 0) {
    const cutoff = now - config.backup.retentionDays * 24 * 60 * 60 * 1000
    for (const [key, item] of mirrored) {
      if (mediaKeys.has(key)) continue
      if (!item.LastModified || item.LastModified.getTime() >= cutoff) continue
      try {
        await getS3().send(new DeleteObjectCommand({ Bucket: backupBucket(), Key: `${MIRROR_PREFIX}${key}` }))
        report.pruned++
      } catch {
        // Retried by the next run.
      }
    }
  }

  return report
}

/** Copies what is missing from the media bucket into <backup bucket>/media-mirror/ and records the outcome. */
export const runMediaMirror = (now: number = Date.now()): Promise<MirrorReport> => {
  if (running) return running
  running = (async () => {
    try {
      const report = await doMirror(now)
      mediaMirrorStatus.objects = report.objects
      mediaMirrorStatus.bytes = report.bytes
      if (report.failed === 0) {
        mediaMirrorStatus.lastStatus = "ok"
        mediaMirrorStatus.lastSuccessAt = new Date().toISOString()
        try {
          await putObject(statusKey(), JSON.stringify(mediaMirrorStatus), "application/json")
        } catch (error) {
          console.error(`[mirror] status not stored: ${scrubSecrets(error instanceof Error ? error.message : String(error))}`)
        }
      } else {
        mediaMirrorStatus.lastStatus = "failed"
      }
      console.log(
        `[mirror] ${mediaMirrorStatus.lastStatus} media=${report.mediaObjects} copied=${report.copied} failed=${report.failed} pruned=${report.pruned}`
      )
      return report
    } catch (error) {
      mediaMirrorStatus.lastStatus = "failed"
      console.error(`[mirror] failed: ${scrubSecrets(error instanceof Error ? error.message : String(error))}`)
      throw error
    } finally {
      running = null
    }
  })()
  return running
}

const runIfDue = async (): Promise<void> => {
  const last = mediaMirrorStatus.lastSuccessAt
  if (last && Date.now() - new Date(last).getTime() < DUE_AFTER_MS) return
  try {
    await runMediaMirror()
  } catch {
    // Already logged, and the status shows failed. The next hourly check tries again.
  }
}

/** First check 5 minutes after boot (after the backup's own first check), then hourly. */
export const startMediaMirrorScheduler = (): void => {
  mediaMirrorStatus.enabled = config.mediaMirrorEnabled
  if (!config.mediaMirrorEnabled) {
    console.log("[mirror] disabled (MEDIA_MIRROR_ENABLED is not true)")
    return
  }

  // Show the last known state in /health straight away.
  getObjectIfExists(statusKey())
    .then((body) => {
      if (!body) return
      const saved = JSON.parse(body.toString("utf8")) as Partial<MirrorStatus>
      if (typeof saved.lastSuccessAt === "string") {
        mediaMirrorStatus.lastSuccessAt = saved.lastSuccessAt
        mediaMirrorStatus.lastStatus = "ok"
        mediaMirrorStatus.objects = saved.objects ?? 0
        mediaMirrorStatus.bytes = saved.bytes ?? 0
      }
    })
    .catch(() => undefined)

  setTimeout(() => {
    void runIfDue()
    setInterval(() => void runIfDue(), CHECK_INTERVAL_MS)
  }, FIRST_CHECK_DELAY_MS)
  console.log("[mirror] scheduler started, first check in 5 minutes")
}
