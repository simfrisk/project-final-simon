import path from "path"
import { MongoClient } from "mongodb"
import { config } from "../config"
import { isDumpableCollection, timestampFolder } from "./bsonTools"
import { dumpDatabase } from "./dump"
import { assertValidBackupPath, resolveTargetUrl } from "./restore"
import { getObject, listKeys } from "./s3"
import { MediaField, MediaMapping, MediaMappingEntry, RewriteFieldReport, RewriteReport } from "./types"

const CLOUDINARY_MARKER = "res.cloudinary.com"
const FIELDS: MediaField[] = ["projects.video", "projects.thumbnail", "users.profileImage"]

export interface RewriteInput {
  mapping: string // path inside the backup bucket, for example phase2/2026-10-20T08-10-00Z/mapping.json
  direction: "forward" | "reverse"
  dryRun: boolean
}

/** Reads the mapping from the backup bucket and refuses anything that is not a well formed version 1 mapping. */
export const loadMapping = async (mappingPath: string): Promise<MediaMapping> => {
  assertValidBackupPath(mappingPath)
  if (!mappingPath.startsWith("phase2/") || !mappingPath.endsWith(".json")) {
    throw new Error("mapping must be a .json path under phase2/")
  }
  if (!config.mediaPublicBaseUrl) throw new Error("MEDIA_PUBLIC_BASE_URL is not set")

  const mapping = JSON.parse((await getObject(mappingPath)).toString("utf8")) as MediaMapping
  validateMapping(mapping)
  return mapping
}

export const validateMapping = (mapping: MediaMapping): void => {
  if (!mapping || mapping.version !== 1 || !Array.isArray(mapping.entries)) {
    throw new Error("mapping is not a version 1 mapping")
  }
  const prefix = `${config.mediaPublicBaseUrl}/`
  const seenOld = new Set<string>()
  const seenNew = new Set<string>()

  for (const entry of mapping.entries) {
    if (typeof entry.oldUrl !== "string" || !entry.oldUrl || typeof entry.newUrl !== "string" || !entry.newUrl) {
      throw new Error("mapping entry without oldUrl or newUrl")
    }
    if (!entry.newUrl.startsWith(prefix)) {
      throw new Error("mapping holds a newUrl outside MEDIA_PUBLIC_BASE_URL")
    }
    if (entry.newUrl === entry.oldUrl) throw new Error("mapping entry where oldUrl equals newUrl")
    if (entry.oldUrl.startsWith(prefix)) throw new Error("mapping holds an oldUrl that is already a media URL")

    // Per field, because the default avatar legitimately appears for a user field and for the code default.
    const oldId = `${entry.field}\n${entry.oldUrl}`
    const newId = `${entry.field}\n${entry.newUrl}`
    if (seenOld.has(oldId)) throw new Error(`mapping has a duplicate oldUrl for ${entry.field}`)
    // Two different old URLs onto one new URL would make the reverse direction ambiguous.
    if (seenNew.has(newId)) throw new Error(`mapping has a duplicate newUrl for ${entry.field}`)
    seenOld.add(oldId)
    seenNew.add(newId)
  }
}

const splitField = (field: MediaField): { collection: string; property: string } => {
  const [collection, property] = field.split(".")
  return { collection, property }
}

// One rewrite at a time, so a double click or a retried request cannot interleave two runs.
let chain: Promise<unknown> = Promise.resolve()
const exclusive = <T>(task: () => Promise<T>): Promise<T> => {
  const run = chain.then(task, task)
  chain = run.catch(() => undefined)
  return run
}

/** Folder for the backup taken before a real run. The first run keeps the plain name, later runs never overwrite it. */
const preRewriteFolder = async (mappingPath: string, direction: string): Promise<string> => {
  const base = `${path.posix.dirname(mappingPath)}/pre-rewrite`
  const taken = (await listKeys(`${base}/`)).length > 0
  return taken ? `${base}-${direction}-${timestampFolder()}` : base
}

/**
 * Rewrites media URLs in projects.video, projects.thumbnail and users.profileImage from the mapping, forward
 * (Cloudinary to MinIO) or reverse. Each update names the value it expects, so it is idempotent and a value
 * that someone changed in the meantime is never overwritten. FerretDB has no transactions, so none are used.
 */
export const rewriteMediaUrls = (input: RewriteInput): Promise<RewriteReport> =>
  exclusive(async () => {
    const mapping = await loadMapping(input.mapping)
    // Refuses Atlas. The rewrite only ever runs against the OSC database.
    const url = resolveTargetUrl("MONGO_URL")

    let preRewriteBackup: string | null = null
    if (!input.dryRun) {
      const folder = await preRewriteFolder(input.mapping, input.direction)
      // Stops here when the backup cannot be written: nothing has been changed yet.
      const dump = await dumpDatabase(url, "classync-app", { folder })
      preRewriteBackup = dump.folder
    }

    const client = new MongoClient(url, { serverSelectionTimeoutMS: 15000 })
    await client.connect()
    try {
      const db = client.db()
      const fields: RewriteFieldReport[] = []

      for (const field of FIELDS) {
        const { collection, property } = splitField(field)
        const entries: MediaMappingEntry[] = mapping.entries.filter((entry) => entry.field === field)
        const target = db.collection(collection)
        const report: RewriteFieldReport = { field, matched: 0, changed: 0, alreadyDone: 0, unmapped: [] }

        for (const entry of entries) {
          const from = input.direction === "forward" ? entry.oldUrl : entry.newUrl
          const to = input.direction === "forward" ? entry.newUrl : entry.oldUrl

          const docs = await target.find({ [property]: from }, { projection: { _id: 1 } }).toArray()
          report.matched += docs.length
          report.alreadyDone += await target.countDocuments({ [property]: to })

          if (input.dryRun) continue
          for (const doc of docs) {
            const result = await target.updateOne({ _id: doc._id, [property]: from }, { $set: { [property]: to } })
            report.changed += result.modifiedCount
          }
        }

        // What is still on Cloudinary and has no mapping. Looked at after the run, so a real run reports what it left behind.
        const known = new Set(entries.map((entry) => entry.oldUrl))
        const leftover = new Set<string>()
        for (const doc of await target.find({}, { projection: { [property]: 1 } }).toArray()) {
          const value = (doc as Record<string, unknown>)[property]
          if (typeof value === "string" && value.includes(CLOUDINARY_MARKER) && !known.has(value)) leftover.add(value)
        }
        report.unmapped = [...leftover].sort()
        fields.push(report)
      }

      return {
        direction: input.direction,
        dryRun: input.dryRun,
        preRewriteBackup,
        fields,
        cloudinaryStringsLeft: await scanForCloudinary(db),
      }
    } finally {
      await client.close()
    }
  })

/** Per collection, how many documents still hold the Cloudinary host anywhere in their data. */
const scanForCloudinary = async (db: ReturnType<MongoClient["db"]>): Promise<Record<string, number>> => {
  const counts: Record<string, number> = {}
  const infos = await db.listCollections({}, { nameOnly: true }).toArray()
  for (const info of infos.sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (!isDumpableCollection(info.name)) continue
    let count = 0
    for (const doc of await db.collection(info.name).find({}).toArray()) {
      if (JSON.stringify(doc).includes(CLOUDINARY_MARKER)) count++
    }
    counts[info.name] = count
  }
  return counts
}

