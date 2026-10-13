import crypto from "crypto"
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListPartsCommand,
  Part,
  UploadPartCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { config } from "../config"
import { buildKey, parseOwnedKey } from "./keys"
import { getMediaS3, mediaBucket, publicUrlFor } from "./s3Client"
import { matchesMagicBytes } from "./sniff"
import {
  CreateUploadRequest,
  MediaPurpose,
  MediaStorage,
  PartUrl,
  S3UploadTicket,
  StoredMedia,
  UploadedMediaRef,
  UploadError,
  UploadLimits,
} from "./types"

export const PART_SIZE_BYTES = 8 * 1024 * 1024
const MAX_PARTS_PER_SIGN_CALL = 50
const PART_URL_LIFETIME_SECONDS = 15 * 60
// MinIO drops unfinished uploads after 24 hours, so a ticket is not offered for longer than 23.
const TICKET_LIFETIME_MS = 23 * 60 * 60 * 1000
const CACHE_CONTROL = "public, max-age=31536000, immutable"

const VIDEO_FORMATS = ["mp4", "mov"]
const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"]

// Content type to the extension used in the object key.
const EXTENSIONS: Record<MediaPurpose, Record<string, string>> = {
  video: { "video/mp4": "mp4", "video/quicktime": "mov" },
  image: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" },
  thumbnail: { "image/jpeg": "jpg" },
}

const CONTENT_TYPE_OF_EXTENSION: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
}

const isPurpose = (value: unknown): value is MediaPurpose =>
  value === "video" || value === "image" || value === "thumbnail"

const labelOf = (purpose: MediaPurpose): string => (purpose === "video" ? "video" : "image")

const errorName = (error: unknown): string => (error as { name?: string } | undefined)?.name ?? ""
const statusOf = (error: unknown): number | undefined =>
  (error as { $metadata?: { httpStatusCode?: number } } | undefined)?.$metadata?.httpStatusCode

const isNoSuchUpload = (error: unknown): boolean => errorName(error) === "NoSuchUpload"
const isNotFound = (error: unknown): boolean =>
  errorName(error) === "NoSuchKey" || errorName(error) === "NotFound" || statusOf(error) === 404

// Never log the error object itself: SDK errors can carry request details.
const logFailure = (action: string, error: unknown): void => {
  console.error(`[media] ${action} failed name=${errorName(error) || "unknown"} status=${statusOf(error) ?? "unknown"}`)
}

export class S3MediaStorage implements MediaStorage {
  readonly provider = "s3" as const

  private maxBytes(purpose: MediaPurpose): number {
    if (purpose === "video") return config.maxVideoBytes
    if (purpose === "thumbnail") return config.thumbnailMaxBytes
    return config.maxImageBytes
  }

  limits(): UploadLimits {
    return {
      provider: "s3",
      videoMaxBytes: config.maxVideoBytes,
      imageMaxBytes: config.maxImageBytes,
      thumbnailMaxBytes: config.thumbnailMaxBytes,
      videoFormats: VIDEO_FORMATS,
      imageFormats: IMAGE_FORMATS,
    }
  }

  async createUpload(input: CreateUploadRequest & { userId: string }): Promise<S3UploadTicket> {
    const { userId, purpose, contentType, sizeBytes, resumeKey } = input

    if (!isPurpose(purpose)) throw new UploadError(400, "Invalid purpose")
    const extension =
      typeof contentType === "string" ? EXTENSIONS[purpose][contentType.toLowerCase().trim()] : undefined
    if (!extension) throw new UploadError(400, "Unsupported file type")
    if (typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes) || sizeBytes <= 0) {
      throw new UploadError(400, "sizeBytes must be a positive number")
    }
    const maxBytes = this.maxBytes(purpose)
    if (sizeBytes > maxBytes) throw new UploadError(413, "File too large", { maxBytes })
    // Part URLs are signed per batch and live 15 minutes, so nothing expires mid upload and there is nothing to resume.
    if (resumeKey !== undefined && resumeKey !== null && resumeKey !== "") {
      throw new UploadError(400, "Not used by this provider")
    }

    const key = buildKey(userId, purpose, crypto.randomUUID(), extension)

    let uploadId: string | undefined
    try {
      const created = await getMediaS3().send(
        new CreateMultipartUploadCommand({
          Bucket: mediaBucket(),
          Key: key,
          ContentType: CONTENT_TYPE_OF_EXTENSION[extension],
          CacheControl: CACHE_CONTROL,
        })
      )
      uploadId = created.UploadId
    } catch (error) {
      logFailure("CreateMultipartUpload", error)
      throw new UploadError(500, "Could not start the upload")
    }
    if (!uploadId) throw new UploadError(500, "Could not start the upload")

    return {
      provider: "s3",
      key,
      uploadId,
      partSizeBytes: PART_SIZE_BYTES,
      partCount: Math.ceil(sizeBytes / PART_SIZE_BYTES),
      expiresAt: new Date(Date.now() + TICKET_LIFETIME_MS).toISOString(),
    }
  }

  async signParts(input: {
    userId: string
    key: string
    uploadId: string
    partNumbers: number[]
  }): Promise<PartUrl[]> {
    const { userId, key, uploadId, partNumbers } = input
    const { purpose } = parseOwnedKey(userId, key)
    if (typeof uploadId !== "string" || uploadId.length === 0 || uploadId.length > 200) {
      throw new UploadError(400, "Invalid upload key")
    }

    const highest = Math.ceil(this.maxBytes(purpose) / PART_SIZE_BYTES)
    if (
      !Array.isArray(partNumbers) ||
      partNumbers.length < 1 ||
      partNumbers.length > MAX_PARTS_PER_SIGN_CALL ||
      new Set(partNumbers).size !== partNumbers.length ||
      !partNumbers.every((n) => Number.isInteger(n) && n >= 1 && n <= highest)
    ) {
      throw new UploadError(400, "Invalid part numbers")
    }

    const s3 = getMediaS3()
    // Proves the upload exists and belongs to this key. A wrong uploadId fails here.
    try {
      await s3.send(new ListPartsCommand({ Bucket: mediaBucket(), Key: key, UploadId: uploadId, MaxParts: 1 }))
    } catch (error) {
      if (isNoSuchUpload(error)) throw new UploadError(404, "Upload not found")
      logFailure("ListParts", error)
      throw new UploadError(500, "Could not sign the upload parts")
    }

    try {
      // No body, no content type, no checksum: the browser sends nothing but the bytes, so the signed headers are only host.
      return await Promise.all(
        partNumbers.map(async (partNumber) => ({
          partNumber,
          url: await getSignedUrl(
            s3,
            new UploadPartCommand({ Bucket: mediaBucket(), Key: key, UploadId: uploadId, PartNumber: partNumber }),
            { expiresIn: PART_URL_LIFETIME_SECONDS }
          ),
        }))
      )
    } catch (error) {
      logFailure("presign", error)
      throw new UploadError(500, "Could not sign the upload parts")
    }
  }

  async completeUpload(input: {
    userId: string
    purpose: MediaPurpose
    ref: UploadedMediaRef
  }): Promise<StoredMedia> {
    const { userId, purpose, ref } = input
    // The uploadId is an S3 value here and is deliberately not compared with the uuid in the key.
    const { extension } = parseOwnedKey(userId, ref?.key, purpose)
    if (!EXTENSIONS[purpose] || !Object.values(EXTENSIONS[purpose]).includes(extension)) {
      throw new UploadError(400, "Unsupported file type")
    }
    const key = ref.key
    const maxBytes = this.maxBytes(purpose)
    const s3 = getMediaS3()

    const parts = await this.listAllParts(key, ref.uploadId)

    let totalBytes: number
    if (parts === null) {
      // The upload is gone. A retried complete after a lost response finds the finished object instead.
      totalBytes = await this.finishedObjectSize(key, purpose)
    } else {
      if (parts.length === 0) throw new UploadError(404, `Uploaded ${labelOf(purpose)} not found`)

      const numbered = parts.every((part, index) => part.PartNumber === index + 1)
      if (!numbered) {
        await this.abortQuietly(key, ref.uploadId)
        throw new UploadError(400, "Upload is incomplete")
      }
      totalBytes = parts.reduce((sum, part) => sum + (part.Size ?? 0), 0)
      if (totalBytes <= 0) {
        await this.abortQuietly(key, ref.uploadId)
        throw new UploadError(400, "Upload is empty")
      }
      if (totalBytes > maxBytes) {
        await this.abortQuietly(key, ref.uploadId)
        throw new UploadError(413, "File too large", { maxBytes })
      }

      try {
        await s3.send(
          new CompleteMultipartUploadCommand({
            Bucket: mediaBucket(),
            Key: key,
            UploadId: ref.uploadId,
            MultipartUpload: { Parts: parts.map((part) => ({ PartNumber: part.PartNumber, ETag: part.ETag })) },
          })
        )
      } catch (error) {
        if (isNoSuchUpload(error)) {
          // Lost a race with another complete of the same upload.
          totalBytes = await this.finishedObjectSize(key, purpose)
        } else {
          logFailure("CompleteMultipartUpload", error)
          throw new UploadError(500, "Could not finish the upload")
        }
      }
    }

    // The bytes decide the format, not the file name or the content type the browser claimed.
    const head = await this.readHead(key)
    if (!matchesMagicBytes(purpose, extension, head)) {
      await this.deleteQuietly(key)
      throw new UploadError(400, "Unsupported file type")
    }

    return { key, url: publicUrlFor(key), bytes: totalBytes, format: extension }
  }

  async abortUpload(input: { userId: string; ref: UploadedMediaRef; purpose?: MediaPurpose }): Promise<void> {
    const { userId, ref, purpose } = input
    parseOwnedKey(userId, ref?.key, purpose)

    // MinIO answers 204 when it aborts an upload that does not exist, so the abort alone cannot tell a
    // finished upload from a running one. ListParts can: it says NoSuchUpload once the upload is gone.
    try {
      await getMediaS3().send(
        new ListPartsCommand({ Bucket: mediaBucket(), Key: ref.key, UploadId: ref.uploadId, MaxParts: 1 })
      )
    } catch (error) {
      if (isNoSuchUpload(error)) {
        // Already completed (or never there): what is left is the finished object, if any.
        await this.deleteQuietly(ref.key)
      } else {
        logFailure("ListParts", error)
      }
      return
    }
    await this.abortQuietly(ref.key, ref.uploadId)
  }

  /** All parts of an upload in part order, or null when the upload does not exist. */
  private async listAllParts(key: string, uploadId: string): Promise<Part[] | null> {
    const parts: Part[] = []
    let marker: string | undefined
    try {
      for (;;) {
        const page = await getMediaS3().send(
          new ListPartsCommand({ Bucket: mediaBucket(), Key: key, UploadId: uploadId, PartNumberMarker: marker })
        )
        parts.push(...(page.Parts ?? []))
        if (!page.IsTruncated || page.NextPartNumberMarker === undefined) break
        marker = String(page.NextPartNumberMarker)
      }
    } catch (error) {
      if (isNoSuchUpload(error)) return null
      logFailure("ListParts", error)
      throw new UploadError(500, "Could not verify the uploaded file")
    }
    return parts.sort((a, b) => (a.PartNumber ?? 0) - (b.PartNumber ?? 0))
  }

  /** Size of an object that is already complete. 404 when it is not there, 413 (and deleted) when it is too big. */
  private async finishedObjectSize(key: string, purpose: MediaPurpose): Promise<number> {
    let size: number
    try {
      const head = await getMediaS3().send(new HeadObjectCommand({ Bucket: mediaBucket(), Key: key }))
      size = head.ContentLength ?? 0
    } catch (error) {
      if (isNotFound(error)) throw new UploadError(404, `Uploaded ${labelOf(purpose)} not found`)
      logFailure("HeadObject", error)
      throw new UploadError(500, "Could not verify the uploaded file")
    }
    const maxBytes = this.maxBytes(purpose)
    if (size <= 0) throw new UploadError(404, `Uploaded ${labelOf(purpose)} not found`)
    if (size > maxBytes) {
      await this.deleteQuietly(key)
      throw new UploadError(413, "File too large", { maxBytes })
    }
    return size
  }

  private async readHead(key: string): Promise<Uint8Array> {
    try {
      const response = await getMediaS3().send(
        new GetObjectCommand({ Bucket: mediaBucket(), Key: key, Range: "bytes=0-15" })
      )
      return (await response.Body?.transformToByteArray()) ?? new Uint8Array()
    } catch (error) {
      logFailure("GetObject", error)
      throw new UploadError(500, "Could not verify the uploaded file")
    }
  }

  private async abortQuietly(key: string, uploadId: string): Promise<void> {
    try {
      await getMediaS3().send(new AbortMultipartUploadCommand({ Bucket: mediaBucket(), Key: key, UploadId: uploadId }))
    } catch (error) {
      if (!isNoSuchUpload(error)) logFailure("AbortMultipartUpload", error)
    }
  }

  private async deleteQuietly(key: string): Promise<void> {
    try {
      await getMediaS3().send(new DeleteObjectCommand({ Bucket: mediaBucket(), Key: key }))
    } catch (error) {
      if (!isNotFound(error)) logFailure("DeleteObject", error)
    }
  }
}
