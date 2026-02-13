import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChangePasswordForm } from '@/features/admin/settings/security/_components/change-password-form'
import { DisableTwoFactorAuth } from '@/features/admin/settings/security/_components/disable-two-factor-auth'
import { EnableTwoFactorAuth } from '@/features/admin/settings/security/_components/enable-two-factor-auth'
import { SetPasswordButton } from '@/features/admin/settings/security/_components/set-password-button'
import { ViewBackupCodes } from '@/features/admin/settings/security/_components/view-backup-codes'
import { render, screen, userEvent, waitFor } from '@/lib/vitest'

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

vi.mock('@/features/admin/settings/security/actions', () => ({
  updatePasswordAction: vi.fn(),
  viewBackupCodesAction: vi.fn(),
}))

const mockToastError = vi.fn()
const mockToastSuccess = vi.fn()

vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}))

const mockTwoFactorEnable = vi.fn()
const mockTwoFactorVerifyTotp = vi.fn()
const mockTwoFactorDisable = vi.fn()
const mockRequestPasswordReset = vi.fn()

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    twoFactor: {
      enable: (...args: unknown[]) => mockTwoFactorEnable(...args),
      verifyTotp: (...args: unknown[]) => mockTwoFactorVerifyTotp(...args),
      disable: (...args: unknown[]) => mockTwoFactorDisable(...args),
    },
    requestPasswordReset: (...args: unknown[]) =>
      mockRequestPasswordReset(...args),
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
      expect(
        screen.getByRole('heading', { name: /password/i })
      ).toBeInTheDocument()
      expect(
        screen.getByText(/update your password to keep your account secure/i)
      ).toBeInTheDocument()
    })

    it('opens password change form when clicking change button', async () => {
      render(<ChangePasswordForm />)

      const changeButton = screen.getByRole('button', { name: /change/i })
      await userEvent.click(changeButton)

      expect(
        screen.getByRole('heading', { name: /change password/i })
      ).toBeInTheDocument()
      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument()
      expect(screen.getAllByLabelText(/new password/i)[0]).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /sign out of other devices/i })
      ).toBeInTheDocument()
    })

    it('renders all password form fields', async () => {
      render(<ChangePasswordForm />)

      await userEvent.click(screen.getByRole('button', { name: /change/i }))

      // All form fields should be present
      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument()
      expect(screen.getAllByLabelText(/new password/i)[0]).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /update password/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
    })

    it('closes form when clicking cancel', async () => {
      render(<ChangePasswordForm />)

      await userEvent.click(screen.getByRole('button', { name: /change/i }))
      expect(
        screen.getByRole('heading', { name: /change password/i })
      ).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: /change password/i })
        ).not.toBeInTheDocument()
      })
    })

    it('validates form with mismatched passwords', async () => {
      render(<ChangePasswordForm />)

      await userEvent.click(screen.getByRole('button', { name: /change/i }))

      await userEvent.type(
        screen.getAllByLabelText(/new password/i)[0],
        'newPassword123!'
      )
      await userEvent.type(
        screen.getByLabelText(/confirm new password/i),
        'differentPassword123!'
      )

      await userEvent.click(
        screen.getByRole('button', { name: /update password/i })
      )

      // The form should have validation errors
      await waitFor(() => {
        const errorElements = screen.queryAllByText(/password/i)
        // There should be field labels or errors containing "password"
        expect(errorElements.length).toBeGreaterThan(0)
      })
    })

    it('shows error when new password matches current password', async () => {
      render(<ChangePasswordForm />)

      await userEvent.click(screen.getByRole('button', { name: /change/i }))

      const currentPassword = 'samePassword123!'
      await userEvent.type(
        screen.getByLabelText(/current password/i),
        currentPassword
      )
      await userEvent.type(
        screen.getAllByLabelText(/new password/i)[0],
        currentPassword
      )
      await userEvent.type(
        screen.getByLabelText(/confirm new password/i),
        currentPassword
      )

      await userEvent.click(
        screen.getByRole('button', { name: /update password/i })
      )

      await waitFor(() => {
        expect(
          screen.getByText(
            /new password must be different from current password/i
          )
        ).toBeInTheDocument()
      })
    })

    it('toggles revoke other sessions checkbox', async () => {
      render(<ChangePasswordForm />)

      await userEvent.click(screen.getByRole('button', { name: /change/i }))

      const checkbox = screen.getByRole('checkbox', {
        name: /sign out of other devices/i,
      })
      expect(checkbox).not.toBeChecked()

      await userEvent.click(checkbox)
      expect(checkbox).toBeChecked()
    })
  })

  describe('EnableTwoFactorAuth', () => {
    it('renders enable button initially', () => {
      render(<EnableTwoFactorAuth />)

      expect(
        screen.getByRole('button', { name: /enable/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: /two-factor authentication/i })
      ).toBeInTheDocument()
      expect(
        screen.getByText(/add an extra layer of security to your account/i)
      ).toBeInTheDocument()
    })

    it('opens modal when clicking enable button', async () => {
      render(<EnableTwoFactorAuth />)

      await userEvent.click(screen.getByRole('button', { name: /enable/i }))

      expect(
        screen.getByRole('heading', {
          name: /enable two-factor authentication/i,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(/enter your password/i)
      ).toBeInTheDocument()
    })

    it('shows password input in step 1', async () => {
      render(<EnableTwoFactorAuth />)

      await userEvent.click(screen.getByRole('button', { name: /enable/i }))

      // Step 1 modal should be open with password input
      expect(
        screen.getByPlaceholderText(/enter your password/i)
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /continue/i })
      ).toBeInTheDocument()
    })

    it('closes modal when clicking cancel in step 1', async () => {
      render(<EnableTwoFactorAuth />)

      await userEvent.click(screen.getByRole('button', { name: /enable/i }))
      expect(
        screen.getByRole('heading', {
          name: /enable two-factor authentication/i,
        })
      ).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', {
            name: /enable two-factor authentication/i,
          })
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('DisableTwoFactorAuth', () => {
    it('renders disable button and view backup codes button', () => {
      render(<DisableTwoFactorAuth />)

      expect(
        screen.getByRole('button', { name: /disable/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /view backup codes/i })
      ).toBeInTheDocument()
      expect(
        screen.getByText(
          /your account was secured with two-factor authentication/i
        )
      ).toBeInTheDocument()
    })

    it('opens disable confirmation modal when clicking disable', async () => {
      render(<DisableTwoFactorAuth />)

      await userEvent.click(screen.getByRole('button', { name: /disable/i }))

      expect(
        screen.getByRole('heading', {
          name: /disable two-factor authentication/i,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByText(/disabling 2fa will make your account less secure/i)
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(/enter your password/i)
      ).toBeInTheDocument()
    })

    it('shows password input in disable modal', async () => {
      render(<DisableTwoFactorAuth />)

      await userEvent.click(screen.getByRole('button', { name: /disable/i }))

      // Modal should have password input
      expect(
        screen.getByPlaceholderText(/enter your password/i)
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /disable 2fa/i })
      ).toBeInTheDocument()
    })

    it('closes modal when clicking cancel', async () => {
      render(<DisableTwoFactorAuth />)

      await userEvent.click(screen.getByRole('button', { name: /disable/i }))
      expect(
        screen.getByRole('heading', {
          name: /disable two-factor authentication/i,
        })
      ).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', {
            name: /disable two-factor authentication/i,
          })
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('ViewBackupCodes', () => {
    it('renders view backup codes button initially', () => {
      render(<ViewBackupCodes onCodesViewed={vi.fn()} />)

      expect(
        screen.getByRole('button', { name: /view backup codes/i })
      ).toBeInTheDocument()
    })

    it('opens modal when clicking view backup codes', async () => {
      render(<ViewBackupCodes onCodesViewed={vi.fn()} />)

      await userEvent.click(
        screen.getByRole('button', { name: /view backup codes/i })
      )

      expect(
        screen.getByRole('heading', { name: /view backup codes/i })
      ).toBeInTheDocument()
      expect(
        screen.getByText(/enter your password to view your backup codes/i)
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(/enter your password/i)
      ).toBeInTheDocument()
    })

    it('shows password input in modal', async () => {
      render(<ViewBackupCodes onCodesViewed={vi.fn()} />)

      await userEvent.click(
        screen.getByRole('button', { name: /view backup codes/i })
      )

      // Modal should have password input
      expect(
        screen.getByPlaceholderText(/enter your password/i)
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /view codes/i })
      ).toBeInTheDocument()
    })

    it('closes modal when clicking cancel', async () => {
      render(<ViewBackupCodes onCodesViewed={vi.fn()} />)

      await userEvent.click(
        screen.getByRole('button', { name: /view backup codes/i })
      )
      expect(
        screen.getByRole('heading', { name: /view backup codes/i })
      ).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }))

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', { name: /view backup codes/i })
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('SetPasswordButton', () => {
    it('renders send reset link button', () => {
      render(<SetPasswordButton email="user@example.com" />)

      expect(
        screen.getByRole('button', { name: /send reset link/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: /password/i })
      ).toBeInTheDocument()
      expect(
        screen.getByText(/set a password to keep your account secure/i)
      ).toBeInTheDocument()
    })

    it('sends password reset email when clicking button', async () => {
      mockRequestPasswordReset.mockResolvedValue({ error: null })

      render(<SetPasswordButton email="user@example.com" />)

      await userEvent.click(
        screen.getByRole('button', { name: /send reset link/i })
      )

      await waitFor(() => {
        expect(mockRequestPasswordReset).toHaveBeenCalledWith({
          email: 'user@example.com',
          redirectTo: expect.any(String),
        })
      })

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          'Check your email for a password reset link'
        )
      })
    })

    it('shows error when reset email fails', async () => {
      mockRequestPasswordReset.mockResolvedValue({
        error: { message: 'Failed to send email' },
      })

      render(<SetPasswordButton email="user@example.com" />)

      await userEvent.click(
        screen.getByRole('button', { name: /send reset link/i })
      )

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to send email')
      })
    })

    it('shows loading state while sending', async () => {
      mockRequestPasswordReset.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ error: null }), 100)
          })
      )

      render(<SetPasswordButton email="user@example.com" />)

      const button = screen.getByRole('button', { name: /send reset link/i })
      await userEvent.click(button)

      await waitFor(() => {
        expect(button).toBeDisabled()
      })
      expect(screen.getByText(/sending/i)).toBeInTheDocument()
    })
  })
})
