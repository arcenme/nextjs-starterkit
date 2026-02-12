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
    // Tailwind merge should keep the last conflicting class
    expect(result).toBe('py-2 px-6')
  })

  it('handles object syntax', () => {
    const result = cn('base', {
      'text-red-500': true,
      'text-blue-500': false,
    })
    expect(result).toBe('base text-red-500')
  })
})
