import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'

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

// Note: calculateSHA256 tests removed as they require browser File API
// which is not available in jsdom. These should be tested in integration
// tests with proper browser environment or mocked.
