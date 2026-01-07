import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription } from '@/components/ui/field'
import { ResetPasswordForm } from '@/features/reset-password/_components/reset-password-form'

export default function ResetPasswordPage() {
  return (
    <div className="bg-muted flex min-h-svh w-full items-center justify-center p-6 md:p-10">
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
                  <Link href="/signup">Sign up</Link>
                </FieldDescription>
              </Field>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
