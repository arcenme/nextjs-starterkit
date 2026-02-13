import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

vi.mock('server-only', () => ({}))

// Mock better-auth APIError
vi.mock('better-auth', () => ({
  APIError: class APIError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'APIError'
    }
  },
}))

const mockReturnValidationErrors = vi.fn()

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      revokeSession: vi.fn() as unknown as ReturnType<typeof vi.fn>,
      revokeOtherSessions: vi.fn() as unknown as ReturnType<typeof vi.fn>,
      verifyPassword: vi.fn() as unknown as ReturnType<typeof vi.fn>,
    },
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
        return next({ ctx: { user: { id: '1' } } })
      }),
  }
})

import { APIError } from 'better-auth'
import {
  revokeOtherSessionsAction,
  revokeSessionAction,
} from '@/features/admin/settings/session-management/actions'

describe('revokeSessionAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('revokes session successfully', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.revokeSession as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      status: 'ok',
    })

    const input = {
      token: 'abc123defghijklmnop',
    }

    const result = await revokeSessionAction(input)

    expect(result).toEqual({ data: { success: true } })
    expect(auth.api.revokeSession).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          token: input.token,
        }),
      })
    )
  })

  it('handles APIError and returns validation errors', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.revokeSession as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new APIError('Session not found'))

    const input = {
      token: 'invalid-token',
    }

    await revokeSessionAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalledWith(expect.anything(), {
      _errors: ['Session not found'],
    })
  })

  it('handles generic errors silently', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.revokeSession as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('Network error'))

    const input = {
      token: 'abc123defghijklmnop',
    }

    const result = await revokeSessionAction(input)

    // Should not throw, returns success even on error
    expect(result).toEqual({ data: { success: true } })
    expect(mockReturnValidationErrors).not.toHaveBeenCalled()
  })

  it('handles APIError with fallback message', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.revokeSession as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new APIError(''))

    const input = {
      token: 'abc123defghijklmnop',
    }

    await revokeSessionAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalledWith(expect.anything(), {
      _errors: ['Failed to revoke session'],
    })
  })

  it('validates empty token', async () => {
    const input = {
      token: '',
    }

    const result = await revokeSessionAction(input)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('token')
  })

  it('validates token format', async () => {
    const input = {
      token: 'invalid token!',
    }

    const result = await revokeSessionAction(input)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('token')
  })
})

describe('revokeOtherSessionsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('revokes other sessions successfully', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.verifyPassword as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      status: true,
    })
    ;(
      auth.api.revokeOtherSessions as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      status: 'ok',
    })

    const input = {
      password: 'Password123!',
    }

    const result = await revokeOtherSessionsAction(input)

    expect(result).toEqual({ data: { success: true } })
    expect(auth.api.verifyPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          password: input.password,
        }),
      })
    )
    expect(auth.api.revokeOtherSessions).toHaveBeenCalled()
  })

  describe('verifyPassword error handling', () => {
    it('handles APIError from verifyPassword', async () => {
      const { auth } = await import('@/lib/auth')
      ;(
        auth.api.verifyPassword as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new APIError('Invalid password'))

      const input = {
        password: 'wrongpassword',
      }

      await revokeOtherSessionsAction(input)

      expect(mockReturnValidationErrors).toHaveBeenCalledWith(
        expect.anything(),
        {
          password: {
            _errors: ['Invalid password'],
          },
        }
      )
    })

    it('handles APIError from verifyPassword with fallback message', async () => {
      const { auth } = await import('@/lib/auth')
      ;(
        auth.api.verifyPassword as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new APIError(''))

      const input = {
        password: 'wrongpassword',
      }

      await revokeOtherSessionsAction(input)

      expect(mockReturnValidationErrors).toHaveBeenCalledWith(
        expect.anything(),
        {
          password: {
            _errors: ['Failed to verify password'],
          },
        }
      )
    })

    it('handles generic error from verifyPassword', async () => {
      const { auth } = await import('@/lib/auth')
      ;(
        auth.api.verifyPassword as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('Network error'))

      const input = {
        password: 'Password123!',
      }

      await revokeOtherSessionsAction(input)

      // Generic errors trigger the fallback validation error
      expect(mockReturnValidationErrors).toHaveBeenCalledWith(
        expect.anything(),
        {
          _errors: ['Failed to verify password'],
        }
      )
    })
  })

  describe('revokeOtherSessions error handling', () => {
    it('handles APIError from revokeOtherSessions', async () => {
      const { auth } = await import('@/lib/auth')
      ;(
        auth.api.verifyPassword as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ status: true })
      ;(
        auth.api.revokeOtherSessions as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new APIError('Failed to revoke sessions'))

      const input = {
        password: 'Password123!',
      }

      await revokeOtherSessionsAction(input)

      expect(mockReturnValidationErrors).toHaveBeenCalledWith(
        expect.anything(),
        {
          _errors: ['Failed to revoke sessions'],
        }
      )
    })

    it('handles APIError from revokeOtherSessions with fallback message', async () => {
      const { auth } = await import('@/lib/auth')
      ;(
        auth.api.verifyPassword as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ status: true })
      ;(
        auth.api.revokeOtherSessions as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new APIError(''))

      const input = {
        password: 'Password123!',
      }

      await revokeOtherSessionsAction(input)

      expect(mockReturnValidationErrors).toHaveBeenCalledWith(
        expect.anything(),
        {
          _errors: ['Failed to revoke sessions'],
        }
      )
    })

    it('handles generic error from revokeOtherSessions silently', async () => {
      const { auth } = await import('@/lib/auth')
      ;(
        auth.api.verifyPassword as unknown as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ status: true })
      ;(
        auth.api.revokeOtherSessions as unknown as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('Network error'))

      const input = {
        password: 'Password123!',
      }

      const result = await revokeOtherSessionsAction(input)

      // Should return success even on error
      expect(result).toEqual({ data: { success: true } })
      // Generic errors don't trigger validation errors
      expect(mockReturnValidationErrors).not.toHaveBeenCalled()
    })
  })

  it('validates empty password', async () => {
    const input = {
      password: '',
    }

    const result = await revokeOtherSessionsAction(input)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('password')
  })

  it('validates password too long', async () => {
    const input = {
      password: 'a'.repeat(129),
    }

    const result = await revokeOtherSessionsAction(input)
    expect(result).toHaveProperty('validationErrors')
    expect(result.validationErrors).toHaveProperty('password')
  })
})
