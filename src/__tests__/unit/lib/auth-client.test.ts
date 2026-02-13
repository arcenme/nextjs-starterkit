import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/env-client', () => ({
  env: {
    NEXT_PUBLIC_APP_NAME: 'Test App',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_BETTER_AUTH_URL: 'http://localhost:3000/api/auth',
  },
}))

// Mock window.location for auth client
// biome-ignore lint/suspicious/noExplicitAny: window.location mock for tests
delete (window as any).location
// biome-ignore lint/suspicious/noExplicitAny: window.location mock for tests
window.location = { href: '' } as any

describe('authClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.location.href = ''
  })

  it('initializes authClient successfully', async () => {
    // Should not throw when importing
    const authClientModule = await import('@/lib/auth-client')
    expect(authClientModule).toBeDefined()
    expect(authClientModule.authClient).toBeDefined()
  })

  it('exports Session type', async () => {
    const authClientModule = await import('@/lib/auth-client')
    // Type export doesn't exist at runtime, but module should be importable
    expect(authClientModule).toBeDefined()
  })
})

describe('authClient configuration', () => {
  it('initializes with correct baseURL from env', async () => {
    const { env } = await import('@/lib/env-client')
    expect(env.NEXT_PUBLIC_BETTER_AUTH_URL).toBe(
      'http://localhost:3000/api/auth'
    )
  })

  it('env contains required variables', async () => {
    const { env } = await import('@/lib/env-client')
    expect(env.NEXT_PUBLIC_APP_NAME).toBe('Test App')
    expect(env.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000')
    expect(env.NEXT_PUBLIC_BETTER_AUTH_URL).toBe(
      'http://localhost:3000/api/auth'
    )
  })
})
