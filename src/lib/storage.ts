import 'server-only'

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import type { FileConfig, StorageVisibility } from '@/constants/storage'
import { env } from '@/env/server'

const s3Client = new S3Client({
  region: env.S3_DEFAULT_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for MinIO
})

class StorageError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message)
    this.name = 'StorageError'
  }
}

/**
 * Validate and sanitize file path - supports nested paths
 */
function validatePath(path?: string): string {
  if (!path) return ''

  // Remove leading/trailing slashes and whitespace
  const sanitized = path.trim().replace(/^\/+|\/+$/g, '')

  if (!sanitized) return ''

  // Check for path traversal attempts
  if (sanitized.includes('..')) {
    throw new StorageError(
      'Invalid path: path traversal detected',
      'INVALID_PATH'
    )
  }

  // Remove consecutive slashes
  const normalized = sanitized.replace(/\/+/g, '/')

  // Only allow alphanumeric, dash, underscore, and forward slash
  if (!/^[a-zA-Z0-9\-_/]+$/.test(normalized)) {
    throw new StorageError(
      'Invalid path: contains invalid characters',
      'INVALID_PATH'
    )
  }

  return normalized
}

/**
 * Validate file extension against allowed list
 */
function validateExtension(
  filename: string,
  allowedExtensions: readonly string[]
): string {
  const parts = filename.split('.')

  if (parts.length < 2) {
    throw new StorageError(
      'Invalid filename: no extension found',
      'INVALID_EXTENSION'
    )
  }

  const extension = `.${parts.pop()?.toLowerCase()}`

  if (!allowedExtensions.includes(extension)) {
    throw new StorageError(
      `Invalid file extension. Allowed: ${allowedExtensions.join(', ')}`,
      'INVALID_EXTENSION'
    )
  }

  return extension
}

/**
 * Validate file size against max limit
 */
function validateFileSize(fileSize: number, maxSize: number): void {
  if (fileSize <= 0) {
    throw new StorageError('Invalid file size', 'INVALID_FILE_SIZE')
  }

  if (fileSize > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(2)
    throw new StorageError(
      `File too large. Maximum size: ${maxMB}MB`,
      'FILE_TOO_LARGE'
    )
  }
}

/**
 * Validate MIME type against allowed list
 */
function validateMimeType(
  mimeType: string,
  allowedMimes: readonly string[]
): void {
  if (!allowedMimes.includes(mimeType)) {
    throw new StorageError(
      `Invalid MIME type. Allowed: ${allowedMimes.join(', ')}`,
      'INVALID_MIME_TYPE'
    )
  }
}

/**
 * Validate file against config (extension, MIME, size)
 */
export function validateFile({
  filename,
  mimeType,
  fileSize,
  config,
}: {
  filename: string
  mimeType: string
  fileSize: number
  config: FileConfig
}): void {
  validateExtension(filename, config.ACCEPTED_EXTENSIONS)
  validateMimeType(mimeType, config.ACCEPTED_MIME)
  validateFileSize(fileSize, config.MAX_SIZE)
}

/**
 * Generate random S3 key
 * Supports nested paths: /private/parent/child/children/file.jpg
 */
export function generateRandomKey({
  filename,
  visibility,
  path,
  config,
}: {
  filename: string
  visibility: StorageVisibility
  path?: string
  config: FileConfig
}): string {
  // Validate extension
  const extension = validateExtension(filename, config.ACCEPTED_EXTENSIONS)

  // Validate and sanitize path (supports nested paths)
  const sanitizedPath = validatePath(path)

  // Generate new filename with UUID
  const newFilename = `${randomUUID()}${extension}`

  // Construct object key with nested path support
  const pathPrefix = sanitizedPath ? `/${sanitizedPath}` : ''
  const objectKey = `${visibility}${pathPrefix}/${newFilename}`

  return objectKey
}

/**
 * Generate presigned URL for uploading file to S3/MinIO
 */
export async function generatePresignedUrl({
  key,
  fileType,
  fileSize,
  checksum,
  config,
  expiresInMinutes = 3,
  isPublic = false,
}: {
  key: string
  fileType: string
  fileSize: number
  checksum: string
  config: FileConfig
  expiresInMinutes?: number
  isPublic?: boolean
}): Promise<string> {
  // Validate file
  validateMimeType(fileType, config.ACCEPTED_MIME)
  validateFileSize(fileSize, config.MAX_SIZE)

  // Validate checksum format (SHA-256 base64 is 44 chars)
  if (!checksum || checksum.length !== 44) {
    throw new StorageError('Invalid checksum format', 'INVALID_CHECKSUM')
  }

  // biome-ignore lint/suspicious/noExplicitAny: s3Client.send() requires any
  const commandParams: any = {
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize,
    ChecksumSHA256: checksum,
    Metadata: {
      uploadedAt: new Date().toISOString(),
    },
  }

  // ACL might not be supported in MinIO, make it conditional
  if (isPublic) {
    commandParams.ACL = 'public-read'
  }

  const putObjectCommand = new PutObjectCommand(commandParams)

  try {
    return await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: expiresInMinutes * 60,
    })
  } catch {
    throw new StorageError(
      'Failed to generate presigned URL',
      'PRESIGNED_URL_ERROR'
    )
  }
}

/**
 * Generate temporary signed URL for accessing private files
 */
export async function generateTemporaryUrl({
  key,
  expiresInMinutes = 5,
}: {
  key: string
  expiresInMinutes?: number
}): Promise<string> {
  const getObjectCommand = new GetObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
  })

  try {
    return await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: expiresInMinutes * 60,
    })
  } catch {
    throw new StorageError(
      'Failed to generate temporary URL',
      'TEMPORARY_URL_ERROR'
    )
  }
}

/**
 * Delete object from S3/MinIO
 */
export async function deleteObject({ key }: { key: string }): Promise<void> {
  try {
    const deleteObjectCommand = new DeleteObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(deleteObjectCommand)
  } catch {
    throw new StorageError(
      `Failed to delete object: ${key}`,
      'DELETE_OBJECT_ERROR'
    )
  }
}

/**
 * Get public URL for S3/MinIO object
 * Works with both S3 and MinIO endpoints
 */
export function getPublicUrl(key: string): string {
  // Remove trailing slash
  const endpoint = env.S3_ENDPOINT.replace(/\/$/, '')
  return `${endpoint}/${env.S3_BUCKET_NAME}/${key}`
}

/**
 * Extract key from public URL
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const endpoint = env.S3_ENDPOINT.replace(/\/$/, '')

    // Handle S3/MinIO endpoint URL
    if (url.startsWith(endpoint)) {
      const pathWithBucket = url.replace(`${endpoint}/`, '')
      // Remove bucket name prefix
      const withoutBucket = pathWithBucket.replace(`${env.S3_BUCKET_NAME}/`, '')
      return withoutBucket
    }

    // Fallback: extract from pathname
    const pathname = urlObj.pathname
    const parts = pathname.split('/')
    // Remove empty first element and bucket name
    const filteredParts = parts.filter((p) => p && p !== env.S3_BUCKET_NAME)
    return filteredParts.join('/')
  } catch {
    return null
  }
}

/**
 * Check if file is public based on key
 */
export function isPublicFile(key: string): boolean {
  return key.startsWith('public/')
}

/**
 * Get file visibility from key
 */
export function getFileVisibility(key: string): StorageVisibility {
  return isPublicFile(key) ? 'public' : 'private'
}

// Export error class and types for consumers
export { StorageError }
export type { StorageVisibility, FileConfig }
