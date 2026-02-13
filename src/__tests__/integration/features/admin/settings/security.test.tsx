import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChangePasswordForm } from '@/features/admin/settings/security/_components/change-password-form'
import { render, screen } from '@/lib/vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/env-client', () => ({
  env: {
    NEXT_PUBLIC_APP_NAME: 'Test App',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_BETTER_AUTH_URL: 'http://localhost:3000/api/auth',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    NODE_ENV: 'test',
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      listUserAccounts: vi.fn(),
    },
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

vi.mock('@/features/settings/security/actions', () => ({
  updatePasswordAction: vi.fn(() => ({ success: true })),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('Security Settings Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ChangePasswordForm', () => {
    it('renders change password button initially', () => {
      render(<ChangePasswordForm />)

      expect(
        screen.getByRole('button', { name: /change/i })
      ).toBeInTheDocument()
    })
  })
})
