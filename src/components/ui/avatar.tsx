'use client'

import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { getImageProps } from 'next/image'
import type * as React from 'react'
import { cn } from '@/lib/utils'

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  const { src, alt, width, height, ...rest } = props

  if (!src) {
    return (
      <AvatarPrimitive.Image
        data-slot="avatar-image"
        className={cn('aspect-square size-full', className)}
        {...props}
      />
    )
  }

  const size =
    width && height
      ? { width: Number(width), height: Number(height) }
      : { fill: true }

  const { props: nextOptimizedProps } = getImageProps({
    src: String(src),
    alt: String(alt),
    ...size,
    ...rest,
  })

  return <AvatarPrimitive.Image {...nextOptimizedProps} />
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-muted',
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
