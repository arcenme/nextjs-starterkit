import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import MagicLinkPage from '@/features/magic-link'
import { auth } from '@/lib/auth'

type PageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect(ROUTES.REDIRECT_AFTER_SIGN_IN)

  const { error } = await searchParams
  return <MagicLinkPage error={error} />
}
