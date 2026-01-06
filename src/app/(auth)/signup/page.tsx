import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import SignUpPage from '@/features/signup'
import { auth } from '@/lib/auth'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect('/dashboard')

  return <SignUpPage />
}
