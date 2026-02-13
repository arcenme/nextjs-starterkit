'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { AlertCircleIcon } from 'lucide-react'
import Link from 'next/link'
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
import { loginAction } from '@/features/auth/login/actions'
import { LoginSchema } from '@/features/auth/login/types'

export function LoginForm() {
  const router = useRouter()

  const { form, action, handleSubmitWithAction, resetFormAndAction } =
    useHookFormAction(loginAction, zodResolver(LoginSchema), {
      formProps: {
        defaultValues: {
          email: '',
          password: '',
        },
      },
      actionProps: {
        onSuccess: () => {
          resetFormAndAction()
          router.push(ROUTES.REDIRECT_AFTER_SIGN_IN)
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
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link
                  tabIndex={-1}
                  href={ROUTES.AUTH.FORGOT_PASSWORD}
                  className="ml-auto text-sm underline-offset-2 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                {...field}
                required
                id="password"
                type="password"
                placeholder="********"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field orientation="horizontal">
          <ButtonLoading
            type="submit"
            loading={action.isExecuting}
            disabled={action.isExecuting}
            className="w-full cursor-pointer"
          >
            {action.isExecuting ? 'Signing in...' : 'Sign in'}
          </ButtonLoading>
        </Field>
      </FieldGroup>
    </form>
  )
}
