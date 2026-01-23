'use client'

import { BookOpen, Folder, Home } from 'lucide-react'
import Link from 'next/link'
import type * as React from 'react'
import { AppLogo } from '@/components/shared/app-logo'
import { NavFooter } from '@/components/shared/nav-footer'
import { NavMain } from '@/components/shared/nav-main'
import { NavUser } from '@/components/shared/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { ROUTES } from '@/constants/routes'
import { authClient } from '@/lib/auth-client'
import { env } from '@/lib/env-client'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = authClient.useSession()

  const data = {
    app: {
      name: env.NEXT_PUBLIC_APP_NAME,
      description: 'by @arcenme',
    },
    navMain: [
      {
        title: 'Dashboard',
        url: ROUTES.ADMIN.DASHBOARD,
        icon: Home,
      },
      {
        title: 'Documentation',
        icon: BookOpen,
        items: [
          {
            title: 'Introduction',
            url: '#',
            icon: Folder,
          },
          {
            title: 'Get Started',
            url: '#',
            icon: Folder,
          },
        ],
      },
    ],
    navFooter: [
      {
        title: 'Repository',
        url: ROUTES.GITHUB_REPO,
        icon: Folder,
      },
    ],
    navUser: {
      name: session?.user.name ?? '',
      email: session?.user.email ?? '',
      avatar: session?.user.image ?? '',
    },
  }

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={ROUTES.ADMIN.DASHBOARD}>
                <AppLogo app={data.app} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain label="Menu Items" items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavFooter items={data.navFooter} className="mt-auto" />
        <NavUser user={data.navUser} isPending={isPending} />
      </SidebarFooter>
    </Sidebar>
  )
}
