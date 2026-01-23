'use server'
import 'server-only'

import { APIError } from 'better-auth'
import { returnValidationErrors } from 'next-safe-action'
import { ROUTES } from '@/constants/routes'
import { LoginSchema } from '@/features/login/types'
import { auth } from '@/lib/auth'
import { safeAction } from '@/lib/safe-action'

export const loginAction = safeAction
  .metadata({ actionName: 'login' })
  .inputSchema(LoginSchema)
  .action(async ({ parsedInput }) => {
    const data = await auth.api
      .signInEmail({
        body: {
          email: parsedInput.email,
          password: parsedInput.password,
          rememberMe: true,
          callbackURL: ROUTES.REDIRECT_AFTER_SIGN_IN,
        },
      })
      .catch((error) => {
        if (error instanceof APIError) {
          returnValidationErrors(LoginSchema, {
            _errors: [error.message],
          })
        }
      })

    if (!data) {
      returnValidationErrors(LoginSchema, {
        _errors: ['Invalid credentials'],
      })
    }
  })
