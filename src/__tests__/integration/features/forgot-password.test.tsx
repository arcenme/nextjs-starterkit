import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ForgotPasswordForm } from '@/features/forgot-password/_components/forgot-password-form'
import { render, screen, userEvent, waitFor } from '@/lib/vitest'

// Mock the auth client
const mockRequestPasswordReset = vi.fn()
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    requestPasswordReset: (...args: unknown[]) =>
      mockRequestPasswordReset(...args),
  },
}))

// Mock the router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('Forgot Password Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders forgot password form with email field', () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /send reset link/i })
    ).toBeInTheDocument()
  })

  it('allows entering email address', async () => {
    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await userEvent.type(emailInput, 'user@example.com')

    expect(emailInput).toHaveValue('user@example.com')
  })

  it('has working submit button', async () => {
    render(<ForgotPasswordForm />)

    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    })

    // Button should be enabled initially
    expect(submitButton).not.toBeDisabled()

    // Form should be submittable
    await userEvent.click(submitButton)
  })

  it('submits form with valid email', async () => {
    mockRequestPasswordReset.mockResolvedValue({ success: true })

    render(<ForgotPasswordForm />)

    // Fill form
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.click(
      screen.getByRole('button', { name: /send reset link/i })
    )

    // Verify auth client was called with correct data
    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith({
        email: 'user@example.com',
        redirectTo: '/reset-password',
        fetchOptions: expect.any(Object),
      })
    })
  })

  it('redirects to login after successful submission', async () => {
    mockRequestPasswordReset.mockImplementation((options) => {
      // Trigger success callback
      options.fetchOptions?.onSuccess?.({ data: { message: 'Success' } })
      return Promise.resolve({ success: true })
    })

    render(<ForgotPasswordForm />)

    // Fill and submit form
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.click(
      screen.getByRole('button', { name: /send reset link/i })
    )

    // Verify redirect to login page
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('handles error callback on failed submission', async () => {
    mockRequestPasswordReset.mockImplementation((options) => {
      // Trigger error callback
      options.fetchOptions?.onError?.({ error: { message: 'Email not found' } })
      return Promise.resolve({ success: false })
    })

    render(<ForgotPasswordForm />)

    // Fill and submit form
    await userEvent.type(
      screen.getByLabelText(/email/i),
      'nonexistent@example.com'
    )
    await userEvent.click(
      screen.getByRole('button', { name: /send reset link/i })
    )

    // Verify error handling
    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith({
        email: 'nonexistent@example.com',
        redirectTo: '/reset-password',
        fetchOptions: expect.any(Object),
      })
    })
  })

  it('allows retrying with different email', async () => {
    mockRequestPasswordReset.mockResolvedValue({ success: true })

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)

    // Type and clear email
    await userEvent.type(emailInput, 'wrong@example.com')
    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'correct@example.com')

    expect(emailInput).toHaveValue('correct@example.com')
  })

  it('prevents submission with invalid email', async () => {
    render(<ForgotPasswordForm />)

    // Try to submit without entering email
    await userEvent.click(
      screen.getByRole('button', { name: /send reset link/i })
    )

    // Form should still be rendered (not submitted due to validation)
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    })
  })

  it('shows success toast on successful submission', async () => {
    const { toast } = await import('sonner')

    mockRequestPasswordReset.mockImplementation((options) => {
      // Trigger success callback
      options.fetchOptions?.onSuccess?.({
        data: { message: 'Password reset email sent' },
      })
      return Promise.resolve({ success: true })
    })

    render(<ForgotPasswordForm />)

    // Fill and submit form
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.click(
      screen.getByRole('button', { name: /send reset link/i })
    )

    // Verify success toast was called
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Password reset email sent')
    })
  })

  it('shows error toast on failed submission', async () => {
    const { toast } = await import('sonner')

    mockRequestPasswordReset.mockImplementation((options) => {
      // Trigger error callback
      options.fetchOptions?.onError?.({
        error: { message: 'Email not found' },
      })
      return Promise.resolve({ success: false })
    })

    render(<ForgotPasswordForm />)

    // Fill and submit form
    await userEvent.type(
      screen.getByLabelText(/email/i),
      'nonexistent@example.com'
    )
    await userEvent.click(
      screen.getByRole('button', { name: /send reset link/i })
    )

    // Verify error toast was called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email not found')
    })
  })

  it('handles multiple rapid submissions gracefully', async () => {
    let resolveAction: (value: unknown) => void
    const actionPromise = new Promise((resolve) => {
      resolveAction = resolve
    })
    mockRequestPasswordReset.mockReturnValue(actionPromise)

    render(<ForgotPasswordForm />)

    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    })

    // Fill form and submit multiple times rapidly
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.click(submitButton)
    await userEvent.click(submitButton)

    // Should only be called once due to loading state
    expect(mockRequestPasswordReset).toHaveBeenCalledTimes(1)

    // Resolve the action
    await act(async () => {
      resolveAction?.({ success: true })
    })
  })

  it('displays validation error for empty email', async () => {
    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    })

    // Focus and blur empty email to trigger validation
    await userEvent.click(emailInput)
    await userEvent.tab()

    // Try to submit
    await userEvent.click(submitButton)

    // Should not call the action due to validation error
    expect(mockRequestPasswordReset).not.toHaveBeenCalled()
  })

  it('handles submission with whitespace-only email', async () => {
    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    })

    // Type only whitespace
    await userEvent.type(emailInput, '   ')
    await userEvent.tab() // Blur to trigger validation

    // Try to submit
    await userEvent.click(submitButton)

    // Should not call the action due to validation error
    expect(mockRequestPasswordReset).not.toHaveBeenCalled()
  })

  it('submits with correct redirect URL', async () => {
    mockRequestPasswordReset.mockResolvedValue({ success: true })

    render(<ForgotPasswordForm />)

    // Fill and submit form
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.click(
      screen.getByRole('button', { name: /send reset link/i })
    )

    // Verify correct redirect URL is passed
    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith({
        email: 'user@example.com',
        redirectTo: '/reset-password',
        fetchOptions: expect.any(Object),
      })
    })
  })

  it('maintains form state after failed submission', async () => {
    mockRequestPasswordReset.mockImplementation((options) => {
      // Trigger error callback
      options.fetchOptions?.onError?.({
        error: { message: 'Server error' },
      })
      return Promise.resolve({ success: false })
    })

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)

    // Fill form with email
    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.click(
      screen.getByRole('button', { name: /send reset link/i })
    )

    // Wait for error handling
    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalled()
    })

    // Form should still contain the entered email
    expect(emailInput).toHaveValue('test@example.com')

    // Button should be enabled again
    expect(
      screen.getByRole('button', { name: /send reset link/i })
    ).not.toBeDisabled()
  })
})
