import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('Client Environment Configuration', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.doUnmock('@t3-oss/env-nextjs')
  })

  it('exports client environment configuration object', async () => {
    const mockEnv = {
      NEXT_PUBLIC_APP_NAME: 'Test App',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NEXT_PUBLIC_BETTER_AUTH_URL: 'http://localhost:3000',
    }

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: vi.fn().mockReturnValue(mockEnv),
    }))

    const { env } = await import('@/lib/env-client')

    expect(env).toBeDefined()
    expect(env.NEXT_PUBLIC_APP_NAME).toBe('Test App')
    expect(env.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000')
    expect(env.NEXT_PUBLIC_BETTER_AUTH_URL).toBe('http://localhost:3000')
  })

  it('passes client schema configuration to createEnv', async () => {
    const createEnvMock = vi.fn().mockReturnValue({})

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: createEnvMock,
    }))

    await import('@/lib/env-client')

    expect(createEnvMock).toHaveBeenCalledWith(
      expect.objectContaining({
        client: expect.any(Object),
      })
    )

    const config = createEnvMock.mock.calls[0][0]
    expect(Object.keys(config.client)).toContain('NEXT_PUBLIC_APP_NAME')
    expect(Object.keys(config.client)).toContain('NEXT_PUBLIC_APP_URL')
    expect(Object.keys(config.client)).toContain('NEXT_PUBLIC_BETTER_AUTH_URL')
  })

  it('includes all required client environment variables', async () => {
    const createEnvMock = vi.fn().mockReturnValue({})

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: createEnvMock,
    }))

    await import('@/lib/env-client')

    const config = createEnvMock.mock.calls[0][0]
    const requiredVars = [
      'NEXT_PUBLIC_APP_NAME',
      'NEXT_PUBLIC_APP_URL',
      'NEXT_PUBLIC_BETTER_AUTH_URL',
    ]

    for (const varName of requiredVars) {
      expect(config.client[varName]).toBeDefined()
    }
  })

  it('uses runtimeEnv with specific NEXT_PUBLIC variables', async () => {
    const createEnvMock = vi.fn().mockReturnValue({})

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: createEnvMock,
    }))

    await import('@/lib/env-client')

    const config = createEnvMock.mock.calls[0][0]
    expect(config.runtimeEnv).toEqual({
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    })
  })

  it('skips validation in development mode', async () => {
    vi.stubEnv('NODE_ENV', 'development')

    const createEnvMock = vi.fn().mockReturnValue({})

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: createEnvMock,
    }))

    await import('@/lib/env-client')

    const config = createEnvMock.mock.calls[0][0]
    expect(config.skipValidation).toBe(true)
  })

  it('does not skip validation in production mode', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const createEnvMock = vi.fn().mockReturnValue({})

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: createEnvMock,
    }))

    await import('@/lib/env-client')

    const config = createEnvMock.mock.calls[0][0]
    expect(config.skipValidation).toBe(false)
  })

  it('does not skip validation in test mode', async () => {
    vi.stubEnv('NODE_ENV', 'test')

    const createEnvMock = vi.fn().mockReturnValue({})

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: createEnvMock,
    }))

    await import('@/lib/env-client')

    const config = createEnvMock.mock.calls[0][0]
    expect(config.skipValidation).toBe(false)
  })

  it('returns the expected environment values from createEnv', async () => {
    const mockEnv = {
      NEXT_PUBLIC_APP_NAME: 'My Production App',
      NEXT_PUBLIC_APP_URL: 'https://example.com',
      NEXT_PUBLIC_BETTER_AUTH_URL: 'https://auth.example.com',
    }

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: vi.fn().mockReturnValue(mockEnv),
    }))

    const { env } = await import('@/lib/env-client')

    expect(env.NEXT_PUBLIC_APP_NAME).toBe('My Production App')
    expect(env.NEXT_PUBLIC_APP_URL).toBe('https://example.com')
    expect(env.NEXT_PUBLIC_BETTER_AUTH_URL).toBe('https://auth.example.com')
  })

  it('exports all client environment variables', async () => {
    const mockEnv = {
      NEXT_PUBLIC_APP_NAME: 'Test',
      NEXT_PUBLIC_APP_URL: 'http://localhost',
      NEXT_PUBLIC_BETTER_AUTH_URL: 'http://localhost/auth',
    }

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: vi.fn().mockReturnValue(mockEnv),
    }))

    const { env } = await import('@/lib/env-client')

    expect(Object.keys(env)).toEqual([
      'NEXT_PUBLIC_APP_NAME',
      'NEXT_PUBLIC_APP_URL',
      'NEXT_PUBLIC_BETTER_AUTH_URL',
    ])
  })
})
