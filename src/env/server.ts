import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']),
    NEXT_TELEMETRY_DISABLED: z.coerce.number().min(0).max(1).default(1),
    DATABASE_URL: z.url().min(1),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_TELEMETRY: z.coerce.number().min(0).max(1).default(0),
  },
  experimental__runtimeEnv: process.env,
})
