import { describe, expect, it } from 'vitest'
import { ForgotPasswordSchema } from '@/features/forgot-password/types'

describe('ForgotPasswordSchema', () => {
  const validData = {
    email: 'john@example.com',
  }

  it('accepts valid email', () => {
    const result = ForgotPasswordSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects missing email', () => {
    const data = { email: '' }
    const result = ForgotPasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('rejects invalid email format', () => {
    const data = { email: 'invalid-email' }
    const result = ForgotPasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('rejects null email', () => {
    const data = { email: null }
    const result = ForgotPasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects undefined email', () => {
    const data = { email: undefined }
    const result = ForgotPasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects email that is too long', () => {
    const longEmail = `john${'a'.repeat(250)}@example.com`
    const data = { email: longEmail }
    const result = ForgotPasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('accepts various valid email formats', () => {
    const validEmails = [
      'test@example.com',
      'user.name@example.com',
      'user+tag@example.com',
      'user123@example.co.uk',
      'test.email@domain-with-dash.com',
      'firstname.lastname@company.com',
    ]

    validEmails.forEach((email) => {
      const result = ForgotPasswordSchema.safeParse({ email })
      expect(result.success).toBe(true)
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
      const result = ForgotPasswordSchema.safeParse({ email })
      expect(result.success).toBe(false)
    })
  })
})
