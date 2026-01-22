import { Separator } from '@/components/ui/separator'
import { ChangeEmailForm } from '@/features/settings/profile/_components/change-email-form'
import { ProfileDetailForm } from '@/features/settings/profile/_components/profile-detail-form'

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

      <div className="space-y-12">
        <ProfileDetailForm />
        <Separator className="max-w-md" />
        <ChangeEmailForm />
      </div>
    </>
  )
}
