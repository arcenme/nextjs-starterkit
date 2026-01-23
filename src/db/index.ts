// import 'server-only'

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from '@/db/schemas'
import { env } from '@/lib/env'

declare global {
  var dbPool: Pool | undefined
}

let pool: Pool

if (env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: true,
  })
} else {
  if (!global.dbPool) {
    global.dbPool = new Pool({
      connectionString: env.DATABASE_URL,
    })
  }
  pool = global.dbPool
}

export const db = drizzle(pool, {
  schema,
  logger: env.NODE_ENV === 'development',
})
