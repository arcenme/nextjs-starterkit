'use server'
import 'server-only'

import { APIError } from 'better-auth'
import { returnValidationErrors } from 'next-safe-action'
import { ResetPasswordSchema } from '@/features/reset-password/types'
import { auth } from '@/lib/auth'
import { safeAction } from '@/lib/safe-action'

export const resetPasswordAction = safeAction
  .metadata({ actionName: 'resetPassword' })
  .inputSchema(ResetPasswordSchema)
  .action(async ({ parsedInput }) => {
    await auth.api
      .resetPassword({
        body: {
          newPassword: parsedInput.newPassword,
          token: parsedInput.token,
        },
      })
      .catch((error) => {
        if (error instanceof APIError) {
          returnValidationErrors(ResetPasswordSchema, {
            _errors: [error.message],
          })
        }
      })
  })
