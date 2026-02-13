import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NavUser } from '@/components/shared/nav-user'
import { render, screen } from '@/lib/vitest'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

// Mock auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signOut: vi.fn(),
  },
}))

// Mock sidebar UI components
vi.mock('@/components/ui/sidebar', () => ({
  SidebarMenu: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-menu">{children}</div>
  ),
  SidebarMenuButton: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-menu-button">{children}</div>
  ),
  SidebarMenuItem: ({ children }: { children: ReactNode }) => (
    <div data-slot="sidebar-menu-item">{children}</div>
  ),
  useSidebar: () => ({ isMobile: false }),
}))

// Mock dropdown menu
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => (
    <div data-slot="dropdown-menu">{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: ReactNode }) => (
    <div data-slot="dropdown-menu-content">{children}</div>
  ),
  DropdownMenuGroup: ({ children }: { children: ReactNode }) => (
    <div data-slot="dropdown-menu-group">{children}</div>
  ),
  DropdownMenuItem: ({ children }: { children: ReactNode }) => (
    <div data-slot="dropdown-menu-item">{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: ReactNode }) => (
    <div data-slot="dropdown-menu-label">{children}</div>
  ),
  DropdownMenuSeparator: () => <div data-slot="dropdown-menu-separator" />,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => (
    <div data-slot="dropdown-menu-trigger">{children}</div>
  ),
}))

// Mock user-avatar
vi.mock('@/components/shared/user-avatar', () => ({
  UserAvatar: ({ name }: { name: string }) => (
    <div data-testid="user-avatar">{name[0]}</div>
  ),
}))

// Mock skeleton
vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

describe('NavUser', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders user name and email', () => {
    render(<NavUser user={mockUser} isPending={false} />)
    expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument()
    expect(screen.getAllByText('john@example.com')[0]).toBeInTheDocument()
  })

  it('renders user avatar', () => {
    render(<NavUser user={mockUser} isPending={false} />)
    expect(screen.getAllByTestId('user-avatar')[0]).toBeInTheDocument()
  })

  it('shows skeleton when loading', () => {
    render(<NavUser user={mockUser} isPending={true} />)
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
  })

  it('renders Settings link', () => {
    render(<NavUser user={mockUser} isPending={false} />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders Log out button', () => {
    render(<NavUser user={mockUser} isPending={false} />)
    expect(screen.getByText('Log out')).toBeInTheDocument()
  })

  it('renders dropdown menu', () => {
    render(<NavUser user={mockUser} isPending={false} />)
    expect(
      document.querySelector('[data-slot="dropdown-menu"]')
    ).toBeInTheDocument()
  })
})
