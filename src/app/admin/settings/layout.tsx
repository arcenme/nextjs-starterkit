'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: ROUTES.ADMIN.SETTINGS.PROFILE,
  },
  {
    title: 'Security',
    href: ROUTES.ADMIN.SETTINGS.SECURITY,
  },
  {
    title: 'Sessions',
    href: ROUTES.ADMIN.SETTINGS.SESSION_MANAGEMENT,
  },
]

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="space-y-6 p-4 pb-16">
      <div className="space-y-0.5">
        <h2 className="font-bold text-2xl tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <div className="flex flex-col lg:flex-row lg:space-x-12">
        <aside className="w-full max-w-xl lg:w-48">
          <nav
            className="flex flex-col space-x-0 space-y-1"
            aria-label="Settings"
          >
            {sidebarNavItems.map((item, index) => (
              <Link
                key={`${item.href}-${index}`}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'w-full justify-start font-normal',
                  pathname === item.href && 'bg-muted font-semibold'
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <Separator className="my-6 lg:hidden" />

        <div className="flex-1 md:max-w-2xl">
          <section className="max-w-xl space-y-6">{children}</section>
        </div>
      </div>
    </div>
  )
}
