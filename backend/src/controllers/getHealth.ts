import { Request, Response } from "express"
import mongoose from "mongoose"
import { backupStatus } from "../ops/backupScheduler"
import { BackupStatus } from "../ops/types"

export interface HealthResponse {
  status: "ok" | "degraded"
  timestamp: string
  db: "up" | "down"
  backup: BackupStatus
}

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API. Answers 200 when the database connection is up and 503 (status degraded, db down) when it is not. backup shows the last nightly backup.
 *     tags: [Health]
 *     responses:
 *       503:
 *         description: The database connection is down
 *       200:
 *         description: Server is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-01-07T08:30:00.000Z
 *                 db:
 *                   type: string
 *                   enum: [up, down]
 *                 backup:
 *                   type: object
 *                   properties:
 *                     enabled:
 *                       type: boolean
 *                     lastSuccessAt:
 *                       type: string
 *                       nullable: true
 *                     lastStatus:
 *                       type: string
 *                       enum: [ok, failed, never]
 */
export const getHealth = (_req: Request, res: Response): void => {
  const dbUp = mongoose.connection.readyState === 1
  const body: HealthResponse = {
    status: dbUp ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    db: dbUp ? "up" : "down",
    backup: {
      enabled: backupStatus.enabled,
      lastSuccessAt: backupStatus.lastSuccessAt,
      lastStatus: backupStatus.lastStatus,
    },
  }
  // 503 while the database is down, so neither a person nor a monitor reads this as healthy.
  res.status(dbUp ? 200 : 503).json(body)
}
