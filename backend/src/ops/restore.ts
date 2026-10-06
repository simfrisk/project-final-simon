import zlib from "zlib"
import { promisify } from "util"
import { BSON, MongoClient } from "mongodb"
import { config } from "../config"
import { fingerprintUsers, isDumpableCollection, RAW_DECODE, splitBson } from "./bsonTools"
import { getObject } from "./s3"
import { DumpManifest } from "./types"

const gunzip = promisify(zlib.gunzip)

const BATCH_SIZE = 500
const DB_NAME = /^[A-Za-z0-9_-]{1,64}$/
const RESERVED_DBS = ["admin", "local", "config"]

export type TargetUrlEnv = "MONGO_URL" | "MONGO_URL_PROD"

/** Resolves the connection string for a restore target and refuses anything that could be Atlas. */
export const resolveTargetUrl = (targetUrlEnv: TargetUrlEnv): string => {
  const url = targetUrlEnv === "MONGO_URL" ? config.mongoUrl : config.mongoUrlProd
  if (!url) throw new Error(`${targetUrlEnv} is not set`)
  // Atlas is read only from the Mac. Nothing running on OSC may ever write to it.
  if (/^mongodb\+srv:/i.test(url) || /mongodb\.net/i.test(url)) {
    throw new Error("Refusing to write to an Atlas connection string")
  }
  return url
}

export const assertValidTargetDb = (targetDb: string): void => {
  if (!DB_NAME.test(targetDb) || RESERVED_DBS.includes(targetDb)) {
    throw new Error("targetDb is not a valid database name")
  }
}

export const assertValidBackupPath = (from: string): void => {
  if (!/^[A-Za-z0-9._\-/]{1,200}$/.test(from) || from.startsWith("/") || from.includes("..") || from.endsWith("/")) {
    throw new Error("from is not a valid backup path")
  }
}

const readManifest = async (from: string): Promise<DumpManifest> => {
  const manifest = JSON.parse((await getObject(`${from}/manifest.json`)).toString("utf8")) as DumpManifest
  if (manifest.format !== "mongodump-gzip-v1") throw new Error("Unsupported dump format")
  return manifest
}

interface IndexSpec {
  key: Record<string, unknown>
  name: string
  unique?: boolean
  sparse?: boolean
  expireAfterSeconds?: number
  partialFilterExpression?: Record<string, unknown>
}

const readIndexes = async (from: string, name: string): Promise<IndexSpec[]> => {
  const raw = await gunzip(await getObject(`${from}/${name}.metadata.json.gz`))
  // mongodump writes index keys as extended JSON ({"$numberInt":"1"}), the app writes plain numbers.
  // EJSON.parse in relaxed mode reads both into plain numbers.
  const metadata = BSON.EJSON.parse(raw.toString("utf8"), { relaxed: true }) as { indexes?: IndexSpec[] }
  return metadata.indexes ?? []
}

export interface RestoreResult {
  from: string
  targetDb: string
  collections: { name: string; inserted: number; indexes: number }[]
  verification: VerifyResult
}

/**
 * Restores a backup folder into targetDb. Each collection of the dump is dropped in the target and
 * recreated, other collections are left alone. Documents are decoded without type promotion so every
 * value round trips. Finishes with verifyAgainstManifest.
 */
export const restoreDump = async (input: {
  from: string
  targetDb: string
  targetUrlEnv: TargetUrlEnv
}): Promise<RestoreResult> => {
  assertValidBackupPath(input.from)
  assertValidTargetDb(input.targetDb)
  const url = resolveTargetUrl(input.targetUrlEnv)

  const manifest = await readManifest(input.from)

  const client = new MongoClient(url, { serverSelectionTimeoutMS: 15000 })
  await client.connect()
  try {
    const db = client.db(input.targetDb)
    const results: RestoreResult["collections"] = []

    for (const entry of manifest.collections) {
      if (!isDumpableCollection(entry.name)) continue

      const bson = await gunzip(await getObject(`${input.from}/${entry.name}.bson.gz`))
      const docs = splitBson(bson).map((raw) => BSON.deserialize(raw, RAW_DECODE))
      const indexes = (await readIndexes(input.from, entry.name)).filter((index) => index.name !== "_id_")

      const exists = (await db.listCollections({ name: entry.name }, { nameOnly: true }).toArray()).length > 0
      if (exists) await db.collection(entry.name).drop()
      await db.createCollection(entry.name)
      const collection = db.collection(entry.name)

      for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        await collection.insertMany(docs.slice(i, i + BATCH_SIZE), { ordered: true })
      }

      for (const index of indexes) {
        const options: Record<string, unknown> = { name: index.name }
        if (index.unique) options.unique = true
        if (index.sparse) options.sparse = true
        if (typeof index.expireAfterSeconds === "number") options.expireAfterSeconds = index.expireAfterSeconds
        if (index.partialFilterExpression) options.partialFilterExpression = index.partialFilterExpression
        await collection.createIndex(index.key as Record<string, 1 | -1>, options)
      }

      results.push({ name: entry.name, inserted: docs.length, indexes: indexes.length })
    }

    const verification = await verifyAgainstManifest(input)
    return { from: input.from, targetDb: input.targetDb, collections: results, verification }
  } finally {
    await client.close()
  }
}

export interface VerifyResult {
  ok: boolean
  mismatches: string[]
  collections: { name: string; expected: number; actual: number }[]
  usersCanonicalSha256Matches: boolean
  deletedUserPresent: boolean
}

/** Compares the target database with the manifest of a backup. Read only. */
export const verifyAgainstManifest = async (input: {
  from: string
  targetDb: string
  targetUrlEnv: TargetUrlEnv
}): Promise<VerifyResult> => {
  assertValidBackupPath(input.from)
  assertValidTargetDb(input.targetDb)
  const url = resolveTargetUrl(input.targetUrlEnv)
  const manifest = await readManifest(input.from)

  const client = new MongoClient(url, { serverSelectionTimeoutMS: 15000 })
  await client.connect()
  try {
    const db = client.db(input.targetDb)
    const mismatches: string[] = []
    const collections: VerifyResult["collections"] = []

    for (const entry of manifest.collections) {
      const collection = db.collection(entry.name)
      const actual = await collection.countDocuments({})
      collections.push({ name: entry.name, expected: entry.count, actual })
      if (actual !== entry.count) mismatches.push(`${entry.name}: expected ${entry.count} documents, found ${actual}`)

      let indexNames: string[] = []
      try {
        indexNames = (await collection.listIndexes().toArray()).map((index) => String(index.name)).sort()
      } catch {
        // Missing collection: already reported through the count.
      }
      const expectedIndexes = [...entry.indexNames].sort()
      if (JSON.stringify(indexNames) !== JSON.stringify(expectedIndexes)) {
        mismatches.push(`${entry.name}: indexes differ, expected [${expectedIndexes.join(",")}] found [${indexNames.join(",")}]`)
      }
    }

    const rawUsers = (await db
      .collection("users")
      .find({}, { raw: true })
      .sort({ _id: 1 })
      .toArray()) as unknown as Buffer[]
    const fingerprint = fingerprintUsers(rawUsers)
    const usersMatch = fingerprint.sha256 === manifest.usersCanonicalSha256
    if (!usersMatch) mismatches.push("users: canonical hash differs from the manifest")
    if (manifest.deletedUserPresent && !fingerprint.placeholderPresent) {
      mismatches.push("users: the Deleted User placeholder is missing")
    }

    return {
      ok: mismatches.length === 0,
      mismatches,
      collections,
      usersCanonicalSha256Matches: usersMatch,
      deletedUserPresent: fingerprint.placeholderPresent,
    }
  } finally {
    await client.close()
  }
}
