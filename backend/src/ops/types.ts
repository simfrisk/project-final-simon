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
  command: "backup-now" | "restore" | "verify"
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
