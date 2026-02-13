'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ButtonLoading } from '@/components/shared/button-loading'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/constants/routes'
import {
  type BackupCodeInput,
  BackupCodeSchema,
} from '@/features/auth/2fa/types'
import { authClient } from '@/lib/auth-client'

type BackupCodeVerificationFormProps = {
  onSwitchToTotp: () => void
}

export function BackupCodeVerificationForm({
  onSwitchToTotp,
}: BackupCodeVerificationFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<BackupCodeInput>({
    resolver: zodResolver(BackupCodeSchema),
    defaultValues: {
      code: '',
      trustDevice: false,
    },
  })

  async function handleSubmit(data: BackupCodeInput) {
    setIsLoading(true)
    try {
      const { error } = await authClient.twoFactor.verifyBackupCode({
        code: data.code,
        trustDevice: data.trustDevice,
      })

      if (error) {
        form.setError('code', {
          type: 'manual',
          message: error.message || 'Invalid backup code',
        })
        return
      }

      toast.success('Verification successful')

      const callbackUrl =
        searchParams.get('callbackUrl') || ROUTES.REDIRECT_AFTER_SIGN_IN
      router.push(callbackUrl)
    } catch {
      form.setError('code', {
        type: 'manual',
        message: 'Failed to verify backup code',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Two-Factor Authentication</CardTitle>
        <CardDescription className="text-sm">
          Enter one of your backup recovery codes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FieldGroup>
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="backup-code">Backup Code</FieldLabel>
                  <Input
                    {...field}
                    id="backup-code"
                    type="text"
                    placeholder="Enter your backup code"
                    disabled={isLoading}
                    autoComplete="off"
                    autoFocus
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Controller
            name="trustDevice"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal" className="items-start gap-2">
                <Checkbox
                  id="trust-device-backup"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
                <div className="flex-1 space-y-0.5">
                  <FieldLabel
                    htmlFor="trust-device-backup"
                    className="font-normal"
                  >
                    Trust this device for 30 days
                  </FieldLabel>
                </div>
              </Field>
            )}
          />

          <ButtonLoading
            type="submit"
            loading={isLoading}
            disabled={isLoading || !form.formState.isDirty}
            className="w-full"
          >
            Verify
          </ButtonLoading>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={onSwitchToTotp}
              disabled={isLoading}
              className="h-auto cursor-pointer p-0 text-sm"
            >
              Or use authenticator app
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
