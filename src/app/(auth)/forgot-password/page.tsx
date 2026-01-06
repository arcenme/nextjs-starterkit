import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import ForgotPasswordPage from '@/features/forgot-password'
import { auth } from '@/lib/auth'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect('/admin/dashboard')

  return <ForgotPasswordPage />
}
