'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function EmailVerifiedPage({ error }: { error?: string }) {
  const isInvalidToken =
    error && ['invalid_token', 'token_expired'].includes(error.toLowerCase())

  if (error) {
    return (
      <main className="flex h-screen flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <Alert variant="destructive" className="border border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-semibold">
              Verification Failed
            </AlertTitle>
            <AlertDescription>
              {isInvalidToken
                ? 'The verification link is invalid or has expired. Please request a new verification email.'
                : 'Something went wrong.'}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/admin/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex h-screen flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Email Verified!</h1>
            <p className="text-muted-foreground">
              Your email has been successfully verified.
            </p>
          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          <Button asChild>
            <Link href="/admin/dashboard">Continue to Dashboard</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
