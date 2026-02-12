import { describe, expect, it, vi } from 'vitest'

// Mock environment variables before importing
vi.mock('@/lib/env-client', () => ({
  env: {
    NEXT_PUBLIC_APP_NAME: 'Test App',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_BETTER_AUTH_URL: 'http://localhost:3000/api/auth',
  },
}))

// Mock Next.js router
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

import ForgotPasswordPage from '@/features/forgot-password'
import { render, screen } from '@/lib/vitest'

describe('ForgotPasswordPage', () => {
  it('renders the forgot password layout correctly', () => {
    render(<ForgotPasswordPage />)

    // Check main card structure
    expect(screen.getByText(/forgot your password\?/i)).toBeInTheDocument()
    expect(
      screen.getByText(/enter your email below to reset your password/i)
    ).toBeInTheDocument()
  })

  it('renders the forgot password form', () => {
    render(<ForgotPasswordPage />)

    // Check form elements
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /send reset link/i })
    ).toBeInTheDocument()
  })

  it('includes sign up link', () => {
    render(<ForgotPasswordPage />)

    const signUpLink = screen.getByRole('link', { name: /sign up/i })
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute('href', '/signup')
  })

  it('contains proper form description', () => {
    render(<ForgotPasswordPage />)

    // Check the "Don't have an account?" text
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument()
  })

  it('renders without errors', () => {
    render(<ForgotPasswordPage />)

    // Should render successfully without throwing errors
    expect(screen.getByText(/forgot your password\?/i)).toBeInTheDocument()
  })

  it('has proper accessible structure', () => {
    render(<ForgotPasswordPage />)

    // Check that we have the main elements
    expect(screen.getByText(/forgot your password\?/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /send reset link/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
  })
})
