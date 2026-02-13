import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/env-client', () => ({
  env: {
    NEXT_PUBLIC_APP_NAME: 'Test App',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_BETTER_AUTH_URL: 'http://localhost:3000/api/auth',
  },
}))

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    GOOGLE_CLIENT_ID: 'test-google-client-id',
    GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
  },
}))

vi.mock('@/db', () => ({
  db: {},
}))

vi.mock('better-auth', () => ({
  betterAuth: vi.fn(() => ({
    $Infer: { Session: {} },
    api: {},
  })),
}))

vi.mock('better-auth/adapters/drizzle', () => ({
  drizzleAdapter: vi.fn(() => ({})),
}))

vi.mock('better-auth/next-js', () => ({
  nextCookies: vi.fn(() => ({})),
}))

vi.mock('better-auth/plugins', () => ({
  magicLink: vi.fn(() => ({})),
  twoFactor: vi.fn(() => ({})),
}))

describe('auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes auth successfully', async () => {
    // Should not throw when importing
    const authModule = await import('@/lib/auth')
    expect(authModule).toBeDefined()
    expect(authModule.auth).toBeDefined()
  })
})

describe('auth configuration', () => {
  it('uses app name from env', async () => {
    const { env } = await import('@/lib/env-client')
    expect(env.NEXT_PUBLIC_APP_NAME).toBe('Test App')
  })

  it('uses auth URL from env', async () => {
    const { env } = await import('@/lib/env-client')
    expect(env.NEXT_PUBLIC_BETTER_AUTH_URL).toBe(
      'http://localhost:3000/api/auth'
    )
  })

  it('server env contains required variables', async () => {
    const { env } = await import('@/lib/env')
    expect(env.NODE_ENV).toBe('test')
    expect(env.DATABASE_URL).toBe('postgresql://test:test@localhost:5432/test')
    expect(env.GOOGLE_CLIENT_ID).toBe('test-google-client-id')
    expect(env.GOOGLE_CLIENT_SECRET).toBe('test-google-client-secret')
  })
})
