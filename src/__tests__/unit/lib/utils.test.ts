import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { calculateSHA256, cn } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    const result = cn('base-class', 'extra-class')
    expect(result).toBe('base-class extra-class')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const result = cn('base', isActive && 'active', !isActive && 'inactive')
    expect(result).toBe('base active')
  })

  it('filters out falsy values', () => {
    const result = cn('base', null, undefined, false, '', 'valid')
    expect(result).toBe('base valid')
  })

  it('merges Tailwind classes correctly', () => {
    const result = cn('px-4 py-2', 'px-6')
    expect(result).toBe('py-2 px-6')
  })

  it('handles object syntax', () => {
    const result = cn('base', {
      'text-red-500': true,
      'text-blue-500': false,
    })
    expect(result).toBe('base text-red-500')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
  })

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toBe('class1 class2 class3')
  })
})

describe('calculateSHA256', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', {
      subtle: {
        digest: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('calculates SHA256 hash of a file', async () => {
    const mockFile = {
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    } as unknown as File
    const result = await calculateSHA256(mockFile)
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  it('calls crypto.subtle.digest with SHA-256', async () => {
    const arrayBuffer = new ArrayBuffer(8)
    const mockFile = {
      arrayBuffer: vi.fn().mockResolvedValue(arrayBuffer),
    } as unknown as File
    await calculateSHA256(mockFile)
    expect(crypto.subtle.digest).toHaveBeenCalledWith('SHA-256', arrayBuffer)
  })

  it('returns base64 encoded hash', async () => {
    vi.stubGlobal('crypto', {
      subtle: {
        digest: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
      },
    })
    const mockFile = {
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(4)),
    } as unknown as File
    const result = await calculateSHA256(mockFile)
    expect(result).toBe('AQIDBA==')
  })
})
