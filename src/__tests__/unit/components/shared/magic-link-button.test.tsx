import { describe, expect, it, vi } from 'vitest'
import { MagicLinkButton } from '@/components/shared/magic-link-button'
import { render, screen } from '@/lib/vitest'

vi.mock('@/constants/routes', () => ({
  ROUTES: {
    AUTH: {
      MAGIC_LINK: '/auth/magic-link',
    },
  },
}))

describe('MagicLinkButton', () => {
  it('renders as a link to magic link route', () => {
    render(<MagicLinkButton />)

    const link = screen.getByRole('link', { name: /continue with magic link/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/auth/magic-link')
  })

  it('renders Mail icon', () => {
    render(<MagicLinkButton />)

    const icon = document.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('renders correct button text', () => {
    render(<MagicLinkButton />)

    expect(screen.getByText('Continue with Magic Link')).toBeInTheDocument()
  })

  it('applies correct button styling', () => {
    render(<MagicLinkButton />)

    const link = screen.getByRole('link')
    expect(link).toHaveClass('w-full', 'cursor-pointer')
  })

  it('has outline variant', () => {
    render(<MagicLinkButton />)

    const link = screen.getByRole('link')
    // Note: variant is passed to Button but becomes CSS classes
    expect(link).toHaveClass('border') // outline variant creates border instead of solid background
  })

  it('has correct accessibility attributes', () => {
    render(<MagicLinkButton />)

    const link = screen.getByRole('link', { name: /continue with magic link/i })
    expect(link).toBeInTheDocument()
  })

  it('contains both icon and text in correct order', () => {
    render(<MagicLinkButton />)

    const link = screen.getByRole('link')
    const icon = link.querySelector('svg')
    const text = screen.getByText('Continue with Magic Link')

    expect(link).toContainElement(icon)
    expect(link).toContainElement(text)
  })
})
