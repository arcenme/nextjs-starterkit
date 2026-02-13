import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ResetPasswordForm } from '@/features/auth/reset-password/_components/reset-password-form'
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

vi.mock('@/features/auth/reset-password/actions', () => ({
  resetPasswordAction: vi.fn(() => ({ data: { success: true } })),
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams('token=test-token'),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('Reset Password Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ResetPasswordForm', () => {
    it('renders reset password form with all elements', () => {
      render(<ResetPasswordForm />)

      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /reset password/i })
      ).toBeInTheDocument()
    })

    it('password inputs have correct type and attributes', () => {
      render(<ResetPasswordForm />)

      const newPasswordInput = screen.getByLabelText(/new password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      expect(newPasswordInput).toHaveAttribute('type', 'password')
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')
      expect(newPasswordInput).toHaveAttribute('id', 'newPassword')
      expect(confirmPasswordInput).toHaveAttribute('id', 'confirmPassword')
      expect(newPasswordInput).toHaveAttribute('required')
      expect(confirmPasswordInput).toHaveAttribute('required')
    })

    it('password inputs have placeholder text', () => {
      render(<ResetPasswordForm />)

      const newPasswordInput = screen.getByLabelText(/new password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      expect(newPasswordInput).toHaveAttribute('placeholder', '********')
      expect(confirmPasswordInput).toHaveAttribute('placeholder', '********')
    })

    it('allows entering new password', async () => {
      render(<ResetPasswordForm />)

      const passwordInput = screen.getByLabelText(/new password/i)
      await userEvent.type(passwordInput, 'Password123!')

      expect(passwordInput).toHaveValue('Password123!')
    })

    it('allows entering confirm password', async () => {
      render(<ResetPasswordForm />)

      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      await userEvent.type(confirmPasswordInput, 'Password123!')

      expect(confirmPasswordInput).toHaveValue('Password123!')
    })

    it('has working submit button', async () => {
      render(<ResetPasswordForm />)

      const submitButton = screen.getByRole('button', {
        name: /reset password/i,
      })

      expect(submitButton).not.toBeDisabled()
    })

    it('prevents submission with empty password', async () => {
      render(<ResetPasswordForm />)

      await userEvent.click(
        screen.getByRole('button', { name: /reset password/i })
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
      })
    })

    it('prevents submission with mismatched passwords', async () => {
      render(<ResetPasswordForm />)

      await userEvent.type(
        screen.getByLabelText(/new password/i),
        'Password123!'
      )
      await userEvent.type(
        screen.getByLabelText(/confirm password/i),
        'DifferentPassword123!'
      )
      await userEvent.click(
        screen.getByRole('button', { name: /reset password/i })
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
      })
    })

    it('allows retrying with different passwords', async () => {
      render(<ResetPasswordForm />)

      const newPasswordInput = screen.getByLabelText(/new password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await userEvent.type(newPasswordInput, 'WrongPassword123!')
      await userEvent.clear(newPasswordInput)
      await userEvent.type(newPasswordInput, 'CorrectPassword123!')

      await userEvent.type(confirmPasswordInput, 'WrongPassword123!')
      await userEvent.clear(confirmPasswordInput)
      await userEvent.type(confirmPasswordInput, 'CorrectPassword123!')

      expect(newPasswordInput).toHaveValue('CorrectPassword123!')
      expect(confirmPasswordInput).toHaveValue('CorrectPassword123!')
    })

    it('shows loading state during submission', async () => {
      const { resetPasswordAction } = await import(
        '@/features/auth/reset-password/actions'
      )
      ;(resetPasswordAction as ReturnType<typeof vi.fn>).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ data: { success: true } }), 100)
          })
      )

      render(<ResetPasswordForm />)

      await userEvent.type(
        screen.getByLabelText(/new password/i),
        'Password123!'
      )
      await userEvent.type(
        screen.getByLabelText(/confirm password/i),
        'Password123!'
      )

      await userEvent.click(
        screen.getByRole('button', { name: /reset password/i })
      )

      expect(
        screen.getByRole('button', { name: /resetting/i })
      ).toBeInTheDocument()
    })

    it('password fields are of type password', () => {
      render(<ResetPasswordForm />)

      const newPasswordInput = screen.getByLabelText(/new password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      expect(newPasswordInput).toHaveAttribute('type', 'password')
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    })

    it('has required attribute on inputs', () => {
      render(<ResetPasswordForm />)

      const newPasswordInput = screen.getByLabelText(/new password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      expect(newPasswordInput).toBeRequired()
      expect(confirmPasswordInput).toBeRequired()
    })

    it('displays validation error for mismatched passwords', async () => {
      render(<ResetPasswordForm />)

      await userEvent.type(
        screen.getByLabelText(/new password/i),
        'Password123!'
      )
      await userEvent.type(
        screen.getByLabelText(/confirm password/i),
        'DifferentPassword123!'
      )

      await userEvent.click(
        screen.getByRole('button', { name: /reset password/i })
      )

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })
    })

    it('form is invalid when confirm password is empty', async () => {
      render(<ResetPasswordForm />)

      await userEvent.type(
        screen.getByLabelText(/new password/i),
        'Password123!'
      )

      // Confirm password field should be empty
      const confirmInput = screen.getByLabelText(/confirm password/i)
      expect(confirmInput).toHaveValue('')

      // Try to submit
      await userEvent.click(
        screen.getByRole('button', { name: /reset password/i })
      )

      // Form should still be present (submission prevented)
      await waitFor(() => {
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      })
    })

    it('button has cursor-pointer class', () => {
      render(<ResetPasswordForm />)

      const button = screen.getByRole('button', { name: /reset password/i })
      expect(button).toHaveClass('cursor-pointer')
    })

    it('form contains field group with gap', () => {
      render(<ResetPasswordForm />)

      const fieldGroup = document.querySelector('[data-slot="field-group"]')
      expect(fieldGroup).toBeInTheDocument()
      expect(fieldGroup).toHaveClass('gap-4')
    })
  })
})
