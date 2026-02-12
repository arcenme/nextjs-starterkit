'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { Mail } from 'lucide-react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { ButtonLoading } from '@/components/shared/button-loading'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { sendMagicLinkAction } from '@/features/magic-link/actions'
import { MagicLinkSchema } from '@/features/magic-link/types'

export function MagicLinkForm() {
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const { form, handleSubmitWithAction, action } = useHookFormAction(
    sendMagicLinkAction,
    zodResolver(MagicLinkSchema),
    {
      formProps: { defaultValues: { email: '' } },
      actionProps: {
        onSuccess: ({ input }) => {
          setEmailSent(true)
          setSentEmail(input.email)
          toast.success('Magic link sent! Check your email.')
        },
        onError: ({ error }) => {
          toast.error(error.serverError || 'Failed to send magic link')
        },
      },
    }
  )

  if (emailSent) {
    return (
      <div className="space-y-6 text-center">
        <div>
          <h1 className="font-bold text-2xl">Check your email</h1>
          <p className="text-muted-foreground text-sm">
            We sent a magic link to&nbsp;
            <span className="font-medium text-foreground">{sentEmail}</span>
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Click the link in your email to sign in. The link will expire in 5
            minutes.
          </p>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setEmailSent(false)
              form.reset()
            }}
          >
            Use a different email
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmitWithAction} className="space-y-4">
      <div className="flex flex-col items-center gap-2 px-2 pb-0 text-center">
        <h1 className="font-bold text-2xl">Sign in with magic link</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we'll send you a link to sign in
        </p>
      </div>

      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="email" className="sr-only">
              Email
            </FieldLabel>
            <Input
              {...field}
              id="email"
              type="email"
              placeholder="me@example.com"
              disabled={action.isPending}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <ButtonLoading
        type="submit"
        loading={action.isPending}
        disabled={action.isPending}
        className="w-full"
      >
        {action.isExecuting ? (
          'Sending...'
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Send magic link
          </>
        )}
      </ButtonLoading>
    </form>
  )
}
