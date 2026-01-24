'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { ButtonLoading } from '@/components/shared/button-loading'
import { ROUTES } from '@/constants/routes'
import { authClient } from '@/lib/auth-client'

export function SetPasswordButton({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition()

  function handleSendPasswordResetEmail() {
    startTransition(async () => {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: ROUTES.AUTH.RESET_PASSWORD,
      })

      if (error) {
        toast.error(error.message ?? 'Failed to send reset link')
      } else {
        toast.success('Check your email for a password reset link')
      }
    })
  }

  return (
    <div className="max-w-lg space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-medium">Password</h3>
          <p className="text-sm text-muted-foreground">
            Set a password to keep your account secure
          </p>
        </div>
        <ButtonLoading
          type="button"
          variant="outline"
          size="sm"
          loading={isPending}
          disabled={isPending}
          onClick={handleSendPasswordResetEmail}
        >
          {isPending ? 'Sending...' : 'Send reset link'}
        </ButtonLoading>
      </div>
    </div>
  )
}
