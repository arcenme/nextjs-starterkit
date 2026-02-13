import { describe, expect, it } from 'vitest'
import { ResetPasswordSchema } from '@/features/auth/reset-password/types'

describe('ResetPasswordSchema', () => {
  const validInput = {
    newPassword: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
    token: 'valid-token-12345',
  }

  it('validates valid input', () => {
    const result = ResetPasswordSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validInput)
    }
  })

  it('rejects empty newPassword', () => {
    const result = ResetPasswordSchema.safeParse({
      ...validInput,
      newPassword: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects short password (less than 8 characters)', () => {
    const result = ResetPasswordSchema.safeParse({
      ...validInput,
      newPassword: 'Short1!',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password without lowercase letter', () => {
    const result = ResetPasswordSchema.safeParse({
      ...validInput,
      newPassword: 'SECUREPASS123!',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password without uppercase letter', () => {
    const result = ResetPasswordSchema.safeParse({
      ...validInput,
      newPassword: 'securepass123!',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password without number', () => {
    const result = ResetPasswordSchema.safeParse({
      ...validInput,
      newPassword: 'SecurePass!',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password without special character', () => {
    const result = ResetPasswordSchema.safeParse({
      ...validInput,
      newPassword: 'SecurePass123',
    })
    expect(result.success).toBe(false)
  })

  it('rejects mismatched passwords', () => {
    const result = ResetPasswordSchema.safeParse({
      ...validInput,
      confirmPassword: 'DifferentPass123!',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty confirmPassword', () => {
    const result = ResetPasswordSchema.safeParse({
      ...validInput,
      confirmPassword: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty token', () => {
    const result = ResetPasswordSchema.safeParse({
      ...validInput,
      token: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects token exceeding max length', () => {
    const result = ResetPasswordSchema.safeParse({
      ...validInput,
      token: 'a'.repeat(256),
    })
    expect(result.success).toBe(false)
  })

  it('trims whitespace from inputs', () => {
    const result = ResetPasswordSchema.safeParse({
      newPassword: '  SecurePass123!  ',
      confirmPassword: '  SecurePass123!  ',
      token: '  valid-token  ',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.newPassword).toBe('SecurePass123!')
      expect(result.data.confirmPassword).toBe('SecurePass123!')
      expect(result.data.token).toBe('valid-token')
    }
  })
})
