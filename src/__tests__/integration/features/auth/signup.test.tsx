import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SignUpForm } from '@/features/auth/signup/_components/signup-form'
import { render, screen, userEvent } from '@/lib/vitest'

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

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      signUpEmail: vi.fn(),
    },
  },
}))

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
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

    expect(submitButton).not.toBeDisabled()

    await userEvent.click(submitButton)
  })

  it('displays validation errors for mismatched passwords', async () => {
    render(<SignUpForm />)

    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User')
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'SecurePass123!')
    await userEvent.type(
      screen.getByLabelText(/confirm password/i),
      'DifferentPass123!'
    )
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i })
    )

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
  })

  it('displays validation errors for weak passwords', async () => {
    render(<SignUpForm />)

    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User')
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'weak')
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'weak')
    await userEvent.click(
      screen.getByRole('button', { name: /create account/i })
    )

    expect(screen.getByText(/at least 8 characters/)).toBeInTheDocument()
  })
})
