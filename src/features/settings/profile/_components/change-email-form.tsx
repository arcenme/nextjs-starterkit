'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { PencilIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { ButtonLoading } from '@/components/shared/button-loading'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { changeEmailAction } from '@/features/settings/profile/actions'
import { ChangeEmailSchema } from '@/features/settings/profile/types'
import { authClient } from '@/lib/auth-client'

export function ChangeEmailForm() {
  const { isPending, data } = authClient.useSession()
  const [showForm, setShowForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { form, action, handleSubmitWithAction } = useHookFormAction(
    changeEmailAction,
    zodResolver(ChangeEmailSchema),
    {
      formProps: { defaultValues: { email: '' } },
      actionProps: {
        onSuccess: () => {
          setSuccessMessage('Confirmation email sent to your current address')
          setShowForm(false)
          setTimeout(() => setSuccessMessage(null), 4000)
        },
        onError: ({ error }) => {
          if (error.serverError) {
            toast.error(error.serverError)
          }
        },
      },
    }
  )

  const userEmail = data?.user.email
  const isDisabled = isPending || action.isExecuting

  useEffect(() => {
    if (userEmail) {
      form.setValue('email', userEmail)
    }
  }, [userEmail, form])

  const handleCancel = () => {
    setShowForm(false)
    if (userEmail) {
      form.setValue('email', userEmail)
    }
    form.clearErrors()
  }

  return (
    <form className="max-w-md space-y-4" onSubmit={handleSubmitWithAction}>
      <FieldGroup className="gap-4">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>

              <div className="relative w-full">
                <Input
                  {...field}
                  required
                  id="email"
                  type="email"
                  placeholder="me@example.com"
                  aria-invalid={fieldState.invalid}
                  disabled={isDisabled}
                  readOnly={!showForm}
                  className={!showForm ? 'pr-12' : ''}
                />
                {!showForm && (
                  <Button
                    aria-label="Edit email address"
                    type="button"
                    onClick={() => setShowForm(true)}
                    disabled={isPending}
                    size="icon"
                    className="absolute top-0 right-0 h-full rounded-l-none"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                )}
              </div>

              {successMessage && (
                <div className="rounded-md border border-green-200 bg-green-50 p-2 text-sm text-green-900">
                  {successMessage}
                </div>
              )}

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {showForm && (
          <Field orientation="horizontal" className="gap-2">
            <ButtonLoading
              type="submit"
              loading={action.isExecuting}
              disabled={isDisabled}
            >
              Save
            </ButtonLoading>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={action.isExecuting}
            >
              Cancel
            </Button>
          </Field>
        )}
      </FieldGroup>
    </form>
  )
}
