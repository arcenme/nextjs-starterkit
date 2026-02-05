'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ScanQrCode } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Modal } from '@/components/shared/modal'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ViewBackupCodes } from '@/features/settings/security/_components/view-backup-codes'
import {
  type TwoFactorPasswordInput,
  TwoFactorPasswordSchema,
} from '@/features/settings/security/types'
import { authClient } from '@/lib/auth-client'

export function DisableTwoFactorAuth() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isDisabling, setIsDisabling] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const form = useForm<TwoFactorPasswordInput>({
    resolver: zodResolver(TwoFactorPasswordSchema),
    defaultValues: { password: '' },
  })

  const handleClose = () => {
    setOpen(false)
    form.reset()
  }

  const handleCodesViewed = (codes: string[]) => {
    setBackupCodes(codes)
  }

  const handleSubmit = async (data: TwoFactorPasswordInput) => {
    setIsDisabling(true)
    try {
      const { error } = await authClient.twoFactor.disable({
        password: data.password,
      })

      if (error) {
        form.setError('password', {
          type: 'manual',
          message: error.message || 'Invalid password',
        })
        return
      }

      toast.success('Two-factor authentication disabled')
      handleClose()
      setBackupCodes([])

      setTimeout(() => {
        router.refresh()
      }, 300)
    } catch {
      toast.error('Failed to disable two-factor authentication')
    } finally {
      setIsDisabling(false)
    }
  }

  return (
    <>
      <div className="max-w-lg space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex-1">
            <h3 className="font-medium">Two-Factor Authentication</h3>
            <p className="text-muted-foreground text-sm">
              Your account was secured with Two-Factor Authentication, which
              requires an additional step to access your account.
            </p>
          </div>
          <div className="flex gap-2">
            <ViewBackupCodes onCodesViewed={handleCodesViewed} />
            <Button
              size="sm"
              type="button"
              variant="destructive"
              onClick={() => setOpen(true)}
            >
              Disable
            </Button>
          </div>
        </div>

        {/* Display Backup Codes */}
        {backupCodes.length > 0 && (
          <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
            <h4 className="font-medium">Backup Codes</h4>
            <p className="text-muted-foreground text-xs">
              Each code can only be used once to access your account if you lose
              your authenticator device. Protect them like you would protect
              your password. Do not share them with anyone and keep them in a
              safe place.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <code
                  // biome-ignore lint/suspicious/noArrayIndexKey: it's just a plain string, not an array index
                  key={index}
                  className="rounded border bg-background px-2 py-1.5 text-center font-mono text-xs"
                >
                  {code}
                </code>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={open}
        onOpenChange={handleClose}
        size="sm"
        showClose={!isDisabling}
        dismissable={!isDisabling}
      >
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <ScanQrCode className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h2 className="font-semibold text-xl">
                Disable Two-Factor Authentication
              </h2>
              <p className="mt-1 text-muted-foreground text-sm">
                Enter your password to confirm this action
              </p>
            </div>
          </div>

          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    id="disable-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    autoFocus
                    required
                    aria-invalid={fieldState.invalid}
                    disabled={isDisabling}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Warning:</strong> Disabling 2FA will make your account
              less secure. Your backup codes will no longer work.
            </p>
          </div>

          <Field orientation="horizontal">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isDisabling}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isDisabling}
              className="flex-1"
            >
              {isDisabling ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          </Field>
        </form>
      </Modal>
    </>
  )
}
