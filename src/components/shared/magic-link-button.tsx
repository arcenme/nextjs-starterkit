/** biome-ignore-all lint/a11y/noSvgWithoutTitle: cause hydration error */
'use client'

import { Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

export function MagicLinkButton() {
  return (
    <Button asChild variant="outline" className="w-full cursor-pointer">
      <Link href={ROUTES.AUTH.MAGIC_LINK}>
        <Mail className="h-4 w-4" />
        <span>Continue with Magic Link</span>
      </Link>
    </Button>
  )
}
