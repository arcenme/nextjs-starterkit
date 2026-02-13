import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

// Mock server-only first (must be before importing the action)
vi.mock('server-only', () => {
  return {}
})

// Mock other dependencies
const mockSignInEmail = vi.fn()
const mockRedirect = vi.fn()
const mockReturnValidationErrors = vi.fn()

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      signInEmail: (...args: unknown[]) => mockSignInEmail(...args),
    },
  },
}))

vi.mock('next/navigation', () => ({
  redirect: (url: string) => mockRedirect(url),
}))

const mockUse = vi.fn()

vi.mock('next-safe-action', () => ({
  returnValidationErrors: (...args: unknown[]) =>
    mockReturnValidationErrors(...args),
  createSafeActionClient: () => ({
    metadata: () => ({
      inputSchema: () => ({
        // biome-ignore lint/complexity/noBannedTypes: type for mock is not important
        action: (fn: Function) => fn,
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
    AUTH: {
      TWO_FACTOR: '/2fa',
    },
  },
}))

// Import after mocks
import { loginAction } from '@/features/auth/login/actions'

describe('loginAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls signInEmail with correct parameters', async () => {
    mockSignInEmail.mockResolvedValue({ token: 'abc123' })

    const input = {
      email: 'user@example.com',
      password: 'password123',
    }

    await loginAction(input)

    expect(mockSignInEmail).toHaveBeenCalledWith({
      body: {
        email: input.email,
        password: input.password,
        rememberMe: true,
        callbackURL: '/dashboard',
      },
    })
  })

  it('handles API errors gracefully', async () => {
    class APIError extends Error {
      constructor(message: string) {
        super(message)
        this.name = 'APIError'
      }
    }

    mockSignInEmail.mockRejectedValue(new APIError('Invalid credentials'))

    const input = {
      email: 'user@example.com',
      password: 'wrongpassword',
    }

    await loginAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalled()
  })

  it('returns validation errors for null response', async () => {
    mockSignInEmail.mockResolvedValue(null)

    const input = {
      email: 'user@example.com',
      password: 'password123',
    }

    await loginAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalledWith(expect.anything(), {
      _errors: ['Invalid credentials'],
    })
  })

  it('redirects to 2FA page when twoFactorRedirect is present', async () => {
    mockSignInEmail.mockResolvedValue({ twoFactorRedirect: true })

    const input = {
      email: 'user@example.com',
      password: 'password123',
    }

    await loginAction(input)

    expect(mockRedirect).toHaveBeenCalledWith('/2fa')
  })

  it('validates email format before processing', async () => {
    const invalidInput = {
      email: 'invalid-email',
      password: 'password123',
    }

    // The action should return validation errors for invalid email
    const result = await loginAction(invalidInput)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('email')
  })

  it('validates password length before processing', async () => {
    const invalidInput = {
      email: 'user@example.com',
      password: 'short',
    }

    // The action should return validation errors for short password
    const result = await loginAction(invalidInput)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('password')
  })
})
