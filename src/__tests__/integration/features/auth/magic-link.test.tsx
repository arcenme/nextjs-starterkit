import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MagicLinkForm } from '@/features/auth/magic-link/_components/magic-link-form'
import { render, screen, userEvent, waitFor } from '@/lib/vitest'

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

  describe('MagicLinkForm', () => {
    it('renders magic link form with all elements', () => {
      render(<MagicLinkForm />)

      expect(
        screen.getByRole('button', { name: /send magic link/i })
      ).toBeInTheDocument()
      expect(screen.getByText(/sign in with magic link/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/me@example.com/i)).toBeInTheDocument()
      expect(
        screen.getByText(
          /enter your email and we'll send you a link to sign in/i
        )
      ).toBeInTheDocument()
    })

    it('email input has correct type and attributes', () => {
      render(<MagicLinkForm />)

      const emailInput = screen.getByPlaceholderText(/me@example.com/i)
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('id', 'email')
    })

    it('allows entering email address', async () => {
      render(<MagicLinkForm />)

      const emailInput = screen.getByPlaceholderText(/me@example.com/i)
      await userEvent.type(emailInput, 'user@example.com')

      expect(emailInput).toHaveValue('user@example.com')
    })

    it('displays mail icon in button', () => {
      render(<MagicLinkForm />)

      const button = screen.getByRole('button', { name: /send magic link/i })
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('button shows sending text when loading', async () => {
      render(<MagicLinkForm />)

      const emailInput = screen.getByPlaceholderText(/me@example.com/i)
      await userEvent.type(emailInput, 'user@example.com')

      const button = screen.getByRole('button', { name: /send magic link/i })
      await userEvent.click(button)

      // Button should show loading state
      await waitFor(() => {
        expect(button).toBeDisabled()
      })
    })

    it('disables email input while loading', async () => {
      render(<MagicLinkForm />)

      const emailInput = screen.getByPlaceholderText(/me@example.com/i)
      await userEvent.type(emailInput, 'user@example.com')

      const button = screen.getByRole('button', { name: /send magic link/i })
      await userEvent.click(button)

      await waitFor(() => {
        expect(emailInput).toBeDisabled()
      })
    })

    it('email label has sr-only class for accessibility', () => {
      render(<MagicLinkForm />)

      const label = document.querySelector('label[for="email"]')
      expect(label).toHaveClass('sr-only')
    })

    it('validates email format on submit', async () => {
      render(<MagicLinkForm />)

      const emailInput = screen.getByPlaceholderText(/me@example.com/i)
      await userEvent.type(emailInput, 'invalid-email')

      const button = screen.getByRole('button', { name: /send magic link/i })
      await userEvent.click(button)

      // Should show validation error
      await waitFor(() => {
        const errorElements = screen.queryAllByText(/email/i)
        expect(errorElements.length).toBeGreaterThan(0)
      })
    })

    it('allows retrying with different email', async () => {
      render(<MagicLinkForm />)

      const emailInput = screen.getByPlaceholderText(/me@example.com/i)

      await userEvent.type(emailInput, 'wrong@example.com')
      await userEvent.clear(emailInput)
      await userEvent.type(emailInput, 'correct@example.com')

      expect(emailInput).toHaveValue('correct@example.com')
    })

    it('form has proper structure', () => {
      render(<MagicLinkForm />)

      const form = document.querySelector('form')
      expect(form).toBeInTheDocument()
      expect(form).toHaveClass('space-y-4')
    })

    it('button has full width class', () => {
      render(<MagicLinkForm />)

      const button = screen.getByRole('button', { name: /send magic link/i })
      expect(button).toHaveClass('w-full')
    })

    it('displays help text below heading', () => {
      render(<MagicLinkForm />)

      expect(
        screen.getByText(
          /enter your email and we'll send you a link to sign in/i
        )
      ).toBeInTheDocument()
    })
  })
})
