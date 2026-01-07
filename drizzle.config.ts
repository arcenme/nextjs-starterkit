import { defineConfig } from 'drizzle-kit'
import { env } from '@/env/server'

export default defineConfig({
  out: './src/db/_migrations',
  schema: './src/db/schemas.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
})
