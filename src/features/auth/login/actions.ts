'use server'
import 'server-only'

import { APIError } from 'better-auth'
import { redirect } from 'next/navigation'
import { returnValidationErrors } from 'next-safe-action'
import { ROUTES } from '@/constants/routes'
import { LoginSchema } from '@/features/auth/login/types'
import { auth } from '@/lib/auth'
import { safeAction } from '@/lib/safe-action'

export const loginAction = safeAction
  .metadata({ actionName: 'login' })
  .inputSchema(LoginSchema)
  .action(async ({ parsedInput }) => {
    const response = await auth.api
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
          return returnValidationErrors(LoginSchema, {
            _errors: [error.message],
          })
        }
      })

    if (!response) {
      return returnValidationErrors(LoginSchema, {
        _errors: ['Invalid credentials'],
      })
    }

    if ('twoFactorRedirect' in response) {
      redirect(ROUTES.AUTH.TWO_FACTOR)
    }
  })
