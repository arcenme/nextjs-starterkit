import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useInitials } from '@/hooks/use-initials'

describe('useInitials', () => {
  it('returns first letter of single name', () => {
    const { result } = renderHook(() => useInitials())
    expect(result.current('John')).toBe('J')
  })

  it('returns first and last initial for full name', () => {
    const { result } = renderHook(() => useInitials())
    expect(result.current('John Doe')).toBe('JD')
  })

  it('handles multiple names', () => {
    const { result } = renderHook(() => useInitials())
    expect(result.current('John Michael Doe')).toBe('JD')
  })

  it('converts to uppercase', () => {
    const { result } = renderHook(() => useInitials())
    expect(result.current('john doe')).toBe('JD')
  })

  it('handles names with extra spaces', () => {
    const { result } = renderHook(() => useInitials())
    expect(result.current('  John   Doe  ')).toBe('JD')
  })

  it('handles empty string', () => {
    const { result } = renderHook(() => useInitials())
    expect(result.current('')).toBe('')
  })

  it('handles single character name', () => {
    const { result } = renderHook(() => useInitials())
    expect(result.current('J')).toBe('J')
  })

  it('handles names with hyphens', () => {
    const { result } = renderHook(() => useInitials())
    expect(result.current('John-Marie Doe')).toBe('JD')
  })

  it('handles names with numbers', () => {
    const { result } = renderHook(() => useInitials())
    expect(result.current('John123 Doe')).toBe('JD')
  })
})
