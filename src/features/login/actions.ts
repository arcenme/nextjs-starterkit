'use server'
import 'server-only'

import { APIError } from 'better-auth'
import { redirect } from 'next/navigation'
import { returnValidationErrors } from 'next-safe-action'
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

    redirect('/dashboard')
  })
