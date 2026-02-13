'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { ShieldCheck } from 'lucide-react'
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
import { Field, FieldLabel } from '@/components/ui/field'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { ROUTES } from '@/constants/routes'
import { type TotpInput, TotpSchema } from '@/features/auth/2fa/types'
import { authClient } from '@/lib/auth-client'

type TotpVerificationFormProps = {
  onSwitchToBackup: () => void
}

export function TotpVerificationForm({
  onSwitchToBackup,
}: TotpVerificationFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<TotpInput>({
    resolver: zodResolver(TotpSchema),
    defaultValues: {
      code: '',
      trustDevice: false,
    },
  })

  async function handleSubmit(data: TotpInput) {
    setIsLoading(true)
    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: data.code,
        trustDevice: data.trustDevice,
      })

      if (error) {
        toast.error(error.message || 'Invalid code')
        form.setValue('code', '')
        return
      }

      toast.success('Verification successful')

      const callbackUrl =
        searchParams.get('callbackUrl') || ROUTES.REDIRECT_AFTER_SIGN_IN
      router.push(callbackUrl)
    } catch {
      toast.error('Failed to verify code')
    } finally {
      setIsLoading(false)
    }
  }

  const code = form.watch('code')

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl">Two-Factor Authentication</CardTitle>
        <CardDescription className="text-sm">
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <Controller
              name="code"
              control={form.control}
              render={({ field }) => (
                <InputOTP
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  pattern={REGEXP_ONLY_DIGITS}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />

            <div className="flex items-start justify-center gap-2">
              <Controller
                name="trustDevice"
                control={form.control}
                render={({ field }) => (
                  <Field
                    orientation="horizontal"
                    className="w-full items-start gap-2"
                  >
                    <Checkbox
                      id="trust-device"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                    <div className="flex-1 space-y-0.5">
                      <FieldLabel
                        htmlFor="trust-device"
                        className="font-normal"
                      >
                        Trust this device for 30 days
                      </FieldLabel>
                    </div>
                  </Field>
                )}
              />
            </div>

            <ButtonLoading
              type="submit"
              loading={isLoading}
              disabled={isLoading || code.length !== 6}
              className="w-full max-w-[250]"
              size="sm"
            >
              Verify
            </ButtonLoading>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={onSwitchToBackup}
              disabled={isLoading}
              className="h-auto cursor-pointer p-0 text-sm"
            >
              Or use backup code instead
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
