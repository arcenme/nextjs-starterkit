import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

vi.mock('server-only', () => ({}))

const mockReturnValidationErrors = vi.fn()

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      changePassword: vi.fn() as unknown as ReturnType<typeof vi.fn>,
      verifyPassword: vi.fn() as unknown as ReturnType<typeof vi.fn>,
      viewBackupCodes: vi.fn() as unknown as ReturnType<typeof vi.fn>,
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
  updatePasswordAction,
  viewBackupCodesAction,
} from '@/features/admin/settings/security/actions'

describe('updatePasswordAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates password successfully', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.changePassword as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      status: 'ok',
    })

    const input = {
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
      currentPassword: 'OldPassword123!',
      revokeOtherSessions: false,
    }

    await updatePasswordAction(input)

    expect(auth.api.changePassword).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          currentPassword: input.currentPassword,
          newPassword: input.newPassword,
          revokeOtherSessions: input.revokeOtherSessions,
        }),
      })
    )
  })

  it('handles generic API error', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.changePassword as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(
      new APIError('BAD_REQUEST' as never, 'Failed to update password' as never)
    )

    const input = {
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
      currentPassword: 'OldPassword123!',
      revokeOtherSessions: false,
    }

    await updatePasswordAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalled()
  })

  it('validates empty current password', async () => {
    const input = {
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
      currentPassword: '',
      revokeOtherSessions: false,
    }

    const result = await updatePasswordAction(input)
    expect(result).toHaveProperty('validationErrors')
  })

  it('validates mismatched passwords', async () => {
    const input = {
      newPassword: 'NewPassword123!',
      confirmPassword: 'DifferentPassword123!',
      currentPassword: 'OldPassword123!',
      revokeOtherSessions: false,
    }

    const result = await updatePasswordAction(input)
    expect(result).toHaveProperty('validationErrors')
  })
})

describe('viewBackupCodesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retrieves backup codes successfully', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.verifyPassword as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      status: true,
    })
    ;(
      auth.api.viewBackupCodes as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      status: true,
      backupCodes: ['code1', 'code2', 'code3'],
    })

    const input = {
      password: 'Password123!',
    }

    const result = await viewBackupCodesAction(input)

    expect(result).toHaveProperty('data')
    expect(result.data).toHaveProperty('backupCodes')
  })

  it('returns error when password verification fails', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.verifyPassword as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      status: false,
    })

    const input = {
      password: 'WrongPassword123!',
    }

    await viewBackupCodesAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        password: expect.objectContaining({
          _errors: ['Unable to verify password'],
        }),
      })
    )
  })

  it('returns error when no backup codes found', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.verifyPassword as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      status: true,
    })
    ;(
      auth.api.viewBackupCodes as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      status: true,
      backupCodes: [],
    })

    const input = {
      password: 'Password123!',
    }

    await viewBackupCodesAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        _errors: ['No backup codes found'],
      })
    )
  })

  it('handles API errors gracefully', async () => {
    const { auth } = await import('@/lib/auth')
    ;(
      auth.api.verifyPassword as unknown as ReturnType<typeof vi.fn>
    ).mockRejectedValue(
      new APIError('BAD_REQUEST' as never, 'Verification failed' as never)
    )

    const input = {
      password: 'Password123!',
    }

    await viewBackupCodesAction(input)

    expect(mockReturnValidationErrors).toHaveBeenCalled()
  })

  it('validates empty password', async () => {
    const input = {
      password: '',
    }

    const result = await viewBackupCodesAction(input)
    expect(result).toHaveProperty('validationErrors')
  })
})
