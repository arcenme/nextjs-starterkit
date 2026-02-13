import { describe, expect, it } from 'vitest'
import { AppLogo } from '@/components/shared/app-logo'
import { render, screen } from '@/lib/vitest'

describe('AppLogo', () => {
  it('renders app name', () => {
    render(<AppLogo app={{ name: 'Test App' }} />)
    expect(screen.getByText('Test App')).toBeInTheDocument()
  })

  it('renders app name and description', () => {
    render(
      <AppLogo app={{ name: 'Test App', description: 'Test Description' }} />
    )
    expect(screen.getByText('Test App')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    render(<AppLogo app={{ name: 'Test App' }} />)
    expect(screen.getByText('Test App')).toBeInTheDocument()
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument()
  })

  it('renders Command icon', () => {
    render(<AppLogo app={{ name: 'Test App' }} />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })
})
