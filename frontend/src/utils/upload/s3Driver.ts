// Multipart upload straight from the browser to S3 compatible storage (OSC MinIO).
// The backend only creates the upload and signs part URLs, the bytes never pass
// through the OSC app.
//
// The OSC ingress answers every CORS preflight itself and allows only the request
// headers Content-Type, Authorization and x-jwt. A part PUT therefore carries NO
// request headers at all: the signature lives in the query string. Never call
// setRequestHeader on a part request and never read response headers (the part
// ETags are read by the backend with ListParts).

import type { PartUrl, S3UploadTicket, UploadedMediaRef } from "./types"

export interface UploadDriverOptions {
  onProgress?: (fraction: number) => void
  signal?: AbortSignal
}

// Signs the given part numbers. Rejects with a RetryableError when asking again
// can help (network failure, 5xx), with a plain Error otherwise.
export type SignParts = (partNumbers: number[]) => Promise<PartUrl[]>

export class RetryableError extends Error {
  retryable = true
}

const PARTS_IN_FLIGHT = 3
const SIGN_BATCH_SIZE = 6
const SIGN_AHEAD_THRESHOLD = 3
const RETRY_DELAYS_MS = [1000, 3000, 9000]
// Presigned URLs live 15 minutes. A pooled URL older than this is signed again.
const URL_MAX_AGE_MS = 10 * 60 * 1000
const PART_TIMEOUT_MS = 10 * 60 * 1000

class PartError extends Error {
  retryable: boolean
  needsResign: boolean
  constructor(message: string, retryable: boolean, needsResign = false) {
    super(message)
    this.retryable = retryable
    this.needsResign = needsResign
  }
}

const abortError = () => new DOMException("Aborted", "AbortError")

const isAbort = (err: unknown) => err instanceof DOMException && err.name === "AbortError"

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

// One part: PUT of a slice with no request headers. Resolves on any 2xx answer.
const putPart = (
  url: string,
  body: Blob,
  onLoaded: (loadedBytes: number) => void,
  signal: AbortSignal
) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) return reject(abortError())

    const xhr = new XMLHttpRequest()
    const onAbort = () => xhr.abort()
    signal.addEventListener("abort", onAbort, { once: true })
    const cleanup = () => signal.removeEventListener("abort", onAbort)

    xhr.open("PUT", url)
    xhr.timeout = PART_TIMEOUT_MS

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onLoaded(Math.min(event.loaded, body.size))
    }
    xhr.onload = () => {
      cleanup()
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else if (xhr.status === 403) {
        // Expired or rejected signature, sign this part again and retry.
        reject(new PartError("Upload was not authorised (HTTP 403)", true, true))
      } else {
        reject(new PartError(`Upload failed (HTTP ${xhr.status})`, xhr.status >= 500))
      }
    }
    xhr.onerror = () => {
      cleanup()
      reject(new PartError("Network error during upload", true))
    }
    xhr.ontimeout = () => {
      cleanup()
      reject(new PartError("Upload timed out", true))
    }
    xhr.onabort = () => {
      cleanup()
      reject(abortError())
    }

    xhr.send(body)
  })

export const uploadToS3 = async (
  file: File,
  ticket: S3UploadTicket,
  opts: UploadDriverOptions,
  signParts: SignParts
): Promise<UploadedMediaRef> => {
  if (file.size <= 0) throw new Error("The selected file is empty")

  const partSize = ticket.partSizeBytes
  const partCount = Math.ceil(file.size / partSize)
  if (!(partSize > 0) || partCount < 1) throw new Error("Invalid upload ticket")

  // Stops every worker as soon as one of them fails for good or the caller aborts.
  const inner = new AbortController()
  const onOuterAbort = () => inner.abort()
  if (opts.signal?.aborted) throw abortError()
  opts.signal?.addEventListener("abort", onOuterAbort, { once: true })

  const loaded = new Array<number>(partCount + 1).fill(0)
  const reportProgress = () => {
    let sum = 0
    for (let n = 1; n <= partCount; n += 1) sum += loaded[n]
    opts.onProgress?.(Math.min(sum / file.size, 1))
  }

  //#region ----- PART URL POOL -----
  const pool = new Map<number, { url: string; signedAt: number }>()
  let nextToSign = 1
  let signing: Promise<void> | null = null

  const signWithRetry = async (numbers: number[]): Promise<PartUrl[]> => {
    let attempt = 0
    for (;;) {
      try {
        return await signParts(numbers)
      } catch (err) {
        if (isAbort(err)) throw err
        const retryable = err instanceof RetryableError
        if (!retryable || attempt >= RETRY_DELAYS_MS.length) throw err
        await wait(RETRY_DELAYS_MS[attempt], inner.signal)
        attempt += 1
      }
    }
  }

  const store = (parts: PartUrl[]) => {
    const now = Date.now()
    parts.forEach((part) => pool.set(part.partNumber, { url: part.url, signedAt: now }))
  }

  // Signs the next batch of part numbers that were never signed. One batch at a
  // time, concurrent callers share it. A failed batch hands its numbers back.
  const signNextBatch = (): Promise<void> => {
    if (signing) return signing
    if (nextToSign > partCount) return Promise.resolve()
    const numbers: number[] = []
    for (let n = nextToSign; n <= partCount && numbers.length < SIGN_BATCH_SIZE; n += 1) {
      numbers.push(n)
    }
    nextToSign = numbers[numbers.length - 1] + 1
    const current = signWithRetry(numbers)
      .then((parts) => {
        store(parts)
        // The server must answer with every number asked for.
        if (!numbers.every((n) => pool.has(n))) throw new Error("Could not sign all upload parts")
      })
      .catch((err) => {
        nextToSign = Math.min(nextToSign, numbers[0])
        throw err
      })
      .finally(() => {
        signing = null
      })
    signing = current
    return current
  }

  const takeUrl = async (partNumber: number): Promise<string> => {
    while (!pool.has(partNumber)) {
      if (inner.signal.aborted) throw abortError()
      if (nextToSign > partCount && !signing) throw new Error("Could not sign the upload part")
      await signNextBatch()
    }
    const entry = pool.get(partNumber)!
    pool.delete(partNumber)

    // Keep a few URLs ready so a worker never waits for the signing round trip.
    if (pool.size < SIGN_AHEAD_THRESHOLD && nextToSign <= partCount && !signing) {
      signNextBatch().catch(() => {
        // The next takeUrl asks again and reports the error then.
      })
    }

    if (Date.now() - entry.signedAt > URL_MAX_AGE_MS) {
      const [fresh] = await signWithRetry([partNumber])
      if (fresh) return fresh.url
    }
    return entry.url
  }

  const resignPart = async (partNumber: number): Promise<string> => {
    const [fresh] = await signWithRetry([partNumber])
    if (!fresh) throw new Error("Could not sign the upload part")
    return fresh.url
  }
  //#endregion

  //#region ----- WORKERS -----
  let cursor = 1
  let firstError: unknown = null

  const sendPart = async (partNumber: number) => {
    const start = (partNumber - 1) * partSize
    const end = Math.min(partNumber * partSize, file.size)
    const body = file.slice(start, end)

    let url = await takeUrl(partNumber)
    let attempt = 0
    for (;;) {
      try {
        loaded[partNumber] = 0
        await putPart(
          url,
          body,
          (bytes) => {
            loaded[partNumber] = bytes
            reportProgress()
          },
          inner.signal
        )
        loaded[partNumber] = end - start
        reportProgress()
        return
      } catch (err) {
        loaded[partNumber] = 0
        reportProgress()
        const retryable = err instanceof PartError && err.retryable
        if (!retryable || attempt >= RETRY_DELAYS_MS.length) throw err
        await wait(RETRY_DELAYS_MS[attempt], inner.signal)
        attempt += 1
        if ((err as PartError).needsResign) url = await resignPart(partNumber)
      }
    }
  }

  const worker = async () => {
    while (!inner.signal.aborted) {
      const partNumber = cursor
      if (partNumber > partCount) return
      cursor += 1
      try {
        await sendPart(partNumber)
      } catch (err) {
        if (firstError === null && !isAbort(err)) firstError = err
        inner.abort()
        return
      }
    }
  }
  //#endregion

  opts.onProgress?.(0)
  try {
    await Promise.all(
      Array.from({ length: Math.min(PARTS_IN_FLIGHT, partCount) }, () => worker())
    )
  } finally {
    opts.signal?.removeEventListener("abort", onOuterAbort)
  }

  if (opts.signal?.aborted) throw abortError()
  if (firstError !== null) throw firstError
  if (inner.signal.aborted) throw abortError()

  opts.onProgress?.(1)
  return { key: ticket.key, uploadId: ticket.uploadId }
}
