import { config } from "../config"
import { MediaPurpose, UploadError } from "./types"

// Keys are always chosen by the server: <prefix><folder>/<userId>/<uuid>[.<ext>].
// Every operation that takes a key from the browser re-parses it with parseOwnedKey,
// which is the ownership check. A key outside the caller's own folder is refused.

export const FOLDER: Record<MediaPurpose, string> = {
  video: "videos",
  image: "profile_pictures",
}

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const buildKey = (userId: string, purpose: MediaPurpose, uuid: string, extension?: string): string =>
  `${config.mediaFolderPrefix}${FOLDER[purpose]}/${userId}/${uuid}${extension ? `.${extension}` : ""}`

export interface ParsedKey {
  purpose: MediaPurpose
  uuid: string
}

/** Throws UploadError(400, "Invalid upload key") unless the key is exactly one of the caller's own keys. */
export const parseOwnedKey = (userId: string, key: unknown, expectedPurpose?: MediaPurpose): ParsedKey => {
  const invalid = new UploadError(400, "Invalid upload key")
  if (typeof key !== "string" || key.length === 0 || key.length > 300) throw invalid
  if (!/^[0-9a-fA-F]{24}$/.test(userId)) throw invalid

  const pattern = new RegExp(
    `^${escapeRegex(config.mediaFolderPrefix)}(videos|profile_pictures)/${userId}/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(\\.[a-z0-9]{1,8})?$`
  )
  const match = pattern.exec(key)
  if (!match) throw invalid

  const purpose: MediaPurpose = match[1] === FOLDER.video ? "video" : "image"
  if (expectedPurpose && purpose !== expectedPurpose) throw invalid

  return { purpose, uuid: match[2] }
}
