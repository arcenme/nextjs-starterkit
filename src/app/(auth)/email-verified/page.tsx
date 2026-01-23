import EmailVerifiedPage from '@/features/email-verified'

type PageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams

  return <EmailVerifiedPage error={params.error} />
}
