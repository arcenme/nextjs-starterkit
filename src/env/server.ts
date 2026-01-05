// import 'server-only'

import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']),
    DATABASE_URL: z.url().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
  },
  experimental__runtimeEnv: process.env,
})
