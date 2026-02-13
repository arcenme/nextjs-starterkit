import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

vi.mock('server-only', () => ({}))

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

  it('validates empty token', async () => {
    const input = {
      token: '',
    }

    const result = await revokeSessionAction(input)
    expect(result).toHaveProperty('validationErrors')
  })

  it('validates token format', async () => {
    const input = {
      token: 'invalid token!',
    }

    const result = await revokeSessionAction(input)
    expect(result).toHaveProperty('validationErrors')
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

  it('validates empty password', async () => {
    const input = {
      password: '',
    }

    const result = await revokeOtherSessionsAction(input)
    expect(result).toHaveProperty('validationErrors')
  })
})
