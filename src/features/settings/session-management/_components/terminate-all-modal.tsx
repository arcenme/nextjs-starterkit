'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { Power } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { ButtonLoading } from '@/components/shared/button-loading'
import { Modal } from '@/components/shared/modal'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { revokeOtherSessionsAction } from '@/features/settings/session-management/actions'
import { RevokeOtherSessionsSchema } from '@/features/settings/session-management/types'

type TerminateAllModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function TerminateAllModal({
  open,
  onOpenChange,
  onSuccess,
}: TerminateAllModalProps) {
  const { form, action, handleSubmitWithAction } = useHookFormAction(
    revokeOtherSessionsAction,
    zodResolver(RevokeOtherSessionsSchema),
    {
      actionProps: {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess()
        },
      },
      formProps: {
        defaultValues: { password: '' },
      },
    }
  )

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleClose}
      size="sm"
      showClose={!action.isExecuting}
      dismissable={!action.isExecuting}
    >
      <form onSubmit={handleSubmitWithAction} className="space-y-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Power className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h2 className="font-semibold text-xl">Terminate All Sessions</h2>
            <p className="mt-1 text-muted-foreground text-sm">
              Enter your password to terminate all other sessions
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
                  id="terminate-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  autoFocus
                  disabled={action.isExecuting}
                  aria-invalid={fieldState.invalid}
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
            <strong>Warning:</strong> This will log you out from all other
            devices. You will remain logged in on this device.
          </p>
        </div>

        <Field orientation="horizontal">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={action.isExecuting}
            className="flex-1"
          >
            Cancel
          </Button>
          <ButtonLoading
            type="submit"
            variant="destructive"
            loading={action.isExecuting}
            disabled={action.isExecuting}
            className="flex-1"
          >
            Terminate All
          </ButtonLoading>
        </Field>
      </form>
    </Modal>
  )
}
