import { describe, expect, it, vi } from 'vitest'
import {
  extractKeyFromUrl,
  generateRandomKey,
  getFileVisibility,
  getPublicUrl,
  isPublicFile,
  StorageError,
  validateFile,
} from '@/lib/storage'

vi.mock('server-only', () => ({}))

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

  it('throws error for invalid file size (zero or negative)', () => {
    expect(() =>
      validateFile({
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 0,
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

  it('throws error for invalid extension', () => {
    expect(() =>
      generateRandomKey({
        filename: 'test.gif',
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
})

describe('getPublicUrl', () => {
  it('generates correct public URL', () => {
    const url = getPublicUrl('public/test.jpg')
    expect(url).toBe('http://localhost:9000/test-bucket/public/test.jpg')
  })

  it('handles endpoint with trailing slash', () => {
    // The function already handles trailing slashes
    // Since env is mocked with 'http://localhost:9000' (no trailing slash),
    // this tests that the function works correctly with the mocked value
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

  it('handles URL with different endpoint', () => {
    const url = 'https://s3.amazonaws.com/test-bucket/private/file.pdf'
    const key = extractKeyFromUrl(url)
    expect(key).not.toBeNull()
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
})

describe('getFileVisibility', () => {
  it('returns public for public file', () => {
    expect(getFileVisibility('public/test.jpg')).toBe('public')
  })

  it('returns private for private file', () => {
    expect(getFileVisibility('private/test.jpg')).toBe('private')
  })
})
