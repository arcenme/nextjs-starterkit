'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { AlertCircleIcon } from 'lucide-react'
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
import { signUpAction } from '@/features/signup/actions'
import { SignUpSchema } from '@/features/signup/types'

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
          router.push('/login')
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
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to create your account
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
        <Field>
          <Button
            type="submit"
            disabled={action.isExecuting}
            className="cursor-pointer"
          >
            {action.isExecuting ? 'Creating...' : 'Create Account'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
