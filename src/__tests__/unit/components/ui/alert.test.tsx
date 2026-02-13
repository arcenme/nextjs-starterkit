import { describe, expect, it } from 'vitest'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { render, screen } from '@/lib/vitest'

describe('Alert', () => {
  it('renders alert with default variant', () => {
    render(<Alert>Test alert</Alert>)
    expect(screen.getByRole('alert')).toHaveTextContent('Test alert')
  })

  it('renders alert with destructive variant', () => {
    render(<Alert variant="destructive">Destructive alert</Alert>)
    expect(screen.getByRole('alert')).toHaveTextContent('Destructive alert')
  })

  it('applies custom className', () => {
    render(<Alert className="custom-class">Alert with class</Alert>)
    expect(screen.getByRole('alert')).toHaveClass('custom-class')
  })

  it('renders with data-slot attribute', () => {
    render(<Alert>Alert</Alert>)
    expect(screen.getByRole('alert')).toHaveAttribute('data-slot', 'alert')
  })
})

describe('AlertTitle', () => {
  it('renders alert title', () => {
    render(<AlertTitle>Alert Title</AlertTitle>)
    expect(screen.getByText('Alert Title')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<AlertTitle className="custom-title">Title</AlertTitle>)
    expect(screen.getByText('Title')).toHaveClass('custom-title')
  })

  it('renders with data-slot attribute', () => {
    render(<AlertTitle>Title</AlertTitle>)
    expect(screen.getByText('Title')).toHaveAttribute(
      'data-slot',
      'alert-title'
    )
  })
})

describe('AlertDescription', () => {
  it('renders alert description', () => {
    render(<AlertDescription>Alert description</AlertDescription>)
    expect(screen.getByText('Alert description')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <AlertDescription className="custom-desc">Description</AlertDescription>
    )
    expect(screen.getByText('Description')).toHaveClass('custom-desc')
  })

  it('renders with data-slot attribute', () => {
    render(<AlertDescription>Description</AlertDescription>)
    expect(screen.getByText('Description')).toHaveAttribute(
      'data-slot',
      'alert-description'
    )
  })
})

describe('Alert composition', () => {
  it('renders complete alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Alert Title</AlertTitle>
        <AlertDescription>Alert description</AlertDescription>
      </Alert>
    )
    expect(screen.getByText('Alert Title')).toBeInTheDocument()
    expect(screen.getByText('Alert description')).toBeInTheDocument()
  })

  it('renders with icon', () => {
    render(
      <Alert>
        <svg data-testid="icon" />
        <AlertTitle>With Icon</AlertTitle>
      </Alert>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('With Icon')).toBeInTheDocument()
  })
})
