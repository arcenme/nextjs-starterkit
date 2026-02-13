import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TotpVerificationForm } from '@/features/auth/2fa/_components/totp-verification-form'
import { render, screen, userEvent } from '@/lib/vitest'

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

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    twoFactor: {
      verifyTotp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      verifyBackupCode: vi.fn(),
    },
  },
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(''),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('TotpVerificationForm Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders TOTP verification form', () => {
    render(<TotpVerificationForm onSwitchToBackup={() => {}} />)

    expect(screen.getByText(/two-factor authentication/i)).toBeInTheDocument()
    expect(screen.getByText(/enter the 6-digit code/i)).toBeInTheDocument()
  })

  it('has trust device checkbox', () => {
    render(<TotpVerificationForm onSwitchToBackup={() => {}} />)

    expect(
      screen.getByLabelText(/trust this device for 30 days/i)
    ).toBeInTheDocument()
  })

  it('has switch to backup code button', () => {
    render(<TotpVerificationForm onSwitchToBackup={() => {}} />)

    expect(
      screen.getByRole('button', { name: /use backup code instead/i })
    ).toBeInTheDocument()
  })

  it('calls onSwitchToBackup when switch button is clicked', async () => {
    const mockSwitch = vi.fn()
    render(<TotpVerificationForm onSwitchToBackup={mockSwitch} />)

    await userEvent.click(
      screen.getByRole('button', { name: /use backup code instead/i })
    )

    expect(mockSwitch).toHaveBeenCalled()
  })

  it('has verify button', () => {
    render(<TotpVerificationForm onSwitchToBackup={() => {}} />)

    expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument()
  })

  it('verify button is disabled when code is incomplete', () => {
    render(<TotpVerificationForm onSwitchToBackup={() => {}} />)

    expect(screen.getByRole('button', { name: /verify/i })).toBeDisabled()
  })

  it('has input slots for digits', () => {
    render(<TotpVerificationForm onSwitchToBackup={() => {}} />)

    const inputs = document.querySelectorAll('input')
    expect(inputs.length).toBeGreaterThan(0)
  })
})
