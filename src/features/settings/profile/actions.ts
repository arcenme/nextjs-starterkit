'use server'
import 'server-only'

import { APIError } from 'better-auth'
import { headers } from 'next/headers'
import { returnValidationErrors } from 'next-safe-action'
import {
  ChangeEmailSchema,
  UpdateProfileSchema,
} from '@/features/settings/profile/types'
import { auth } from '@/lib/auth'
import { authAction } from '@/lib/safe-action'

export const updateProfileAction = authAction
  .metadata({ actionName: 'updateProfile' })
  .inputSchema(UpdateProfileSchema)
  .action(async ({ parsedInput }) => {
    await auth.api
      .updateUser({
        headers: await headers(),
        body: {
          name: parsedInput.name,
          image: parsedInput.image ?? null,
        },
      })
      .catch((error) => {
        if (error instanceof APIError) {
          returnValidationErrors(UpdateProfileSchema, {
            _errors: [error.message],
          })
        }
      })
  })

export const changeEmailAction = authAction
  .metadata({ actionName: 'changeEmail' })
  .inputSchema(ChangeEmailSchema)
  .action(async ({ parsedInput }) => {
    await auth.api
      .changeEmail({
        headers: await headers(),
        body: {
          newEmail: parsedInput.email,
          callbackURL: '/email-verified',
        },
      })
      .catch((error) => {
        if (error instanceof APIError) {
          returnValidationErrors(ChangeEmailSchema, {
            email: { _errors: [error.message] },
          })
        }
      })
  })
