import { S3Client } from "@aws-sdk/client-s3"
import { config } from "../config"
import { UploadError } from "./types"

let client: S3Client | null = null

/**
 * The client for the media bucket. Path style addressing is mandatory on OSC MinIO and the region is a
 * placeholder it ignores.
 *
 * The two checksum settings are not optional. Without WHEN_REQUIRED the SDK adds x-amz-checksum-* and
 * x-amz-sdk-checksum-algorithm to presigned part URLs, which a browser cannot satisfy and which the OSC
 * ingress would not allow as request headers anyway.
 */
export const getMediaS3 = (): S3Client => {
  if (client) return client
  const { endpoint, accessKey, secretKey, bucket } = config.mediaS3
  if (!endpoint || !accessKey || !secretKey || !bucket || !config.mediaPublicBaseUrl) {
    throw new UploadError(500, "Media storage is not configured")
  }
  client = new S3Client({
    endpoint,
    region: "us-east-1",
    forcePathStyle: true,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  })
  return client
}

export const mediaBucket = (): string => config.mediaS3.bucket

/** The public URL of an object in the media bucket. */
export const publicUrlFor = (key: string): string => `${config.mediaPublicBaseUrl}/${key}`
