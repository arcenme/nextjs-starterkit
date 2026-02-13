import { describe, expect, it } from 'vitest'
import { Spinner } from '@/components/ui/spinner'
import { render, screen } from '@/lib/vitest'

describe('Spinner', () => {
  it('renders spinner with role status', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders with aria-label Loading', () => {
    render(<Spinner />)
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Spinner className="custom-spinner" />)
    expect(screen.getByRole('status')).toHaveClass('custom-spinner')
  })

  it('has animate-spin class', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveClass('animate-spin')
  })

  it('has size-4 class by default', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveClass('size-4')
  })

  it('passes additional props', () => {
    render(<Spinner data-testid="spinner" />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })
})
