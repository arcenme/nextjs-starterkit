import { Separator } from '@/components/ui/separator'
import { ChangeEmailForm } from '@/features/admin/settings/profile/_components/change-email-form'
import { ProfileDetailForm } from '@/features/admin/settings/profile/_components/profile-detail-form'

export default function SettingProfilePage() {
  return (
    <>
      <h1 className="sr-only">Profile Settings</h1>
      <header>
        <h3 className="mb-0.5 font-semibold text-base">Profile Information</h3>
        <p className="text-muted-foreground text-sm">
          Update your name dan email address
        </p>
      </header>
      <Separator className="max-w-md" />

      <div className="space-y-8">
        <ProfileDetailForm />
        <Separator className="max-w-md" />
        <ChangeEmailForm />
      </div>
    </>
  )
}
