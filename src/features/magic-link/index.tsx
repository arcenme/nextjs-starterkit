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
import { MagicLinkForm } from '@/features/magic-link/_components/magic-link-form'

export default function MagicLinkPage({ error }: { error?: string }) {
  if (error) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>Error Processing Magic Link</CardTitle>
              <CardDescription>
                Unable to process magic link request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert
                variant="destructive"
                className="border border-destructive"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle className="font-semibold">
                  Magic Link Invalid
                </AlertTitle>
                <AlertDescription>
                  This magic link is invalid or has expired.
                </AlertDescription>
              </Alert>

              <Field orientation="responsive">
                <Button asChild>
                  <Link href={ROUTES.AUTH.MAGIC_LINK}>Request New Link</Link>
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
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="p-0">
              <Field className="px-2">
                <Field orientation="vertical" className="px-6">
                  <MagicLinkForm />

                  <FieldDescription className="text-center">
                    Already have an account?&nbsp;
                    <Link href={ROUTES.AUTH.SIGN_IN}>Sign in</Link>
                  </FieldDescription>
                </Field>
              </Field>
            </CardContent>
          </Card>

          <FieldDescription className="text-balance px-6 text-center">
            By continue, you agree to our&nbsp;
            <Link href={ROUTES.PUBLIC.TERMS}>Terms of Service</Link> and&nbsp;
            <Link href={ROUTES.PUBLIC.PRIVACY_POLICY}>Privacy Policy</Link>.
          </FieldDescription>
        </div>
      </div>
    </div>
  )
}
