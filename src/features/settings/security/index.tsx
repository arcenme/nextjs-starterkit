import { headers } from 'next/headers'
import { Separator } from '@/components/ui/separator'
import { ChangePasswordForm } from '@/features/settings/security/_components/change-password-form'
import { auth } from '@/lib/auth'

export default async function SettingSecurityPage() {
  const accounts = await auth.api.listUserAccounts({ headers: await headers() })

  const hasPasswordAccount = accounts.some((a) => a.providerId === 'credential')

  // TODO: Implement security settings
  return (
    <>
      <h1 className="sr-only">Security Settings</h1>
      <header>
        <h3 className="mb-0.5 text-base font-medium">Security</h3>
        <p className="text-sm text-muted-foreground">
          Change your password and enable two-factor authentication
        </p>
      </header>

      <Separator className="max-w-lg" />

      <div className="space-y-6 md:space-y-8">
        {hasPasswordAccount ? <ChangePasswordForm /> : <p>SetPassword</p>}
        {hasPasswordAccount && <p>Enable 2 Factor Authentication</p>}
        <p>Logout of all sessions</p>
      </div>
    </>
  )
}
