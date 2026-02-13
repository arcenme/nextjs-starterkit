import { describe, expect, it } from 'vitest'
import {
  RevokeOtherSessionsSchema,
  RevokeSessionSchema,
} from '@/features/admin/settings/session-management/types'

describe('RevokeSessionSchema', () => {
  const validData = {
    token: 'abc123defghijklmnop',
  }

  it('accepts valid session token', () => {
    const result = RevokeSessionSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('accepts token with dots, underscores, hyphens', () => {
    const data = { token: 'abc_123-456.def' }
    const result = RevokeSessionSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('rejects empty token', () => {
    const data = { token: '' }
    const result = RevokeSessionSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('token')
    }
  })

  it('rejects token that is too long', () => {
    const data = { token: 'a'.repeat(101) }
    const result = RevokeSessionSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects token with special characters', () => {
    const data = { token: 'abc@123!' }
    const result = RevokeSessionSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects token with spaces', () => {
    const data = { token: 'abc 123' }
    const result = RevokeSessionSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('rejects token with spaces', () => {
    const data = { token: 'abc 123' }
    const result = RevokeSessionSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('RevokeOtherSessionsSchema', () => {
  const validData = {
    password: 'Password123!',
  }

  it('accepts valid password', () => {
    const result = RevokeOtherSessionsSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects empty password', () => {
    const data = { password: '' }
    const result = RevokeOtherSessionsSchema.safeParse(data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password')
    }
  })

  it('rejects password that is too long', () => {
    const data = { password: 'a'.repeat(129) }
    const result = RevokeOtherSessionsSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('accepts password with whitespace (no trim in schema)', () => {
    const data = { password: '  Password123!  ' }
    // Note: schema does NOT trim, so whitespace is preserved
    const result = RevokeOtherSessionsSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})
