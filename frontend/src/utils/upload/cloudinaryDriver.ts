// Chunked, signed upload straight from the browser to Cloudinary.
// The backend only signs; the bytes never pass through the OSC backend.

import type { CloudinaryUploadTicket, UploadedMediaRef } from "./types"

export interface UploadDriverOptions {
  onProgress?: (fraction: number) => void
  signal?: AbortSignal
}

const RETRY_DELAYS_MS = [1000, 3000, 9000]
const REFRESH_MARGIN_MS = 5 * 60 * 1000

class ChunkError extends Error {
  retryable: boolean
  constructor(message: string, retryable: boolean) {
    super(message)
    this.retryable = retryable
  }
}

const abortError = () => new DOMException("Aborted", "AbortError")

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(abortError())
    const onAbort = () => {
      clearTimeout(timer)
      reject(abortError())
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort)
      resolve()
    }, ms)
    signal?.addEventListener("abort", onAbort, { once: true })
  })

const errorMessageFrom = (responseText: string, status: number) => {
  try {
    const parsed = JSON.parse(responseText)
    const message = parsed?.error?.message
    if (typeof message === "string" && message) return message
  } catch {
    // Not JSON, fall through to the generic text.
  }
  return `Upload failed (HTTP ${status})`
}

// Sends one chunk. Resolves with the response text on a 2xx answer.
const sendChunk = (
  ticket: CloudinaryUploadTicket,
  fields: CloudinaryUploadTicket["fields"],
  file: File,
  start: number,
  end: number, // inclusive
  onChunkProgress: (loadedBytes: number) => void,
  signal?: AbortSignal
) =>
  new Promise<string>((resolve, reject) => {
    if (signal?.aborted) return reject(abortError())

    const body = new FormData()
    Object.entries(fields).forEach(([name, value]) => body.append(name, value))
    body.append("file", file.slice(start, end + 1), file.name)

    const xhr = new XMLHttpRequest()
    const chunkLength = end - start + 1

    const onAbort = () => xhr.abort()
    signal?.addEventListener("abort", onAbort, { once: true })
    const cleanup = () => signal?.removeEventListener("abort", onAbort)

    xhr.open("POST", ticket.uploadUrl)
    xhr.setRequestHeader("X-Unique-Upload-Id", ticket.uploadId)
    xhr.setRequestHeader("Content-Range", `bytes ${start}-${end}/${file.size}`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onChunkProgress(Math.min(event.loaded, chunkLength))
    }
    xhr.onload = () => {
      cleanup()
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText)
      } else {
        const message = errorMessageFrom(xhr.responseText, xhr.status)
        reject(new ChunkError(message, xhr.status >= 500))
      }
    }
    xhr.onerror = () => {
      cleanup()
      reject(new ChunkError("Network error during upload", true))
    }
    xhr.onabort = () => {
      cleanup()
      reject(abortError())
    }

    xhr.send(body)
  })

export const uploadToCloudinary = async (
  file: File,
  initialTicket: CloudinaryUploadTicket,
  opts: UploadDriverOptions,
  refreshTicket: () => Promise<CloudinaryUploadTicket>
): Promise<UploadedMediaRef> => {
  if (file.size <= 0) throw new Error("The selected file is empty")

  let ticket = initialTicket
  const chunkSize = ticket.chunkSizeBytes
  let lastResponseText = ""

  opts.onProgress?.(0)

  for (let start = 0; start < file.size; start += chunkSize) {
    const end = Math.min(start + chunkSize, file.size) - 1

    // Re-sign before the signature runs out. Key and uploadId stay the same.
    if (Date.now() >= Date.parse(ticket.expiresAt) - REFRESH_MARGIN_MS) {
      ticket = await refreshTicket()
    }

    let attempt = 0
    for (;;) {
      try {
        lastResponseText = await sendChunk(
          ticket,
          ticket.fields,
          file,
          start,
          end,
          (loaded) => opts.onProgress?.((start + loaded) / file.size),
          opts.signal
        )
        break
      } catch (err) {
        const retryable = err instanceof ChunkError && err.retryable
        if (!retryable || attempt >= RETRY_DELAYS_MS.length) throw err
        await wait(RETRY_DELAYS_MS[attempt], opts.signal)
        attempt += 1
      }
    }

    opts.onProgress?.((end + 1) / file.size)
  }

  let finalResponse: { public_id?: string } | null = null
  try {
    finalResponse = JSON.parse(lastResponseText)
  } catch {
    finalResponse = null
  }
  if (!finalResponse || finalResponse.public_id !== ticket.key) {
    throw new Error("Upload did not complete")
  }

  return { key: ticket.key, uploadId: ticket.uploadId }
}
