import { describe, expect, it } from 'vitest'
import type { Session } from '@/lib/auth-client'
import {
  formatLocation,
  formatSessionTime,
  getDeviceIcon,
  getDeviceName,
  parseSession,
  parseUserAgent,
} from '@/lib/ua-parser'

describe('UA Parser - parseUserAgent', () => {
  it('parses Chrome on Windows', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    const result = parseUserAgent(ua)

    expect(result.browser).toBeTruthy()
    expect(result.os).toBeTruthy()
    expect(result.device).toBe('desktop')
  })

  it('parses Safari on iPhone', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    const result = parseUserAgent(ua)

    expect(result.device).toBe('mobile')
  })

  it('parses iPad user agent', () => {
    const ua =
      'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15'
    const result = parseUserAgent(ua)

    expect(result.device).toBe('tablet')
  })

  it('handles unknown user agent', () => {
    const ua = ''
    const result = parseUserAgent(ua)

    expect(result.browser).toBe('Unknown Browser')
    expect(result.os).toBe('Unknown OS')
  })
})

describe('UA Parser - getDeviceIcon', () => {
  it('returns mobile for mobile devices', () => {
    expect(getDeviceIcon('mobile')).toBe('mobile')
  })

  it('returns tablet for tablet devices', () => {
    expect(getDeviceIcon('tablet')).toBe('tablet')
  })

  it('returns desktop for desktop and other devices', () => {
    expect(getDeviceIcon('desktop')).toBe('desktop')
    expect(getDeviceIcon('')).toBe('desktop')
    expect(getDeviceIcon('unknown')).toBe('desktop')
  })
})

describe('UA Parser - getDeviceName', () => {
  it('returns vendor and model when available', () => {
    expect(getDeviceName('Chrome', 'Windows', 'iPhone', 'Apple')).toBe(
      'Apple iPhone'
    )
  })

  it('returns model only when vendor is not available', () => {
    expect(getDeviceName('Chrome', 'Windows', 'Pixel', undefined)).toBe('Pixel')
  })

  it('returns browser and OS when no device info', () => {
    expect(getDeviceName('Chrome', 'Windows', undefined, undefined)).toBe(
      'Chrome Windows'
    )
  })
})

describe('UA Parser - formatSessionTime', () => {
  it('returns Just now for recent activity', () => {
    const now = new Date()
    expect(formatSessionTime(now)).toBe('Just now')
  })

  it('returns relative time for recent past', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const result = formatSessionTime(fiveMinutesAgo)
    expect(result).toContain('ago')
  })

  it('returns absolute date for old activity', () => {
    const oldDate = new Date('2023-01-15')
    const result = formatSessionTime(oldDate)
    expect(result).toMatch(/Jan \d+, 2023/)
  })

  it('handles string dates', () => {
    const result = formatSessionTime('2023-06-15T10:00:00Z')
    expect(result).toMatch(/Jun \d+, 2023/)
  })
})

describe('UA Parser - formatLocation', () => {
  it('returns IP address when available', () => {
    expect(formatLocation('192.168.1.1')).toBe('192.168.1.1')
  })

  it('returns Unknown location when IP is null', () => {
    expect(formatLocation(null)).toBe('Unknown location')
  })

  it('returns Unknown location when IP is undefined', () => {
    expect(formatLocation(undefined)).toBe('Unknown location')
  })
})

describe('UA Parser - parseSession', () => {
  it('parses session with all fields', () => {
    const mockSession = {
      id: 'session-1',
      userId: 'user-1',
      token: 'token-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    } as Session['session']

    const result = parseSession(mockSession, 'token-1')

    expect(result.deviceName).toBeTruthy()
    expect(result.deviceIcon).toBe('desktop')
    expect(result.browserName).toBeTruthy()
    expect(result.osName).toBeTruthy()
    expect(result.location).toBe('192.168.1.1')
    expect(result.isCurrentDevice).toBe(true)
  })

  it('marks non-current sessions correctly', () => {
    const mockSession = {
      id: 'session-1',
      userId: 'user-1',
      token: 'token-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Session['session']

    const result = parseSession(mockSession, 'different-token')

    expect(result.isCurrentDevice).toBe(false)
  })

  it('handles missing user agent', () => {
    const mockSession = {
      id: 'session-1',
      userId: 'user-1',
      token: 'token-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      userAgent: null,
    } as Session['session']

    const result = parseSession(mockSession, 'token-1')

    expect(result.deviceName).toBe('Unknown Browser Unknown OS')
    expect(result.browserName).toBe('Unknown Browser')
    expect(result.osName).toBe('Unknown OS')
  })
})
