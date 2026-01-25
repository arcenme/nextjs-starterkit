import { AlertCircle } from 'lucide-react'
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
import { Field, FieldDescription } from '@/components/ui/field'
import { ROUTES } from '@/constants/routes'
import { ResetPasswordForm } from '@/features/reset-password/_components/reset-password-form'

export default function ResetPasswordPage({
  token,
  error,
}: {
  token?: string
  error?: string
}) {
  if (!token || error) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>Invalid Reset Link</CardTitle>
              <CardDescription>
                Unable to process password reset request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert
                variant="destructive"
                className="border border-destructive"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-semibold">
                  Reset Link Invalid
                </AlertTitle>
                <AlertDescription>
                  This password reset link is invalid or has expired. Please
                  request a new one.
                </AlertDescription>
              </Alert>

              <Field orientation="responsive">
                <Button asChild>
                  <Link href={ROUTES.AUTH.FORGOT_PASSWORD}>
                    Request New Link
                  </Link>
                </Button>
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
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>Enter your new password</CardDescription>
            </CardHeader>
            <CardContent>
              <Field>
                <ResetPasswordForm />

                <FieldDescription className="text-center">
                  Don&apos;t have an account?&nbsp;
                  <Link href={ROUTES.AUTH.SIGN_UP}>Sign up</Link>
                </FieldDescription>
              </Field>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
