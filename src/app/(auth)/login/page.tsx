import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import LoginPage from '@/features/login'
import { auth } from '@/lib/auth'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect(ROUTES.REDIRECT_AFTER_SIGN_IN)

  return <LoginPage />
}
