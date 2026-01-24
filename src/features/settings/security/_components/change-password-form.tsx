'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { AlertCircleIcon } from 'lucide-react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { ButtonLoading } from '@/components/shared/button-loading'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { updatePasswordAction } from '@/features/settings/security/actions'
import { UpdatePasswordSchema } from '@/features/settings/security/types'

export function ChangePasswordForm() {
  const [showForm, setShowForm] = useState(false)

  const { form, action, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(updatePasswordAction, zodResolver(UpdatePasswordSchema), {
      formProps: {
        defaultValues: {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          revokeOtherSessions: false,
        },
      },
      actionProps: {
        onSuccess: async () => {
          toast.success('Password updated successfully')
          resetFormAndAction()
          setShowForm(false)
        },
        onError: ({ error }) => {
          if (error.serverError) {
            toast.error(error.serverError)
          }
        },
      },
    })

  const handleCancel = () => {
    resetFormAndAction()
    setShowForm(false)
  }

  if (!showForm) {
    return (
      <div className="max-w-lg space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Password</h3>
            <p className="text-sm text-muted-foreground">
              Update your password to keep your account secure
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            Change
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form className="max-w-lg space-y-6" onSubmit={handleSubmitWithAction}>
      <div className="space-y-1">
        <h3 className="font-medium">Change Password</h3>
        <p className="text-sm text-muted-foreground">
          Enter your current password and choose a new one
        </p>
      </div>

      {action.hasErrored && action.result?.validationErrors?._errors && (
        <Alert variant="destructive" className="border-destructive">
          <AlertCircleIcon />
          <AlertTitle>{action.result.validationErrors?._errors[0]}</AlertTitle>
        </Alert>
      )}

      <FieldGroup className="gap-4">
        <Controller
          name="currentPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="currentPassword">
                Current Password
              </FieldLabel>
              <Input
                {...field}
                required
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
                disabled={action.isExecuting}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="newPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
              <Input
                {...field}
                required
                id="newPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
                disabled={action.isExecuting}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm New Password
              </FieldLabel>
              <Input
                {...field}
                required
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                aria-invalid={fieldState.invalid}
                disabled={action.isExecuting}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="revokeOtherSessions"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal" className="items-start gap-2">
              <Checkbox
                id="revokeOtherSessions"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={action.isExecuting}
              />
              <div className="space-y-1">
                <FieldLabel
                  htmlFor="revokeOtherSessions"
                  className="font-normal"
                >
                  Sign out of other devices
                </FieldLabel>
                <FieldDescription className="text-xs">
                  This will log you out from all other active sessions
                </FieldDescription>
              </div>
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex gap-2">
        <ButtonLoading
          type="submit"
          loading={action.isExecuting}
          disabled={action.isExecuting}
        >
          Update Password
        </ButtonLoading>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={action.isExecuting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
