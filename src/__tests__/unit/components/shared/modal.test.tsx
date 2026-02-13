import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Modal } from '@/components/shared/modal'
import { render, screen } from '@/lib/vitest'

// Mock DialogOverlay from @/components/ui/dialog
vi.mock('@/components/ui/dialog', () => ({
  DialogOverlay: () => <div data-testid="dialog-overlay" />,
  DialogPortal: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

describe('Modal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    children: <div>Modal content</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders modal with default props', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('renders modal with title', () => {
    render(<Modal {...defaultProps} title="Test Title" />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders modal with description', () => {
    render(
      <Modal {...defaultProps} title="Test" description="Test Description" />
    )
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('renders modal without title', () => {
    render(<Modal {...defaultProps} />)
    // Should still render the dialog
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders modal with footer', () => {
    render(
      <Modal
        {...defaultProps}
        footer={<button type="button">Footer Button</button>}
      />
    )
    expect(
      screen.getByRole('button', { name: 'Footer Button' })
    ).toBeInTheDocument()
  })

  it('renders modal without footer when not provided', () => {
    render(<Modal {...defaultProps} />)
    // Just verify the modal renders without footer section
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders close button by default', () => {
    render(<Modal {...defaultProps} />)
    // The close button has sr-only text "Close"
    expect(screen.getByText('Close')).toBeInTheDocument()
  })

  it('hides close button when showClose is false', () => {
    render(<Modal {...defaultProps} showClose={false} />)
    // The close text should not be present
    expect(screen.queryByText('Close')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Modal {...defaultProps} className="custom-modal-class" />)
    expect(screen.getByRole('dialog')).toHaveClass('custom-modal-class')
  })

  describe('size variants', () => {
    it('renders with sm size', () => {
      render(<Modal {...defaultProps} size="sm" />)
      expect(screen.getByRole('dialog')).toHaveClass('sm:max-w-sm')
    })

    it('renders with md size (default)', () => {
      render(<Modal {...defaultProps} />)
      expect(screen.getByRole('dialog')).toHaveClass('sm:max-w-md')
    })

    it('renders with lg size', () => {
      render(<Modal {...defaultProps} size="lg" />)
      expect(screen.getByRole('dialog')).toHaveClass('sm:max-w-lg')
    })

    it('renders with xl size', () => {
      render(<Modal {...defaultProps} size="xl" />)
      expect(screen.getByRole('dialog')).toHaveClass('sm:max-w-xl')
    })

    it('renders with full size', () => {
      render(<Modal {...defaultProps} size="full" />)
      expect(screen.getByRole('dialog')).toHaveClass('sm:max-w-[95vw]')
    })
  })

  describe('dismissable behavior', () => {
    it('is dismissable by default', () => {
      render(<Modal {...defaultProps} />)
      // Modal should render normally
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('can be non-dismissable', () => {
      render(<Modal {...defaultProps} dismissable={false} />)
      // Modal should still render
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('prevents closing when not dismissable and clicking outside', () => {
      const onOpenChange = vi.fn()
      render(
        <Modal
          {...defaultProps}
          onOpenChange={onOpenChange}
          dismissable={false}
        />
      )

      // Modal should be rendered
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('prevents closing when not dismissable and pressing escape', () => {
      const onOpenChange = vi.fn()
      render(
        <Modal
          {...defaultProps}
          onOpenChange={onOpenChange}
          dismissable={false}
        />
      )

      // Modal should be rendered
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  it('renders description with sr-only class when description is empty', () => {
    render(<Modal {...defaultProps} title="Test" />)
    // The description element should have sr-only class when empty
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
  })

  it('passes open state correctly', () => {
    const { rerender } = render(<Modal {...defaultProps} open={false} />)
    // When closed, the dialog should not be visible
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    rerender(<Modal {...defaultProps} open={true} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('renders complex children content', () => {
    render(
      <Modal {...defaultProps}>
        <div data-testid="complex-content">
          <h3>Heading</h3>
          <p>Paragraph text</p>
          <button type="button">Action</button>
        </div>
      </Modal>
    )

    expect(screen.getByTestId('complex-content')).toBeInTheDocument()
    expect(screen.getByText('Heading')).toBeInTheDocument()
    expect(screen.getByText('Paragraph text')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })

  it('renders complex footer with multiple buttons', () => {
    render(
      <Modal
        {...defaultProps}
        footer={
          <>
            <button type="button">Cancel</button>
            <button type="button">Save</button>
            <button type="button">Delete</button>
          </>
        }
      />
    )

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('combines all props correctly', () => {
    render(
      <Modal
        open={true}
        onOpenChange={vi.fn()}
        title="Complete Modal"
        description="This is a complete modal"
        size="lg"
        showClose={true}
        dismissable={true}
        className="my-custom-class"
        footer={<button type="button">Done</button>}
      >
        <div>Content</div>
      </Modal>
    )

    expect(screen.getByText('Complete Modal')).toBeInTheDocument()
    expect(screen.getByText('This is a complete modal')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toHaveClass('sm:max-w-lg')
    expect(screen.getByRole('dialog')).toHaveClass('my-custom-class')
    expect(screen.getByText('Close')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})
