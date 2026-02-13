import { describe, expect, it } from 'vitest'
import { Separator } from '@/components/ui/separator'
import { render, screen } from '@/lib/vitest'

describe('Separator', () => {
  it('renders separator element', () => {
    render(<Separator />)
    expect(
      document.querySelector('[data-slot="separator"]')
    ).toBeInTheDocument()
  })

  it('renders horizontal separator by default', () => {
    render(<Separator />)
    const separator = document.querySelector('[data-slot="separator"]')
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('renders vertical separator', () => {
    render(<Separator orientation="vertical" />)
    const separator = document.querySelector('[data-slot="separator"]')
    expect(separator).toHaveAttribute('data-orientation', 'vertical')
  })

  it('applies custom className', () => {
    render(<Separator className="custom-separator" />)
    const separator = document.querySelector('[data-slot="separator"]')
    expect(separator).toHaveClass('custom-separator')
  })

  it('renders with data-slot attribute', () => {
    render(<Separator />)
    const separator = document.querySelector('[data-slot="separator"]')
    expect(separator).toHaveAttribute('data-slot', 'separator')
  })

  it('is decorative by default (no role attribute)', () => {
    render(<Separator />)
    const separator = document.querySelector('[data-slot="separator"]')
    expect(separator).toHaveAttribute('role', 'none')
  })

  it('respects decorative prop', () => {
    render(<Separator decorative={false} />)
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })
})
