// Upload contract shared with the backend. Keep field for field identical to
// backend/src/media/types.ts (the backend copy also holds MediaStorage,
// UploadError and StoredMedia, which the browser never needs).

export type MediaPurpose = "video" | "image"
export type StorageProvider = "cloudinary" | "s3"

export interface UploadLimits {
  provider: StorageProvider
  videoMaxBytes: number
  imageMaxBytes: number
  videoFormats: string[] // ["mp4", "mov", "avi"]
  imageFormats: string[] // ["jpg", "jpeg", "png", "webp"]
}

export interface CreateUploadRequest {
  purpose: MediaPurpose
  fileName: string
  contentType: string
  sizeBytes: number
  resumeKey?: string // re-sign an upload already in progress (same user, same key)
}

export interface CloudinaryUploadTicket {
  provider: "cloudinary"
  key: string // Cloudinary public_id chosen by the server
  uploadId: string // sent as X-Unique-Upload-Id on every chunk
  uploadUrl: string // https://api.cloudinary.com/v1_1/<cloud>/<video|image>/upload
  chunkSizeBytes: number // 20 MiB
  fields: {
    api_key: string
    timestamp: string
    signature: string
    public_id: string
    allowed_formats: string
  }
  expiresAt: string // ISO, timestamp + 55 minutes
}

export interface S3UploadTicket {
  provider: "s3"
  key: string // object key in the media bucket
  uploadId: string // S3 multipart UploadId
  partSizeBytes: number // 32 MiB, under the 64 MiB ingress cap
  partCount: number
  expiresAt: string
}

export type UploadTicket = CloudinaryUploadTicket | S3UploadTicket

export interface PartUrl {
  partNumber: number
  url: string
}

// Sent by the browser to the resource endpoint once the bytes are uploaded.
export interface UploadedMediaRef {
  key: string
  uploadId: string
}
