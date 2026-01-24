'use client'

import { AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { ROUTES } from '@/constants/routes'

export default function EmailVerifiedPage({
  token,
  error,
}: {
  token?: string
  error?: string
}) {
  if (error || !token) {
    return (
      <div className="bg-muted flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>Verification Failed</CardTitle>
              <CardDescription>
                Unable to verify your email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert
                variant="destructive"
                className="border border-destructive"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-semibold">
                  Invalid Verification Link
                </AlertTitle>
                <AlertDescription>
                  The verification link is invalid or has expired. Please
                  request a new verification email.
                </AlertDescription>
              </Alert>

              <Field orientation="responsive">
                <Button asChild variant="outline">
                  <Link href={ROUTES.AUTH.SIGN_IN}>Back to Login</Link>
                </Button>
              </Field>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-muted flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={ROUTES.ADMIN.DASHBOARD}>Continue to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
