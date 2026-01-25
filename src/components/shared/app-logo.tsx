import { Command } from 'lucide-react'

export function AppLogo({
  app,
}: {
  app: { name: string; description?: string }
}) {
  return (
    <>
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Command className="size-4" />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{app.name}</span>
        {app.description && (
          <span className="truncate text-xs">{app.description}</span>
        )}
      </div>
    </>
  )
}
