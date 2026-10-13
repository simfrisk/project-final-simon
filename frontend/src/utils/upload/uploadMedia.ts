// Storage-neutral upload entry point. Callers only use getUploadLimits,
// uploadMedia and abortUpload. The provider named in the ticket decides which
// driver moves the bytes, so switching storage needs no change in the callers.

import { baseUrl } from "../../config/api"
import { uploadToCloudinary } from "./cloudinaryDriver"
import { RetryableError, uploadToS3 } from "./s3Driver"
import type {
  CloudinaryUploadTicket,
  CreateUploadRequest,
  MediaPurpose,
  PartUrl,
  SignPartsRequest,
  SignPartsResponse,
  UploadedMediaRef,
  UploadLimits,
  UploadTicket,
} from "./types"

export interface UploadMediaOptions {
  token: string
  onProgress?: (fraction: number) => void
  signal?: AbortSignal
}

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
}

// A thumbnail is always a JPEG made in the browser.
const THUMBNAIL_FORMATS = ["jpg", "jpeg"]

const toMegabytes = (bytes: number) => Math.round(bytes / (1024 * 1024))

const extensionOf = (fileName: string) => {
  const dot = fileName.lastIndexOf(".")
  return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase()
}

//#region ----- LIMITS -----
let limitsPromise: Promise<UploadLimits> | null = null

export const getUploadLimits = (): Promise<UploadLimits> => {
  if (!limitsPromise) {
    limitsPromise = (async () => {
      const res = await fetch(`${baseUrl}/uploads/limits`)
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success || !json.response) {
        throw new Error(json?.message || "Could not load upload limits")
      }
      return json.response as UploadLimits
    })().catch((err) => {
      // Do not cache a failure, the next call should try again.
      limitsPromise = null
      throw err
    })
  }
  return limitsPromise
}
//#endregion

//#region ----- TICKETS -----
const requestTicket = async (
  body: CreateUploadRequest,
  token: string,
  signal?: AbortSignal
): Promise<UploadTicket> => {
  const res = await fetch(`${baseUrl}/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token },
    body: JSON.stringify(body),
    signal,
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.success || !json.response) {
    throw new Error(json?.message || json?.error || "Could not start the upload")
  }
  return json.response as UploadTicket
}

// Asks the backend to presign UploadPart URLs for an S3 multipart upload.
const requestPartUrls = async (
  body: SignPartsRequest,
  token: string,
  signal?: AbortSignal
): Promise<PartUrl[]> => {
  let res: Response
  try {
    res = await fetch(`${baseUrl}/uploads/parts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(body),
      signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err
    throw new RetryableError("Network error while preparing the upload")
  }
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.success || !json.response) {
    const message = json?.message || json?.error || "Could not prepare the upload"
    if (res.status >= 500) throw new RetryableError(message)
    throw new Error(message)
  }
  return (json.response as SignPartsResponse).parts
}
//#endregion

//#region ----- UPLOAD -----
export const uploadMedia = async (
  file: File,
  purpose: MediaPurpose,
  opts: UploadMediaOptions
): Promise<UploadedMediaRef> => {
  const limits = await getUploadLimits()

  if (purpose === "thumbnail" && limits.provider !== "s3") {
    throw new Error("Thumbnails are not uploaded with this storage")
  }

  const maxBytes =
    purpose === "video"
      ? limits.videoMaxBytes
      : purpose === "thumbnail"
        ? (limits.thumbnailMaxBytes ?? 0)
        : limits.imageMaxBytes
  if (file.size > maxBytes) {
    throw new Error(`File too large. Max ${toMegabytes(maxBytes)} MB.`)
  }

  const extension = extensionOf(file.name)
  const allowedFormats =
    purpose === "video"
      ? limits.videoFormats
      : purpose === "thumbnail"
        ? THUMBNAIL_FORMATS
        : limits.imageFormats
  if (!allowedFormats.includes(extension)) {
    throw new Error(`Unsupported file type. Allowed: ${allowedFormats.join(", ")}.`)
  }

  const request: CreateUploadRequest = {
    purpose,
    fileName: file.name,
    contentType: CONTENT_TYPE_BY_EXTENSION[extension] || file.type,
    sizeBytes: file.size,
  }
  const ticket = await requestTicket(request, opts.token, opts.signal)

  switch (ticket.provider) {
    case "cloudinary":
      return uploadToCloudinary(
        file,
        ticket,
        { onProgress: opts.onProgress, signal: opts.signal },
        async () => {
          const fresh = await requestTicket(
            { ...request, resumeKey: ticket.key },
            opts.token,
            opts.signal
          )
          if (fresh.provider !== "cloudinary") throw new Error("Upload provider not supported")
          return fresh as CloudinaryUploadTicket
        }
      )
    case "s3":
      try {
        return await uploadToS3(
          file,
          ticket,
          { onProgress: opts.onProgress, signal: opts.signal },
          (partNumbers) =>
            requestPartUrls(
              { key: ticket.key, uploadId: ticket.uploadId, partNumbers },
              opts.token,
              opts.signal
            )
        )
      } catch (err) {
        // Nothing completed this upload, so release it. Best effort, never throws.
        await abortUpload({ key: ticket.key, uploadId: ticket.uploadId }, opts.token)
        throw err
      }
    default:
      throw new Error("Upload provider not supported")
  }
}
//#endregion

//#region ----- ABORT -----
// Best effort cleanup of an upload that finished but was never attached to a
// resource. Never throws.
export const abortUpload = async (ref: UploadedMediaRef, token: string): Promise<void> => {
  try {
    await fetch(`${baseUrl}/uploads`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(ref),
    })
  } catch {
    // Nothing useful to do if cleanup fails.
  }
}
//#endregion
