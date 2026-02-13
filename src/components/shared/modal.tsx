'use client'

import { X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import type { ReactNode } from 'react'
import { DialogOverlay, DialogPortal } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showClose?: boolean
  dismissable?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  full: 'sm:max-w-[95vw]',
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  showClose = true,
  dismissable = true,
  className,
}: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-0 border bg-background shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:rounded-lg',
            sizeClasses[size],
            'flex max-h-[90vh] flex-col p-1 pt-0',
            className
          )}
          onInteractOutside={(e) => {
            if (!dismissable) {
              e.preventDefault()
            }
          }}
          onEscapeKeyDown={(e) => {
            if (!dismissable) {
              e.preventDefault()
            }
          }}
        >
          {/* Header */}
          <div className="flex flex-col space-y-1.5 px-6 pt-6">
            <DialogPrimitive.Title className="font-semibold text-lg leading-none tracking-tight">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description
              className={cn(
                'text-muted-foreground text-sm',
                !description && 'sr-only'
              )}
            >
              {description || ' '}
            </DialogPrimitive.Description>
          </div>

          {/* Body with scroll */}
          <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex flex-col-reverse gap-2 px-6 pt-4 pb-6 sm:flex-row sm:justify-end">
              {footer}
            </div>
          )}

          {/* Close button */}
          {showClose && (
            <DialogPrimitive.Close className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  )
}
