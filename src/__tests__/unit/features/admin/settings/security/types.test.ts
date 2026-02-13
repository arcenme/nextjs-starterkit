import { describe, expect, it } from 'vitest'
import {
  TwoFactorPasswordSchema,
  UpdatePasswordSchema,
} from '@/features/admin/settings/security/types'

describe('UpdatePasswordSchema', () => {
  const validData = {
    newPassword: 'Password123!',
    confirmPassword: 'Password123!',
    currentPassword: 'OldPassword123!',
    revokeOtherSessions: false,
  }

  it('accepts valid password update data', () => {
    const result = UpdatePasswordSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('accepts valid data with revokeOtherSessions true', () => {
    const data = { ...validData, revokeOtherSessions: true }
    const result = UpdatePasswordSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects empty current password', () => {
    const data = { ...validData, currentPassword: '' }
    const result = UpdatePasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects current password that is too long', () => {
    const data = { ...validData, currentPassword: 'a'.repeat(129) }
    const result = UpdatePasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects new password that is too short', () => {
    const data = {
      ...validData,
      newPassword: 'Pass1!',
      confirmPassword: 'Pass1!',
    }
    const result = UpdatePasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects new password without lowercase letter', () => {
    const data = {
      ...validData,
      newPassword: 'PASSWORD123!',
      confirmPassword: 'PASSWORD123!',
    }
    const result = UpdatePasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects new password without uppercase letter', () => {
    const data = {
      ...validData,
      newPassword: 'password123!',
      confirmPassword: 'password123!',
    }
    const result = UpdatePasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects new password without number', () => {
    const data = {
      ...validData,
      newPassword: 'Password!',
      confirmPassword: 'Password!',
    }
    const result = UpdatePasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects new password without special character', () => {
    const data = {
      ...validData,
      newPassword: 'Password123',
      confirmPassword: 'Password123',
    }
    const result = UpdatePasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects new password that is too long', () => {
    const longPassword = `Aa1!${'b'.repeat(130)}`
    const data = {
      ...validData,
      newPassword: longPassword,
      confirmPassword: longPassword,
    }
    const result = UpdatePasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects missing confirm password', () => {
    const data = { ...validData, confirmPassword: '' }
    const result = UpdatePasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects mismatched passwords', () => {
    const data = {
      ...validData,
      confirmPassword: 'DifferentPassword123!',
    }
    const result = UpdatePasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Passwords do not match')
      expect(result.error.issues[0].path).toContain('confirmPassword')
    }
  })

  it('rejects new password same as current', () => {
    const data = {
      ...validData,
      newPassword: validData.currentPassword,
      confirmPassword: validData.currentPassword,
    }
    const result = UpdatePasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'New password must be different from current password'
      )
      expect(result.error.issues[0].path).toContain('newPassword')
    }
  })

  it('trims whitespace from passwords', () => {
    const data = {
      newPassword: '  Password123!  ',
      confirmPassword: '  Password123!  ',
      currentPassword: '  OldPassword123!  ',
      revokeOtherSessions: false,
    }
    const result = UpdatePasswordSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.newPassword).toBe('Password123!')
      expect(result.data.currentPassword).toBe('OldPassword123!')
    }
  })
})

describe('TwoFactorPasswordSchema', () => {
  const validData = {
    password: 'Password123!',
  }

  it('accepts valid password', () => {
    const result = TwoFactorPasswordSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects empty password', () => {
    const data = { password: '' }
    const result = TwoFactorPasswordSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('trims whitespace from password', () => {
    const data = { password: '  Password123!  ' }
    const result = TwoFactorPasswordSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.password).toBe('Password123!')
    }
  })
})
