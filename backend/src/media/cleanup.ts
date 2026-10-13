import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import { config } from "../config"
import { Project } from "../models/Projects"
import { getMediaS3, mediaBucket } from "./s3Client"

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// Only objects this app created itself: videos/<userId>/<uuid>[.ext] and thumbnails/<userId>/<uuid>[.ext].
// Everything else in the bucket (migrated/, defaults/, profile_pictures/) is never removed from here.
const ownKeyPattern = (): RegExp =>
  new RegExp(
    `^${escapeRegex(config.mediaFolderPrefix)}(videos|thumbnails)/[0-9a-fA-F]{24}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\\.[a-z0-9]{1,8})?$`
  )

/** The object key behind a stored URL when the URL is one of this app's own deletable media objects, else null. */
export const deletableKeyOf = (url: unknown): string | null => {
  if (typeof url !== "string" || !config.mediaPublicBaseUrl) return null
  const prefix = `${config.mediaPublicBaseUrl}/`
  if (!url.startsWith(prefix)) return null
  const key = url.slice(prefix.length)
  return ownKeyPattern().test(key) ? key : null
}

/**
 * Best effort removal of the objects of a project that was just deleted from the database. Never throws,
 * and an object that another project still points at is left alone.
 */
export const deleteProjectMedia = async (urls: unknown[]): Promise<void> => {
  for (const url of new Set(urls)) {
    const key = deletableKeyOf(url)
    if (!key) continue
    try {
      const stillUsed = await Project.exists({ $or: [{ video: url }, { thumbnail: url }] })
      if (stillUsed) continue
      await getMediaS3().send(new DeleteObjectCommand({ Bucket: mediaBucket(), Key: key }))
      console.log("[media] removed an object of a deleted project")
    } catch (error) {
      console.error(`[media] could not remove an object of a deleted project: ${(error as { name?: string })?.name ?? "unknown"}`)
    }
  }
}
