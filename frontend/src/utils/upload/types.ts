// Upload contract shared with the backend. Keep field for field identical to
// backend/src/media/types.ts (the backend copy also holds MediaStorage,
// UploadError and StoredMedia, which the browser never needs).

export type MediaPurpose = "video" | "image" | "thumbnail"
export type StorageProvider = "cloudinary" | "s3"

export interface UploadLimits {
  provider: StorageProvider
  videoMaxBytes: number
  imageMaxBytes: number
  thumbnailMaxBytes: number // 2 MiB; 0 when the provider does not take thumbnails (cloudinary)
  videoFormats: string[] // s3: ["mp4", "mov"]; cloudinary keeps ["mp4", "mov", "avi"]
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
  key: string // object key in the media bucket, chosen by the server
  uploadId: string // S3 multipart UploadId (NOT the uuid in the key)
  partSizeBytes: number // 8 MiB (8388608); last part may be smaller
  partCount: number // ceil(sizeBytes / partSizeBytes)
  expiresAt: string // ISO, now + 23 h (MinIO drops unfinished uploads after 24 h)
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

export interface SignPartsRequest {
  key: string
  uploadId: string
  partNumbers: number[] // 1 to 50 numbers per call
}

export interface SignPartsResponse {
  parts: PartUrl[] // presigned UploadPart URLs, valid 15 minutes, no signed headers but host
}
