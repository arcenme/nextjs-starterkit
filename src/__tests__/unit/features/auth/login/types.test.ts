import { describe, expect, it } from 'vitest'
import { LoginSchema } from '@/features/auth/login/types'

describe('LoginSchema', () => {
  it('validates correct email and password', () => {
    const validData = {
      email: 'user@example.com',
      password: 'password123',
    }

    const result = LoginSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects invalid email format', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123',
    }

    const result = LoginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 8 characters', () => {
    const invalidData = {
      email: 'user@example.com',
      password: 'short',
    }

    const result = LoginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('rejects password longer than 128 characters', () => {
    const invalidData = {
      email: 'user@example.com',
      password: 'a'.repeat(129),
    }

    const result = LoginSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('trims whitespace from password', () => {
    const dataWithWhitespace = {
      email: 'user@example.com',
      password: '  password123  ',
    }

    const result = LoginSchema.parse(dataWithWhitespace)
    expect(result.password).toBe('password123')
  })

  it('requires email field', () => {
    const dataWithoutEmail = {
      password: 'password123',
    }

    const result = LoginSchema.safeParse(dataWithoutEmail)
    expect(result.success).toBe(false)
  })

  it('requires password field', () => {
    const dataWithoutPassword = {
      email: 'user@example.com',
    }

    const result = LoginSchema.safeParse(dataWithoutPassword)
    expect(result.success).toBe(false)
  })

  it('accepts valid email with special characters', () => {
    const validData = {
      email: 'user.name+tag@example.co.uk',
      password: 'password123',
    }

    const result = LoginSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})
