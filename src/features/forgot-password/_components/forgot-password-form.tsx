'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  type ForgotPasswordInput,
  ForgotPasswordSchema,
} from '@/features/forgot-password/types'
import { authClient } from '@/lib/auth-client'

export function ForgotPasswordForm() {
  const router = useRouter()

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit({ email }: ForgotPasswordInput) {
    await authClient.requestPasswordReset({
      email,
      redirectTo: '/reset-password',
      fetchOptions: {
        onSuccess: ({ data }) => {
          toast.success(data.message)
          router.push('/login')
        },
        onError: ({ error }) => {
          toast.error(error.message)
        },
      },
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
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
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="cursor-pointer"
          >
            {form.formState.isSubmitting ? 'Loading ...' : 'Send reset link'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
