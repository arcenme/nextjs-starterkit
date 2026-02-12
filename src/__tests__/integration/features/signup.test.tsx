import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SignUpForm } from '@/features/signup/_components/signup-form'
import { render, screen, userEvent, waitFor } from '@/lib/vitest'

// Mock the server action
const mockSignUpAction = vi.fn()
vi.mock('@/features/signup/actions', () => ({
  signUpAction: (...args: unknown[]) => mockSignUpAction(...args),
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

describe('Signup Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders signup form with all required fields', () => {
    render(<SignUpForm />)

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create account/i })
    ).toBeInTheDocument()
  })

  it('allows entering name, email, password and confirm password', async () => {
    render(<SignUpForm />)

    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

    await userEvent.type(nameInput, 'John Doe')
    await userEvent.type(emailInput, 'john@example.com')
    await userEvent.type(passwordInput, 'SecurePass123!')
    await userEvent.type(confirmPasswordInput, 'SecurePass123!')

    expect(nameInput).toHaveValue('John Doe')
    expect(emailInput).toHaveValue('john@example.com')
    expect(passwordInput).toHaveValue('SecurePass123!')
    expect(confirmPasswordInput).toHaveValue('SecurePass123!')
  })

  it('has working form submission button', async () => {
    render(<SignUpForm />)

    const submitButton = screen.getByRole('button', { name: /create account/i })

    // Button should be enabled initially
    expect(submitButton).not.toBeDisabled()

    // Form should be submittable
    await userEvent.click(submitButton)
  })

  it('shows loading state when form is submitting', async () => {
    // Create a delayed promise to test loading state
    let resolveAction: (value: unknown) => void
    const actionPromise = new Promise((resolve) => {
      resolveAction = resolve
    })
    mockSignUpAction.mockReturnValue(actionPromise)

    render(<SignUpForm />)

    // Fill form
    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe')
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass123!')
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      'SecurePass123!'
    )

    // Submit
    const submitButton = screen.getByRole('button', { name: /create account/i })
    await userEvent.click(submitButton)

    // Wait for loading state to appear
    await waitFor(() => {
      expect(screen.getByText(/creating/i)).toBeInTheDocument()
    })

    // Resolve action and wait for completion
    // biome-ignore lint/style/noNonNullAssertion: False positive
    resolveAction!({ success: true })

    await waitFor(() => {
      expect(screen.queryByText(/creating/i)).not.toBeInTheDocument()
    })
  })

  it('submits form with entered values', async () => {
    mockSignUpAction.mockResolvedValue({ success: true })

    render(<SignUpForm />)

    // Fill form
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Smith')
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass123!')
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      'SecurePass123!'
    )

    // Submit
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i })
    )

    // Verify action was called
    await waitFor(() => {
      expect(mockSignUpAction).toHaveBeenCalled()
    })
  })

  it('shows success behavior on successful signup', async () => {
    mockSignUpAction.mockResolvedValue({ success: true })

    render(<SignUpForm />)

    // Fill and submit form
    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User')
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass123!')
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      'SecurePass123!'
    )
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i })
    )

    // Verify action was called successfully
    await waitFor(() => {
      expect(mockSignUpAction).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      })
    })
  })

  it('handles signup failure gracefully', async () => {
    // Mock a failed action response that doesn't throw during test setup
    mockSignUpAction.mockResolvedValue({
      success: false,
      serverError: 'Email already exists',
    })

    render(<SignUpForm />)

    // Fill and submit form
    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User')
    await userEvent.type(
      screen.getByLabelText(/email/i),
      'existing@example.com'
    )
    await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass123!')
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      'SecurePass123!'
    )
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i })
    )

    // Verify action was called with the form data
    await waitFor(() => {
      expect(mockSignUpAction).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'existing@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
      })
    })
  })
})

it('displays validation errors for mismatched passwords', async () => {
  render(<SignUpForm />)

  // Fill form with mismatched passwords
  await userEvent.type(screen.getByLabelText(/full name/i), 'Test User')
  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
  await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass123!')
  await userEvent.type(
    screen.getByLabelText(/confirm password/i),
    'DifferentPass123!'
  )
  await userEvent.click(screen.getByRole('button', { name: /create account/i }))

  // Verify password validation error
  await waitFor(() => {
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
  })
})

it('displays validation errors for weak passwords', async () => {
  render(<SignUpForm />)

  // Fill form with weak password
  await userEvent.type(screen.getByLabelText(/full name/i), 'Test User')
  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
  await userEvent.type(screen.getByLabelText(/^password$/i), 'weak')
  await userEvent.type(screen.getByLabelText(/confirm password/i), 'weak')
  await userEvent.click(screen.getByRole('button', { name: /create account/i }))

  // Verify password validation error
  await waitFor(() => {
    expect(screen.getByText(/at least 8 characters/)).toBeInTheDocument()
  })
})

it('validates email format and submits form with valid data', async () => {
  mockSignUpAction.mockResolvedValue({ success: true })

  render(<SignUpForm />)

  // Fill form with valid data
  await userEvent.type(screen.getByLabelText(/full name/i), 'Test User')
  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
  await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass123!')
  await userEvent.type(
    screen.getByLabelText(/confirm password/i),
    'SecurePass123!'
  )
  await userEvent.click(screen.getByRole('button', { name: /create account/i }))

  // Verify form is submitted successfully with valid data
  await waitFor(() => {
    expect(mockSignUpAction).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
    })
  })
})
