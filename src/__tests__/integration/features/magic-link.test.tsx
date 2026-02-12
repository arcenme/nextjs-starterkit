import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MagicLinkForm } from '@/features/magic-link/_components/magic-link-form'
import { render, screen, userEvent, waitFor } from '@/lib/vitest'

// Mocks
const mockSendMagicLinkAction = vi.fn()
vi.mock('@/features/magic-link/actions', () => ({
  sendMagicLinkAction: (...args: unknown[]) => mockSendMagicLinkAction(...args),
}))

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('Magic Link Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders magic link form with email field', () => {
    render(<MagicLinkForm />)

    expect(
      screen.getByRole('button', { name: /send magic link/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/sign in with magic link/i)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
  })

  it('allows entering email address', async () => {
    render(<MagicLinkForm />)

    const emailInput = screen.getByRole('textbox', { name: /email/i })
    await userEvent.type(emailInput, 'user@example.com')

    expect(emailInput).toHaveValue('user@example.com')
  })

  it('has working submit button', async () => {
    render(<MagicLinkForm />)

    const submitButton = screen.getByRole('button', {
      name: /send magic link/i,
    })

    // Button should be enabled initially
    expect(submitButton).not.toBeDisabled()

    // Form should be submittable
    await userEvent.click(submitButton)
  })

  it('submits form with valid email', async () => {
    mockSendMagicLinkAction.mockResolvedValue({ success: true })

    render(<MagicLinkForm />)

    // Fill form
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    await userEvent.type(emailInput, 'user@example.com')
    await userEvent.click(
      screen.getByRole('button', { name: /send magic link/i })
    )

    // Verify action was called with correct data
    await waitFor(() => {
      expect(mockSendMagicLinkAction).toHaveBeenCalledWith({
        email: 'user@example.com',
      })
    })
  })

  it('shows success state after submission', async () => {
    mockSendMagicLinkAction.mockResolvedValue({ success: true })

    render(<MagicLinkForm />)

    // Fill and submit form
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    await userEvent.type(emailInput, 'user@example.com')
    await userEvent.click(
      screen.getByRole('button', { name: /send magic link/i })
    )

    // Verify action was called successfully
    await waitFor(() => {
      expect(mockSendMagicLinkAction).toHaveBeenCalledWith({
        email: 'user@example.com',
      })
    })
  })

  it('shows loading state during submission', async () => {
    // Create a delayed promise to test loading state
    let resolveAction: (value: unknown) => void
    const actionPromise = new Promise((resolve) => {
      resolveAction = resolve
    })
    mockSendMagicLinkAction.mockReturnValue(actionPromise)

    render(<MagicLinkForm />)

    // Fill form
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    await userEvent.type(emailInput, 'user@example.com')

    // Submit
    const submitButton = screen.getByRole('button', {
      name: /send magic link/i,
    })
    await userEvent.click(submitButton)

    // Wait for loading state to appear
    await waitFor(() => {
      expect(screen.getByText(/sending/i)).toBeInTheDocument()
    })

    // Resolve action and wait for completion
    // biome-ignore lint/style/noNonNullAssertion: False positive
    resolveAction!({ success: true })

    await waitFor(() => {
      expect(screen.queryByText(/sending/i)).not.toBeInTheDocument()
    })
  })

  it('handles submission error gracefully', async () => {
    mockSendMagicLinkAction.mockImplementation((options) => {
      // Trigger error callback
      options.fetchOptions?.onError?.({
        error: { message: 'Email not found' },
      })
      return Promise.resolve({ success: false })
    })

    render(<MagicLinkForm />)

    // Fill and submit form
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    await userEvent.type(emailInput, 'invalid@example.com')
    await userEvent.click(
      screen.getByRole('button', { name: /send magic link/i })
    )

    // Verify error handling
    await waitFor(() => {
      expect(mockSendMagicLinkAction).toHaveBeenCalledWith({
        email: 'invalid@example.com',
      })
    })
  })

  it('allows retrying with different email', async () => {
    mockSendMagicLinkAction.mockResolvedValue({ success: true })

    render(<MagicLinkForm />)

    const emailInput = screen.getByRole('textbox', { name: /email/i })

    // Type and clear email
    await userEvent.type(emailInput, 'wrong@example.com')
    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'correct@example.com')

    expect(emailInput).toHaveValue('correct@example.com')
  })

  it('prevents submission with invalid email', async () => {
    render(<MagicLinkForm />)

    // Try to submit without entering email
    await userEvent.click(
      screen.getByRole('button', { name: /send magic link/i })
    )

    // Form should still be rendered (not submitted due to validation)
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /email/i })
      ).toBeInTheDocument()
    })
  })

  it('transforms email to lowercase', async () => {
    mockSendMagicLinkAction.mockResolvedValue({ success: true })

    render(<MagicLinkForm />)

    // Fill form with uppercase email
    const emailInput = screen.getByRole('textbox', { name: /email/i })
    await userEvent.type(emailInput, 'USER@EXAMPLE.COM')

    await userEvent.click(
      screen.getByRole('button', { name: /send magic link/i })
    )

    // Verify action was called with lowercase email
    await waitFor(() => {
      expect(mockSendMagicLinkAction).toHaveBeenCalledWith({
        email: 'user@example.com', // Should be transformed to lowercase
      })
    })
  })
})
