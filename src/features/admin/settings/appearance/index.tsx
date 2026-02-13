import { Separator } from '@/components/ui/separator'
import { SwitchTheme } from '@/features/admin/settings/appearance/_components/switch-theme'

export default function SettingAppearancePage() {
  return (
    <>
      <h1 className="sr-only">Appearance Settings</h1>
      <header>
        <h3 className="mb-0.5 font-semibold text-base">Appearance Settings</h3>
        <p className="text-muted-foreground text-sm">
          Update your account's appearance settings
        </p>
      </header>

      <Separator className="max-w-lg" />

      <div className="space-y-6 md:space-y-8">
        <SwitchTheme />
      </div>
    </>
  )
}
