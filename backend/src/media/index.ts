import { config } from "../config"
import { CloudinaryMediaStorage } from "./cloudinaryStorage"
import { MediaStorage, UploadError } from "./types"

let instance: MediaStorage | null = null

/**
 * Returns the storage provider named by MEDIA_STORAGE. Controllers only ever talk to the
 * MediaStorage interface, so switching provider is an env change and not a controller change.
 */
export const getMediaStorage = (): MediaStorage => {
  if (instance) return instance

  if (config.mediaStorage === "cloudinary") {
    instance = new CloudinaryMediaStorage()
    return instance
  }

  throw new UploadError(500, `Media storage "${config.mediaStorage}" is not available`)
}
