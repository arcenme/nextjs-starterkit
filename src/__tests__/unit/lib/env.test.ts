import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('Server Environment Configuration', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.doUnmock('@t3-oss/env-nextjs')
  })

  it('exports environment configuration object', async () => {
    const mockEnv = {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://test',
      BETTER_AUTH_SECRET: 'test-secret',
      GOOGLE_CLIENT_ID: 'test-client-id',
      GOOGLE_CLIENT_SECRET: 'test-client-secret',
      S3_ENDPOINT: 'https://s3.test.com',
      S3_ACCESS_KEY_ID: 'test-key',
      S3_SECRET_ACCESS_KEY: 'test-secret',
      S3_BUCKET_NAME: 'test-bucket',
    }

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: vi.fn().mockReturnValue(mockEnv),
    }))

    const { env } = await import('@/lib/env')

    expect(env).toBeDefined()
    expect(env.NODE_ENV).toBe('test')
  })

  it('passes server schema configuration to createEnv', async () => {
    const createEnvMock = vi.fn().mockReturnValue({})

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: createEnvMock,
    }))

    await import('@/lib/env')

    expect(createEnvMock).toHaveBeenCalledWith(
      expect.objectContaining({
        server: expect.any(Object),
      })
    )

    const config = createEnvMock.mock.calls[0][0]
    expect(Object.keys(config.server)).toContain('NODE_ENV')
    expect(Object.keys(config.server)).toContain('DATABASE_URL')
    expect(Object.keys(config.server)).toContain('BETTER_AUTH_SECRET')
  })

  it('includes all required server environment variables', async () => {
    const createEnvMock = vi.fn().mockReturnValue({})

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: createEnvMock,
    }))

    await import('@/lib/env')

    const config = createEnvMock.mock.calls[0][0]
    const requiredVars = [
      'NODE_ENV',
      'NEXT_TELEMETRY_DISABLED',
      'DATABASE_URL',
      'BETTER_AUTH_SECRET',
      'BETTER_AUTH_TELEMETRY',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'S3_ENDPOINT',
      'S3_DEFAULT_REGION',
      'S3_ACCESS_KEY_ID',
      'S3_SECRET_ACCESS_KEY',
      'S3_BUCKET_NAME',
    ]

    for (const varName of requiredVars) {
      expect(config.server[varName]).toBeDefined()
    }
  })

  it('uses experimental__runtimeEnv from process.env', async () => {
    const createEnvMock = vi.fn().mockReturnValue({})

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: createEnvMock,
    }))

    await import('@/lib/env')

    const config = createEnvMock.mock.calls[0][0]
    expect(config.experimental__runtimeEnv).toBe(process.env)
  })

  it('skips validation in development mode', async () => {
    vi.stubEnv('NODE_ENV', 'development')

    const createEnvMock = vi.fn().mockReturnValue({})

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: createEnvMock,
    }))

    await import('@/lib/env')

    const config = createEnvMock.mock.calls[0][0]
    expect(config.skipValidation).toBe(true)
  })

  it('does not skip validation in production mode', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const createEnvMock = vi.fn().mockReturnValue({})

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: createEnvMock,
    }))

    await import('@/lib/env')

    const config = createEnvMock.mock.calls[0][0]
    expect(config.skipValidation).toBe(false)
  })

  it('does not skip validation in test mode', async () => {
    vi.stubEnv('NODE_ENV', 'test')

    const createEnvMock = vi.fn().mockReturnValue({})

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: createEnvMock,
    }))

    await import('@/lib/env')

    const config = createEnvMock.mock.calls[0][0]
    expect(config.skipValidation).toBe(false)
  })

  it('includes all S3 configuration variables', async () => {
    const createEnvMock = vi.fn().mockReturnValue({})

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: createEnvMock,
    }))

    await import('@/lib/env')

    const config = createEnvMock.mock.calls[0][0]
    const s3Vars = [
      'S3_ENDPOINT',
      'S3_DEFAULT_REGION',
      'S3_ACCESS_KEY_ID',
      'S3_SECRET_ACCESS_KEY',
      'S3_BUCKET_NAME',
    ]

    for (const varName of s3Vars) {
      expect(config.server[varName]).toBeDefined()
    }
  })

  it('includes Google OAuth configuration variables', async () => {
    const createEnvMock = vi.fn().mockReturnValue({})

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: createEnvMock,
    }))

    await import('@/lib/env')

    const config = createEnvMock.mock.calls[0][0]
    expect(config.server.GOOGLE_CLIENT_ID).toBeDefined()
    expect(config.server.GOOGLE_CLIENT_SECRET).toBeDefined()
  })

  it('returns the expected environment values from createEnv', async () => {
    const mockEnv = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://prod-db',
      BETTER_AUTH_SECRET: 'prod-secret',
      NEXT_TELEMETRY_DISABLED: 1,
      BETTER_AUTH_TELEMETRY: 0,
    }

    vi.doMock('@t3-oss/env-nextjs', () => ({
      createEnv: vi.fn().mockReturnValue(mockEnv),
    }))

    const { env } = await import('@/lib/env')

    expect(env.NODE_ENV).toBe('production')
    expect(env.DATABASE_URL).toBe('postgresql://prod-db')
    expect(env.NEXT_TELEMETRY_DISABLED).toBe(1)
    expect(env.BETTER_AUTH_TELEMETRY).toBe(0)
  })
})
