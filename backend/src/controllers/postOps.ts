import crypto from "crypto"
import express, { NextFunction, Request, Response } from "express"
import { config, scrubSecrets } from "../config"
import { runBackup } from "../ops/backupScheduler"
import { putObject } from "../ops/s3"
import { restoreDump, TargetUrlEnv, verifyAgainstManifest } from "../ops/restore"
import { timestampFolder } from "../ops/bsonTools"
import { OpsReport } from "../ops/types"

const MIN_TOKEN_LENGTH = 48

const digest = (value: string): Buffer => crypto.createHash("sha256").update(value).digest()

/** The header x-ops-token against OPS_TOKEN, compared in constant time. This is not the user token. */
export const requireOpsToken = (req: Request, res: Response, next: NextFunction): void => {
  if (config.ops.token.length < MIN_TOKEN_LENGTH) {
    res.status(503).json({ success: false, response: null, message: "Ops token is not configured" })
    return
  }
  const supplied = req.header("x-ops-token") ?? ""
  // Hashing first makes both sides the same length, which timingSafeEqual requires.
  if (!crypto.timingSafeEqual(digest(supplied), digest(config.ops.token))) {
    res.status(401).json({ success: false, response: null, message: "Invalid ops token" })
    return
  }
  next()
}

const TARGET_ENVS: TargetUrlEnv[] = ["MONGO_URL", "MONGO_URL_PROD"]

const isString = (value: unknown): value is string => typeof value === "string" && value.length > 0

/** Runs one ops command, writes its report to the bucket and answers with it. Never logs a URL. */
const respondWithReport = async (
  res: Response,
  command: OpsReport["command"],
  work: () => Promise<{ ok: boolean; details: Record<string, unknown> }>
): Promise<Response> => {
  const startedAt = new Date()
  let report: OpsReport

  try {
    const { ok, details } = await work()
    report = {
      command,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      ok,
      details,
    }
  } catch (error) {
    report = {
      command,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      ok: false,
      details: {},
      error: scrubSecrets(error instanceof Error ? error.message : String(error)),
    }
  }

  console.log(`[ops] ${command} ok=${report.ok}`)

  try {
    await putObject(
      `${config.backup.prefix}/reports/${timestampFolder(startedAt)}-${command}.json`,
      JSON.stringify(report, null, 2),
      "application/json"
    )
  } catch (error) {
    // The report is still returned to the caller below.
    console.error(`[ops] report not stored: ${scrubSecrets(error instanceof Error ? error.message : String(error))}`)
  }

  return res.status(report.ok ? 200 : 500).json({
    success: report.ok,
    response: report,
    message: report.ok ? "Done" : "Failed",
  })
}

const backupNow = (_req: Request, res: Response): Promise<Response> =>
  respondWithReport(res, "backup-now", async () => {
    const result = await runBackup()
    return {
      ok: true,
      details: { folder: result.folder, objects: result.objects, pruned: result.pruned, manifest: result.manifest },
    }
  })

const restore = (req: Request, res: Response): Promise<Response> => {
  const { from, targetDb, targetUrlEnv, confirmDrop } = req.body ?? {}
  if (!isString(from) || !isString(targetDb) || !TARGET_ENVS.includes(targetUrlEnv)) {
    return Promise.resolve(
      res.status(400).json({
        success: false,
        response: null,
        message: "from, targetDb and targetUrlEnv (MONGO_URL or MONGO_URL_PROD) are required",
      })
    )
  }
  // Dropping collections is destructive, so the caller must type the database name a second time.
  if (confirmDrop !== targetDb) {
    return Promise.resolve(
      res.status(400).json({ success: false, response: null, message: "confirmDrop must equal targetDb" })
    )
  }
  return respondWithReport(res, "restore", async () => {
    const result = await restoreDump({ from, targetDb, targetUrlEnv })
    return { ok: result.verification.ok, details: { ...result } }
  })
}

const verify = (req: Request, res: Response): Promise<Response> => {
  const { from, targetDb, targetUrlEnv } = req.body ?? {}
  if (!isString(from) || !isString(targetDb) || !TARGET_ENVS.includes(targetUrlEnv)) {
    return Promise.resolve(
      res.status(400).json({
        success: false,
        response: null,
        message: "from, targetDb and targetUrlEnv (MONGO_URL or MONGO_URL_PROD) are required",
      })
    )
  }
  return respondWithReport(res, "verify", async () => {
    const result = await verifyAgainstManifest({ from, targetDb, targetUrlEnv })
    return { ok: result.ok, details: { ...result } }
  })
}

/** Mounted at /ops by server.ts only when OPS_ENABLED is "true". */
export const createOpsRouter = (): express.Router => {
  const router = express.Router()
  router.use(requireOpsToken)
  router.post("/backup-now", backupNow)
  router.post("/restore", restore)
  router.post("/verify", verify)
  router.use((_req, res) => {
    res.status(404).json({ success: false, response: null, message: "Not found" })
  })
  return router
}
