import { Monitor, Smartphone, Tablet } from 'lucide-react'

type DeviceIconProps = {
  type: 'desktop' | 'mobile' | 'tablet'
  className?: string
}

export function DeviceIcon({ type, className }: DeviceIconProps) {
  const Icon =
    type === 'mobile' ? Smartphone : type === 'tablet' ? Tablet : Monitor

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
      <Icon className={className || 'h-5 w-5 text-primary'} />
    </div>
  )
}
