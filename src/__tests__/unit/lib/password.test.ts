import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from '@/lib/password'

describe('Password - hashPassword', () => {
  it('hashes password successfully', async () => {
    const password = 'mySecurePassword123'
    const hash = await hashPassword(password)

    expect(hash).toBeTruthy()
    expect(typeof hash).toBe('string')
    expect(hash.length).toBeGreaterThan(0)
  })

  it('produces different hashes for same password', async () => {
    const password = 'mySecurePassword123'
    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)

    // Argon2 adds random salt, so hashes should be different
    expect(hash1).not.toBe(hash2)
  })

  it('handles empty string password', async () => {
    const hash = await hashPassword('')
    expect(hash).toBeTruthy()
    expect(typeof hash).toBe('string')
  })

  it('handles long passwords', async () => {
    const longPassword = 'a'.repeat(100)
    const hash = await hashPassword(longPassword)
    expect(hash).toBeTruthy()
  })
})

describe('Password - verifyPassword', () => {
  it('verifies correct password', async () => {
    const password = 'mySecurePassword123'
    const hash = await hashPassword(password)

    const isValid = await verifyPassword({ password, hash })
    expect(isValid).toBe(true)
  })

  it('rejects incorrect password', async () => {
    const password = 'mySecurePassword123'
    const wrongPassword = 'wrongPassword'
    const hash = await hashPassword(password)

    const isValid = await verifyPassword({ password: wrongPassword, hash })
    expect(isValid).toBe(false)
  })

  it('handles empty string verification', async () => {
    const password = ''
    const hash = await hashPassword(password)

    const isValid = await verifyPassword({ password, hash })
    expect(isValid).toBe(true)
  })

  it('handles different passwords with same hash check', async () => {
    const password1 = 'password1'
    const password2 = 'password2'
    const hash = await hashPassword(password1)

    const isValid = await verifyPassword({ password: password2, hash })
    expect(isValid).toBe(false)
  })
})
