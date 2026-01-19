import 'server-only'

import { headers } from 'next/headers'
import { createSafeActionClient } from 'next-safe-action'
import { z } from 'zod'
import { auth } from '@/lib/auth'

export const safeAction = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string().trim(),
    })
  },
  handleServerError(e, { metadata }) {
    console.log(`Action error(${metadata.actionName}):`, e.message)

    return 'Oh no, something went wrong!'
  },
})

export const authAction = safeAction.use(async ({ next }) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    throw new Error('Unauthorized')
  }
  return next({ ctx: { user: session.user } })
})
