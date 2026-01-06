import 'server-only'

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'

import { db } from '@/db'
import { sendEmail } from '@/lib/email'
import { hashPassword, verifyPassword } from '@/lib/password'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 30,
    autoSignIn: true,
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
  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
