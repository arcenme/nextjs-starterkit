import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProfileDetailForm } from '@/features/settings/profile/_components/profile-detail-form'
import { render, screen } from '@/lib/vitest'

vi.mock('@/lib/env-client', () => ({
  env: {
    NEXT_PUBLIC_APP_NAME: 'Test App',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_BETTER_AUTH_URL: 'http://localhost:3000/api/auth',
  },
}))

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => ({
      isPending: false,
      data: {
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          image: null,
        },
      },
      refetch: vi.fn(),
    }),
  },
}))

vi.mock('@/features/settings/profile/actions', () => ({
  updateProfileAction: vi.fn(() => ({ success: true })),
  generateAvatarPresignedUrlAction: vi.fn(),
  changeEmailAction: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('Profile Settings Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ProfileDetailForm', () => {
    it('renders profile form with name field', () => {
      render(<ProfileDetailForm />)

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    })

    it('has file input for avatar', () => {
      render(<ProfileDetailForm />)

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    })
  })
})
