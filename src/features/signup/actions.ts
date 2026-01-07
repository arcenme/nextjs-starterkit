'use server'
import 'server-only'

import { APIError } from 'better-auth'
import { returnValidationErrors } from 'next-safe-action'
import { SignUpSchema } from '@/features/signup/types'
import { auth } from '@/lib/auth'
import { safeAction } from '@/lib/safe-action'

export const signUpAction = safeAction
  .metadata({ actionName: 'signUp' })
  .inputSchema(SignUpSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api
      .signUpEmail({
        body: {
          name: parsedInput.name,
          email: parsedInput.email,
          password: parsedInput.password,
          callbackURL: '/admin/dashboard',
        },
      })
      .catch((error) => {
        if (error instanceof APIError) {
          returnValidationErrors(SignUpSchema, {
            _errors: [error.message],
          })
        }
      })

    if (!session) {
      returnValidationErrors(SignUpSchema, {
        _errors: ['Invalid credentials'],
      })
    }
  })
