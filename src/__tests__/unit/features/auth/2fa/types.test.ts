import { describe, expect, it } from 'vitest'
import { BackupCodeSchema, TotpSchema } from '@/features/auth/2fa/types'

describe('TotpSchema', () => {
  const validInput = {
    code: '123456',
    trustDevice: false,
  }

  it('validates valid TOTP input', () => {
    const result = TotpSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validInput)
    }
  })

  it('rejects code with less than 6 digits', () => {
    const result = TotpSchema.safeParse({
      ...validInput,
      code: '12345',
    })
    expect(result.success).toBe(false)
  })

  it('rejects code with more than 6 digits', () => {
    const result = TotpSchema.safeParse({
      ...validInput,
      code: '1234567',
    })
    expect(result.success).toBe(false)
  })

  it('accepts non-numeric code (schema does not validate numeric)', () => {
    const result = TotpSchema.safeParse({
      code: 'abcdef',
      trustDevice: false,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty code', () => {
    const result = TotpSchema.safeParse({
      ...validInput,
      code: '',
    })
    expect(result.success).toBe(false)
  })

  it('accepts trustDevice as true', () => {
    const result = TotpSchema.safeParse({
      code: '123456',
      trustDevice: true,
    })
    expect(result.success).toBe(true)
  })

  it('accepts trustDevice as false', () => {
    const result = TotpSchema.safeParse({
      code: '123456',
      trustDevice: false,
    })
    expect(result.success).toBe(true)
  })

  it('rejects code with whitespace (length validation fails with spaces)', () => {
    const result = TotpSchema.safeParse({
      code: '  123456  ',
      trustDevice: false,
    })
    expect(result.success).toBe(false)
  })
})

describe('BackupCodeSchema', () => {
  const validInput = {
    code: 'abc123def456',
    trustDevice: false,
  }

  it('validates valid backup code input', () => {
    const result = BackupCodeSchema.safeParse(validInput)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validInput)
    }
  })

  it('rejects empty code', () => {
    const result = BackupCodeSchema.safeParse({
      ...validInput,
      code: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects whitespace-only code', () => {
    const result = BackupCodeSchema.safeParse({
      ...validInput,
      code: '   ',
    })
    expect(result.success).toBe(false)
  })

  it('accepts trustDevice as true', () => {
    const result = BackupCodeSchema.safeParse({
      code: 'backup123',
      trustDevice: true,
    })
    expect(result.success).toBe(true)
  })

  it('accepts trustDevice as false', () => {
    const result = BackupCodeSchema.safeParse({
      code: 'backup123',
      trustDevice: false,
    })
    expect(result.success).toBe(true)
  })

  it('trims whitespace from code', () => {
    const result = BackupCodeSchema.safeParse({
      code: '  backup123  ',
      trustDevice: false,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.code).toBe('backup123')
    }
  })

  it('accepts alphanumeric backup codes', () => {
    const result = BackupCodeSchema.safeParse({
      code: 'a1b2c3d4e5f6',
      trustDevice: false,
    })
    expect(result.success).toBe(true)
  })

  it('accepts special characters in backup codes', () => {
    const result = BackupCodeSchema.safeParse({
      code: 'backup-code_123',
      trustDevice: false,
    })
    expect(result.success).toBe(true)
  })
})
