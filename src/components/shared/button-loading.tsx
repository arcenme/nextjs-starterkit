import type { VariantProps } from 'class-variance-authority'
import { Button, type buttonVariants } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface ButtonLoadingProps extends VariantProps<typeof buttonVariants> {
  className?: string
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  children: React.ReactNode
}

export function ButtonLoading({
  className,
  variant = 'default',
  size = 'default',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  children,
}: ButtonLoadingProps) {
  return (
    <Button
      className={className}
      size={size}
      type={type}
      variant={variant}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </Button>
  )
}
