// Mac side helper for the backup bucket. Run from the repo after `npm run build`:
//   node backend/dist/ops/cli.js <command> [options]
// Environment comes from the shell (BACKUP_S3_ENDPOINT, BACKUP_S3_BUCKET, BACKUP_S3_ACCESS_KEY,
// BACKUP_S3_SECRET_KEY, and MONGO_URL or MONGO_URL_PROD for the commands that read a database).
// Nothing here prints a secret, and nothing here writes to a database.
//
// Media move (Phase 2) commands also read CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
// (read only Admin API), MEDIA_S3_ENDPOINT, MEDIA_S3_BUCKET, MEDIA_S3_ACCESS_KEY, MEDIA_S3_SECRET_KEY and
// MEDIA_PUBLIC_BASE_URL from the shell, and ffprobe must be installed. Load them from the keychain inside the
// command that runs this file, never into a file.

import fs from "fs"
import path from "path"
import zlib from "zlib"
import { assertValidBackupPath, TargetUrlEnv, verifyAgainstManifest } from "./restore"
import { buildManifest, DumpedCollection, isDumpableCollection, splitBson } from "./bsonTools"
import { dumpDatabase } from "./dump"
import { ensureBucket, getObject, listKeys, putObject } from "./s3"
import { config, scrubSecrets } from "../config"
import { runInventory } from "./mediaInventory"
import { runCopy, runDefaultAvatar, verifyMapping } from "./mediaCopy"
import { runMediaMirror } from "./mediaMirror"
import { loadMapping } from "./rewriteMedia"
import { MediaMapping } from "./types"

const USAGE = `Commands:
  ensure-bucket
  manifest --dir <mongodump db dir>          writes manifest.json into the folder
  upload-dir --dir <dir> --to <path>         uploads a dump folder, manifest.json last
  list --prefix <prefix>
  download --from <path> --dir <dir>
  backup-now                                 dump MONGO_URL into BACKUP_PREFIX
  verify --from <path> --db <name> --url-env <MONGO_URL|MONGO_URL_PROD>

Media move, positional arguments:
  media-inventory <dumpDir> <outDir> [sourceBackup] [orphanListPath]
                                             reads projects and users from a downloaded backup, lists the Cloudinary
                                             account (read only), writes inventory.json, orphans.json and the orphan list
  media-copy <outDir> [dry-run]              copies the inventory into the media bucket, proves each copy through its
                                             public URL, writes mapping.json and copy-report.json (dry-run writes nothing
                                             to the bucket and names the mapping mapping.dry-run.json)
  media-default-avatar <outDir> [dry-run]    only the default avatar, no inventory needed
  media-verify <mappingPath>                 checks every mapped object through its public URL; mappingPath is a local
                                             file or a phase2/... path in the backup bucket
  media-mirror                               one run of the nightly mirror: media bucket to <backup bucket>/media-mirror/`

const parseArgs = (argv: string[]): Record<string, string> => {
  const out: Record<string, string> = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith("--")) {
      const value = argv[i + 1]
      if (value === undefined || value.startsWith("--")) throw new Error(`Missing value for ${arg}`)
      out[arg.slice(2)] = value
      i++
    }
  }
  return out
}

const need = (args: Record<string, string>, name: string): string => {
  if (!args[name]) throw new Error(`Missing --${name}\n${USAGE}`)
  return args[name]
}

const manifestCommand = async (dir: string): Promise<void> => {
  const names = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".bson.gz"))
    .map((file) => file.replace(/\.bson\.gz$/, ""))
    .filter(isDumpableCollection)
    .sort()
  if (names.length === 0) throw new Error(`No .bson.gz files found in ${dir}`)

  const collections: DumpedCollection[] = names.map((name) => {
    const docs = splitBson(zlib.gunzipSync(fs.readFileSync(path.join(dir, `${name}.bson.gz`))))
    const metadataFile = path.join(dir, `${name}.metadata.json.gz`)
    const metadata = fs.existsSync(metadataFile)
      ? (JSON.parse(zlib.gunzipSync(fs.readFileSync(metadataFile)).toString("utf8")) as { indexes?: { name: string }[] })
      : {}
    return { name, docs, indexNames: (metadata.indexes ?? []).map((index) => index.name) }
  })

  const manifest = buildManifest({ database: path.basename(path.resolve(dir)), source: "mac-mongodump", collections })
  fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2))
  console.log(`manifest written: ${manifest.collections.length} collections`)
  for (const collection of manifest.collections) console.log(`  ${collection.name}: ${collection.count}`)
  console.log(`  deletedUserPresent=${manifest.deletedUserPresent}`)
}

const uploadDirCommand = async (dir: string, to: string): Promise<void> => {
  assertValidBackupPath(to)
  const files = fs
    .readdirSync(dir)
    .filter((file) => fs.statSync(path.join(dir, file)).isFile())
    // Probe and system collections are never restored, so they are not uploaded either.
    .filter((file) => file === "manifest.json" || isDumpableCollection(file))
    // The manifest goes last so a folder without one is recognisably incomplete.
    .sort((a, b) => (a === "manifest.json" ? 1 : b === "manifest.json" ? -1 : a < b ? -1 : 1))
  if (!files.includes("manifest.json")) throw new Error("manifest.json is missing, run the manifest command first")

  for (const file of files) {
    await putObject(`${to}/${file}`, fs.readFileSync(path.join(dir, file)))
  }
  console.log(`uploaded ${files.length} files to ${to}/`)
}

const downloadCommand = async (from: string, dir: string): Promise<void> => {
  assertValidBackupPath(from)
  fs.mkdirSync(dir, { recursive: true })
  const keys = (await listKeys(`${from}/`)).filter((key) => !key.slice(from.length + 1).includes("/"))
  if (keys.length === 0) throw new Error(`Nothing found under ${from}/`)
  for (const key of keys) {
    fs.writeFileSync(path.join(dir, path.basename(key)), await getObject(key))
  }
  console.log(`downloaded ${keys.length} files to ${dir}`)
}

const MEDIA_COMMANDS = ["media-inventory", "media-copy", "media-default-avatar", "media-verify", "media-mirror"]

const mediaCommand = async (command: string, positional: string[]): Promise<void> => {
  const [first, second, third, fourth] = positional
  const need2 = (): void => {
    if (!first) throw new Error(`Missing argument\n${USAGE}`)
  }

  switch (command) {
    case "media-inventory": {
      if (!first || !second) throw new Error(`media-inventory needs <dumpDir> <outDir>\n${USAGE}`)
      const { inventory, orphans, files } = await runInventory({ dumpDir: first, outDir: second, sourceBackup: third, orphanListPath: fourth })
      console.log(`referenced items: ${inventory.items.length}, orphans: ${orphans.length}`)
      console.log(`listing: ${inventory.listing.images} images, ${inventory.listing.videos} videos`)
      if (inventory.notCloudinary.length > 0) console.log(`values that are not Cloudinary URLs: ${inventory.notCloudinary.length}`)
      for (const file of files) console.log(`wrote ${file}`)
      return
    }
    case "media-copy": {
      need2()
      if (second !== undefined && second !== "dry-run") throw new Error(`Unknown option "${second}", the only one is dry-run`)
      const result = await runCopy({ outDir: first, dryRun: second === "dry-run" })
      console.log(
        `${result.report.dryRun ? "dry run" : "copy"}: ${result.report.objects} objects, ${result.report.bytes} bytes, ` +
          `${result.report.renditions} renditions, ${result.report.failures} failures`
      )
      if (result.backupFolder) console.log(`reports and mapping uploaded to ${result.backupFolder}/ (use ${result.backupFolder}/mapping.json for the rewrite)`)
      if (result.report.failures > 0) process.exitCode = 1
      return
    }
    case "media-default-avatar": {
      need2()
      if (second !== undefined && second !== "dry-run") throw new Error(`Unknown option "${second}", the only one is dry-run`)
      const report = await runDefaultAvatar({ outDir: first, dryRun: second === "dry-run" })
      if (report.failures > 0) process.exitCode = 1
      return
    }
    case "media-verify": {
      need2()
      let mapping: MediaMapping
      if (fs.existsSync(first)) mapping = JSON.parse(fs.readFileSync(first, "utf8")) as MediaMapping
      else mapping = await loadMapping(first)
      const report = await verifyMapping(mapping)
      for (const failure of report.failed) console.error(`FAILED ${failure.key}: ${failure.error}`)
      console.log(`verified ${report.checked - report.failed.length} of ${report.checked} objects`)
      if (report.failed.length > 0) process.exitCode = 1
      return
    }
    case "media-mirror": {
      const report = await runMediaMirror()
      console.log(JSON.stringify(report))
      if (report.failed > 0) process.exitCode = 1
      return
    }
  }
}

const main = async (): Promise<void> => {
  const [command, ...rest] = process.argv.slice(2)
  if (MEDIA_COMMANDS.includes(command)) return mediaCommand(command, rest)
  const args = parseArgs(rest)

  switch (command) {
    case "ensure-bucket":
      console.log(`bucket ${await ensureBucket()}`)
      return
    case "manifest":
      return manifestCommand(need(args, "dir"))
    case "upload-dir":
      return uploadDirCommand(need(args, "dir"), need(args, "to"))
    case "list":
      for (const key of await listKeys(args.prefix ?? "")) console.log(key)
      return
    case "download":
      return downloadCommand(need(args, "from"), need(args, "dir"))
    case "backup-now": {
      if (!config.mongoUrl) throw new Error("MONGO_URL is not set")
      const result = await dumpDatabase(config.mongoUrl, "classync-app")
      console.log(`backup ok: ${result.folder} (${result.objects} objects)`)
      return
    }
    case "verify": {
      const urlEnv = need(args, "url-env")
      if (urlEnv !== "MONGO_URL" && urlEnv !== "MONGO_URL_PROD") throw new Error("--url-env must be MONGO_URL or MONGO_URL_PROD")
      const result = await verifyAgainstManifest({ from: need(args, "from"), targetDb: need(args, "db"), targetUrlEnv: urlEnv as TargetUrlEnv })
      console.log(JSON.stringify(result, null, 2))
      if (!result.ok) process.exitCode = 1
      return
    }
    default:
      console.log(USAGE)
      process.exitCode = command ? 1 : 0
  }
}

main().catch((error) => {
  console.error(scrubSecrets(error instanceof Error ? error.message : String(error)))
  process.exit(1)
})
