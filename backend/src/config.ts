import dotenv from "dotenv"
dotenv.config()

/**
 * The single place that reads environment variables.
 *
 * Importing this module has no side effects besides loading .env. The server calls
 * reportConfig() once at boot, which logs one line per known key (never the value)
 * and, on OSC, exits when a required key is missing or masked.
 */

const env = process.env

// OSC injects APP_URL into every My App. Nothing else sets it, so it is the OSC marker.
const isOsc = Boolean(env.APP_URL)

const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = parseInt(value ?? "", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const trimSlash = (value: string): string => value.replace(/\/+$/, "")

const port = toInt(env.PORT, 8080)

const frontendOrigins = (env.FRONTEND_URL || "")
  .split(",")
  .map((entry) => trimSlash(entry.trim()))
  .filter(Boolean)
if (!isOsc) frontendOrigins.push("http://localhost:5173")

// Empty, or a path that ends with a slash, for example "osctest/".
const normalizePrefix = (raw: string | undefined): string => {
  const cleaned = (raw || "").trim().replace(/^\/+/, "")
  if (!cleaned) return ""
  if (!/^[A-Za-z0-9_\-/]+$/.test(cleaned)) {
    throw new Error("MEDIA_FOLDER_PREFIX may only contain letters, digits, underscore, dash and slash")
  }
  return cleaned.endsWith("/") ? cleaned : `${cleaned}/`
}

export const config = {
  isOsc,
  port,
  mongoUrl: env.MONGO_URL || (isOsc ? "" : "mongodb://localhost/final-project"),
  mongoUrlProd: env.MONGO_URL_PROD || "",
  publicApiUrl: trimSlash(env.APP_URL || env.API_URL || `http://localhost:${port}`),
  frontendOrigins,
  // Used to build invitation links. FRONTEND_URL may hold a list, the first entry wins.
  primaryFrontendUrl: frontendOrigins[0] || "http://localhost:5173",
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: env.CLOUDINARY_API_KEY || "",
    apiSecret: env.CLOUDINARY_API_SECRET || "",
  },
  mediaStorage: (env.MEDIA_STORAGE || "cloudinary") as "cloudinary" | "s3",
  mediaFolderPrefix: normalizePrefix(env.MEDIA_FOLDER_PREFIX),
  maxVideoBytes: toInt(env.MAX_VIDEO_MB, 100) * 1024 * 1024,
  maxImageBytes: toInt(env.MAX_IMAGE_MB, 10) * 1024 * 1024,
  backup: {
    enabled: env.BACKUP_ENABLED === "true",
    prefix: (env.BACKUP_PREFIX || "").replace(/^\/+|\/+$/g, ""),
    endpoint: env.BACKUP_S3_ENDPOINT || "",
    bucket: env.BACKUP_S3_BUCKET || "",
    accessKey: env.BACKUP_S3_ACCESS_KEY || "",
    secretKey: env.BACKUP_S3_SECRET_KEY || "",
    retentionDays: toInt(env.BACKUP_RETENTION_DAYS, 30),
  },
  ops: {
    enabled: env.OPS_ENABLED === "true",
    token: env.OPS_TOKEN || "",
  },
}

const KNOWN_KEYS = [
  "MONGO_URL",
  "MONGO_URL_PROD",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "MEDIA_STORAGE",
  "MEDIA_FOLDER_PREFIX",
  "MAX_VIDEO_MB",
  "MAX_IMAGE_MB",
  "FRONTEND_URL",
  "BACKUP_ENABLED",
  "BACKUP_PREFIX",
  "BACKUP_S3_ENDPOINT",
  "BACKUP_S3_BUCKET",
  "BACKUP_S3_ACCESS_KEY",
  "BACKUP_S3_SECRET_KEY",
  "BACKUP_RETENTION_DAYS",
  "OPS_ENABLED",
  "OPS_TOKEN",
  "APP_URL",
  "PORT",
  "API_URL",
  "RESET_DB",
]

// OSC returns the literal "***" for secrets it masks. A value like that must never be used.
const isMasked = (value: string | undefined): boolean => Boolean(value) && /^\*+$/.test(value as string)

const requiredOnOsc = (): string[] => {
  const keys = [
    "MONGO_URL",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "FRONTEND_URL",
    "MEDIA_STORAGE",
  ]
  if (env.BACKUP_ENABLED === "true") {
    keys.push(
      "BACKUP_PREFIX",
      "BACKUP_S3_ENDPOINT",
      "BACKUP_S3_BUCKET",
      "BACKUP_S3_ACCESS_KEY",
      "BACKUP_S3_SECRET_KEY"
    )
  }
  return keys
}

/** Logs one line per known key without ever printing a value. Exits on OSC when a required key is unusable. */
export const reportConfig = (): void => {
  for (const key of KNOWN_KEYS) {
    const value = env[key]
    console.log(`[config] ${key} present=${Boolean(value)} len=${value ? value.length : 0} masked=${isMasked(value)}`)
  }

  if (!isOsc) return

  const problems: string[] = []
  for (const key of requiredOnOsc()) {
    const value = env[key]
    if (!value) problems.push(`${key} is missing`)
    else if (isMasked(value)) problems.push(`${key} arrived masked, the value is not usable`)
  }
  if (env.OPS_ENABLED === "true" && (env.OPS_TOKEN || "").length < 48) {
    problems.push("OPS_TOKEN must be at least 48 characters when OPS_ENABLED is true")
  }

  if (problems.length > 0) {
    for (const problem of problems) console.error(`[config] FATAL ${problem}`)
    console.error("[config] Refusing to start on OSC with an incomplete configuration")
    process.exit(1)
  }
}

/** Removes anything that looks like a connection string from text that is about to be logged or returned. */
export const scrubSecrets = (text: string): string =>
  text.replace(/mongodb(\+srv)?:\/\/[^\s"'`]+/gi, "mongodb://[redacted]")
