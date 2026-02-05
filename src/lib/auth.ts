import 'server-only'

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { twoFactor } from 'better-auth/plugins'
import { AUTH_COOKIE_NAME } from '@/constants/common'
import { db } from '@/db'
import { sendEmail } from '@/lib/email'
import { env as envClient } from '@/lib/env-client'
import { hashPassword, verifyPassword } from '@/lib/password'

export const auth = betterAuth({
  appName: envClient.NEXT_PUBLIC_APP_NAME,
  baseURL: envClient.NEXT_PUBLIC_BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: false,
    resetPasswordTokenExpiresIn: 15 * 60, // 15 minutes
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: 'Reset your password',
        body: `Reset your password by visiting ${url}`,
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    expiresIn: 30 * 60, // 30 minutes
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: 'Verify your email',
        body: `Click the link to verify your email: ${url}`,
      })
    },
  },
  advanced: {
    cookiePrefix: AUTH_COOKIE_NAME,
  },
  plugins: [twoFactor(), nextCookies()],
})

export type Session = typeof auth.$Infer.Session
