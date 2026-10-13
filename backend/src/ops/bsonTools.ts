import crypto from "crypto"
import { BSON } from "mongodb"
import { CollectionManifest, DumpManifest } from "./types"

export const PLACEHOLDER_USER_ID = "68a45fbaca5d5d29fe782190"

// Decode without turning BSON types into JavaScript ones, so numbers, dates and ids round trip exactly.
export const RAW_DECODE = {
  promoteValues: false,
  promoteLongs: false,
  promoteBuffers: false,
  bsonRegExp: true,
} as const

export const sha256 = (data: Buffer | string): string => crypto.createHash("sha256").update(data).digest("hex")

/** Splits the contents of a .bson file into one buffer per document. */
export const splitBson = (file: Buffer): Buffer[] => {
  const docs: Buffer[] = []
  let offset = 0
  while (offset < file.length) {
    if (offset + 4 > file.length) throw new Error("Corrupt BSON file: truncated length prefix")
    const size = file.readInt32LE(offset)
    if (size < 5 || offset + size > file.length) throw new Error("Corrupt BSON file: bad document length")
    docs.push(file.subarray(offset, offset + size))
    offset += size
  }
  return docs
}

const sortKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(value as object).sort()) {
      out[key] = sortKeys((value as Record<string, unknown>)[key])
    }
    return out
  }
  return value
}

/** Canonical extended JSON with sorted keys, so the same data hashes the same whatever order a server stored the fields in. */
export const canonicalJson = (raw: Buffer): string => {
  const doc = BSON.deserialize(raw, RAW_DECODE)
  return JSON.stringify(sortKeys(BSON.EJSON.serialize(doc, { relaxed: false })))
}

export interface UsersFingerprint {
  sha256: string
  placeholderPresent: boolean
}

/** Hash over every user, sorted by _id, plus whether the "Deleted User" placeholder is among them. */
export const fingerprintUsers = (rawUsers: Buffer[]): UsersFingerprint => {
  const lines: { id: string; json: string }[] = rawUsers.map((raw) => {
    const doc = BSON.deserialize(raw, RAW_DECODE)
    const id = JSON.stringify(sortKeys(BSON.EJSON.serialize({ _id: doc._id }, { relaxed: false })))
    return { id, json: canonicalJson(raw) }
  })
  lines.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))

  const placeholderMarker = JSON.stringify({ _id: { $oid: PLACEHOLDER_USER_ID } })
  return {
    sha256: sha256(lines.map((line) => line.json).join("\n")),
    placeholderPresent: lines.some((line) => line.id === placeholderMarker),
  }
}

export interface DumpedCollection {
  name: string
  docs: Buffer[]
  indexNames: string[]
}

export const buildManifest = (input: {
  database: string
  source: DumpManifest["source"]
  collections: DumpedCollection[]
  createdAt?: Date
}): DumpManifest => {
  const collections: CollectionManifest[] = input.collections
    .map((collection) => ({
      name: collection.name,
      count: collection.docs.length,
      bsonSha256: sha256(Buffer.concat(collection.docs)),
      indexNames: [...collection.indexNames].sort(),
    }))
    .sort((a, b) => (a.name < b.name ? -1 : 1))

  const users = input.collections.find((collection) => collection.name === "users")
  const fingerprint = fingerprintUsers(users ? users.docs : [])

  return {
    format: "mongodump-gzip-v1",
    createdAt: (input.createdAt ?? new Date()).toISOString(),
    source: input.source,
    database: input.database,
    collections,
    usersCanonicalSha256: fingerprint.sha256,
    deletedUserPresent: fingerprint.placeholderPresent,
  }
}

/** Collections that are never dumped: server internals and throwaway probe collections. */
export const isDumpableCollection = (name: string): boolean => !name.startsWith("system.") && !name.startsWith("zz_")

/** 2026-10-20T02-00-05Z, sortable and safe in an object key. */
export const timestampFolder = (date: Date = new Date()): string =>
  date.toISOString().replace(/\.\d{3}Z$/, "Z").replace(/:/g, "-")

export const TIMESTAMP_FOLDER = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}Z$/

export const parseTimestampFolder = (name: string): Date | null => {
  if (!TIMESTAMP_FOLDER.test(name)) return null
  const iso = name.replace(/T(\d{2})-(\d{2})-(\d{2})Z$/, "T$1:$2:$3Z")
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? null : date
}
