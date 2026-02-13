'use client'

import { X } from 'lucide-react'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'
import { toast } from 'sonner'
import { ButtonLoading } from '@/components/shared/button-loading'
import { DeviceIcon } from '@/components/shared/device-icon'
import { revokeSessionAction } from '@/features/admin/settings/session-management/actions'
import { formatSessionTime, type ParsedSession } from '@/lib/ua-parser'

type SessionItemProps = {
  session: ParsedSession
  onRevoked: () => void
}

export function SessionItem({ session, onRevoked }: SessionItemProps) {
  const [isRevoking, setIsRevoking] = useState(false)

  const { execute } = useAction(revokeSessionAction, {
    onSuccess: () => {
      toast.success('Session terminated')
      onRevoked()
    },
    onError: ({ error }) => {
      toast.error(error.serverError || 'Failed to terminate session')
    },
    onSettled: () => {
      setIsRevoking(false)
    },
  })

  const handleRevoke = () => {
    if (session.isCurrentDevice) return

    setIsRevoking(true)
    execute({ token: session.token })
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
      <DeviceIcon type={session.deviceIcon} />

      <div className="flex-1">
        <div className="flex items-start justify-between gap-1">
          <div className="space-y-1">
            <h4 className="font-medium leading-none">{session.deviceName}</h4>
            <p className="text-muted-foreground text-sm">
              {session.browserName}
            </p>
          </div>

          {!session.isCurrentDevice && (
            <ButtonLoading
              size="icon"
              variant="ghost"
              onClick={handleRevoke}
              loading={isRevoking}
              disabled={isRevoking}
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
            >
              {!isRevoking && <X className="h-4 w-4" />}
              <span className="sr-only">Terminate this session</span>
            </ButtonLoading>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground text-xs">
          <span>{session.location}</span>
          <span className="text-muted-foreground/50">•</span>
          <span>
            {session.isCurrentDevice
              ? 'Active now'
              : formatSessionTime(session.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}
