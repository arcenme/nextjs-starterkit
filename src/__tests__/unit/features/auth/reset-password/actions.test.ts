import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

// Mock server-only first (must be before importing the action)
vi.mock('server-only', () => {
  return {}
})

vi.mock('better-auth', () => {
  class APIError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'APIError'
    }
  }
  return { APIError }
})

// Mock dependencies
const mockResetPassword = vi.fn()
const mockReturnValidationErrors = vi.fn()

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      resetPassword: (...args: unknown[]) => mockResetPassword(...args),
    },
  },
}))

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

// Import after mocks
import { APIError } from 'better-auth'
import { resetPasswordAction } from '@/features/auth/reset-password/actions'

describe('resetPasswordAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls resetPassword API with correct parameters', async () => {
    mockResetPassword.mockResolvedValue({ success: true })

    const input = {
      newPassword: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      token: 'valid-reset-token',
    }

    await resetPasswordAction(input)

    expect(mockResetPassword).toHaveBeenCalledWith({
      body: {
        newPassword: input.newPassword,
        token: input.token,
      },
    })
  })

  it('handles API errors and returns validation errors', async () => {
    mockResetPassword.mockRejectedValue(
      // @ts-expect-error - APIError constructor typing issue
      new APIError('Invalid or expired token')
    )

    const input = {
      newPassword: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      token: 'invalid-token',
    }

    await resetPasswordAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalledWith(expect.anything(), {
      _errors: ['Invalid or expired token'],
    })
  })

  it('handles generic errors gracefully', async () => {
    mockResetPassword.mockRejectedValue(new Error('Network error'))

    const input = {
      newPassword: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      token: 'valid-token',
    }

    await resetPasswordAction(input)

    // Should not throw, error is caught
    expect(mockReturnValidationErrors).not.toHaveBeenCalled()
  })

  it('validates newPassword is required', async () => {
    const input = {
      newPassword: '',
      confirmPassword: '',
      token: 'valid-token',
    }

    const result = await resetPasswordAction(input)

    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('newPassword')
  })

  it('validates token is required', async () => {
    const input = {
      newPassword: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      token: '',
    }

    const result = await resetPasswordAction(input)

    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('token')
  })

  it('validates password confirmation matches', async () => {
    const input = {
      newPassword: 'SecurePass123!',
      confirmPassword: 'DifferentPass456!',
      token: 'valid-token',
    }

    const result = await resetPasswordAction(input)

    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('confirmPassword')
  })
})
