import {
  CreateBucketCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { config } from "../config"

let client: S3Client | null = null

/** Path style is mandatory on OSC MinIO, and the region is a placeholder it ignores. */
export const getS3 = (): S3Client => {
  if (client) return client
  const { endpoint, accessKey, secretKey } = config.backup
  if (!endpoint || !accessKey || !secretKey || !config.backup.bucket) {
    throw new Error("Backup storage is not configured (BACKUP_S3_ENDPOINT, BACKUP_S3_BUCKET and keys)")
  }
  client = new S3Client({
    endpoint,
    region: "us-east-1",
    forcePathStyle: true,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    // MinIO does not need the newer default checksum trailers and some versions reject them.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  })
  return client
}

const bucket = (): string => config.backup.bucket

export const putObject = async (key: string, body: Buffer | string, contentType?: string): Promise<void> => {
  await getS3().send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType }))
}

export const getObject = async (key: string): Promise<Buffer> => {
  const response = await getS3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }))
  const bytes = await response.Body?.transformToByteArray()
  if (!bytes) throw new Error(`Object is empty: ${key}`)
  return Buffer.from(bytes)
}

/** Returns null when the object does not exist. */
export const getObjectIfExists = async (key: string): Promise<Buffer | null> => {
  try {
    return await getObject(key)
  } catch (error) {
    const e = error as { name?: string; $metadata?: { httpStatusCode?: number } }
    if (e.name === "NoSuchKey" || e.$metadata?.httpStatusCode === 404) return null
    throw error
  }
}

export const listKeys = async (prefix: string): Promise<string[]> => {
  const keys: string[] = []
  let token: string | undefined
  do {
    const page = await getS3().send(
      new ListObjectsV2Command({ Bucket: bucket(), Prefix: prefix, ContinuationToken: token })
    )
    for (const item of page.Contents ?? []) if (item.Key) keys.push(item.Key)
    token = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (token)
  return keys
}

/** One level of "folders" under a prefix, each returned with its trailing slash. */
export const listFolders = async (prefix: string): Promise<string[]> => {
  const folders: string[] = []
  let token: string | undefined
  do {
    const page = await getS3().send(
      new ListObjectsV2Command({ Bucket: bucket(), Prefix: prefix, Delimiter: "/", ContinuationToken: token })
    )
    for (const item of page.CommonPrefixes ?? []) if (item.Prefix) folders.push(item.Prefix)
    token = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (token)
  return folders
}

export const deleteKeys = async (keys: string[]): Promise<void> => {
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000)
    await getS3().send(
      new DeleteObjectsCommand({ Bucket: bucket(), Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true } })
    )
  }
}

/** Creates the bucket when it is missing. MinIO buckets are private unless a policy says otherwise. */
export const ensureBucket = async (): Promise<"created" | "exists"> => {
  try {
    await getS3().send(new HeadBucketCommand({ Bucket: bucket() }))
    return "exists"
  } catch {
    await getS3().send(new CreateBucketCommand({ Bucket: bucket() }))
    return "created"
  }
}
