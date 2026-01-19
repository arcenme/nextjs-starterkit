'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const sidebarNavItems = [
  {
    title: 'Profile',
    href: '/admin/settings/profile',
  },
  {
    title: 'Account',
    href: '/admin/settings/account',
  },
  {
    title: 'Security',
    href: '/admin/settings/security',
  },
  {
    title: 'Appearance',
    href: '/admin/settings/appearance',
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
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <div className="flex flex-col lg:flex-row lg:space-x-12">
        <aside className="w-full max-w-xl lg:w-48">
          <nav
            className="flex flex-col space-y-1 space-x-0"
            aria-label="Settings"
          >
            {sidebarNavItems.map((item, index) => (
              <Link
                key={`${item.href}-${index}`}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'w-full justify-start font-semibold',
                  pathname === item.href && 'bg-muted'
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>
        <Separator className="my-6 lg:hidden" />

        <div className="flex-1 md:max-w-2xl">
          <section className="max-w-xl space-y-12">{children}</section>
        </div>
      </div>
    </div>
  )
}
