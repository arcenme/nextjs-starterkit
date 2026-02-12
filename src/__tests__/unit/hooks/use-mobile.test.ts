import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useIsMobile } from '@/hooks/use-mobile'

describe('useIsMobile', () => {
  it('returns a boolean', () => {
    const { result } = renderHook(() => useIsMobile())
    expect(typeof result.current).toBe('boolean')
  })

  it('returns true when window.innerWidth is below mobile breakpoint', () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })

    // Mock matchMedia to match mobile query
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 767px)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { result } = renderHook(() => useIsMobile())

    // Wait for the effect to run and update state
    waitFor(() => {
      expect(result.current).toBe(true)
    })
  })

  it('returns false when window.innerWidth is above mobile breakpoint', () => {
    // Mock window.innerWidth for desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    // Mock matchMedia to not match mobile query
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { result } = renderHook(() => useIsMobile())

    // Wait for the effect to run and update state
    waitFor(() => {
      expect(result.current).toBe(false)
    })
  })
})
