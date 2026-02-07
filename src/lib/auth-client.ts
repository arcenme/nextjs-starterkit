import { magicLinkClient, twoFactorClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { ROUTES } from '@/constants/routes'
import { env } from '@/lib/env-client'

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    magicLinkClient(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        window.location.href = ROUTES.AUTH.TWO_FACTOR
      },
    }),
  ],
})

export type Session = typeof authClient.$Infer.Session
