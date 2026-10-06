import zlib from "zlib"
import { promisify } from "util"
import { MongoClient } from "mongodb"
import { config } from "../config"
import { buildManifest, DumpedCollection, isDumpableCollection, timestampFolder } from "./bsonTools"
import { putObject } from "./s3"
import { DumpManifest } from "./types"

const gzip = promisify(zlib.gzip)

export interface CollectedDump {
  database: string
  // File name inside the dump folder mapped to its bytes. Layout of `mongodump --gzip --out`.
  files: Map<string, Buffer>
  manifest: DumpManifest
}

/**
 * Reads every dumpable collection of the database in the connection string into memory,
 * in the layout of `mongodump --gzip --out`. Read only: nothing is written to the source.
 * The data set is small (about a tenth of a megabyte), so buffering is fine here.
 */
export const collectDump = async (
  mongoUrl: string,
  source: DumpManifest["source"]
): Promise<CollectedDump> => {
  const client = new MongoClient(mongoUrl, { serverSelectionTimeoutMS: 15000 })
  await client.connect()
  try {
    const db = client.db()
    const infos = await db.listCollections({}, { nameOnly: false }).toArray()
    const names = infos
      .filter((info) => info.type !== "view" && isDumpableCollection(info.name))
      .map((info) => info.name)
      .sort()

    const dumped: DumpedCollection[] = []
    const files = new Map<string, Buffer>()

    for (const name of names) {
      const collection = db.collection(name)
      const raw = (await collection.find({}, { raw: true }).sort({ _id: 1 }).toArray()) as unknown as Buffer[]
      const indexes = (await collection.listIndexes().toArray()).map((index) => {
        const { ns: _ns, ...rest } = index as Record<string, unknown>
        return rest
      })

      dumped.push({ name, docs: raw, indexNames: indexes.map((index) => String(index.name)) })

      files.set(`${name}.bson.gz`, await gzip(Buffer.concat(raw)))
      const metadata = { options: {}, indexes, uuid: "", collectionName: name, type: "collection" }
      files.set(`${name}.metadata.json.gz`, await gzip(Buffer.from(JSON.stringify(metadata))))
    }

    const manifest = buildManifest({ database: db.databaseName, source, collections: dumped })
    files.set("manifest.json", Buffer.from(JSON.stringify(manifest, null, 2)))
    return { database: db.databaseName, files, manifest }
  } finally {
    await client.close()
  }
}

export interface DumpUpload {
  folder: string // for example prod/2026-10-20T02-00-05Z
  manifest: DumpManifest
  objects: number
}

/** Writes a collected dump to <BACKUP_PREFIX>/<timestamp>/ and updates <BACKUP_PREFIX>/latest.json last. */
export const dumpDatabase = async (
  mongoUrl: string,
  source: DumpManifest["source"] = "classync-app"
): Promise<DumpUpload> => {
  const prefix = config.backup.prefix
  if (!prefix) throw new Error("BACKUP_PREFIX is not set")

  const dump = await collectDump(mongoUrl, source)
  const folder = `${prefix}/${timestampFolder(new Date(dump.manifest.createdAt))}`

  // Data files first, then the manifest, then latest.json. A folder without a manifest is incomplete,
  // and latest.json never points at one.
  for (const [name, body] of dump.files) {
    if (name === "manifest.json") continue
    await putObject(`${folder}/${name}`, body, "application/gzip")
  }
  await putObject(`${folder}/manifest.json`, dump.files.get("manifest.json") as Buffer, "application/json")
  await putObject(
    `${prefix}/latest.json`,
    JSON.stringify({ folder, createdAt: dump.manifest.createdAt }),
    "application/json"
  )

  return { folder, manifest: dump.manifest, objects: dump.files.size }
}
