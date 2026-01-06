import Image from 'next/image'
import Link from 'next/link'
import { SocialSignOn } from '@/components/shared/social-signon'
import { Card, CardContent } from '@/components/ui/card'
import { Field, FieldDescription, FieldSeparator } from '@/components/ui/field'
import { SignUpForm } from '@/features/signup/_components/signup-form'

export default function SignUpPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <Field className="gap-0">
                <SignUpForm />

                <Field orientation="vertical" className="p-6 md:p-8 gap-6">
                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    Or continue with
                  </FieldSeparator>

                  <SocialSignOn />

                  <FieldDescription className="text-center">
                    Already have an account? <Link href="/login">Sign in</Link>
                  </FieldDescription>
                </Field>
              </Field>

              <div className="bg-muted relative hidden md:block">
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
            <Link href="/terms">Terms of Service</Link> and&nbsp;
            <Link href="/privacy-policy">Privacy Policy</Link>.
          </FieldDescription>
        </div>
      </div>
    </div>
  )
}
