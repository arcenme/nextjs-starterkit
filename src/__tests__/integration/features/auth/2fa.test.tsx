import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BackupCodeVerificationForm } from '@/features/auth/2fa/_components/backup-code-verification-form'
import { TotpVerificationForm } from '@/features/auth/2fa/_components/totp-verification-form'
import { render, screen, userEvent, waitFor } from '@/lib/vitest'

vi.mock('server-only', () => ({}))

vi.mock('@/lib/env-client', () => ({
  env: {
    NEXT_PUBLIC_APP_NAME: 'Test App',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_BETTER_AUTH_URL: 'http://localhost:3000/api/auth',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    NODE_ENV: 'test',
    S3_DEFAULT_REGION: 'us-east-1',
    S3_ENDPOINT: 'http://localhost:9000',
    S3_BUCKET_NAME: 'test-bucket',
    S3_ACCESS_KEY_ID: 'test-key',
    S3_SECRET_ACCESS_KEY: 'test-secret',
  },
}))

const mockVerifyTotp = vi.fn()
const mockVerifyBackupCode = vi.fn()
const mockPush = vi.fn()

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    twoFactor: {
      verifyTotp: (...args: unknown[]) => mockVerifyTotp(...args),
      verifyBackupCode: (...args: unknown[]) => mockVerifyBackupCode(...args),
    },
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(''),
}))

const mockToastError = vi.fn()
const mockToastSuccess = vi.fn()

vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}))

describe('2FA Verification Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock elementFromPoint for input-otp library
    if (!document.elementFromPoint) {
      document.elementFromPoint = vi.fn(() => null)
    }
  })

  describe('TotpVerificationForm', () => {
    it('renders TOTP verification form with all elements', () => {
      render(<TotpVerificationForm onSwitchToBackup={() => {}} />)

      expect(screen.getByText(/two-factor authentication/i)).toBeInTheDocument()
      expect(
        screen.getByText(/enter the 6-digit code from your authenticator app/i)
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(/trust this device for 30 days/i)
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /verify/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /use backup code instead/i })
      ).toBeInTheDocument()
    })

    it('displays shield icon in header', () => {
      render(<TotpVerificationForm onSwitchToBackup={() => {}} />)

      const icon = document.querySelector('[data-slot="card"] svg')
      expect(icon).toBeInTheDocument()
    })

    it('has trust device checkbox unchecked by default', () => {
      render(<TotpVerificationForm onSwitchToBackup={() => {}} />)

      const checkbox = screen.getByLabelText(/trust this device for 30 days/i)
      expect(checkbox).not.toBeChecked()
    })

    it('toggles trust device checkbox', async () => {
      render(<TotpVerificationForm onSwitchToBackup={() => {}} />)

      const checkbox = screen.getByLabelText(/trust this device for 30 days/i)
      await userEvent.click(checkbox)
      expect(checkbox).toBeChecked()

      await userEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('calls onSwitchToBackup when switch button is clicked', async () => {
      const mockSwitch = vi.fn()
      render(<TotpVerificationForm onSwitchToBackup={mockSwitch} />)

      await userEvent.click(
        screen.getByRole('button', { name: /use backup code instead/i })
      )

      expect(mockSwitch).toHaveBeenCalled()
    })

    it('verify button is disabled when code is incomplete', () => {
      render(<TotpVerificationForm onSwitchToBackup={() => {}} />)

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      expect(verifyButton).toBeDisabled()
    })

    it('disables switch button while loading', async () => {
      mockVerifyTotp.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ error: null }), 100)
          )
      )

      render(<TotpVerificationForm onSwitchToBackup={() => {}} />)

      // Fill the OTP input with 6 digits using the data-input-otp attribute
      const otpContainer = document.querySelector(
        '[data-input-otp-container="true"]'
      )
      const otpInput = otpContainer?.querySelector('input')
      if (otpInput) {
        await userEvent.type(otpInput, '123456')
      }

      await userEvent.click(screen.getByRole('button', { name: /verify/i }))

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /use backup code instead/i })
        ).toBeDisabled()
      })
    })

    it('shows error toast on verification error', async () => {
      mockVerifyTotp.mockResolvedValue({
        error: { message: 'Invalid code' },
        data: null,
      })

      render(<TotpVerificationForm onSwitchToBackup={() => {}} />)

      // Fill the OTP input
      const otpContainer = document.querySelector(
        '[data-input-otp-container="true"]'
      )
      const otpInput = otpContainer?.querySelector('input')
      if (otpInput) {
        await userEvent.type(otpInput, '123456')
      }

      await userEvent.click(screen.getByRole('button', { name: /verify/i }))

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Invalid code')
      })
    })

    it('redirects after successful verification', async () => {
      mockVerifyTotp.mockResolvedValue({ error: null, data: {} })

      render(<TotpVerificationForm onSwitchToBackup={() => {}} />)

      // Fill the OTP input
      const otpContainer = document.querySelector(
        '[data-input-otp-container="true"]'
      )
      const otpInput = otpContainer?.querySelector('input')
      if (otpInput) {
        await userEvent.type(otpInput, '123456')
      }

      await userEvent.click(screen.getByRole('button', { name: /verify/i }))

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Verification successful')
        expect(mockPush).toHaveBeenCalled()
      })
    })

    it('submits with trust device option', async () => {
      mockVerifyTotp.mockResolvedValue({ error: null, data: {} })

      render(<TotpVerificationForm onSwitchToBackup={() => {}} />)

      // Fill the OTP input
      const otpContainer = document.querySelector(
        '[data-input-otp-container="true"]'
      )
      const otpInput = otpContainer?.querySelector('input')
      if (otpInput) {
        await userEvent.type(otpInput, '123456')
      }

      await userEvent.click(
        screen.getByLabelText(/trust this device for 30 days/i)
      )

      await userEvent.click(screen.getByRole('button', { name: /verify/i }))

      await waitFor(() => {
        expect(mockVerifyTotp).toHaveBeenCalledWith(
          expect.objectContaining({
            trustDevice: true,
          })
        )
      })
    })
  })

  describe('BackupCodeVerificationForm', () => {
    it('renders backup code verification form with all elements', () => {
      render(<BackupCodeVerificationForm onSwitchToTotp={() => {}} />)

      expect(screen.getByText(/two-factor authentication/i)).toBeInTheDocument()
      expect(
        screen.getByText(/enter one of your backup recovery codes/i)
      ).toBeInTheDocument()
      expect(screen.getByLabelText(/backup code/i)).toBeInTheDocument()
      expect(
        screen.getByLabelText(/trust this device for 30 days/i)
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /verify/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /use authenticator app/i })
      ).toBeInTheDocument()
    })

    it('displays key icon in header', () => {
      render(<BackupCodeVerificationForm onSwitchToTotp={() => {}} />)

      const icon = document.querySelector('[data-slot="card"] svg')
      expect(icon).toBeInTheDocument()
    })

    it('has backup code input field', () => {
      render(<BackupCodeVerificationForm onSwitchToTotp={() => {}} />)

      const input = screen.getByPlaceholderText(/enter your backup code/i)
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'text')
    })

    it('has trust device checkbox unchecked by default', () => {
      render(<BackupCodeVerificationForm onSwitchToTotp={() => {}} />)

      const checkbox = screen.getByLabelText(/trust this device for 30 days/i)
      expect(checkbox).not.toBeChecked()
    })

    it('toggles trust device checkbox', async () => {
      render(<BackupCodeVerificationForm onSwitchToTotp={() => {}} />)

      const checkbox = screen.getByLabelText(/trust this device for 30 days/i)
      await userEvent.click(checkbox)
      expect(checkbox).toBeChecked()

      await userEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })

    it('calls onSwitchToTotp when switch button is clicked', async () => {
      const mockSwitch = vi.fn()
      render(<BackupCodeVerificationForm onSwitchToTotp={mockSwitch} />)

      await userEvent.click(
        screen.getByRole('button', { name: /use authenticator app/i })
      )

      expect(mockSwitch).toHaveBeenCalled()
    })

    it('verify button is disabled when form is empty', () => {
      render(<BackupCodeVerificationForm onSwitchToTotp={() => {}} />)

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      expect(verifyButton).toBeDisabled()
    })

    it('verify button is enabled after typing code', async () => {
      render(<BackupCodeVerificationForm onSwitchToTotp={() => {}} />)

      await userEvent.type(
        screen.getByPlaceholderText(/enter your backup code/i),
        'BACKUP123'
      )

      expect(screen.getByRole('button', { name: /verify/i })).not.toBeDisabled()
    })

    it('verify button is disabled while loading', async () => {
      mockVerifyBackupCode.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ error: null }), 100)
          )
      )

      render(<BackupCodeVerificationForm onSwitchToTotp={() => {}} />)

      await userEvent.type(
        screen.getByPlaceholderText(/enter your backup code/i),
        'BACKUP123'
      )

      const verifyButton = screen.getByRole('button', { name: /verify/i })
      await userEvent.click(verifyButton)

      await waitFor(() => {
        expect(verifyButton).toBeDisabled()
      })
    })

    it('disables switch button while loading', async () => {
      mockVerifyBackupCode.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ error: null }), 100)
          )
      )

      render(<BackupCodeVerificationForm onSwitchToTotp={() => {}} />)

      await userEvent.type(
        screen.getByPlaceholderText(/enter your backup code/i),
        'BACKUP123'
      )

      await userEvent.click(screen.getByRole('button', { name: /verify/i }))

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /use authenticator app/i })
        ).toBeDisabled()
      })
    })

    it('displays field error on invalid backup code', async () => {
      mockVerifyBackupCode.mockResolvedValue({
        error: { message: 'Invalid backup code' },
        data: null,
      })

      render(<BackupCodeVerificationForm onSwitchToTotp={() => {}} />)

      await userEvent.type(
        screen.getByPlaceholderText(/enter your backup code/i),
        'INVALID'
      )

      await userEvent.click(screen.getByRole('button', { name: /verify/i }))

      await waitFor(() => {
        expect(screen.getByText(/invalid backup code/i)).toBeInTheDocument()
      })
    })

    it('redirects after successful verification', async () => {
      mockVerifyBackupCode.mockResolvedValue({ error: null, data: {} })

      render(<BackupCodeVerificationForm onSwitchToTotp={() => {}} />)

      await userEvent.type(
        screen.getByPlaceholderText(/enter your backup code/i),
        'BACKUP123'
      )

      await userEvent.click(screen.getByRole('button', { name: /verify/i }))

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Verification successful')
        expect(mockPush).toHaveBeenCalled()
      })
    })

    it('submits with trust device option', async () => {
      mockVerifyBackupCode.mockResolvedValue({ error: null, data: {} })

      render(<BackupCodeVerificationForm onSwitchToTotp={() => {}} />)

      await userEvent.type(
        screen.getByPlaceholderText(/enter your backup code/i),
        'BACKUP123'
      )

      await userEvent.click(
        screen.getByLabelText(/trust this device for 30 days/i)
      )

      await userEvent.click(screen.getByRole('button', { name: /verify/i }))

      await waitFor(() => {
        expect(mockVerifyBackupCode).toHaveBeenCalledWith(
          expect.objectContaining({
            trustDevice: true,
          })
        )
      })
    })

    it('form has proper input attributes', () => {
      render(<BackupCodeVerificationForm onSwitchToTotp={() => {}} />)

      const input = screen.getByPlaceholderText(/enter your backup code/i)
      expect(input).toHaveAttribute('autocomplete', 'off')
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveFocus()
    })
  })
})
