export interface CollectionManifest {
  name: string
  count: number
  bsonSha256: string // sha256 of the uncompressed .bson file
  indexNames: string[]
}

export interface DumpManifest {
  format: "mongodump-gzip-v1" // same layout as `mongodump --gzip --out`
  createdAt: string
  source: "classync-app" | "mac-mongodump"
  database: string // "final-project"
  collections: CollectionManifest[]
  usersCanonicalSha256: string // sha256 over canonical EJSON of all users sorted by _id
  deletedUserPresent: boolean // _id 68a45fbaca5d5d29fe782190
}

export interface OpsReport {
  command: "backup-now" | "restore" | "verify" | "rewrite-media-urls"
  startedAt: string
  finishedAt: string
  ok: boolean
  details: Record<string, unknown>
  error?: string
}

export interface BackupStatus {
  enabled: boolean
  lastSuccessAt: string | null
  lastStatus: "ok" | "failed" | "never"
}

export interface MirrorStatus {
  enabled: boolean
  lastSuccessAt: string | null
  lastStatus: "ok" | "failed" | "never"
  objects: number // objects of the media bucket that are present in the mirror
  bytes: number
  note: string | null // why the last run did not finish, for example that the backup storage limit was reached
}

// Media migration (Phase 2). The mapping is written by media-copy and read by /ops/rewrite-media-urls.

export type MediaField = "projects.video" | "projects.thumbnail" | "users.profileImage"

export interface MediaMappingEntry {
  field: MediaField | "code.defaultProfileImage"
  oldUrl: string // exact string stored in the database (or in code)
  sourceUrl: string // exact URL downloaded from Cloudinary (differs from oldUrl only when a rendition was used)
  key: string // object key in the media bucket
  newUrl: string // MEDIA_PUBLIC_BASE_URL + "/" + key
  bytes: number
  sha256: string
  contentType: string
  docIds: string[] // documents that held oldUrl when the inventory was taken
}

export interface MediaMapping {
  version: 1
  createdAt: string
  sourceBackup: string // e.g. "prod/2026-10-20T08-00-00Z"
  mediaBaseUrl: string
  entries: MediaMappingEntry[]
}

export interface RewriteFieldReport {
  field: MediaField
  matched: number // documents whose value equals an oldUrl (forward) or newUrl (reverse)
  changed: number // 0 in a dry run
  alreadyDone: number // documents already holding the target value
  unmapped: string[] // Cloudinary URLs found in this field that are not in the mapping
}

export interface RewriteReport {
  direction: "forward" | "reverse"
  dryRun: boolean
  preRewriteBackup: string | null // folder written before a real run
  fields: RewriteFieldReport[]
  cloudinaryStringsLeft: Record<string, number> // per collection, full scan for "res.cloudinary.com"
}
