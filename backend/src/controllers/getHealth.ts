import { Request, Response } from "express"
import mongoose from "mongoose"
import { backupStatus } from "../ops/backupScheduler"
import { BackupStatus } from "../ops/types"

export interface HealthResponse {
  status: "ok"
  timestamp: string
  db: "up" | "down"
  backup: BackupStatus
}

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API. Always answers 200. The db field shows whether the database connection is up, and backup shows the last nightly backup.
 *     tags: [Health]
 *     responses:
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
  const body: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? "up" : "down",
    backup: {
      enabled: backupStatus.enabled,
      lastSuccessAt: backupStatus.lastSuccessAt,
      lastStatus: backupStatus.lastStatus,
    },
  }
  // Always 200 so existing wake-up pings keep working. The db field carries the real state.
  res.status(200).json(body)
}
