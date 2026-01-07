import 'server-only'

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/db'
import { env } from '@/env/server'
import { sendEmail } from '@/lib/email'
import { hashPassword, verifyPassword } from '@/lib/password'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
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
    sendResetPassword: async ({ user, url, token }) => {
      void sendEmail({
        to: user.email,
        subject: 'Reset your password',
        body: `Reset your password by visiting ${url}?token=${token}`,
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    expiresIn: 30 * 60, // 30 minutes
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      void sendEmail({
        to: user.email,
        subject: 'Verify your email',
        body: `Verify your email by visiting ${url}?token=${token}`,
      })
    },
  },
  advanced: {
    cookiePrefix: env.BETTER_AUTH_COOKIE_PREFIX,
  },
  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
