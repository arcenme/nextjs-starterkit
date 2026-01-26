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
import {
  type TwoFactorPasswordInput,
  TwoFactorPasswordSchema,
} from '@/features/settings/security/types'
import { authClient } from '@/lib/auth-client'

export function DisableTwoFactorAuth() {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [isDisabling, setIsDisabling] = useState(false)

  const disablePasswordForm = useForm<TwoFactorPasswordInput>({
    resolver: zodResolver(TwoFactorPasswordSchema),
    defaultValues: { password: '' },
  })

  const handleCloseDisable = () => {
    setOpen(false)
    disablePasswordForm.reset()
  }

  // Disable 2FA
  async function handleDisableSubmit(data: TwoFactorPasswordInput) {
    setIsDisabling(true)
    try {
      const { error } = await authClient.twoFactor.disable({
        password: data.password,
      })

      if (error) {
        disablePasswordForm.setError('password', {
          type: 'manual',
          message: error.message || 'Invalid password',
        })
        return
      }

      toast.success('Two-factor authentication disabled')
      handleCloseDisable()

      // Refresh session to update 2FA status
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Two-Factor Authentication</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Your account is protected with 2FA
            </p>
          </div>
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

      {/* Disable 2FA Modal */}
      <Modal
        open={open}
        onOpenChange={handleCloseDisable}
        size="sm"
        showClose={!isDisabling}
      >
        <form
          onSubmit={disablePasswordForm.handleSubmit(handleDisableSubmit)}
          className="space-y-6"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <ScanQrCode className="size-6 text-destructive" />
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
              control={disablePasswordForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    id="disable-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    autoFocus
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
              onClick={handleCloseDisable}
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
