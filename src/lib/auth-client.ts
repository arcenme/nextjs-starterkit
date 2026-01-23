import { createAuthClient } from 'better-auth/react'
import { env } from '@/lib/env-client'

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
})

export type Session = typeof authClient.$Infer.Session
