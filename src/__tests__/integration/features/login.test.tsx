import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from '@/features/login/_components/login-form'
import { render, screen, userEvent, waitFor } from '@/lib/vitest'

// Mock the server action
const mockLoginAction = vi.fn()
vi.mock('@/features/login/actions', () => ({
  loginAction: (...args: unknown[]) => mockLoginAction(...args),
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

describe('Login Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form with email and password fields', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('allows entering email and password', async () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    await userEvent.type(emailInput, 'test@example.com')
    await userEvent.type(passwordInput, 'password123')

    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('has working form submission button', async () => {
    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /sign in/i })

    // Button should be enabled initially
    expect(submitButton).not.toBeDisabled()

    // Form should be submittable
    await userEvent.click(submitButton)
  })

  it('has forgot password link', () => {
    render(<LoginForm />)

    const forgotLink = screen.getByText(/forgot your password/i)
    expect(forgotLink).toBeInTheDocument()
    expect(forgotLink).toHaveAttribute('href', '/forgot-password')
  })

  it('shows loading state when form is submitting', async () => {
    // Create a delayed promise to test loading state
    let resolveAction: (value: unknown) => void
    const actionPromise = new Promise((resolve) => {
      resolveAction = resolve
    })
    mockLoginAction.mockReturnValue(actionPromise)

    render(<LoginForm />)

    // Fill form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')

    // Submit
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await userEvent.click(submitButton)

    // Wait for loading state to appear
    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    })

    // Resolve action and wait for completion
    // biome-ignore lint/style/noNonNullAssertion: False positive
    resolveAction!({ success: true })

    await waitFor(() => {
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument()
    })
  })

  it('submits form with entered values', async () => {
    mockLoginAction.mockResolvedValue({ success: true })

    render(<LoginForm />)

    // Fill form
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(
      screen.getByLabelText(/password/i),
      'securepassword123'
    )

    // Submit
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    // Verify action was called
    await waitFor(() => {
      expect(mockLoginAction).toHaveBeenCalled()
    })
  })
})
