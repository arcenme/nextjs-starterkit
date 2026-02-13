import { describe, expect, it } from 'vitest'
import { SignUpSchema } from '@/features/auth/signup/types'

describe('SignUpSchema', () => {
  const validData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  }

  it('accepts valid sign-up data', () => {
    const result = SignUpSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const data = { ...validData, name: '' }
    const result = SignUpSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('name')
    }
  })

  it('rejects invalid email format', () => {
    const data = { ...validData, email: 'invalid-email' }
    const result = SignUpSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('rejects password that is too short', () => {
    const data = { ...validData, password: 'Pass1!', confirmPassword: 'Pass1!' }
    const result = SignUpSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password')
    }
  })

  it('rejects password without lowercase letter', () => {
    const data = {
      ...validData,
      password: 'PASSWORD123!',
      confirmPassword: 'PASSWORD123!',
    }
    const result = SignUpSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects password without uppercase letter', () => {
    const data = {
      ...validData,
      password: 'password123!',
      confirmPassword: 'password123!',
    }
    const result = SignUpSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects password without number', () => {
    const data = {
      ...validData,
      password: 'Password!',
      confirmPassword: 'Password!',
    }
    const result = SignUpSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects password without special character', () => {
    const data = {
      ...validData,
      password: 'Password123',
      confirmPassword: 'Password123',
    }
    const result = SignUpSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects password that is too long', () => {
    const longPassword = `Aa1!${'b'.repeat(130)}`
    const data = {
      ...validData,
      password: longPassword,
      confirmPassword: longPassword,
    }
    const result = SignUpSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects missing confirm password', () => {
    const data = { ...validData, confirmPassword: '' }
    const result = SignUpSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('confirmPassword')
    }
  })

  it('rejects mismatched passwords', () => {
    const data = { ...validData, confirmPassword: 'DifferentPassword123!' }
    const result = SignUpSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Passwords do not match')
      expect(result.error.issues[0].path).toContain('confirmPassword')
    }
  })

  it('rejects name that is too long', () => {
    const data = { ...validData, name: 'a'.repeat(126) }
    const result = SignUpSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('name')
    }
  })

  it('rejects email that is too long', () => {
    const longEmail = `john${'a'.repeat(250)}@example.com`
    const data = { ...validData, email: longEmail }
    const result = SignUpSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email')
    }
  })

  it('trims whitespace from name and password', () => {
    const data = {
      name: '  John Doe  ',
      email: 'john@example.com', // Email can't have spaces due to validation
      password: '  Password123!  ',
      confirmPassword: '  Password123!  ',
    }
    const result = SignUpSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('John Doe')
      expect(result.data.email).toBe('john@example.com')
      expect(result.data.password).toBe('Password123!')
      expect(result.data.confirmPassword).toBe('Password123!')
    }
  })
})
