// Mac side. Builds the list of Cloudinary assets that the database and the code point at, and the list of
// everything else in the account (the orphans). Read only: it reads a downloaded backup and the Cloudinary
// Admin API, and writes files into a local folder. Nothing is copied or deleted anywhere.

import fs from "fs"
import path from "path"
import zlib from "zlib"
import { BSON } from "mongodb"
import { LEGACY_DEFAULT_PROFILE_IMAGE_URL } from "../config"
import { splitBson } from "./bsonTools"
import {
  CloudinaryResource,
  DEMO_VIDEO_URL,
  listCloudinaryResources,
  parseCloudinaryUrl,
  ParsedCloudinaryUrl,
  ResourceType,
} from "./cloudinary"
import { MediaMappingEntry } from "./types"

export type InventoryKind = "video" | "thumbnail" | "profile" | "default"

export interface InventoryItem {
  field: MediaMappingEntry["field"]
  kind: InventoryKind
  storedUrl: string // exact string in the database (or in code)
  docIds: string[]
  resourceType: ResourceType
  publicId: string
  format: string // from the stored URL
  transformation: string // "" for an original
  bytes: number // size of the original asset according to the Admin API
}

export interface Inventory {
  version: 1
  createdAt: string
  sourceBackup: string
  listing: { listedAt: string; images: number; videos: number }
  items: InventoryItem[]
  // Stored values that are not Cloudinary URLs (empty, relative, or already a media bucket URL), per field.
  notCloudinary: { field: string; value: string; docIds: string[] }[]
  demo: { url: string; publicId: string; bytes: number }
}

export interface OrphanResource {
  public_id: string
  resource_type: ResourceType
  format: string
  bytes: number
  created_at: string
  width?: number
  height?: number
  secure_url: string
  group: string
}

const MEDIA_FIELDS: { collection: "projects" | "users"; property: string; field: InventoryItem["field"]; kind: InventoryKind }[] = [
  { collection: "projects", property: "video", field: "projects.video", kind: "video" },
  { collection: "projects", property: "thumbnail", field: "projects.thumbnail", kind: "thumbnail" },
  { collection: "users", property: "profileImage", field: "users.profileImage", kind: "profile" },
]

const resourceKey = (type: ResourceType, publicId: string): string => `${type}\n${publicId}`

/** Reads <dir>/<name>.bson or <dir>/<name>.bson.gz into documents. */
export const readDumpedCollection = (dir: string, name: string): Record<string, unknown>[] => {
  const plain = path.join(dir, `${name}.bson`)
  const gzipped = path.join(dir, `${name}.bson.gz`)
  let buffer: Buffer
  if (fs.existsSync(plain)) buffer = fs.readFileSync(plain)
  else if (fs.existsSync(gzipped)) buffer = zlib.gunzipSync(fs.readFileSync(gzipped))
  else throw new Error(`${name}.bson or ${name}.bson.gz not found in ${dir}`)
  return splitBson(buffer).map((raw) => BSON.deserialize(raw) as Record<string, unknown>)
}

export const groupOf = (publicId: string): string => (publicId.includes("/") ? publicId.split("/")[0] : "(root)")

export interface InventoryResult {
  inventory: Inventory
  orphans: OrphanResource[]
  resources: CloudinaryResource[]
}

/** The pure part: references from the dump and the code against a listing of the account. */
export const buildInventory = (input: {
  projects: Record<string, unknown>[]
  users: Record<string, unknown>[]
  resources: CloudinaryResource[]
  sourceBackup: string
  listedAt: string
  now?: Date
}): InventoryResult => {
  const known = new Map<string, CloudinaryResource>()
  for (const resource of input.resources) known.set(resourceKey(resource.resource_type, resource.public_id), resource)

  type Pending = { field: InventoryItem["field"]; kind: InventoryKind; storedUrl: string; docIds: string[]; parsed: ParsedCloudinaryUrl }
  const pending = new Map<string, Pending>()
  const notCloudinary = new Map<string, { field: string; value: string; docIds: string[] }>()
  const unparseable: string[] = []

  const reference = (field: InventoryItem["field"], kind: InventoryKind, value: unknown, docId: string | null): void => {
    if (typeof value !== "string" || value === "") return
    const parsed = parseCloudinaryUrl(value)
    if (!parsed) {
      if (value.includes("res.cloudinary.com")) {
        unparseable.push(`${field}: ${value}`)
        return
      }
      const id = `${field}\n${value}`
      const existing = notCloudinary.get(id) ?? { field, value, docIds: [] }
      if (docId) existing.docIds.push(docId)
      notCloudinary.set(id, existing)
      return
    }
    const id = `${field}\n${value}`
    const existing = pending.get(id) ?? { field, kind, storedUrl: value, docIds: [], parsed }
    if (docId) existing.docIds.push(docId)
    pending.set(id, existing)
  }

  for (const spec of MEDIA_FIELDS) {
    const documents = spec.collection === "projects" ? input.projects : input.users
    for (const doc of documents) {
      reference(spec.field, spec.kind, doc[spec.property], String(doc._id))
    }
  }
  // The default avatar is also baked into the code as the default value of a new user.
  reference("code.defaultProfileImage", "default", LEGACY_DEFAULT_PROFILE_IMAGE_URL, null)

  // A user whose image is the default one is the default kind, so it ends up under defaults/.
  for (const item of pending.values()) {
    if (item.field === "users.profileImage" && item.storedUrl === LEGACY_DEFAULT_PROFILE_IMAGE_URL) item.kind = "default"
  }

  const demo = parseCloudinaryUrl(DEMO_VIDEO_URL)
  if (!demo) throw new Error("The demo video URL could not be parsed")

  const referenced = new Set<string>()
  const missing: string[] = []
  const items: InventoryItem[] = []

  for (const item of [...pending.values()].sort((a, b) => (a.field + a.storedUrl < b.field + b.storedUrl ? -1 : 1))) {
    const key = resourceKey(item.parsed.resourceType, item.parsed.publicId)
    const resource = known.get(key)
    if (!resource) {
      missing.push(`${item.field}: ${item.parsed.resourceType} ${item.parsed.publicId}`)
      continue
    }
    referenced.add(key)
    items.push({
      field: item.field,
      kind: item.kind,
      storedUrl: item.storedUrl,
      docIds: item.docIds,
      resourceType: item.parsed.resourceType,
      publicId: item.parsed.publicId,
      format: item.parsed.format,
      transformation: item.parsed.transformation,
      bytes: resource.bytes,
    })
  }

  const demoKey = resourceKey(demo.resourceType, demo.publicId)
  const demoResource = known.get(demoKey)
  if (!demoResource) missing.push(`demo: ${demo.resourceType} ${demo.publicId}`)
  else referenced.add(demoKey)

  if (unparseable.length > 0) {
    throw new Error(`Cloudinary URLs this tool cannot read:\n${unparseable.join("\n")}`)
  }
  if (missing.length > 0) {
    throw new Error(`Referenced assets missing in the Cloudinary account:\n${missing.join("\n")}`)
  }

  const orphans: OrphanResource[] = input.resources
    .filter((resource) => !referenced.has(resourceKey(resource.resource_type, resource.public_id)))
    .map((resource) => ({
      public_id: resource.public_id,
      resource_type: resource.resource_type,
      format: resource.format,
      bytes: resource.bytes,
      created_at: resource.created_at,
      width: resource.width,
      height: resource.height,
      secure_url: resource.secure_url,
      group: groupOf(resource.public_id),
    }))
    .sort((a, b) => b.bytes - a.bytes)

  return {
    inventory: {
      version: 1,
      createdAt: (input.now ?? new Date()).toISOString(),
      sourceBackup: input.sourceBackup,
      listing: {
        listedAt: input.listedAt,
        images: input.resources.filter((r) => r.resource_type === "image").length,
        videos: input.resources.filter((r) => r.resource_type === "video").length,
      },
      items,
      notCloudinary: [...notCloudinary.values()],
      demo: { url: DEMO_VIDEO_URL, publicId: demo.publicId, bytes: demoResource?.bytes ?? 0 },
    },
    orphans,
    resources: input.resources,
  }
}

const mb = (bytes: number): string => (bytes / (1024 * 1024)).toFixed(1)

/** The orphan list for Simon, as Markdown. No user names or emails: profile images are listed by public id only. */
export const orphanMarkdown = (input: { orphans: OrphanResource[]; sourceBackup: string; listedAt: string }): string => {
  const lines: string[] = []
  lines.push("# Cloudinary orphans")
  lines.push("")
  lines.push("Assets in the Cloudinary account that no project, user or code in Classync points at. Nothing here has been copied or deleted.")
  lines.push("")
  lines.push("Simon's call, per group: `keep in Cloudinary`, `archive to MinIO`, `delete when retiring`, `not Classync, leave alone`.")
  lines.push("")

  const groups = new Map<string, OrphanResource[]>()
  for (const orphan of input.orphans) {
    const id = `${orphan.group}\n${orphan.resource_type}`
    groups.set(id, [...(groups.get(id) ?? []), orphan])
  }
  const ordered = [...groups.entries()]
    .map(([id, list]) => ({ group: id.split("\n")[0], type: id.split("\n")[1], list }))
    .sort((a, b) => b.list.reduce((s, o) => s + o.bytes, 0) - a.list.reduce((s, o) => s + o.bytes, 0))

  lines.push("## Summary")
  lines.push("")
  lines.push("| Group | Type | Count | MB | Simon's call |")
  lines.push("|---|---|---|---|---|")
  for (const { group, type, list } of ordered) {
    lines.push(`| ${group} | ${type} | ${list.length} | ${mb(list.reduce((s, o) => s + o.bytes, 0))} |  |`)
  }
  lines.push(`| **All** |  | ${input.orphans.length} | ${mb(input.orphans.reduce((s, o) => s + o.bytes, 0))} |  |`)
  lines.push("")

  for (const { group, type, list } of ordered) {
    lines.push(`## ${group} (${type})`)
    lines.push("")
    lines.push("| public_id | type | format | MB | created | size | link |")
    lines.push("|---|---|---|---|---|---|---|")
    for (const orphan of list) {
      const size = orphan.width && orphan.height ? `${orphan.width}x${orphan.height}` : ""
      lines.push(
        `| ${orphan.public_id} | ${orphan.resource_type} | ${orphan.format ?? ""} | ${mb(orphan.bytes)} | ${orphan.created_at.slice(0, 10)} | ${size} | [open](${orphan.secure_url}) |`
      )
    }
    lines.push("")
  }

  lines.push("---")
  lines.push("")
  lines.push(`Inventory source backup: ${input.sourceBackup}. Cloudinary listing taken ${input.listedAt}. Regenerate with \`media-inventory\`.`)
  lines.push("")
  return lines.join("\n")
}

/** media-inventory <dumpDir> <outDir> [sourceBackup] [orphanListPath] */
export const runInventory = async (input: {
  dumpDir: string
  outDir: string
  sourceBackup?: string
  orphanListPath?: string
}): Promise<{ inventory: Inventory; orphans: OrphanResource[]; files: string[] }> => {
  const projects = readDumpedCollection(input.dumpDir, "projects")
  const users = readDumpedCollection(input.dumpDir, "users")

  const resources = [...(await listCloudinaryResources("image")), ...(await listCloudinaryResources("video"))]
  const listedAt = new Date().toISOString()
  const sourceBackup = input.sourceBackup || path.basename(path.resolve(input.dumpDir))

  const { inventory, orphans } = buildInventory({ projects, users, resources, sourceBackup, listedAt })

  fs.mkdirSync(input.outDir, { recursive: true })
  const inventoryFile = path.join(input.outDir, "inventory.json")
  const orphansFile = path.join(input.outDir, "orphans.json")
  const markdownFile = input.orphanListPath || path.join(input.outDir, "cloudinary-orphans.md")
  fs.writeFileSync(inventoryFile, JSON.stringify(inventory, null, 2))
  fs.writeFileSync(orphansFile, JSON.stringify({ version: 1, sourceBackup, listedAt, orphans }, null, 2))
  fs.writeFileSync(markdownFile, orphanMarkdown({ orphans, sourceBackup, listedAt }))

  return { inventory, orphans, files: [inventoryFile, orphansFile, markdownFile] }
}
