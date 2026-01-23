'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { AlertCircleIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/constants/routes'
import { resetPasswordAction } from '@/features/reset-password/actions'
import { ResetPasswordSchema } from '@/features/reset-password/types'

export function ResetPasswordForm() {
  const router = useRouter()

  const searchParams = useSearchParams()
  const token = searchParams.get('token') as string

  const { form, action, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(resetPasswordAction, zodResolver(ResetPasswordSchema), {
      formProps: {
        defaultValues: {
          newPassword: '',
          confirmPassword: '',
          token,
        },
      },
      actionProps: {
        onSuccess: () => {
          resetFormAndAction()
          toast.success('Password reset successfully')
          router.push(ROUTES.AUTH.SIGN_IN)
        },
        onError: ({ error }) => {
          if (error.serverError) {
            toast.error(error.serverError)
          }
        },
      },
    })

  return (
    <form onSubmit={handleSubmitWithAction}>
      <FieldGroup className="gap-4">
        {action.hasErrored && action.result?.validationErrors?._errors && (
          <Alert variant="destructive" className="border-destructive">
            <AlertCircleIcon />
            <AlertTitle>
              {action.result.validationErrors?._errors[0]}
            </AlertTitle>
          </Alert>
        )}
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
                placeholder="********"
                aria-invalid={fieldState.invalid}
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
                Confirm Password
              </FieldLabel>
              <Input
                {...field}
                required
                id="confirmPassword"
                type="password"
                placeholder="********"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field>
          <Button
            type="submit"
            disabled={action.isExecuting}
            className="cursor-pointer"
          >
            {action.isExecuting ? 'Resetting ...' : 'Reset Password'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
