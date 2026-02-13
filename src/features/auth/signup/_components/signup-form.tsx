'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { AlertCircleIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { ButtonLoading } from '@/components/shared/button-loading'
import { Alert, AlertTitle } from '@/components/ui/alert'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/constants/routes'
import { signUpAction } from '@/features/auth/signup/actions'
import { SignUpSchema } from '@/features/auth/signup/types'

export function SignUpForm() {
  const router = useRouter()

  const { form, action, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(signUpAction, zodResolver(SignUpSchema), {
      formProps: {
        defaultValues: {
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
        },
      },
      actionProps: {
        onSuccess: () => {
          resetFormAndAction()
          toast.success('Please check your email for a verification link')
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
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                {...field}
                required
                id="name"
                type="text"
                placeholder="John Doe"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...field}
                required
                id="email"
                type="email"
                placeholder="me@example.com"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Field>
          <Field className="grid grid-cols-2 gap-4">
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    {...field}
                    required
                    id="password"
                    type="password"
                    placeholder="********"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirm-password">
                    Confirm Password
                  </FieldLabel>
                  <Input
                    {...field}
                    required
                    type="password"
                    id="confirm-password"
                    placeholder="********"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </Field>
        </Field>
        <Field orientation="horizontal">
          <ButtonLoading
            type="submit"
            loading={action.isExecuting}
            disabled={action.isExecuting}
            className="w-full cursor-pointer"
          >
            {action.isExecuting ? 'Creating...' : 'Create Account'}
          </ButtonLoading>
        </Field>
      </FieldGroup>
    </form>
  )
}
