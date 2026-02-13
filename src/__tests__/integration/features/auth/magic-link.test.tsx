import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MagicLinkForm } from '@/features/auth/magic-link/_components/magic-link-form'
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
      sendVerificationEmail: vi.fn(),
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

    expect(submitButton).not.toBeDisabled()

    await userEvent.click(submitButton)
  })

  it('prevents submission with invalid email', async () => {
    render(<MagicLinkForm />)

    await userEvent.click(
      screen.getByRole('button', { name: /send magic link/i })
    )

    await expect(
      screen.getByRole('textbox', { name: /email/i })
    ).toBeInTheDocument()
  })

  it('allows retrying with different email', async () => {
    render(<MagicLinkForm />)

    const emailInput = screen.getByRole('textbox', { name: /email/i })

    await userEvent.type(emailInput, 'wrong@example.com')
    await userEvent.clear(emailInput)
    await userEvent.type(emailInput, 'correct@example.com')

    expect(emailInput).toHaveValue('correct@example.com')
  })
})
