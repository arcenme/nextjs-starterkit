'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { AlertCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import { loginAction } from '@/features/login/actions'
import { LoginSchema } from '@/features/login/types'

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
    <form className="p-6 md:p-8 pb-0 md:pb-0" onSubmit={handleSubmitWithAction}>
      <div className="flex flex-col items-center gap-2 text-center pb-6">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-balance">
          Login to your Acme Inc account
        </p>
      </div>
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

        <Field>
          <Button
            type="submit"
            disabled={action.isExecuting}
            className="cursor-pointer"
          >
            {action.isExecuting ? 'Loading ...' : 'Login'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
