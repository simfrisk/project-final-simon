import type { SyntheticEvent } from "react"

export const FALLBACK_THUMBNAIL = "/fallback-thumbnail.jpg"

// onError handler for a thumbnail <img>. A stored thumbnail is made in the browser
// and is optional, so one that does not load falls back to the placeholder instead
// of showing a broken image. Runs once so a missing placeholder cannot loop.
export const showFallbackThumbnail = (event: SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget
  if (image.getAttribute("src") === FALLBACK_THUMBNAIL) return
  image.src = FALLBACK_THUMBNAIL
}
