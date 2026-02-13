import { describe, expect, it, vi } from 'vitest'
import { ConfirmationModal } from '@/components/shared/confirmation-modal'
import { render, screen } from '@/lib/vitest'

describe('ConfirmationModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Confirm Action',
  }

  it('renders with title', () => {
    render(<ConfirmationModal {...defaultProps} />)
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(<ConfirmationModal {...defaultProps} description="Are you sure?" />)
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
  })

  it('renders default confirm and cancel buttons', () => {
    render(<ConfirmationModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('renders custom button text', () => {
    render(
      <ConfirmationModal
        {...defaultProps}
        confirmText="Delete"
        cancelText="Keep"
      />
    )
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument()
  })

  it('calls onOpenChange when cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    render(<ConfirmationModal {...defaultProps} onOpenChange={onOpenChange} />)

    await screen.getByRole('button', { name: 'Cancel' }).click()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('disables buttons when loading', () => {
    render(<ConfirmationModal {...defaultProps} loading />)
    expect(screen.getByRole('button', { name: 'Processing...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('disables buttons when disabled', () => {
    render(<ConfirmationModal {...defaultProps} disabled />)
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('renders default variant icon', () => {
    render(<ConfirmationModal {...defaultProps} />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders destructive variant', () => {
    render(<ConfirmationModal {...defaultProps} variant="destructive" />)
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
  })

  it('renders warning variant', () => {
    render(<ConfirmationModal {...defaultProps} variant="warning" />)
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
  })

  it('renders info variant', () => {
    render(<ConfirmationModal {...defaultProps} variant="info" />)
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
  })
})
