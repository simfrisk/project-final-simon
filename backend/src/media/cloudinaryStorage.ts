import crypto from "crypto"
import { v2 as cloudinary } from "cloudinary"
import { config } from "../config"
import { buildKey, parseOwnedKey } from "./keys"
import {
  CloudinaryUploadTicket,
  CreateUploadRequest,
  MediaPurpose,
  MediaStorage,
  PartUrl,
  StoredMedia,
  UploadedMediaRef,
  UploadError,
  UploadLimits,
} from "./types"

const VIDEO_FORMATS = ["mp4", "mov", "avi"]
const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"]

const CONTENT_TYPES: Record<MediaPurpose, string[]> = {
  video: ["video/mp4", "video/quicktime", "video/x-msvideo"],
  image: ["image/jpeg", "image/png", "image/webp"],
}

const CHUNK_SIZE_BYTES = 20 * 1024 * 1024
const TICKET_LIFETIME_MS = 55 * 60 * 1000
const COMPLETE_RETRIES = 3
const COMPLETE_RETRY_DELAY_MS = 2000

// Moved verbatim from the old postProject controller so stored URL shapes stay exactly as before.
export const generateThumbnailUrl = (videoUrl: string): string => {
  if (!videoUrl) return ""
  return videoUrl
    .replace("/video/upload/", "/video/upload/so_3,w_600,h_400,c_fill/")
    .replace(/\.(mp4|mov|avi)$/i, ".jpg")
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

// The Cloudinary SDK rejects with a few different shapes depending on the call.
const httpCodeOf = (error: unknown): number | undefined => {
  const e = error as { http_code?: number; error?: { http_code?: number } } | undefined
  return e?.error?.http_code ?? e?.http_code
}

const resourceTypeOf = (purpose: MediaPurpose): "video" | "image" => (purpose === "video" ? "video" : "image")

export class CloudinaryMediaStorage implements MediaStorage {
  readonly provider = "cloudinary" as const
  private configured = false

  private ensureConfigured(): void {
    const { cloudName, apiKey, apiSecret } = config.cloudinary
    if (!cloudName || !apiKey || !apiSecret) {
      throw new UploadError(500, "Media storage is not configured")
    }
    if (!this.configured) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
      this.configured = true
    }
  }

  private maxBytes(purpose: MediaPurpose): number {
    return purpose === "video" ? config.maxVideoBytes : config.maxImageBytes
  }

  private formats(purpose: MediaPurpose): string[] {
    return purpose === "video" ? VIDEO_FORMATS : IMAGE_FORMATS
  }

  limits(): UploadLimits {
    return {
      provider: "cloudinary",
      videoMaxBytes: config.maxVideoBytes,
      imageMaxBytes: config.maxImageBytes,
      videoFormats: VIDEO_FORMATS,
      imageFormats: IMAGE_FORMATS,
    }
  }

  async createUpload(input: CreateUploadRequest & { userId: string }): Promise<CloudinaryUploadTicket> {
    const { userId, purpose, contentType, sizeBytes, resumeKey } = input

    if (purpose !== "video" && purpose !== "image") throw new UploadError(400, "Invalid purpose")
    if (typeof contentType !== "string" || !CONTENT_TYPES[purpose].includes(contentType.toLowerCase())) {
      throw new UploadError(400, "Unsupported file type")
    }
    if (typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes) || sizeBytes <= 0) {
      throw new UploadError(400, "sizeBytes must be a positive number")
    }
    const maxBytes = this.maxBytes(purpose)
    if (sizeBytes > maxBytes) throw new UploadError(413, "File too large", { maxBytes })

    this.ensureConfigured()

    let key: string
    let uploadId: string
    if (resumeKey !== undefined && resumeKey !== null && resumeKey !== "") {
      // Same user and same purpose only. The uploadId is the last path segment of the key.
      uploadId = parseOwnedKey(userId, resumeKey, purpose).uuid
      key = resumeKey
    } else {
      uploadId = crypto.randomUUID()
      key = buildKey(userId, purpose, uploadId)
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const allowedFormats = this.formats(purpose).join(",")
    const signature = cloudinary.utils.api_sign_request(
      { allowed_formats: allowedFormats, public_id: key, timestamp },
      config.cloudinary.apiSecret
    )

    return {
      provider: "cloudinary",
      key,
      uploadId,
      uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudinary.cloudName}/${resourceTypeOf(purpose)}/upload`,
      chunkSizeBytes: CHUNK_SIZE_BYTES,
      fields: {
        api_key: config.cloudinary.apiKey,
        timestamp: String(timestamp),
        signature,
        public_id: key,
        allowed_formats: allowedFormats,
      },
      expiresAt: new Date(timestamp * 1000 + TICKET_LIFETIME_MS).toISOString(),
    }
  }

  async signParts(): Promise<PartUrl[]> {
    throw new UploadError(400, "Not used by this provider")
  }

  async completeUpload(input: {
    userId: string
    purpose: MediaPurpose
    ref: UploadedMediaRef
  }): Promise<StoredMedia> {
    const { userId, purpose, ref } = input
    const { uuid } = parseOwnedKey(userId, ref?.key, purpose)
    if (ref.uploadId !== uuid) throw new UploadError(400, "Invalid upload key")

    this.ensureConfigured()
    const resourceType = resourceTypeOf(purpose)
    const label = purpose === "video" ? "video" : "image"

    // Cloudinary can take a moment to expose a finished chunked upload, so retry a missing resource.
    let resource: { bytes: number; format: string; secure_url: string } | null = null
    for (let attempt = 1; attempt <= COMPLETE_RETRIES; attempt++) {
      try {
        resource = await cloudinary.api.resource(ref.key, { resource_type: resourceType })
        break
      } catch (error) {
        if (httpCodeOf(error) !== 404) {
          console.error(`[media] Cloudinary lookup failed status=${httpCodeOf(error) ?? "unknown"}`)
          throw new UploadError(500, "Could not verify the uploaded file")
        }
        if (attempt < COMPLETE_RETRIES) await sleep(COMPLETE_RETRY_DELAY_MS)
      }
    }
    if (!resource) throw new UploadError(404, `Uploaded ${label} not found`)

    const maxBytes = this.maxBytes(purpose)
    if (resource.bytes > maxBytes) {
      await this.destroy(ref.key, resourceType)
      throw new UploadError(413, "File too large", { maxBytes })
    }
    if (!this.formats(purpose).includes(String(resource.format).toLowerCase())) {
      await this.destroy(ref.key, resourceType)
      throw new UploadError(400, "Unsupported file type")
    }

    const url = resource.secure_url
    const stored: StoredMedia = { key: ref.key, url, bytes: resource.bytes, format: resource.format }
    if (purpose === "video") stored.thumbnailUrl = generateThumbnailUrl(url)
    return stored
  }

  async abortUpload(input: { userId: string; ref: UploadedMediaRef }): Promise<void> {
    const { purpose } = parseOwnedKey(input.userId, input.ref?.key)
    this.ensureConfigured()
    await this.destroy(input.ref.key, resourceTypeOf(purpose))
  }

  // Best effort. A missing resource is not an error, and a failure here must never hide the real result.
  private async destroy(key: string, resourceType: "video" | "image"): Promise<void> {
    try {
      await cloudinary.uploader.destroy(key, { resource_type: resourceType, invalidate: true })
    } catch (error) {
      console.error(`[media] Cloudinary destroy failed status=${httpCodeOf(error) ?? "unknown"}`)
    }
  }
}
