import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldDescription } from '@/components/ui/field'
import { ROUTES } from '@/constants/routes'
import { ForgotPasswordForm } from '@/features/forgot-password/_components/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <div className="bg-muted flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Forgot your password?</CardTitle>
              <CardDescription>
                Enter your email below to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Field>
                <ForgotPasswordForm />

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
