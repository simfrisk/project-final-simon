import { config } from "../config"
import { UploadError } from "./types"

// Bytes a user has asked to upload in the last 24 hours, counted from the size declared when the ticket was made.
// Kept in memory on purpose: the app runs as one instance, a restart only gives everyone a fresh day, and it
// keeps a throwaway counter out of the database and its backups.
const DAY_MS = 24 * 60 * 60 * 1000
const log = new Map<string, { at: number; bytes: number }[]>()

const recent = (userId: string, now: number): { at: number; bytes: number }[] => {
  const entries = (log.get(userId) ?? []).filter((entry) => entry.at > now - DAY_MS)
  if (entries.length === 0) log.delete(userId)
  else log.set(userId, entries)
  return entries
}

/** Throws a 429 when this upload would take the user over the daily byte limit. */
export const checkDailyQuota = (userId: string, sizeBytes: number, now: number = Date.now()): void => {
  const max = config.maxDailyUploadBytes
  const entries = recent(userId, now)
  const used = entries.reduce((sum, entry) => sum + entry.bytes, 0)
  if (used + sizeBytes <= max) return

  // When enough of the oldest uploads have aged out of the 24 hour window for this one to fit.
  let freed = 0
  let retryAt = now + DAY_MS
  for (const entry of entries) {
    freed += entry.bytes
    if (used - freed + sizeBytes <= max) {
      retryAt = entry.at + DAY_MS
      break
    }
  }
  throw new UploadError(429, "Daily upload limit reached. Try again later.", {
    reason: "daily_bytes",
    maxBytes: max,
    usedBytes: used,
    retryAfterSeconds: Math.max(1, Math.ceil((retryAt - now) / 1000)),
  })
}

export const recordUpload = (userId: string, sizeBytes: number, now: number = Date.now()): void => {
  recent(userId, now)
  log.set(userId, [...(log.get(userId) ?? []), { at: now, bytes: sizeBytes }])
}

/** For tests. */
export const resetQuota = (): void => {
  log.clear()
  active.clear()
}

// Uploads a user has started and not finished. MinIO cannot list unfinished uploads by a folder prefix (it only
// answers for one exact key), so the app keeps its own list. It is checked against MinIO before it is trusted,
// and a restart simply forgets it: what is left is dropped by MinIO after 24 hours and counted by the daily limit.
export interface TrackedUpload {
  key: string
  uploadId: string
  startedAt: number
}
const active = new Map<string, TrackedUpload[]>()

export const trackedUploads = (userId: string): TrackedUpload[] => active.get(userId) ?? []

export const trackUpload = (userId: string, upload: TrackedUpload): void => {
  active.set(userId, [...trackedUploads(userId), upload])
}

export const untrackUpload = (userId: string, key: string): void => {
  const left = trackedUploads(userId).filter((upload) => upload.key !== key)
  if (left.length === 0) active.delete(userId)
  else active.set(userId, left)
}
