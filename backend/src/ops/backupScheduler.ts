import { config, scrubSecrets } from "../config"
import { parseTimestampFolder } from "./bsonTools"
import { dumpDatabase, DumpUpload } from "./dump"
import { deleteKeys, getObjectIfExists, listFolders, listKeys } from "./s3"
import { BackupStatus } from "./types"

const FIRST_CHECK_DELAY_MS = 2 * 60 * 1000
const CHECK_INTERVAL_MS = 60 * 60 * 1000
const DUE_AFTER_MS = 24 * 60 * 60 * 1000
const ALWAYS_KEEP_NEWEST = 7

// In memory only. The dated folders in the bucket are the proof a backup ran, not this object.
export const backupStatus: BackupStatus = {
  enabled: false,
  lastSuccessAt: null,
  lastStatus: "never",
}

// One backup at a time, whether it was started by the schedule or by /ops/backup-now.
let chain: Promise<unknown> = Promise.resolve()
const exclusive = <T>(task: () => Promise<T>): Promise<T> => {
  const run = chain.then(task, task)
  chain = run.catch(() => undefined)
  return run
}

const latestPath = (): string => `${config.backup.prefix}/latest.json`

const readLatest = async (): Promise<{ folder: string; createdAt: string } | null> => {
  const body = await getObjectIfExists(latestPath())
  if (!body) return null
  try {
    const parsed = JSON.parse(body.toString("utf8"))
    return typeof parsed.createdAt === "string" ? parsed : null
  } catch {
    return null
  }
}

/** Deletes timestamp folders older than the retention window, always keeping the newest ones. */
export const pruneOldBackups = async (now: Date = new Date()): Promise<string[]> => {
  const prefix = `${config.backup.prefix}/`
  const folders = (await listFolders(prefix))
    .map((folder) => ({ folder, date: parseTimestampFolder(folder.slice(prefix.length).replace(/\/$/, "")) }))
    // Anything that is not a timestamp folder (reports/, latest.json, cutover) is never touched.
    .filter((entry): entry is { folder: string; date: Date } => entry.date !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  const cutoff = now.getTime() - config.backup.retentionDays * 24 * 60 * 60 * 1000
  const removed: string[] = []
  for (const entry of folders.slice(ALWAYS_KEEP_NEWEST)) {
    if (entry.date.getTime() >= cutoff) continue
    await deleteKeys(await listKeys(entry.folder))
    removed.push(entry.folder)
  }
  return removed
}

/** Runs one backup of the database the app is connected to and records the outcome. */
export const runBackup = (): Promise<DumpUpload & { pruned: string[] }> =>
  exclusive(async () => {
    try {
      const result = await dumpDatabase(config.mongoUrl, "classync-app")
      backupStatus.lastSuccessAt = result.manifest.createdAt
      backupStatus.lastStatus = "ok"

      let pruned: string[] = []
      try {
        pruned = await pruneOldBackups()
      } catch (error) {
        // The backup itself succeeded. Pruning is retried after the next one.
        console.error(`[backup] prune failed: ${scrubSecrets(error instanceof Error ? error.message : String(error))}`)
      }
      console.log(`[backup] ok folder=${result.folder} objects=${result.objects} pruned=${pruned.length}`)
      return { ...result, pruned }
    } catch (error) {
      backupStatus.lastStatus = "failed"
      console.error(`[backup] failed: ${scrubSecrets(error instanceof Error ? error.message : String(error))}`)
      throw error
    }
  })

/** Runs a backup when the newest one is older than 24 hours, or when none exists. Exported for the scheduler and for tests. */
export const runBackupIfDue = async (): Promise<void> => {
  try {
    const latest = await readLatest()
    if (latest) {
      backupStatus.lastSuccessAt = latest.createdAt
      if (backupStatus.lastStatus === "never") backupStatus.lastStatus = "ok"
      if (Date.now() - new Date(latest.createdAt).getTime() < DUE_AFTER_MS) return
    }
    await runBackup()
  } catch (error) {
    // runBackup already logged and set the status. A failed lookup of latest.json is reported here.
    if (backupStatus.lastStatus !== "failed") {
      console.error(`[backup] check failed: ${scrubSecrets(error instanceof Error ? error.message : String(error))}`)
    }
  }
}

/** First check 2 minutes after boot, then hourly. A backup runs when the newest one is older than 24 hours. */
export const startBackupScheduler = (): void => {
  backupStatus.enabled = config.backup.enabled
  if (!config.backup.enabled) {
    console.log("[backup] disabled (BACKUP_ENABLED is not true)")
    return
  }

  // Show the last known backup in /health straight away instead of "never" for the first two minutes.
  readLatest()
    .then((latest) => {
      if (latest) {
        backupStatus.lastSuccessAt = latest.createdAt
        backupStatus.lastStatus = "ok"
      }
    })
    .catch(() => undefined)

  setTimeout(() => {
    void runBackupIfDue()
    setInterval(() => void runBackupIfDue(), CHECK_INTERVAL_MS)
  }, FIRST_CHECK_DELAY_MS)
  console.log("[backup] scheduler started, first check in 2 minutes")
}
