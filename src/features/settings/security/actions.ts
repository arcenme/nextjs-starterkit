'use server'
import 'server-only'

import { APIError } from 'better-auth'
import { headers } from 'next/headers'
import { returnValidationErrors } from 'next-safe-action'
import {
  TwoFactorPasswordSchema,
  UpdatePasswordSchema,
} from '@/features/settings/security/types'
import { auth } from '@/lib/auth'
import { authAction } from '@/lib/safe-action'

export const updatePasswordAction = authAction
  .metadata({ actionName: 'updatePassword' })
  .inputSchema(UpdatePasswordSchema)
  .action(async ({ parsedInput }) => {
    await auth.api
      .changePassword({
        headers: await headers(),
        body: {
          currentPassword: parsedInput.currentPassword,
          newPassword: parsedInput.newPassword,
          revokeOtherSessions: parsedInput.revokeOtherSessions,
        },
      })
      .catch((error) => {
        if (error instanceof APIError) {
          if (error.body?.code === 'INVALID_PASSWORD') {
            returnValidationErrors(UpdatePasswordSchema, {
              currentPassword: { _errors: ['Current password is incorrect'] },
            })
          }

          returnValidationErrors(UpdatePasswordSchema, {
            _errors: [error.message || 'Failed to update password'],
          })
        }
      })
  })

export const viewBackupCodesAction = authAction
  .metadata({ actionName: 'viewBackupCodes' })
  .inputSchema(TwoFactorPasswordSchema)
  .action(async ({ parsedInput, ctx }) => {
    try {
      const verifyUser = await auth.api.verifyPassword({
        headers: await headers(),
        body: {
          password: parsedInput.password,
        },
      })

      if (!verifyUser.status) {
        returnValidationErrors(TwoFactorPasswordSchema, {
          password: { _errors: ['Unable to verify password'] },
        })
      }

      const response = await auth.api.viewBackupCodes({
        headers: await headers(),
        body: { userId: ctx.user.id },
      })

      if (!response.status || response.backupCodes.length === 0) {
        returnValidationErrors(TwoFactorPasswordSchema, {
          _errors: ['No backup codes found'],
        })
      }

      return { backupCodes: response.backupCodes }
    } catch (error) {
      if (error instanceof APIError) {
        if (error.body?.code === 'INVALID_PASSWORD') {
          returnValidationErrors(TwoFactorPasswordSchema, {
            password: { _errors: ['Current password is incorrect'] },
          })
        }

        returnValidationErrors(TwoFactorPasswordSchema, {
          _errors: [error.message || 'Failed to retrieve backup codes'],
        })
      }
    }
  })
