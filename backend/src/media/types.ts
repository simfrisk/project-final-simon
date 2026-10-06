// Upload contract. The frontend keeps an identical copy of the upload types in
// frontend/src/utils/upload/types.ts. Keep both files field for field in step.

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

// Backend only; never sent by the browser.
export interface StoredMedia {
  key: string
  url: string
  thumbnailUrl?: string // video only
  bytes: number
  format: string
}

export interface MediaStorage {
  readonly provider: StorageProvider
  limits(): UploadLimits
  createUpload(input: CreateUploadRequest & { userId: string }): Promise<UploadTicket>
  // S3 only. The Cloudinary implementation throws UploadError(400, "Not used by this provider").
  signParts(input: {
    userId: string
    key: string
    uploadId: string
    partNumbers: number[]
  }): Promise<PartUrl[]>
  // Verifies the upload belongs to userId and purpose, checks real size and format,
  // finishes it (S3: CompleteMultipartUpload using ListParts server side) and returns public URLs.
  completeUpload(input: {
    userId: string
    purpose: MediaPurpose
    ref: UploadedMediaRef
  }): Promise<StoredMedia>
  // Best effort cleanup of an unfinished or rejected upload.
  abortUpload(input: { userId: string; ref: UploadedMediaRef }): Promise<void>
}

export class UploadError extends Error {
  constructor(
    public status: 400 | 403 | 404 | 413 | 500,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = "UploadError"
  }
}
