// Read only helpers for the Cloudinary side of the media move. Nothing here uploads, renames, deletes or
// changes any Cloudinary setting: it lists resources with the Admin API and parses delivery URLs.
// Mac side tooling, never imported by the running server.

import { config } from "../config"

export const CLOUDINARY_HOST = "res.cloudinary.com"

// The landing page demo, as it is hard coded in the frontend today. It goes into the frontend bundle,
// not into the media bucket, so it is only downloaded for the handover.
export const DEMO_VIDEO_URL =
  "https://res.cloudinary.com/dgr7l5nsx/video/upload/f_mp4/v1754990343/videos/yhzdf7phuo0a0udgm40d.mov"

export type ResourceType = "image" | "video" | "raw"

export interface ParsedCloudinaryUrl {
  resourceType: ResourceType
  deliveryType: string // "upload"
  transformation: string // "" when the URL names an original
  version: string | null
  publicId: string
  format: string // extension of the URL without the dot, lower case
}

const TRANSFORMATION_SEGMENT = /^[a-z]{1,3}_[^,/]+(,[a-z]{1,3}_[^,/]+)*$/

/**
 * Splits a Cloudinary delivery URL into resource type, transformation, version, public id and format.
 * Returns null for anything that is not a Cloudinary upload URL.
 */
export const parseCloudinaryUrl = (url: string): ParsedCloudinaryUrl | null => {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  if (parsed.hostname !== CLOUDINARY_HOST) return null

  // /<cloud>/<resource_type>/<delivery type>/<transformations>/<version>/<public id>.<format>
  const segments = parsed.pathname.split("/").filter(Boolean)
  if (segments.length < 4) return null
  const [, resourceType, deliveryType, ...rest] = segments
  if (resourceType !== "image" && resourceType !== "video" && resourceType !== "raw") return null

  const transformations: string[] = []
  let version: string | null = null
  let index = 0
  for (; index < rest.length - 1; index++) {
    const segment = rest[index]
    if (/^v\d+$/.test(segment)) {
      version = segment
      index++
      break
    }
    if (TRANSFORMATION_SEGMENT.test(segment)) {
      transformations.push(segment)
      continue
    }
    break
  }

  const idSegments = rest.slice(index)
  if (idSegments.length === 0) return null
  const last = idSegments[idSegments.length - 1]
  const dot = last.lastIndexOf(".")
  const format = dot > 0 ? last.slice(dot + 1).toLowerCase() : ""
  idSegments[idSegments.length - 1] = dot > 0 ? last.slice(0, dot) : last

  try {
    return {
      resourceType,
      deliveryType,
      transformation: transformations.join("/"),
      version,
      publicId: idSegments.map((segment) => decodeURIComponent(segment)).join("/"),
      format,
    }
  } catch {
    return null
  }
}

/** The URL of a rendition that is always H.264 + AAC in an MP4, for videos that do not play everywhere as stored. */
export const mp4RenditionUrl = (url: string): string =>
  url
    .replace("/video/upload/", "/video/upload/f_mp4,vc_h264,ac_aac/")
    .replace(/\.[A-Za-z0-9]+$/, ".mp4")

export interface CloudinaryResource {
  public_id: string
  resource_type: ResourceType
  type: string
  format: string
  bytes: number
  created_at: string
  width?: number
  height?: number
  secure_url: string
  version?: number
}

const requireAdminConfig = (): { cloudName: string; apiKey: string; apiSecret: string } => {
  const { cloudName, apiKey, apiSecret } = config.cloudinary
  const missing = [
    !cloudName && "CLOUDINARY_CLOUD_NAME",
    !apiKey && "CLOUDINARY_API_KEY",
    !apiSecret && "CLOUDINARY_API_SECRET",
  ].filter(Boolean)
  if (missing.length > 0) throw new Error(`Missing ${missing.join(", ")} in the environment`)
  return { cloudName, apiKey, apiSecret }
}

// Where the Admin API lives. A test points this at a local fake. Never set it in real use.
const adminBase = (): string => (process.env.CLOUDINARY_API_BASE || "https://api.cloudinary.com").replace(/\/+$/, "")

/** Lists every upload resource of one type. Read only: GET requests with HTTP basic auth, 500 per page. */
export const listCloudinaryResources = async (resourceType: "image" | "video"): Promise<CloudinaryResource[]> => {
  const { cloudName, apiKey, apiSecret } = requireAdminConfig()
  const authorization = `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`

  const all: CloudinaryResource[] = []
  let cursor: string | undefined
  do {
    const query = new URLSearchParams({ max_results: "500" })
    if (cursor) query.set("next_cursor", cursor)
    const response = await fetch(`${adminBase()}/v1_1/${cloudName}/resources/${resourceType}/upload?${query}`, {
      method: "GET",
      headers: { Authorization: authorization },
    })
    if (!response.ok) {
      // The body can echo request details, so only the status is reported.
      throw new Error(`Cloudinary Admin API answered ${response.status} for the ${resourceType} listing`)
    }
    const page = (await response.json()) as { resources?: CloudinaryResource[]; next_cursor?: string }
    for (const resource of page.resources ?? []) {
      all.push({ ...resource, resource_type: resource.resource_type ?? resourceType })
    }
    cursor = page.next_cursor || undefined
  } while (cursor)
  return all
}

// Where public delivery URLs are fetched from. A test points this at a local fake. Never set it in real use.
export const deliveryUrl = (url: string): string => {
  const override = process.env.CLOUDINARY_DELIVERY_OVERRIDE
  return override ? url.replace(`https://${CLOUDINARY_HOST}`, override.replace(/\/+$/, "")) : url
}
