import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

// Mock server-only first (must be before importing action)
vi.mock('server-only', () => {
  return {}
})

// Create mock references before using them
const mockSignInMagicLink = vi.fn()
const mockReturnValidationErrors = vi.fn()

// Mock external dependencies
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      signInMagicLink: (...args: unknown[]) => mockSignInMagicLink(...args),
    },
  },
}))

vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve({})),
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
    authAction: vi.fn(),
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
      MAGIC_LINK: '/auth/magic-link',
    },
  },
}))

// Import AFTER all mocks
import { sendMagicLinkAction } from '@/features/magic-link/actions'

describe('sendMagicLinkAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls signInMagicLink with correct parameters', async () => {
    mockSignInMagicLink.mockResolvedValue(undefined)

    const input = {
      email: 'john@example.com',
    }

    const result = await sendMagicLinkAction(input)

    expect(mockSignInMagicLink).toHaveBeenCalledWith({
      headers: {},
      body: {
        email: 'john@example.com',
        name: 'john',
        callbackURL: '/dashboard',
        newUserCallbackURL: '/admin/settings/profile',
        errorCallbackURL: '/auth/magic-link',
      },
    })
    expect(result).toEqual({ data: { success: true } })
  })

  it('extracts name from email correctly', async () => {
    mockSignInMagicLink.mockResolvedValue(undefined)

    const input = {
      email: 'john.doe@example.com',
    }

    await sendMagicLinkAction(input)

    expect(mockSignInMagicLink).toHaveBeenCalledWith({
      headers: {},
      body: expect.objectContaining({
        email: 'john.doe@example.com',
        name: 'john doe', // Should replace dots with spaces
      }),
    })
  })

  it('handles email with single word before @', async () => {
    mockSignInMagicLink.mockResolvedValue(undefined)

    const input = {
      email: 'simple@example.com',
    }

    await sendMagicLinkAction(input)

    expect(mockSignInMagicLink).toHaveBeenCalledWith({
      headers: {},
      body: expect.objectContaining({
        email: 'simple@example.com',
        name: 'simple',
      }),
    })
  })

  it('handles API errors gracefully', async () => {
    const error = new Error('Failed to send magic link')
    mockSignInMagicLink.mockRejectedValue(error)

    const input = {
      email: 'john@example.com',
    }

    await sendMagicLinkAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalledWith(expect.anything(), {
      _errors: ['Failed to send magic link'],
    })
  })

  it('handles errors without message', async () => {
    const error = new Error()
    mockSignInMagicLink.mockRejectedValue(error)

    const input = {
      email: 'john@example.com',
    }

    await sendMagicLinkAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalledWith(expect.anything(), {
      _errors: ['Failed to process magic link'],
    })
  })

  it('validates email format before processing', async () => {
    const invalidInput = {
      email: 'invalid-email',
    }

    // The action should return validation errors for invalid email
    const result = await sendMagicLinkAction(invalidInput)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('email')
  })

  it('validates email presence before processing', async () => {
    const invalidInput = {
      email: '',
    }

    // The action should return validation errors for empty email
    const result = await sendMagicLinkAction(invalidInput)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('email')
  })

  it('returns success object on successful magic link send', async () => {
    mockSignInMagicLink.mockResolvedValue(undefined)

    const input = {
      email: 'test@example.com',
    }

    const result = await sendMagicLinkAction(input)
    expect(result).toEqual({ data: { success: true } })
  })
})
