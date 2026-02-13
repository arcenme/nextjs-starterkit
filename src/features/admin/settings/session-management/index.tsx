import { headers } from 'next/headers'
import { Separator } from '@/components/ui/separator'
import { ActiveSessions } from '@/features/admin/settings/session-management/_components/active-sessions'
import { auth } from '@/lib/auth'

export default async function SettingSessionManagementPage() {
  const [session, sessions] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    auth.api.listSessions({ headers: await headers() }),
  ])

  return (
    <>
      <h1 className="sr-only">Session Management</h1>
      <header>
        <h3 className="mb-0.5 font-semibold text-base">Active Sessions</h3>
        <p className="text-muted-foreground text-sm">
          Manage your active sessions and devices
        </p>
      </header>

      <Separator className="max-w-lg" />

      <div className="space-y-6 md:space-y-8">
        <ActiveSessions
          currentSessionToken={session?.session?.token}
          sessions={sessions || []}
        />
      </div>
    </>
  )
}
