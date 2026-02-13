import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

vi.mock('server-only', () => ({}))

const mockReturnValidationErrors = vi.fn()

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      updateUser: vi.fn() as ReturnType<typeof vi.fn>,
      changeEmail: vi.fn() as ReturnType<typeof vi.fn>,
    },
  },
}))

const mockValidateFile = vi.fn()
const mockGenerateRandomKey = vi.fn()
const mockGeneratePresignedUrl = vi.fn()
const mockGetPublicUrl = vi.fn()
const mockExtractKeyFromUrl = vi.fn()
const mockDeleteObject = vi.fn()

vi.mock('@/lib/storage', () => {
  class StorageError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'StorageError'
    }
  }
  return {
    validateFile: (...args: unknown[]) => mockValidateFile(...args),
    generateRandomKey: (...args: unknown[]) => mockGenerateRandomKey(...args),
    generatePresignedUrl: (...args: unknown[]) =>
      mockGeneratePresignedUrl(...args),
    getPublicUrl: (...args: unknown[]) => mockGetPublicUrl(...args),
    extractKeyFromUrl: (...args: unknown[]) => mockExtractKeyFromUrl(...args),
    deleteObject: (...args: unknown[]) => mockDeleteObject(...args),
    StorageError,
  }
})

vi.mock('@/constants/routes', () => ({
  ROUTES: {
    REDIRECT_AFTER_SIGN_IN: '/dashboard',
    ADMIN: {
      SETTINGS: {
        PROFILE: '/admin/settings/profile',
      },
    },
    AUTH: {
      EMAIL_VERIFIED: '/email-verified',
    },
  },
}))

vi.mock('@/constants/storage', () => ({
  IMAGE_CONFIG: {
    maxSize: 5000000,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

const mockUse = vi.fn()

vi.mock('next-safe-action', () => ({
  returnValidationErrors: (...args: unknown[]) =>
    mockReturnValidationErrors(...args),
  createSafeActionClient: () => ({
    metadata: () => ({
      inputSchema: () => ({
        action: (fn: (...args: unknown[]) => unknown) => fn,
      }),
    }),
    use: (...args: unknown[]) => mockUse(...args),
  }),
}))

// Track user context for testing different scenarios
let mockUserImage: string | null = null

vi.mock('@/lib/safe-action', async () => {
  const actual =
    await vi.importActual<typeof import('next-safe-action')>('next-safe-action')
  return {
    safeAction: actual.createSafeActionClient({
      defineMetadataSchema() {
        return z.object({
          actionName: z.string().trim(),
        })
      },
    }),
    authAction: actual
      .createSafeActionClient({
        defineMetadataSchema() {
          return z.object({
            actionName: z.string().trim(),
          })
        },
      })
      .use(async ({ next }) => {
        return next({ ctx: { user: { id: '1', image: mockUserImage } } })
      }),
  }
})

// Mock better-auth APIError
vi.mock('better-auth', () => ({
  APIError: class APIError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'APIError'
    }
  },
}))

import { APIError } from 'better-auth'
import {
  changeEmailAction,
  generateAvatarPresignedUrlAction,
  updateProfileAction,
} from '@/features/admin/settings/profile/actions'
import { StorageError } from '@/lib/storage'

describe('generateAvatarPresignedUrlAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockValidateFile.mockImplementation(() => {}) // Success by default
    mockGenerateRandomKey.mockReturnValue('avatars/1/random-key.png')
    mockGeneratePresignedUrl.mockResolvedValue('https://presigned.url')
    mockGetPublicUrl.mockReturnValue('https://public.url')
  })

  it('generates presigned URL with correct parameters', async () => {
    const input = {
      filename: 'avatar.png',
      fileType: 'image/png',
      fileSize: 1024,
      checksum: 'n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=',
    }

    const result = await generateAvatarPresignedUrlAction(input)

    expect(result.data).toEqual({
      presignedUrl: 'https://presigned.url',
      key: 'avatars/1/random-key.png',
      publicUrl: 'https://public.url',
    })
    expect(mockValidateFile).toHaveBeenCalledWith({
      filename: input.filename,
      mimeType: input.fileType,
      fileSize: input.fileSize,
      config: expect.anything(),
    })
    expect(mockGenerateRandomKey).toHaveBeenCalledWith({
      filename: input.filename,
      visibility: 'public',
      path: 'avatars/1',
      config: expect.anything(),
    })
  })

  it('handles StorageError from validateFile', async () => {
    mockValidateFile.mockImplementation(() => {
      throw new StorageError('Invalid file type')
    })

    const input = {
      filename: 'avatar.exe',
      fileType: 'application/exe',
      fileSize: 1024,
      checksum: 'n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=',
    }

    await generateAvatarPresignedUrlAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalledWith(expect.anything(), {
      _errors: ['Invalid file type'],
    })
  })

  it('handles StorageError from generatePresignedUrl', async () => {
    mockGeneratePresignedUrl.mockRejectedValue(
      new StorageError('Failed to generate URL')
    )

    const input = {
      filename: 'avatar.png',
      fileType: 'image/png',
      fileSize: 1024,
      checksum: 'n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=',
    }

    await generateAvatarPresignedUrlAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalledWith(expect.anything(), {
      _errors: ['Failed to generate URL'],
    })
  })

  it('handles generic errors silently', async () => {
    mockValidateFile.mockImplementation(() => {
      throw new Error('Unexpected error')
    })

    const input = {
      filename: 'avatar.png',
      fileType: 'image/png',
      fileSize: 1024,
      checksum: 'n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=',
    }

    await generateAvatarPresignedUrlAction(input)

    // Generic errors don't trigger validation errors
    expect(mockReturnValidationErrors).not.toHaveBeenCalled()
  })

  it('validates empty filename', async () => {
    const input = {
      filename: '',
      fileType: 'image/png',
      fileSize: 1024,
      checksum: 'n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=',
    }

    const result = await generateAvatarPresignedUrlAction(input)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('filename')
  })

  it('validates empty fileType', async () => {
    const input = {
      filename: 'avatar.png',
      fileType: '',
      fileSize: 1024,
      checksum: 'n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=',
    }

    const result = await generateAvatarPresignedUrlAction(input)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('fileType')
  })

  it('validates empty checksum', async () => {
    const input = {
      filename: 'avatar.png',
      fileType: 'image/png',
      fileSize: 1024,
      checksum: '',
    }

    const result = await generateAvatarPresignedUrlAction(input)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('checksum')
  })
})

describe('updateProfileAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUserImage = null // Reset to null by default
    mockExtractKeyFromUrl.mockReturnValue('avatars/1/old-key.png')
    mockDeleteObject.mockResolvedValue(undefined)
  })

  it('updates user profile successfully', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.updateUser as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      status: 'ok',
    })

    const input = {
      name: 'John Doe',
      imageUrl: 'https://example.com/new-avatar.png',
    }

    const result = await updateProfileAction(input)

    expect(result).toEqual({ data: { success: true } })
    expect(auth.api.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          name: input.name,
          image: input.imageUrl,
        }),
      })
    )
  })

  it('updates profile with empty imageUrl', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.updateUser as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      status: 'ok',
    })

    const input = {
      name: 'John Doe',
      imageUrl: '',
    }

    const result = await updateProfileAction(input)

    expect(result).toEqual({ data: { success: true } })
    expect(auth.api.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          name: input.name,
          image: '',
        }),
      })
    )
  })

  it('deletes old avatar when new one is different', async () => {
    mockUserImage = 'https://example.com/old-avatar.png'
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.updateUser as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      status: 'ok',
    })

    const input = {
      name: 'John Doe',
      imageUrl: 'https://example.com/new-avatar.png',
    }

    await updateProfileAction(input)

    expect(mockExtractKeyFromUrl).toHaveBeenCalledWith(mockUserImage)
    expect(mockDeleteObject).toHaveBeenCalledWith({
      key: 'avatars/1/old-key.png',
    })
  })

  it('does not delete avatar when image unchanged', async () => {
    mockUserImage = 'https://example.com/same-avatar.png'
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.updateUser as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      status: 'ok',
    })

    const input = {
      name: 'John Doe',
      imageUrl: 'https://example.com/same-avatar.png',
    }

    await updateProfileAction(input)

    expect(mockExtractKeyFromUrl).not.toHaveBeenCalled()
    expect(mockDeleteObject).not.toHaveBeenCalled()
  })

  it('does not delete avatar when user has no previous image', async () => {
    mockUserImage = null
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.updateUser as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      status: 'ok',
    })

    const input = {
      name: 'John Doe',
      imageUrl: 'https://example.com/new-avatar.png',
    }

    await updateProfileAction(input)

    expect(mockExtractKeyFromUrl).not.toHaveBeenCalled()
    expect(mockDeleteObject).not.toHaveBeenCalled()
  })

  it('handles APIError from updateUser', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.updateUser as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(
      // @ts-expect-error - APIError constructor typing issue
      new APIError('Failed to update profile')
    )

    const input = {
      name: 'John Doe',
      imageUrl: 'https://example.com/avatar.png',
    }

    await updateProfileAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalledWith(expect.anything(), {
      _errors: ['Failed to update profile'],
    })
  })

  it('handles generic errors from updateUser silently', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.updateUser as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('Network error'))

    const input = {
      name: 'John Doe',
      imageUrl: 'https://example.com/avatar.png',
    }

    await updateProfileAction(input)

    // Generic errors don't trigger validation errors
    expect(mockReturnValidationErrors).not.toHaveBeenCalled()
  })

  it('validates empty name', async () => {
    const input = {
      name: '',
      imageUrl: 'https://example.com/avatar.png',
    }

    const result = await updateProfileAction(input)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('name')
  })

  it('validates name too long', async () => {
    const input = {
      name: 'a'.repeat(126),
      imageUrl: 'https://example.com/avatar.png',
    }

    const result = await updateProfileAction(input)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('name')
  })
})

describe('changeEmailAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('changes email successfully', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.changeEmail as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      status: 'ok',
    })

    const input = {
      email: 'newemail@example.com',
    }

    await changeEmailAction(input)

    expect(auth.api.changeEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          newEmail: input.email,
          callbackURL: '/email-verified',
        }),
      })
    )
  })

  it('handles APIError from changeEmail', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.changeEmail as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(
      // @ts-expect-error - APIError constructor typing issue
      new APIError('Email already in use')
    )

    const input = {
      email: 'existing@example.com',
    }

    await changeEmailAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalledWith(expect.anything(), {
      email: {
        _errors: ['Email already in use'],
      },
    })
  })

  it('handles generic errors from changeEmail silently', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.changeEmail as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('Network error'))

    const input = {
      email: 'test@example.com',
    }

    await changeEmailAction(input)

    // Generic errors don't trigger validation errors
    expect(mockReturnValidationErrors).not.toHaveBeenCalled()
  })

  it('validates invalid email format', async () => {
    const input = {
      email: 'invalid-email',
    }

    const result = await changeEmailAction(input)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('email')
  })

  it('validates empty email', async () => {
    const input = {
      email: '',
    }

    const result = await changeEmailAction(input)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('email')
  })
})
