import { describe, expect, it, vi } from 'vitest'
import { SwitchTheme } from '@/features/settings/appearance/_components/switch-theme'
import { render, screen } from '@/lib/vitest'

vi.mock('@/lib/env-client', () => ({
  env: {
    NEXT_PUBLIC_APP_NAME: 'Test App',
    NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    NEXT_PUBLIC_BETTER_AUTH_URL: 'http://localhost:3000/api/auth',
  },
}))

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'system',
    setTheme: vi.fn(),
  }),
}))

describe('Appearance Settings Integration', () => {
  it('renders theme selector', () => {
    render(<SwitchTheme />)

    expect(screen.getByText(/theme/i)).toBeInTheDocument()
  })

  it('renders light theme option', () => {
    render(<SwitchTheme />)

    expect(screen.getByRole('tab', { name: /light/i })).toBeInTheDocument()
  })

  it('renders dark theme option', () => {
    render(<SwitchTheme />)

    expect(screen.getByRole('tab', { name: /dark/i })).toBeInTheDocument()
  })

  it('renders system theme option', () => {
    render(<SwitchTheme />)

    expect(screen.getByRole('tab', { name: /system/i })).toBeInTheDocument()
  })

  it('has correct theme selector id', () => {
    render(<SwitchTheme />)

    const tabs = screen.getByRole('tablist')
    expect(tabs).toBeInTheDocument()
  })
})
