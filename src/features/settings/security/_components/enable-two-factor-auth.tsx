'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { Copy, Download, KeyRound, ScanQrCode } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import { Modal } from '@/components/shared/modal'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import {
  type TwoFactorPasswordInput,
  TwoFactorPasswordSchema,
} from '@/features/settings/security/types'
import { authClient } from '@/lib/auth-client'

export function EnableTwoFactorAuth() {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [twoFactorData, setTwoFactorData] = useState<{
    totpURI: string
    backupCodes: string[]
  } | null>(null)

  const form = useForm<TwoFactorPasswordInput>({
    resolver: zodResolver(TwoFactorPasswordSchema),
    defaultValues: { password: '' },
  })

  const handleClose = () => {
    setOpen(false)

    // Small delay before resetting to prevent visual glitch
    setTimeout(() => {
      setStep(1)
      setTwoFactorData(null)
      setOtpCode('')
      form.reset()
    }, 250)

    // Refresh session in background
    if (step === 4) {
      router.refresh()
    }
  }

  // Step 1: Verify password
  async function handlePasswordSubmit(data: TwoFactorPasswordInput) {
    setIsLoading(true)
    try {
      const { error, data: res } = await authClient.twoFactor.enable({
        password: data.password,
      })

      if (error) {
        form.setError('password', {
          type: 'manual',
          message: error.message || 'Invalid password',
        })
        return
      }

      if (res?.totpURI && res?.backupCodes) {
        setTwoFactorData({
          totpURI: res.totpURI,
          backupCodes: res.backupCodes,
        })
        setStep(2)
      }
    } catch {
      toast.error('Failed to enable two-factor authentication')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2 -> Step 3: Continue to verify
  const handleContinueToVerify = () => {
    setStep(3)
  }

  // Step 3: Verify TOTP code
  async function handleVerifyCode() {
    if (otpCode.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: otpCode,
      })

      if (error) {
        toast.error(error.message || 'Invalid code')
        setOtpCode('')
        return
      }

      // Go to step 4 to show backup codes
      setStep(4)
      toast.success('Two-factor authentication enabled successfully')
    } catch {
      toast.error('Failed to verify code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 3) {
      setStep(2)
      setOtpCode('')
    } else if (step === 2) {
      setStep(1)
      setTwoFactorData(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const extractSetupKey = (uri: string) => {
    const match = uri.match(/secret=([A-Z0-9]+)/)
    return match ? match[1] : ''
  }

  // Format setup key: JBSWY3DPEHPK3PXP -> JBSW Y3DP EHPK 3PXP
  const formatSetupKey = (key: string) => {
    return key.match(/.{1,4}/g)?.join(' ') || key
  }

  const downloadBackupCodes = () => {
    if (!twoFactorData?.backupCodes) return

    const content = twoFactorData.backupCodes.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Backup codes downloaded')
  }

  return (
    <>
      <div className="max-w-lg space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-medium">Two-Factor Authentication</h3>
            <p className="text-muted-foreground text-sm">
              Add an extra layer of security to your account
            </p>
          </div>
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() => setOpen(true)}
          >
            Enable
          </Button>
        </div>
      </div>

      <Modal
        size="sm"
        open={open}
        onOpenChange={handleClose}
        showClose={!isLoading && step !== 4}
        dismissable={step !== 4}
      >
        {/* Step 1: Password Verification */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-full border-2 border-muted-foreground/25 border-dashed">
                <KeyRound className="size-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h2 className="font-semibold text-lg">
                  Enable Two-Factor Authentication
                </h2>
                <p className="text-muted-foreground text-sm">
                  To finish enabling two-factor authentication, please verify
                  your password
                </p>
              </div>
            </div>

            <form
              onSubmit={form.handleSubmit(handlePasswordSubmit)}
              className="space-y-4"
            >
              <FieldGroup>
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Input
                        {...field}
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        autoFocus
                        disabled={isLoading}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>

              <Field orientation="horizontal">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Verifying...' : 'Continue'}
                </Button>
              </Field>
            </form>
          </div>
        )}

        {/* Step 2: QR Code & Setup Key */}
        {step === 2 && twoFactorData && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-full border-2 border-primary/25 border-dashed bg-primary/5">
                <ScanQrCode className="size-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h2 className="font-semibold text-lg">Scan QR Code</h2>
                <p className="text-muted-foreground text-sm">
                  Use your authenticator app to scan this QR code
                </p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center rounded-lg border bg-white p-6">
              <QRCode value={twoFactorData.totpURI} size={200} />
            </div>

            {/* Setup Key */}
            <div className="space-y-2">
              <p className="text-center font-medium text-sm">
                or, enter the code manually
              </p>
              <div className="space-y-2 rounded-md border bg-muted/50 p-3">
                <code className="block break-all text-center font-mono text-sm">
                  {formatSetupKey(extractSetupKey(twoFactorData.totpURI))}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    copyToClipboard(extractSetupKey(twoFactorData.totpURI))
                  }
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Code
                </Button>
              </div>
            </div>

            <Button
              onClick={handleContinueToVerify}
              disabled={isLoading}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 3: Verify Code */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-full border-2 border-primary/25 border-dashed bg-primary/5">
                <ScanQrCode className="size-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h2 className="font-semibold text-lg">
                  Verify Authentication Code
                </h2>
                <p className="text-muted-foreground text-sm">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={setOtpCode}
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
            </div>

            <Field orientation="horizontal">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleVerifyCode}
                disabled={isLoading || otpCode.length !== 6}
                className="flex-1"
              >
                {isLoading ? 'Verifying...' : 'Confirm'}
              </Button>
            </Field>
          </div>
        )}

        {/* Step 4: Success & Backup Codes */}
        {step === 4 && twoFactorData && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <ScanQrCode className="size-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-1">
                <h2 className="font-semibold text-lg">
                  2FA Enabled Successfully!
                </h2>
                <p className="text-muted-foreground text-sm">
                  Save your backup codes in a secure place
                </p>
              </div>
            </div>

            {/* Backup Codes */}
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
              <div className="grid grid-cols-2 gap-2">
                {twoFactorData.backupCodes.map((code, index) => (
                  <code
                    // biome-ignore lint/suspicious/noArrayIndexKey: it's just a plain string
                    key={index}
                    className="rounded border bg-background px-2 py-1.5 text-center font-mono text-xs"
                  >
                    {code}
                  </code>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">
                Each code can only be used once to access your account if you
                lose your authenticator device.
              </p>
            </div>

            <Field orientation="vertical">
              <Button
                variant="default"
                onClick={downloadBackupCodes}
                className="w-full"
              >
                Download Codes
              </Button>
              <Button
                onClick={handleClose}
                className="w-full"
                variant="outline"
              >
                Close
              </Button>
            </Field>
          </div>
        )}
      </Modal>
    </>
  )
}
