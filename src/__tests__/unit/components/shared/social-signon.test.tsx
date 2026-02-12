import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SocialSignOn } from '@/components/shared/social-signon'
import { render, screen } from '@/lib/vitest'

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      social: vi.fn(),
    },
  },
}))

vi.mock('@/constants/routes', () => ({
  ROUTES: {
    REDIRECT_AFTER_SIGN_IN: '/dashboard',
  },
}))

const mockAuthClient = await import('@/lib/auth-client')

describe('SocialSignOn', () => {
  it('renders Google sign-in button', () => {
    render(<SocialSignOn />)

    const button = screen.getByRole('button', { name: /continue with google/i })
    expect(button).toBeInTheDocument()
  })

  it('calls authClient.signIn.social with Google provider on click', async () => {
    const user = userEvent.setup()
    render(<SocialSignOn />)

    const button = screen.getByRole('button', { name: /continue with google/i })
    await user.click(button)

    expect(mockAuthClient.authClient.signIn.social).toHaveBeenCalledWith({
      callbackURL: '/dashboard',
      provider: 'google',
    })
  })

  it('renders button with correct styling', () => {
    render(<SocialSignOn />)

    const button = screen.getByRole('button', { name: /continue with google/i })
    expect(button).toHaveClass('cursor-pointer')
    expect(button).toHaveAttribute('type', 'button')
    // Note: variant is passed to Button but becomes CSS classes
    expect(button).toHaveClass('border') // outline variant creates border instead of solid background
  })

  it('renders Google SVG icon', () => {
    render(<SocialSignOn />)

    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('viewBox', '0 0 262.00 262.00')
  })

  it('wraps buttons in Field component with correct classes', () => {
    render(<SocialSignOn />)

    const field = screen.getByRole('button').parentElement
    expect(field).toHaveClass('grid', 'grid-cols-1', 'gap-4')
  })

  it('displays correct button text', () => {
    render(<SocialSignOn />)

    expect(screen.getByText('Continue with Google')).toBeInTheDocument()
  })

  it('has correct accessibility attributes', () => {
    render(<SocialSignOn />)

    const button = screen.getByRole('button', { name: /continue with google/i })
    expect(button).toBeEnabled()
  })
})
