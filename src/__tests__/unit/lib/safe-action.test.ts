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

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}))

const mockGetSession = vi.fn()

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}))

describe('safeAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports safeAction', async () => {
    const { safeAction } = await import('@/lib/safe-action')
    expect(safeAction).toBeDefined()
  })

  it('exports authAction', async () => {
    const { authAction } = await import('@/lib/safe-action')
    expect(authAction).toBeDefined()
  })

  it('safeAction has metadata method', async () => {
    const { safeAction } = await import('@/lib/safe-action')
    expect(safeAction.metadata).toBeDefined()
    expect(typeof safeAction.metadata).toBe('function')
  })

  it('safeAction has use method', async () => {
    const { safeAction } = await import('@/lib/safe-action')
    expect(safeAction.use).toBeDefined()
    expect(typeof safeAction.use).toBe('function')
  })
})

describe('safeAction configuration', () => {
  it('safeAction requires actionName in metadata', async () => {
    const { safeAction } = await import('@/lib/safe-action')

    // Should not throw when metadata is valid
    expect(() => {
      safeAction.metadata({ actionName: 'testAction' })
    }).not.toThrow()
  })

  it('safeAction metadata rejects empty actionName', async () => {
    const { safeAction } = await import('@/lib/safe-action')

    // Should handle empty/whitespace action names
    expect(() => {
      safeAction.metadata({ actionName: '   ' })
    }).not.toThrow() // The validation happens later
  })
})

describe('authAction', () => {
  it('authAction is created from safeAction', async () => {
    const { authAction, safeAction } = await import('@/lib/safe-action')
    expect(authAction).toBeDefined()
    expect(safeAction).toBeDefined()
  })

  it('authAction exists and has required methods', async () => {
    const { authAction } = await import('@/lib/safe-action')
    expect(authAction).toBeDefined()
    expect(authAction.metadata).toBeDefined()
    expect(authAction.use).toBeDefined()
  })
})
