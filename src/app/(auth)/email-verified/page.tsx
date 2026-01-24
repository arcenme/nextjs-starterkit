import EmailVerifiedPage from '@/features/email-verified'

type PageProps = {
  searchParams: Promise<{ error?: string; token?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { error, token } = await searchParams

  return <EmailVerifiedPage token={token} error={error} />
}
