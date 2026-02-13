'use server'
import 'server-only'

import { headers } from 'next/headers'
import { returnValidationErrors } from 'next-safe-action'
import { ROUTES } from '@/constants/routes'
import { MagicLinkSchema } from '@/features/auth/magic-link/types'
import { auth } from '@/lib/auth'
import { safeAction } from '@/lib/safe-action'

export const sendMagicLinkAction = safeAction
  .metadata({ actionName: 'sendMagicLink' })
  .inputSchema(MagicLinkSchema)
  .action(async ({ parsedInput }) => {
    const { email } = parsedInput

    await auth.api
      .signInMagicLink({
        headers: await headers(),
        body: {
          email,
          name: email.split('@')[0].replace(/\./g, ' '),
          callbackURL: ROUTES.REDIRECT_AFTER_SIGN_IN,
          newUserCallbackURL: ROUTES.ADMIN.SETTINGS.PROFILE,
          errorCallbackURL: ROUTES.AUTH.MAGIC_LINK,
        },
      })
      .catch((error) => {
        returnValidationErrors(MagicLinkSchema, {
          _errors: [error.message || 'Failed to process magic link'],
        })
      })

    return { success: true }
  })
