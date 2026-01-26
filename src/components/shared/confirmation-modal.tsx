'use client'

import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { Modal } from '@/components/shared/modal'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ConfirmationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: string
  children?: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'warning' | 'info'
  loading?: boolean
  disabled?: boolean
}

const variantConfig = {
  default: {
    icon: CheckCircle2,
    iconClass: 'text-primary',
    buttonVariant: 'default' as const,
  },
  destructive: {
    icon: AlertCircle,
    iconClass: 'text-destructive',
    buttonVariant: 'destructive' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-yellow-600 dark:text-yellow-500',
    buttonVariant: 'default' as const,
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-600 dark:text-blue-500',
    buttonVariant: 'default' as const,
  },
}

export function ConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
  disabled = false,
}: ConfirmationModalProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      showClose={!loading}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading || disabled}
            className="sm:flex-1"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={loading || disabled}
            className="sm:flex-1"
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full',
            variant === 'destructive' && 'bg-destructive/10',
            variant === 'warning' && 'bg-yellow-100 dark:bg-yellow-900/20',
            variant === 'info' && 'bg-blue-100 dark:bg-blue-900/20',
            variant === 'default' && 'bg-primary/10'
          )}
        >
          <Icon className={cn('h-6 w-6', config.iconClass)} />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>

        {children && <div className="w-full">{children}</div>}
      </div>
    </Modal>
  )
}
