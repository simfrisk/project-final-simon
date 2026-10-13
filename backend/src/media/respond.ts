import { Response } from "express"
import { UploadedMediaRef, UploadError } from "./types"

/** Maps an UploadError to its status and message, and anything else to 500. */
export const sendUploadError = (res: Response, error: unknown): Response => {
  if (error instanceof UploadError) {
    return res.status(error.status).json({
      success: false,
      response: error.details ?? null,
      message: error.message,
    })
  }

  console.error("[media] Unexpected error:", error instanceof Error ? error.message : "unknown")
  return res.status(500).json({
    success: false,
    response: null,
    message: error instanceof Error ? error.message : "Unknown server error",
  })
}

/** Narrows an untrusted request body field to an UploadedMediaRef. Ownership is checked later by the storage. */
export const asUploadedMediaRef = (value: unknown): UploadedMediaRef | null => {
  if (!value || typeof value !== "object") return null
  const { key, uploadId } = value as Record<string, unknown>
  if (typeof key !== "string" || typeof uploadId !== "string") return null
  if (key.length === 0 || key.length > 300 || uploadId.length === 0 || uploadId.length > 200) return null
  return { key, uploadId }
}
