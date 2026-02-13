import { describe, expect, it } from 'vitest'
import { DynamicBreadcrumbs } from '@/components/shared/breadcrumbs'
import { render, screen } from '@/lib/vitest'

describe('DynamicBreadcrumbs', () => {
  it('returns null when no segments', () => {
    const { container } = render(<DynamicBreadcrumbs segments={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when only admin segment', () => {
    const { container } = render(<DynamicBreadcrumbs segments={['admin']} />)
    expect(container.firstChild).toBeNull()
  })

  it('filters out admin segment', () => {
    render(<DynamicBreadcrumbs segments={['admin', 'settings']} />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('renders single segment as current page', () => {
    render(<DynamicBreadcrumbs segments={['settings']} />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders multiple segments with links', () => {
    render(<DynamicBreadcrumbs segments={['admin', 'settings', 'profile']} />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('formats kebab-case segments', () => {
    render(
      <DynamicBreadcrumbs segments={['user-settings', 'email-preferences']} />
    )
    expect(screen.getByText('User Settings')).toBeInTheDocument()
    expect(screen.getByText('Email Preferences')).toBeInTheDocument()
  })
})
