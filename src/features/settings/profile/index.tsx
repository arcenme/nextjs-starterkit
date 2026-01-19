import { ChangeEmailForm } from '@/features/settings/profile/_components/change-email-form'

export default function SettingProfilePage() {
  return (
    <>
      <h1 className="sr-only">Profile Settings</h1>
      <header>
        <h3 className="mb-0.5 text-base font-medium">Profile Information</h3>
        <p className="text-sm text-muted-foreground">
          Update your name dan email address
        </p>
      </header>

      <div className="flex gap-4 flex-col">
        <ChangeEmailForm />
      </div>
    </>
  )
}
