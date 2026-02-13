import { Home, Settings } from 'lucide-react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NavFooter } from '@/components/shared/nav-footer'
import { render, screen } from '@/lib/vitest'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock the sidebar UI components
vi.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({
    children,
    className,
  }: {
    children: ReactNode
    className?: string
  }) => (
    <div data-slot="sidebar-group" className={className}>
      {children}
    </div>
  ),
  SidebarGroupContent: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-group-content">{children}</div>
  ),
  SidebarMenu: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-menu">{children}</div>
  ),
  SidebarMenuButton: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-menu-button">{children}</div>
  ),
  SidebarMenuItem: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-menu-item">{children}</div>
  ),
}))

describe('NavFooter', () => {
  const mockItems = [
    { title: 'Home', url: '/', icon: Home },
    { title: 'Settings', url: '/settings', icon: Settings },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders footer items', () => {
    render(<NavFooter items={mockItems} />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders links with correct hrefs', () => {
    render(<NavFooter items={mockItems} />)

    expect(screen.getByRole('link', { name: /Home/i })).toHaveAttribute(
      'href',
      '/'
    )
    expect(screen.getByRole('link', { name: /Settings/i })).toHaveAttribute(
      'href',
      '/settings'
    )
  })

  it('renders icons for each item', () => {
    render(<NavFooter items={mockItems} />)

    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThanOrEqual(2)
  })

  it('handles empty items array', () => {
    render(<NavFooter items={[]} />)

    expect(
      document.querySelector('[data-slot="sidebar-menu"]')
    ).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<NavFooter items={mockItems} className="custom-class" />)

    expect(document.querySelector('.custom-class')).toBeInTheDocument()
  })
})
