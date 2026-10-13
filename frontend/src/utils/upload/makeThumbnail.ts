// Makes a 600x400 JPEG thumbnail from a local video file, in the browser, before
// the upload. A hidden video element decodes one frame and a canvas crops it.
// Nothing is sent anywhere here.

const THUMB_WIDTH = 600
const THUMB_HEIGHT = 400
const JPEG_QUALITY = 0.85
const TIMEOUT_MS = 15000
const SEEK_SECONDS = 3

export interface ThumbnailResult {
  blob: Blob | null
  // False when the browser itself could not decode the video (decode error or no
  // picture size). A timeout or canvas failure leaves this true: it says nothing
  // about the file.
  playable: boolean
}

const abortError = () => new DOMException("Aborted", "AbortError")

export const generateThumbnail = (file: File, signal?: AbortSignal): Promise<ThumbnailResult> =>
  new Promise<ThumbnailResult>((resolve, reject) => {
    if (signal?.aborted) return reject(abortError())

    const objectUrl = URL.createObjectURL(file)
    const video = document.createElement("video")
    let finished = false

    const finish = (result: ThumbnailResult) => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      signal?.removeEventListener("abort", onAbort)
      video.removeAttribute("src")
      video.load()
      URL.revokeObjectURL(objectUrl)
      resolve(result)
    }

    const onAbort = () => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      video.removeAttribute("src")
      video.load()
      URL.revokeObjectURL(objectUrl)
      reject(abortError())
    }

    const timer = setTimeout(() => finish({ blob: null, playable: true }), TIMEOUT_MS)
    signal?.addEventListener("abort", onAbort, { once: true })

    const drawFrame = () => {
      if (!video.videoWidth || !video.videoHeight) {
        finish({ blob: null, playable: false })
        return
      }
      try {
        const canvas = document.createElement("canvas")
        canvas.width = THUMB_WIDTH
        canvas.height = THUMB_HEIGHT
        const context = canvas.getContext("2d")
        if (!context) return finish({ blob: null, playable: true })

        // Cover crop: fill the whole thumbnail, cut what does not fit.
        const scale = Math.max(THUMB_WIDTH / video.videoWidth, THUMB_HEIGHT / video.videoHeight)
        const drawWidth = video.videoWidth * scale
        const drawHeight = video.videoHeight * scale
        context.drawImage(
          video,
          (THUMB_WIDTH - drawWidth) / 2,
          (THUMB_HEIGHT - drawHeight) / 2,
          drawWidth,
          drawHeight
        )
        canvas.toBlob(
          (blob) => finish({ blob: blob && blob.size > 0 ? blob : null, playable: true }),
          "image/jpeg",
          JPEG_QUALITY
        )
      } catch {
        finish({ blob: null, playable: true })
      }
    }

    video.muted = true
    video.playsInline = true
    video.preload = "auto"
    video.onerror = () => finish({ blob: null, playable: false })

    // Wait for the first frame before seeking, Safari ignores a seek before that.
    video.onloadeddata = () => {
      if (!video.videoWidth || !video.videoHeight) {
        finish({ blob: null, playable: false })
        return
      }
      const duration = Number.isFinite(video.duration) ? video.duration : 0
      const target = Math.min(SEEK_SECONDS, duration / 2)
      if (target < 0.05) {
        drawFrame()
        return
      }
      video.onseeked = drawFrame
      video.currentTime = target
    }

    video.src = objectUrl
    video.load()
  })

// Thumbnail only, null on any failure.
export const makeThumbnail = async (file: File, signal?: AbortSignal): Promise<Blob | null> =>
  (await generateThumbnail(file, signal)).blob
