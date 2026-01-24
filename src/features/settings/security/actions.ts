'use server'
import 'server-only'

import { APIError } from 'better-auth'
import { headers } from 'next/headers'
import { returnValidationErrors } from 'next-safe-action'
import { UpdatePasswordSchema } from '@/features/settings/security/types'
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
