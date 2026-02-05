'use client'

import { useState } from 'react'
import { BackupCodeVerificationForm } from '@/features/2fa/_components/backup-code-verification-form'
import { TotpVerificationForm } from '@/features/2fa/_components/totp-verification-form'

export function TwoFactorPage() {
  const [mode, setMode] = useState<'totp' | 'backup'>('totp')

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
      {mode === 'totp' ? (
        <TotpVerificationForm onSwitchToBackup={() => setMode('backup')} />
      ) : (
        <BackupCodeVerificationForm onSwitchToTotp={() => setMode('totp')} />
      )}
    </div>
  )
}
