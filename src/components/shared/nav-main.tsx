'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

export type MenuItemChild = {
  title: string
  url: string
  icon?: LucideIcon
}

export type MenuItem = {
  title: string
  url?: string
  icon?: LucideIcon
  items?: MenuItemChild[]
}

type NavMenuProps = {
  items: MenuItem[]
  label?: string
}

export function NavMain({ items, label }: NavMenuProps) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = item.items && item.items.length > 0

          if (hasChildren) {
            return (
              <NavMenuItemWithChildren
                key={item.title}
                item={item}
                pathname={pathname}
              />
            )
          }

          if (!item.url) {
            return null
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={
                  pathname === item.url || pathname.startsWith(`${item.url}/`)
                }
              >
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavMenuItemWithChildren({
  item,
  pathname,
}: {
  item: MenuItem
  pathname: string
}) {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const hasActiveChild = item.items?.some((child) => pathname === child.url)
  const [isOpen, setIsOpen] = useState(hasActiveChild ?? false)

  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true)
    }
  }, [hasActiveChild])

  if (isCollapsed) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip={item.title} className="cursor-pointer">
              {item.icon && <item.icon />}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="min-w-48">
            {item.items?.map((subItem) => {
              const isActive =
                pathname === subItem.url ||
                pathname.startsWith(`${subItem.url}/`)

              return (
                <DropdownMenuItem key={subItem.title} asChild>
                  <Link
                    href={subItem.url}
                    className={cn(
                      'flex cursor-pointer items-center gap-2',
                      isActive && 'bg-accent'
                    )}
                  >
                    {subItem.icon && <subItem.icon className="size-4" />}
                    <span>{subItem.title}</span>
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} className="cursor-pointer">
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight
              className={cn(
                'ml-auto transition-transform duration-200',
                isOpen && 'rotate-90'
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="mr-0 pr-0">
            {item.items?.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  asChild
                  isActive={
                    pathname === subItem.url ||
                    pathname.startsWith(`${subItem.url}/`)
                  }
                >
                  <Link href={subItem.url}>
                    {subItem.icon && <subItem.icon />}
                    <span>{subItem.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
