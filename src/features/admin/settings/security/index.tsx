import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'
import { ChangePasswordForm } from '@/features/admin/settings/security/_components/change-password-form'
import { DisableTwoFactorAuth } from '@/features/admin/settings/security/_components/disable-two-factor-auth'
import { EnableTwoFactorAuth } from '@/features/admin/settings/security/_components/enable-two-factor-auth'
import { SetPasswordButton } from '@/features/admin/settings/security/_components/set-password-button'
import { auth } from '@/lib/auth'

export default async function SettingSecurityPage() {
  const [session, accounts] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    auth.api.listUserAccounts({ headers: await headers() }),
  ])

  if (!session?.user.email) return redirect(ROUTES.AUTH.SIGN_IN)

  const hasPasswordAccount = accounts.some((a) => a.providerId === 'credential')
  const isTwoFactorEnabled = session?.user.twoFactorEnabled ?? false

  return (
    <>
      <h1 className="sr-only">Security Settings</h1>
      <header>
        <h3 className="mb-0.5 font-semibold text-base">Security</h3>
        <p className="text-muted-foreground text-sm">
          Change your password and enable two-factor authentication
        </p>
      </header>

      <Separator className="max-w-lg" />

      <div className="space-y-6 md:space-y-8">
        {/* Password */}
        {!hasPasswordAccount ? (
          <SetPasswordButton email={session?.user.email} />
        ) : (
          <ChangePasswordForm />
        )}

        {/* Tow-Factor Authentication */}
        {isTwoFactorEnabled ? (
          <DisableTwoFactorAuth />
        ) : (
          <EnableTwoFactorAuth />
        )}
      </div>
    </>
  )
}
