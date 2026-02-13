'use client'

import type { Session } from 'better-auth/types'
import { Power } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SessionItem } from '@/features/admin/settings/session-management/_components/session-item'
import { TerminateAllModal } from '@/features/admin/settings/session-management/_components/terminate-all-modal'
import { type ParsedSession, parseSession } from '@/lib/ua-parser'

type ActiveSessionsProps = {
  currentSessionToken?: string
  sessions?: Session[]
}

export function ActiveSessions({
  currentSessionToken,
  sessions = [],
}: ActiveSessionsProps) {
  const router = useRouter()

  const [openTerminateAll, setOpenTerminateAll] = useState(false)
  const [parsedSessions, setParsedSessions] = useState<ParsedSession[]>([])

  const handleTerminateAllSuccess = () => {
    toast.success('All other sessions terminated')
    router.refresh()
  }

  const handleRevoked = () => {
    router.refresh()
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: parsing sessions is not a dependency
  useEffect(() => {
    if (sessions.length > 0) {
      const parsed = sessions.map((s) => parseSession(s, currentSessionToken))
      // Sort: current device first, then by createdAt
      const sorted = parsed.sort((a, b) => {
        if (a.isCurrentDevice) return -1
        if (b.isCurrentDevice) return 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      setParsedSessions(sorted)
    }
  }, [sessions])

  const thisSessions = parsedSessions.find((s) => s.isCurrentDevice)
  const otherSessions = parsedSessions.filter((s) => !s.isCurrentDevice)

  if (parsedSessions.length === 0) {
    return (
      <div className="max-w-lg space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 rounded-lg border p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* This Device */}
      {thisSessions && (
        <div className="space-y-1">
          <h4 className="font-normal text-lg">This device</h4>
          <SessionItem
            key={thisSessions.id}
            session={thisSessions}
            onRevoked={handleRevoked}
          />

          {/* Terminate all other sessions */}
          {otherSessions.length > 0 && (
            <div className="flex flex-col space-y-2 rounded-lg border border-dashed bg-muted/50 p-4">
              <Button
                size="sm"
                variant="destructive"
                className="w-full self-center"
                onClick={() => setOpenTerminateAll(true)}
              >
                <Power className="mr-2 h-4 w-4" />
                Terminate all other sessions
              </Button>
              <p className="text-center text-muted-foreground text-xs">
                Logs out all devices except for this one.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Other devices */}
      {otherSessions.length > 0 && (
        <div className="space-y-1">
          <h4 className="font-normal text-lg">Other devices</h4>
          <div className="space-y-3">
            {otherSessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                onRevoked={handleRevoked}
              />
            ))}
          </div>
        </div>
      )}

      <TerminateAllModal
        open={openTerminateAll}
        onOpenChange={setOpenTerminateAll}
        onSuccess={handleTerminateAllSuccess}
      />
    </div>
  )
}
