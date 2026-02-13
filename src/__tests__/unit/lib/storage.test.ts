import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  deleteObject,
  extractKeyFromUrl,
  generatePresignedUrl,
  generateRandomKey,
  generateTemporaryUrl,
  getFileVisibility,
  getPublicUrl,
  isPublicFile,
  StorageError,
  validateFile,
} from '@/lib/storage'

vi.mock('server-only', () => ({}))

// Mock AWS SDK - use module-level variables that will be hoisted
const mockState = {
  send: vi.fn(),
  getSignedUrl: vi.fn(),
}

vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: class MockS3Client {
      send(...args: unknown[]) {
        return mockState.send(...args)
      }
    },
    PutObjectCommand: class MockPutObjectCommand {
      constructor(public params: unknown) {}
    },
    GetObjectCommand: class MockGetObjectCommand {
      constructor(public params: unknown) {}
    },
    DeleteObjectCommand: class MockDeleteObjectCommand {
      constructor(public params: unknown) {}
    },
  }
})

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: (...args: unknown[]) => mockState.getSignedUrl(...args),
}))

vi.mock('@/lib/env', () => ({
  env: {
    S3_DEFAULT_REGION: 'us-east-1',
    S3_ENDPOINT: 'http://localhost:9000',
    S3_BUCKET_NAME: 'test-bucket',
    S3_ACCESS_KEY_ID: 'test-key',
    S3_SECRET_ACCESS_KEY: 'test-secret',
  },
}))

const mockImageConfig = {
  ACCEPTED_EXTENSIONS: ['.jpg', '.png'] as const,
  ACCEPTED_TYPES: ['image/jpeg', 'image/png'] as const,
  ACCEPTED_MIME: ['image/jpeg', 'image/png'] as const,
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
}

describe('StorageError', () => {
  it('creates error with message and code', () => {
    const error = new StorageError('Test error', 'TEST_CODE')
    expect(error.message).toBe('Test error')
    expect(error.code).toBe('TEST_CODE')
    expect(error.name).toBe('StorageError')
  })
})

describe('validateFile', () => {
  it('validates correct file', () => {
    expect(() =>
      validateFile({
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        config: mockImageConfig,
      })
    ).not.toThrow()
  })

  it('throws error for invalid extension', () => {
    expect(() =>
      validateFile({
        filename: 'test.gif',
        mimeType: 'image/gif',
        fileSize: 1024,
        config: mockImageConfig,
      })
    ).toThrow(StorageError)
  })

  it('throws error for file without extension', () => {
    expect(() =>
      validateFile({
        filename: 'test',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        config: mockImageConfig,
      })
    ).toThrow(StorageError)
  })

  it('throws error for invalid MIME type', () => {
    expect(() =>
      validateFile({
        filename: 'test.jpg',
        mimeType: 'text/plain',
        fileSize: 1024,
        config: mockImageConfig,
      })
    ).toThrow(StorageError)
  })

  it('throws error for file too large', () => {
    expect(() =>
      validateFile({
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 10 * 1024 * 1024, // 10MB
        config: mockImageConfig,
      })
    ).toThrow(StorageError)
  })

  it('throws error for invalid file size (zero)', () => {
    expect(() =>
      validateFile({
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 0,
        config: mockImageConfig,
      })
    ).toThrow(StorageError)
  })

  it('throws error for invalid file size (negative)', () => {
    expect(() =>
      validateFile({
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: -1,
        config: mockImageConfig,
      })
    ).toThrow(StorageError)
  })
})

describe('generateRandomKey', () => {
  it('generates key for public visibility', () => {
    const key = generateRandomKey({
      filename: 'test.jpg',
      visibility: 'public',
      config: mockImageConfig,
    })

    expect(key).toMatch(/^public\/[a-f0-9-]+\.jpg$/)
  })

  it('generates key for private visibility', () => {
    const key = generateRandomKey({
      filename: 'test.png',
      visibility: 'private',
      config: mockImageConfig,
    })

    expect(key).toMatch(/^private\/[a-f0-9-]+\.png$/)
  })

  it('includes path prefix when provided', () => {
    const key = generateRandomKey({
      filename: 'test.jpg',
      visibility: 'public',
      path: 'avatars/users',
      config: mockImageConfig,
    })

    expect(key).toMatch(/^public\/avatars\/users\/[a-f0-9-]+\.jpg$/)
  })

  it('handles empty path', () => {
    const key = generateRandomKey({
      filename: 'test.jpg',
      visibility: 'public',
      path: '',
      config: mockImageConfig,
    })

    expect(key).toMatch(/^public\/[a-f0-9-]+\.jpg$/)
  })

  it('handles path with leading/trailing slashes', () => {
    const key = generateRandomKey({
      filename: 'test.jpg',
      visibility: 'public',
      path: '/avatars/users/',
      config: mockImageConfig,
    })

    expect(key).toMatch(/^public\/avatars\/users\/[a-f0-9-]+\.jpg$/)
  })

  it('throws error for invalid extension', () => {
    expect(() =>
      generateRandomKey({
        filename: 'test.gif',
        visibility: 'public',
        config: mockImageConfig,
      })
    ).toThrow(StorageError)
  })

  it('throws error for file without extension', () => {
    expect(() =>
      generateRandomKey({
        filename: 'test',
        visibility: 'public',
        config: mockImageConfig,
      })
    ).toThrow(StorageError)
  })

  it('throws error for path traversal attempt', () => {
    expect(() =>
      generateRandomKey({
        filename: 'test.jpg',
        visibility: 'public',
        path: '../../../etc',
        config: mockImageConfig,
      })
    ).toThrow(StorageError)
  })

  it('throws error for invalid path characters', () => {
    expect(() =>
      generateRandomKey({
        filename: 'test.jpg',
        visibility: 'public',
        path: 'path with spaces',
        config: mockImageConfig,
      })
    ).toThrow(StorageError)
  })

  it('throws error for path with special characters', () => {
    expect(() =>
      generateRandomKey({
        filename: 'test.jpg',
        visibility: 'public',
        path: 'path@with#special!chars',
        config: mockImageConfig,
      })
    ).toThrow(StorageError)
  })
})

describe('generatePresignedUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generates presigned URL successfully', async () => {
    mockState.getSignedUrl.mockResolvedValue(
      'https://presigned-url.example.com'
    )

    const result = await generatePresignedUrl({
      key: 'public/test.jpg',
      fileType: 'image/jpeg',
      fileSize: 1024,
      checksum: 'a'.repeat(44), // Valid SHA-256 base64 length
      config: mockImageConfig,
    })

    expect(result).toBe('https://presigned-url.example.com')
    expect(mockState.getSignedUrl).toHaveBeenCalled()
  })

  it('generates presigned URL with public ACL', async () => {
    mockState.getSignedUrl.mockResolvedValue(
      'https://presigned-url.example.com'
    )

    await generatePresignedUrl({
      key: 'public/test.jpg',
      fileType: 'image/jpeg',
      fileSize: 1024,
      checksum: 'a'.repeat(44),
      config: mockImageConfig,
      isPublic: true,
    })

    // ACL should be set to public-read
    const callArgs = mockState.getSignedUrl.mock.calls[0]
    expect(callArgs[1].params).toMatchObject({
      ACL: 'public-read',
    })
  })

  it('generates presigned URL without ACL for private files', async () => {
    mockState.getSignedUrl.mockResolvedValue(
      'https://presigned-url.example.com'
    )

    await generatePresignedUrl({
      key: 'private/test.jpg',
      fileType: 'image/jpeg',
      fileSize: 1024,
      checksum: 'a'.repeat(44),
      config: mockImageConfig,
      isPublic: false,
    })

    // ACL should not be set
    const callArgs = mockState.getSignedUrl.mock.calls[0]
    expect(callArgs[1].params.ACL).toBeUndefined()
  })

  it('throws error for invalid checksum format (too short)', async () => {
    await expect(
      generatePresignedUrl({
        key: 'public/test.jpg',
        fileType: 'image/jpeg',
        fileSize: 1024,
        checksum: 'short',
        config: mockImageConfig,
      })
    ).rejects.toThrow(StorageError)
  })

  it('throws error for invalid checksum format (empty)', async () => {
    await expect(
      generatePresignedUrl({
        key: 'public/test.jpg',
        fileType: 'image/jpeg',
        fileSize: 1024,
        checksum: '',
        config: mockImageConfig,
      })
    ).rejects.toThrow(StorageError)
  })

  it('throws error for invalid MIME type', async () => {
    await expect(
      generatePresignedUrl({
        key: 'public/test.gif',
        fileType: 'image/gif',
        fileSize: 1024,
        checksum: 'a'.repeat(44),
        config: mockImageConfig,
      })
    ).rejects.toThrow(StorageError)
  })

  it('throws error for file too large', async () => {
    await expect(
      generatePresignedUrl({
        key: 'public/test.jpg',
        fileType: 'image/jpeg',
        fileSize: 10 * 1024 * 1024, // 10MB
        checksum: 'a'.repeat(44),
        config: mockImageConfig,
      })
    ).rejects.toThrow(StorageError)
  })

  it('throws error when getSignedUrl fails', async () => {
    mockState.getSignedUrl.mockRejectedValue(new Error('S3 error'))

    await expect(
      generatePresignedUrl({
        key: 'public/test.jpg',
        fileType: 'image/jpeg',
        fileSize: 1024,
        checksum: 'a'.repeat(44),
        config: mockImageConfig,
      })
    ).rejects.toThrow(StorageError)
  })

  it('uses custom expiration time', async () => {
    mockState.getSignedUrl.mockResolvedValue(
      'https://presigned-url.example.com'
    )

    await generatePresignedUrl({
      key: 'public/test.jpg',
      fileType: 'image/jpeg',
      fileSize: 1024,
      checksum: 'a'.repeat(44),
      config: mockImageConfig,
      expiresInMinutes: 10,
    })

    expect(mockState.getSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        expiresIn: 600, // 10 minutes in seconds
      })
    )
  })
})

describe('generateTemporaryUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generates temporary URL successfully', async () => {
    mockState.getSignedUrl.mockResolvedValue('https://temp-url.example.com')

    const result = await generateTemporaryUrl({
      key: 'private/test.jpg',
    })

    expect(result).toBe('https://temp-url.example.com')
    expect(mockState.getSignedUrl).toHaveBeenCalled()
  })

  it('uses custom expiration time', async () => {
    mockState.getSignedUrl.mockResolvedValue('https://temp-url.example.com')

    await generateTemporaryUrl({
      key: 'private/test.jpg',
      expiresInMinutes: 15,
    })

    expect(mockState.getSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        expiresIn: 900, // 15 minutes in seconds
      })
    )
  })

  it('throws error when getSignedUrl fails', async () => {
    mockState.getSignedUrl.mockRejectedValue(new Error('S3 error'))

    await expect(
      generateTemporaryUrl({
        key: 'private/test.jpg',
      })
    ).rejects.toThrow(StorageError)
  })
})

describe('deleteObject', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes object successfully', async () => {
    mockState.send.mockResolvedValue({})

    await expect(
      deleteObject({ key: 'public/test.jpg' })
    ).resolves.not.toThrow()

    expect(mockState.send).toHaveBeenCalled()
  })

  it('throws error when delete fails', async () => {
    mockState.send.mockRejectedValue(new Error('S3 delete error'))

    await expect(deleteObject({ key: 'public/test.jpg' })).rejects.toThrow(
      StorageError
    )
  })
})

describe('getPublicUrl', () => {
  it('generates correct public URL', () => {
    const url = getPublicUrl('public/test.jpg')
    expect(url).toBe('http://localhost:9000/test-bucket/public/test.jpg')
  })
})

describe('extractKeyFromUrl', () => {
  it('extracts key from S3 endpoint URL', () => {
    const url = 'http://localhost:9000/test-bucket/public/avatars/test.jpg'
    const key = extractKeyFromUrl(url)
    expect(key).toBe('public/avatars/test.jpg')
  })

  it('returns null for invalid URL', () => {
    const key = extractKeyFromUrl('not-a-valid-url')
    expect(key).toBeNull()
  })

  it('handles URL with different endpoint (fallback path)', () => {
    const url = 'https://s3.amazonaws.com/test-bucket/private/file.pdf'
    const key = extractKeyFromUrl(url)
    expect(key).toBe('private/file.pdf')
  })

  it('handles URL without bucket in path', () => {
    const url = 'https://example.com/other-bucket/path/to/file.jpg'
    const key = extractKeyFromUrl(url)
    // The function filters out test-bucket from the path, so other-bucket remains
    expect(key).toBe('other-bucket/path/to/file.jpg')
  })

  it('returns empty string for URL with only bucket', () => {
    const url = 'https://s3.amazonaws.com/test-bucket'
    const key = extractKeyFromUrl(url)
    expect(key).toBe('')
  })
})

describe('isPublicFile', () => {
  it('returns true for public file', () => {
    expect(isPublicFile('public/test.jpg')).toBe(true)
  })

  it('returns false for private file', () => {
    expect(isPublicFile('private/test.jpg')).toBe(false)
  })

  it('returns false for nested private file', () => {
    expect(isPublicFile('private/avatars/test.jpg')).toBe(false)
  })

  it('returns true for nested public file', () => {
    expect(isPublicFile('public/avatars/users/test.jpg')).toBe(true)
  })

  it('returns false for empty string', () => {
    expect(isPublicFile('')).toBe(false)
  })
})

describe('getFileVisibility', () => {
  it('returns public for public file', () => {
    expect(getFileVisibility('public/test.jpg')).toBe('public')
  })

  it('returns private for private file', () => {
    expect(getFileVisibility('private/test.jpg')).toBe('private')
  })

  it('returns private for empty string', () => {
    expect(getFileVisibility('')).toBe('private')
  })
})
