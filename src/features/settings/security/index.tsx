import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'
import { ChangePasswordForm } from '@/features/settings/security/_components/change-password-form'
import { SetPasswordButton } from '@/features/settings/security/_components/set-password-button'
import { auth } from '@/lib/auth'

export default async function SettingSecurityPage() {
  const [session, accounts] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    auth.api.listUserAccounts({ headers: await headers() }),
  ])

  const hasPasswordAccount = accounts.some((a) => a.providerId === 'credential')
  if (!session?.user.email) return redirect(ROUTES.AUTH.SIGN_IN)

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
        {!hasPasswordAccount ? (
          <SetPasswordButton email={session?.user.email} />
        ) : (
          <ChangePasswordForm />
        )}

        {hasPasswordAccount && <p>Enable 2 Factor Authentication</p>}
        <p>Logout of all sessions</p>
      </div>
    </>
  )
}
