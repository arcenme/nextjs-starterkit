import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ActiveSessions } from '@/features/settings/session-management/_components/active-sessions'
import { render, screen } from '@/lib/vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/env-client', () => ({
  env: {
    NEXT_PUBLIC_APP_NAME: 'Test App',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_BETTER_AUTH_URL: 'http://localhost:3000/api/auth',
  },
}))

const mockSessions = [
  {
    id: 'session-1',
    token: 'current-token',
    expiresAt: new Date(Date.now() + 86400000),
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user-1',
  },
  {
    id: 'session-2',
    token: 'other-token-1',
    expiresAt: new Date(Date.now() + 86400000),
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
    userId: 'user-1',
  },
]

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.mock('@/features/settings/session-management/actions', () => ({
  revokeSessionAction: vi.fn(),
  revokeOtherSessionsAction: vi.fn(),
}))

vi.mock('@/lib/ua-parser', () => ({
  parseSession: vi.fn((session, currentToken) => ({
    id: session.id,
    token: session.token,
    deviceName: 'Chrome on Windows',
    deviceIcon: 'desktop',
    browserName: 'Chrome',
    location: 'United States',
    isCurrentDevice: session.token === currentToken,
    createdAt: session.createdAt,
  })),
  formatSessionTime: vi.fn(() => '2 hours ago'),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('Session Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders active sessions list', () => {
    render(
      <ActiveSessions
        currentSessionToken="current-token"
        sessions={mockSessions}
      />
    )

    expect(screen.getByText(/this device/i)).toBeInTheDocument()
  })

  it('shows this device section', () => {
    render(
      <ActiveSessions
        currentSessionToken="current-token"
        sessions={mockSessions}
      />
    )

    expect(screen.getByText(/this device/i)).toBeInTheDocument()
  })

  it('shows other devices section when there are other sessions', () => {
    render(
      <ActiveSessions
        currentSessionToken="current-token"
        sessions={mockSessions}
      />
    )

    expect(screen.getByText(/other devices/i)).toBeInTheDocument()
  })

  it('shows terminate all other sessions button when there are other sessions', () => {
    render(
      <ActiveSessions
        currentSessionToken="current-token"
        sessions={mockSessions}
      />
    )

    expect(
      screen.getByRole('button', { name: /terminate all other sessions/i })
    ).toBeInTheDocument()
  })

  it('shows current device with active now status', () => {
    render(
      <ActiveSessions
        currentSessionToken="current-token"
        sessions={mockSessions}
      />
    )

    expect(screen.getByText(/active now/i)).toBeInTheDocument()
  })

  it('shows no other devices when only current session exists', () => {
    render(
      <ActiveSessions
        currentSessionToken="current-token"
        sessions={[mockSessions[0]]}
      />
    )

    expect(screen.queryByText(/other devices/i)).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /terminate all other sessions/i })
    ).not.toBeInTheDocument()
  })
})
