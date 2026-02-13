import { describe, expect, it } from 'vitest'
import { MagicLinkSchema } from '@/features/auth/magic-link/types'

describe('MagicLinkSchema', () => {
  const validData = {
    email: 'john@example.com',
  }

  it('accepts valid email', () => {
    const result = MagicLinkSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects missing email', () => {
    const data = { email: '' }
    const result = MagicLinkSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('rejects invalid email format', () => {
    const data = { email: 'invalid-email' }
    const result = MagicLinkSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('rejects null email', () => {
    const data = { email: null }
    const result = MagicLinkSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects undefined email', () => {
    const data = { email: undefined }
    const result = MagicLinkSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects email that is too long', () => {
    const longEmail = `john${'a'.repeat(250)}@example.com`
    const data = { email: longEmail }
    const result = MagicLinkSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('transforms email to lowercase', () => {
    const data = { email: 'JOHN@EXAMPLE.COM' }
    const result = MagicLinkSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('john@example.com')
    }
  })

  it('accepts various valid email formats and transforms them', () => {
    const validEmails = [
      { input: 'Test@Example.COM', expected: 'test@example.com' },
      { input: 'USER.Name@Example.COM', expected: 'user.name@example.com' },
      { input: 'user+tag@EXAMPLE.COM', expected: 'user+tag@example.com' },
      { input: 'USER123@EXAMPLE.CO.UK', expected: 'user123@example.co.uk' },
      {
        input: 'test.email@Domain-With-Dash.COM',
        expected: 'test.email@domain-with-dash.com',
      },
    ]

    validEmails.forEach(({ input, expected }) => {
      const result = MagicLinkSchema.safeParse({ email: input })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe(expected)
      }
    })
  })

  it('rejects clearly invalid email formats', () => {
    const invalidEmails = [
      'plainaddress',
      '@missingdomain.com',
      'missing@domain',
      'no-at-symbol.com',
    ]

    invalidEmails.forEach((email) => {
      const result = MagicLinkSchema.safeParse({ email })
      expect(result.success).toBe(false)
    })
  })
})
