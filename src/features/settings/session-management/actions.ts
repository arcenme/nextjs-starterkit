'use server'
import 'server-only'

import { APIError } from 'better-auth'
import { headers } from 'next/headers'
import { returnValidationErrors } from 'next-safe-action'
import {
  RevokeOtherSessionsSchema,
  RevokeSessionSchema,
} from '@/features/settings/session-management/types'
import { auth } from '@/lib/auth'
import { authAction } from '@/lib/safe-action'

export const revokeSessionAction = authAction
  .metadata({ actionName: 'revokeSession' })
  .inputSchema(RevokeSessionSchema)
  .action(async ({ parsedInput }) => {
    await auth.api
      .revokeSession({
        headers: await headers(),
        body: { token: parsedInput.token },
      })
      .catch((error) => {
        if (error instanceof APIError) {
          returnValidationErrors(RevokeSessionSchema, {
            _errors: [error.message || 'Failed to revoke session'],
          })
        }
      })

    return { success: true }
  })

export const revokeOtherSessionsAction = authAction
  .metadata({ actionName: 'revokeOtherSessions' })
  .inputSchema(RevokeOtherSessionsSchema)
  .action(async ({ parsedInput }) => {
    // Verify password
    await auth.api
      .verifyPassword({
        headers: await headers(),
        body: { password: parsedInput.password },
      })
      .catch((error) => {
        if (error instanceof APIError) {
          returnValidationErrors(RevokeOtherSessionsSchema, {
            password: {
              _errors: [error.message || 'Failed to verify password'],
            },
          })
        }

        returnValidationErrors(RevokeOtherSessionsSchema, {
          _errors: ['Failed to verify password'],
        })
      })

    // Revoke all other sessions
    await auth.api
      .revokeOtherSessions({
        headers: await headers(),
      })
      .catch((error) => {
        if (error instanceof APIError) {
          returnValidationErrors(RevokeOtherSessionsSchema, {
            _errors: [error.message || 'Failed to revoke sessions'],
          })
        }
      })

    return { success: true }
  })
