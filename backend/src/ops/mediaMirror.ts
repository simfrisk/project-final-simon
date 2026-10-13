import { Readable } from "stream"
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, _Object } from "@aws-sdk/client-s3"
import { Upload } from "@aws-sdk/lib-storage"
import { config, scrubSecrets } from "../config"
import { getMediaS3, mediaBucket } from "../media/s3Client"
import { backupBucket, getObjectIfExists, getS3, putObject } from "./s3"
import { MirrorStatus } from "./types"

// A copy of every media object in the backup bucket, so media exists on two volumes (two MinIO instances).
// It is a safety net, not a sync: an object that disappears from the media bucket stays in the mirror
// until BACKUP_RETENTION_DAYS have passed since the run that first noticed it missing, which covers an
// accidental or malicious delete. The date it went missing is kept in media-mirror-missing.json.
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
  note: null,
}

export interface MirrorReport {
  mediaObjects: number
  copied: number
  failed: number
  alreadyMirrored: number
  pruned: number
  skippedForSpace: number
  objects: number
  bytes: number
}

const stateKey = (name: string): string => (config.backup.prefix ? `${config.backup.prefix}/${name}` : name)
const statusKey = (): string => stateKey("media-mirror-status.json")
const missingKey = (): string => stateKey("media-mirror-missing.json")

// Mirrored keys that are no longer in the media bucket, with the time a run first saw them missing.
const loadMissing = async (): Promise<Record<string, string>> => {
  const body = await getObjectIfExists(missingKey())
  if (!body) return {}
  try {
    const parsed = JSON.parse(body.toString("utf8")) as { since?: Record<string, string> }
    return parsed.since && typeof parsed.since === "object" ? parsed.since : {}
  } catch {
    return {}
  }
}

/** Bytes held in the backup bucket in total: database backups and the mirror together. */
const backupBucketBytes = async (scope: string): Promise<number> => {
  const all = await listAll(async (token) => {
    // Unscoped (production): the whole bucket. Scoped (tests): only the mirror copies under that scope.
    const page = await getS3().send(
      new ListObjectsV2Command({ Bucket: backupBucket(), Prefix: scope ? `${MIRROR_PREFIX}${scope}` : undefined, ContinuationToken: token })
    )
    return { items: page.Contents ?? [], next: page.IsTruncated ? page.NextContinuationToken : undefined }
  })
  return all.reduce((sum, item) => sum + (item.Size ?? 0), 0)
}

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

const listMedia = (scope: string): Promise<_Object[]> =>
  listAll(async (token) => {
    const page = await getMediaS3().send(new ListObjectsV2Command({ Bucket: mediaBucket(), Prefix: scope || undefined, ContinuationToken: token }))
    return { items: page.Contents ?? [], next: page.IsTruncated ? page.NextContinuationToken : undefined }
  })

const listMirror = (scope: string): Promise<_Object[]> =>
  listAll(async (token) => {
    const page = await getS3().send(
      new ListObjectsV2Command({ Bucket: backupBucket(), Prefix: `${MIRROR_PREFIX}${scope}`, ContinuationToken: token })
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

export interface MirrorOptions {
  now?: number // the clock, for tests
  scope?: string // only objects whose key starts with this are looked at, copied or pruned (tests, partial runs)
  maxBytes?: number // instead of MIRROR_MAX_BYTES
}

const doMirror = async (options: MirrorOptions): Promise<MirrorReport> => {
  const now = options.now ?? Date.now()
  const scope = options.scope ?? ""
  const media = await listMedia(scope)
  const mirror = await listMirror(scope)
  const mirrored = new Map(mirror.map((item) => [(item.Key as string).slice(MIRROR_PREFIX.length), item]))
  const mediaKeys = new Set<string>()

  const report: MirrorReport = {
    mediaObjects: media.length,
    copied: 0,
    failed: 0,
    alreadyMirrored: 0,
    pruned: 0,
    skippedForSpace: 0,
    objects: 0,
    bytes: 0,
  }

  // The app cannot ask MinIO how full its drive is, so the limit is a number the operator sets.
  const limit = options.maxBytes ?? config.mirrorMaxBytes
  let backupBytes = limit > 0 ? await backupBucketBytes(scope) : 0

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
    if (limit > 0 && backupBytes + (item.Size ?? 0) > limit) {
      report.skippedForSpace++
      continue
    }
    try {
      await copyObject(key)
      backupBytes += item.Size ?? 0
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

  // Only with a trustworthy (not empty) media listing. The clock for an object starts at the first run that
  // sees it missing, not when it was mirrored, so old media gets the full retention window after a delete.
  if (media.length > 0) {
    const since = await loadMissing()
    // Entries outside this run's scope are not this run's to judge, so they are carried over as they are.
    const next: Record<string, string> = Object.fromEntries(Object.entries(since).filter(([key]) => !key.startsWith(scope)))
    const retentionMs = config.backup.retentionDays * 24 * 60 * 60 * 1000
    for (const key of mirrored.keys()) {
      if (mediaKeys.has(key)) continue
      const missingSince = since[key] ?? new Date(now).toISOString()
      if (now - Date.parse(missingSince) >= retentionMs) {
        try {
          await getS3().send(new DeleteObjectCommand({ Bucket: backupBucket(), Key: `${MIRROR_PREFIX}${key}` }))
          report.pruned++
          continue
        } catch {
          // Kept in the list and retried by the next run.
        }
      }
      next[key] = missingSince
    }
    if (JSON.stringify(next) !== JSON.stringify(since)) {
      await putObject(missingKey(), JSON.stringify({ version: 1, since: next }), "application/json")
    }
  }

  return report
}

/** Copies what is missing from the media bucket into <backup bucket>/media-mirror/ and records the outcome. */
export const runMediaMirror = (options: MirrorOptions = {}): Promise<MirrorReport> => {
  if (running) return running
  running = (async () => {
    try {
      const report = await doMirror(options)
      mediaMirrorStatus.objects = report.objects
      mediaMirrorStatus.bytes = report.bytes
      if (report.failed === 0 && report.skippedForSpace === 0) {
        mediaMirrorStatus.lastStatus = "ok"
        mediaMirrorStatus.lastSuccessAt = new Date().toISOString()
        mediaMirrorStatus.note = null
      } else {
        mediaMirrorStatus.lastStatus = "failed"
        mediaMirrorStatus.note =
          report.skippedForSpace > 0
            ? "Stopped copying: the backup storage would pass MIRROR_MAX_BYTES"
            : "Some objects could not be copied"
      }
      try {
        await putObject(statusKey(), JSON.stringify(mediaMirrorStatus), "application/json")
      } catch (error) {
        console.error(`[mirror] status not stored: ${scrubSecrets(error instanceof Error ? error.message : String(error))}`)
      }
      console.log(
        `[mirror] ${mediaMirrorStatus.lastStatus} media=${report.mediaObjects} copied=${report.copied} failed=${report.failed} skippedForSpace=${report.skippedForSpace} pruned=${report.pruned}`
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
      if (typeof saved.lastSuccessAt === "string") mediaMirrorStatus.lastSuccessAt = saved.lastSuccessAt
      if (saved.lastStatus === "ok" || saved.lastStatus === "failed") mediaMirrorStatus.lastStatus = saved.lastStatus
      mediaMirrorStatus.objects = saved.objects ?? 0
      mediaMirrorStatus.bytes = saved.bytes ?? 0
      mediaMirrorStatus.note = typeof saved.note === "string" ? saved.note : null
    })
    .catch(() => undefined)

  setTimeout(() => {
    void runIfDue()
    setInterval(() => void runIfDue(), CHECK_INTERVAL_MS)
  }, FIRST_CHECK_DELAY_MS)
  console.log("[mirror] scheduler started, first check in 5 minutes")
}
