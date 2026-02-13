import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppSidebar } from '@/components/shared/app-sidebar'
import { render, screen } from '@/lib/vitest'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => ({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          image: 'https://example.com/avatar.jpg',
        },
      },
      isPending: false,
    }),
  },
}))

// Mock env client
vi.mock('@/lib/env-client', () => ({
  env: {
    NEXT_PUBLIC_APP_NAME: 'Test App',
  },
}))

// Mock sidebar UI components
vi.mock('@/components/ui/sidebar', () => ({
  Sidebar: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar">{children}</div>
  ),
  SidebarContent: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-content">{children}</div>
  ),
  SidebarFooter: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-footer">{children}</div>
  ),
  SidebarHeader: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-header">{children}</div>
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

// Mock child components
vi.mock('@/components/shared/app-logo', () => ({
  AppLogo: ({ app }: { app: { name: string } }) => <div>{app.name}</div>,
}))

vi.mock('@/components/shared/nav-footer', () => ({
  NavFooter: () => <div data-testid="nav-footer">NavFooter</div>,
}))

vi.mock('@/components/shared/nav-main', () => ({
  NavMain: ({ label }: { label?: string }) => (
    <div data-testid="nav-main">{label || 'NavMain'}</div>
  ),
}))

vi.mock('@/components/shared/nav-user', () => ({
  NavUser: ({ user }: { user: { name: string } }) => (
    <div data-testid="nav-user">{user.name}</div>
  ),
}))

describe('AppSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sidebar', () => {
    render(<AppSidebar />)
    expect(document.querySelector('[data-slot="sidebar"]')).toBeInTheDocument()
  })

  it('renders app logo', () => {
    render(<AppSidebar />)
    expect(screen.getByText('Test App')).toBeInTheDocument()
  })

  it('renders navigation main', () => {
    render(<AppSidebar />)
    expect(screen.getByTestId('nav-main')).toBeInTheDocument()
  })

  it('renders navigation footer', () => {
    render(<AppSidebar />)
    expect(screen.getByTestId('nav-footer')).toBeInTheDocument()
  })

  it('renders user navigation', () => {
    render(<AppSidebar />)
    expect(screen.getByTestId('nav-user')).toBeInTheDocument()
  })

  it('renders sidebar structure', () => {
    render(<AppSidebar />)
    expect(
      document.querySelector('[data-slot="sidebar-header"]')
    ).toBeInTheDocument()
    expect(
      document.querySelector('[data-slot="sidebar-content"]')
    ).toBeInTheDocument()
    expect(
      document.querySelector('[data-slot="sidebar-footer"]')
    ).toBeInTheDocument()
  })
})
