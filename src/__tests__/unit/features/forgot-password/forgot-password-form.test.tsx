import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ForgotPasswordForm } from '@/features/forgot-password/_components/forgot-password-form'
import { act, render, screen, userEvent, waitFor } from '@/lib/vitest'

// Mock auth client
const mockRequestPasswordReset = vi.fn()
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    requestPasswordReset: (...args: unknown[]) =>
      mockRequestPasswordReset(...args),
  },
}))

// Mock router
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

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form with correct elements', () => {
    render(<ForgotPasswordForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /send reset link/i })
    ).toBeInTheDocument()
  })

  it('has correct input attributes', () => {
    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('id', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(emailInput).toHaveAttribute('placeholder', 'me@example.com')
  })

  it('has accessible field structure', () => {
    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toHaveAccessibleName('Email')
  })

  it('shows loading state when submitting', async () => {
    // Create a delayed promise to test loading state
    let resolveAction: (value: unknown) => void
    const actionPromise = new Promise((resolve) => {
      resolveAction = resolve
    })
    mockRequestPasswordReset.mockReturnValue(actionPromise)

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    await userEvent.type(emailInput, 'test@example.com')

    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    })

    // Button should be enabled initially
    expect(submitButton).not.toBeDisabled()
    expect(submitButton).toHaveTextContent('Send reset link')

    // Submit the form
    await userEvent.click(submitButton)

    // Button should show loading state
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText('Loading ...')).toBeInTheDocument()

    // Resolve the action
    // biome-ignore lint/style/noNonNullAssertion: False positive
    resolveAction!({ success: true })

    // Button should be enabled again
    await waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled()
    })
  })

  it('initializes form with empty email field', () => {
    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    expect(emailInput.value).toBe('')
  })

  it('validates email format on blur', async () => {
    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    })

    // Type invalid email
    await userEvent.type(emailInput, 'invalid-email')
    await userEvent.tab() // Blur the input

    // Try to submit - form should prevent submission
    await userEvent.click(submitButton)

    // Form should not have called the action due to validation error
    expect(mockRequestPasswordReset).not.toHaveBeenCalled()
  })

  it('handles form submission with valid email', async () => {
    mockRequestPasswordReset.mockResolvedValue({ success: true })

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    })

    // Fill form with valid email
    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.click(submitButton)

    // Verify the auth client was called
    expect(mockRequestPasswordReset).toHaveBeenCalledWith({
      email: 'test@example.com',
      redirectTo: '/reset-password',
      fetchOptions: expect.any(Object),
    })
  })

  it('clears validation error when input becomes valid', async () => {
    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    })

    // Type invalid email and blur
    await userEvent.type(emailInput, 'invalid')
    await userEvent.tab()

    // Try to submit (should be blocked by validation)
    await userEvent.click(submitButton)
    expect(mockRequestPasswordReset).not.toHaveBeenCalled()

    // Clear and type valid email
    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'valid@example.com')
    await userEvent.click(submitButton)

    // Now it should submit
    expect(mockRequestPasswordReset).toHaveBeenCalledWith({
      email: 'valid@example.com',
      redirectTo: '/reset-password',
      fetchOptions: expect.any(Object),
    })
  })

  it('trims email whitespace before submission', async () => {
    mockRequestPasswordReset.mockResolvedValue({ success: true })

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    })

    // Fill form with email containing whitespace
    await userEvent.type(emailInput, '  test@example.com  ')
    await userEvent.click(submitButton)

    // Verify the auth client was called with trimmed email
    expect(mockRequestPasswordReset).toHaveBeenCalledWith({
      email: 'test@example.com', // Should be trimmed
      redirectTo: '/reset-password',
      fetchOptions: expect.any(Object),
    })
  })

  it('handles keyboard submission', async () => {
    mockRequestPasswordReset.mockResolvedValue({ success: true })

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)

    // Fill form and submit with Enter key
    await userEvent.type(emailInput, 'test@example.com{enter}')

    // Verify the auth client was called
    expect(mockRequestPasswordReset).toHaveBeenCalledWith({
      email: 'test@example.com',
      redirectTo: '/reset-password',
      fetchOptions: expect.any(Object),
    })
  })

  it('prevents multiple submissions while loading', async () => {
    let resolveAction: (value: unknown) => void
    const actionPromise = new Promise((resolve) => {
      resolveAction = resolve
    })
    mockRequestPasswordReset.mockReturnValue(actionPromise)

    render(<ForgotPasswordForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', {
      name: /send reset link/i,
    })

    // Fill form and submit multiple times quickly
    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.click(submitButton)
    await userEvent.click(submitButton)

    // Should only be called once due to loading state
    expect(mockRequestPasswordReset).toHaveBeenCalledTimes(1)

    // Resolve action
    await act(async () => {
      resolveAction?.({ success: true })
    })
  })
})
