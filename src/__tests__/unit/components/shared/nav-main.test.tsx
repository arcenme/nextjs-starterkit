import { BookOpen, Folder, Home } from 'lucide-react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NavMain } from '@/components/shared/nav-main'
import { render, screen } from '@/lib/vitest'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}))

// Mock the sidebar UI components
vi.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-group">{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-group-label">{children}</div>
  ),
  SidebarMenu: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-menu">{children}</div>
  ),
  SidebarMenuButton: ({
    children,
    isActive,
  }: {
    children: ReactNode
    isActive?: boolean
  }) => (
    <div data-slot="sidebar-menu-button" data-active={isActive}>
      {children}
    </div>
  ),
  SidebarMenuItem: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-menu-item">{children}</div>
  ),
  SidebarMenuSub: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-menu-sub">{children}</div>
  ),
  SidebarMenuSubButton: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-menu-sub-button">{children}</div>
  ),
  SidebarMenuSubItem: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-menu-sub-item">{children}</div>
  ),
  useSidebar: () => ({ state: 'expanded' }),
}))

// Mock collapsible
vi.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children }: { children: ReactNode }) => (
    <div data-slot="collapsible">{children}</div>
  ),
  CollapsibleContent: ({ children }: { children: ReactNode }) => (
    <div data-slot="collapsible-content">{children}</div>
  ),
  CollapsibleTrigger: ({ children }: { children: ReactNode }) => (
    <div data-slot="collapsible-trigger">{children}</div>
  ),
}))

// Mock dropdown menu
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => (
    <div data-slot="dropdown-menu">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: ReactNode }) => (
    <div data-slot="dropdown-menu-content">{children}</div>
  ),
  DropdownMenuItem: ({ children }: { children: ReactNode }) => (
    <div data-slot="dropdown-menu-item">{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => (
    <div data-slot="dropdown-menu-trigger">{children}</div>
  ),
}))

describe('NavMain', () => {
  const mockItems = [
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    {
      title: 'Documentation',
      icon: BookOpen,
      items: [
        { title: 'Introduction', url: '/docs/intro', icon: Folder },
        { title: 'Guide', url: '/docs/guide', icon: Folder },
      ],
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders menu label when provided', () => {
    render(<NavMain items={mockItems} label="Menu" />)
    expect(screen.getByText('Menu')).toBeInTheDocument()
  })

  it('renders menu items without label', () => {
    render(<NavMain items={mockItems} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders items with links', () => {
    render(<NavMain items={mockItems} />)
    expect(screen.getByRole('link', { name: /Dashboard/i })).toHaveAttribute(
      'href',
      '/dashboard'
    )
  })

  it('renders items with children', () => {
    render(<NavMain items={mockItems} />)
    expect(screen.getByText('Documentation')).toBeInTheDocument()
  })

  it('renders icons for items', () => {
    render(<NavMain items={mockItems} />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('handles empty items array', () => {
    render(<NavMain items={[]} />)
    expect(
      document.querySelector('[data-slot="sidebar-menu"]')
    ).toBeInTheDocument()
  })

  it('handles item without url and children', () => {
    const itemsWithoutUrl = [{ title: 'No URL', icon: Home }]
    render(<NavMain items={itemsWithoutUrl} />)
    // Items without URL and children are not rendered
    expect(document.querySelector('[data-slot="sidebar-menu-item"]')).toBeNull()
  })
})
