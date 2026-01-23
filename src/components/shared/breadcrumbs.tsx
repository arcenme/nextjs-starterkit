import Link from 'next/link'
import React from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ROUTES } from '@/constants/routes'

interface BreadcrumbsProps {
  segments: string[]
}

export function DynamicBreadcrumbs({ segments }: BreadcrumbsProps) {
  // Filter out 'admin'
  const filteredSegments = segments.filter((segment) => segment !== 'admin')

  if (filteredSegments.length === 0) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {filteredSegments.map((segment, index) => {
          const href = `${ROUTES.ADMIN.ROOT}/${filteredSegments.slice(0, index + 1).join('/')}`

          const label = segment
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

          const isLast = index === filteredSegments.length - 1

          return (
            <React.Fragment key={href}>
              {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
              <BreadcrumbItem className="hidden md:block">
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
