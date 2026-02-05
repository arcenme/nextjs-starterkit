import type { Session } from 'better-auth/types'
import {
  differenceInSeconds,
  format,
  formatDistanceToNowStrict,
} from 'date-fns'
import { UAParser } from 'ua-parser-js'

export type ParsedSession = Session & {
  deviceName: string
  deviceIcon: 'desktop' | 'mobile' | 'tablet'
  browserName: string
  osName: string
  location: string
  isCurrentDevice: boolean
}

export function parseSession(
  session: Session,
  currentSessionToken?: string
): ParsedSession {
  const ua = parseUserAgent(session.userAgent || '')

  return {
    ...session,
    deviceName: getDeviceName(
      ua.browser,
      ua.os,
      ua.deviceModel,
      ua.deviceVendor
    ),
    deviceIcon: getDeviceIcon(ua.device),
    browserName: ua.browser,
    osName: ua.os,
    location: formatLocation(session.ipAddress),
    isCurrentDevice: session.token === currentSessionToken,
  }
}

export function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  return {
    browser: result.browser.name || 'Unknown Browser',
    os: result.os.name || 'Unknown OS',
    device: result.device.type || 'desktop',
    deviceModel: result.device.model,
    deviceVendor: result.device.vendor,
  }
}

export function getDeviceIcon(
  deviceType: string
): 'desktop' | 'mobile' | 'tablet' {
  if (deviceType === 'mobile') return 'mobile'
  if (deviceType === 'tablet') return 'tablet'
  return 'desktop'
}

export function getDeviceName(
  browser: string,
  os: string,
  deviceModel?: string,
  deviceVendor?: string
): string {
  if (deviceModel && deviceVendor) {
    return `${deviceVendor} ${deviceModel}`
  }

  if (deviceModel) {
    return deviceModel
  }

  return `${browser} ${os}`
}

export function formatSessionTime(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date
  const secondsDiff = differenceInSeconds(new Date(), parsedDate)

  // Just now (less than 60 seconds)
  if (secondsDiff < 60) {
    return 'Just now'
  }

  // Less than 30 days - use relative format
  if (secondsDiff < 2592000) {
    return formatDistanceToNowStrict(parsedDate, {
      addSuffix: true,
    })
  }

  // More than 30 days - use absolute date
  return format(parsedDate, 'MMM d, yyyy')
}

export function formatLocation(ipAddress?: string | null): string {
  // Implement IP geolocation if needed
  // For now, just return IP or unknown
  return ipAddress || 'Unknown location'
}
