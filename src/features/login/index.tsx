import Image from 'next/image'
import Link from 'next/link'
import { MagicLinkButton } from '@/components/shared/magic-link-button'
import { SocialSignOn } from '@/components/shared/social-signon'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldSeparator } from '@/components/ui/field'
import { ROUTES } from '@/constants/routes'
import { LoginForm } from '@/features/login/_components/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <Field className="px-2 pb-4">
                <div className="flex flex-col items-center gap-2 p-6 pb-0 text-center md:p-8 md:pb-0">
                  <h1 className="font-bold text-2xl">Welcome back</h1>
                  <p className="text-balance text-muted-foreground">
                    Sign in to your account
                  </p>
                </div>

                <Field orientation="vertical" className="gap-6 p-6">
                  <div className="space-y-2.5">
                    <SocialSignOn />
                    <MagicLinkButton />
                  </div>

                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    or
                  </FieldSeparator>

                  <LoginForm />

                  <FieldDescription className="text-center">
                    Don&apos;t have an account?&nbsp;
                    <Link href={ROUTES.AUTH.SIGN_UP}>Sign up</Link>
                  </FieldDescription>
                </Field>
              </Field>

              <div className="relative hidden bg-muted md:block">
                <Image
                  width={400}
                  height={400}
                  src="/placeholder.svg"
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center">
            By clicking continue, you agree to our&nbsp;
            <Link href={ROUTES.PUBLIC.TERMS}>Terms of Service</Link> and&nbsp;
            <Link href={ROUTES.PUBLIC.PRIVACY_POLICY}>Privacy Policy</Link>.
          </FieldDescription>
        </div>
      </div>
    </div>
  )
}
