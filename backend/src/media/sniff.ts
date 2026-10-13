import { MediaPurpose } from "./types"

/**
 * Checks the first bytes of an uploaded object against the format its key claims.
 * This is the server side half of the format check: the browser only inspects codecs for the user's benefit.
 */
export const matchesMagicBytes = (purpose: MediaPurpose, extension: string, head: Uint8Array): boolean => {
  const at = (index: number): number => head[index] ?? -1
  const ascii = (start: number, text: string): boolean =>
    [...text].every((char, offset) => at(start + offset) === char.charCodeAt(0))

  if (purpose === "video") {
    // MP4 and QuickTime files start with an ftyp box: 4 size bytes, then the type.
    return (extension === "mp4" || extension === "mov") && ascii(4, "ftyp")
  }

  switch (extension) {
    case "jpg":
    case "jpeg":
      return at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff
    case "png":
      return at(0) === 0x89 && ascii(1, "PNG")
    case "webp":
      return ascii(0, "RIFF") && ascii(8, "WEBP")
    default:
      return false
  }
}
