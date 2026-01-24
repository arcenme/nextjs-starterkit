import ResetPasswordPage from '@/features/reset-password'

type PageProps = {
  searchParams: Promise<{ error?: string; token?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const { error, token } = await searchParams

  return <ResetPasswordPage token={token} error={error} />
}
