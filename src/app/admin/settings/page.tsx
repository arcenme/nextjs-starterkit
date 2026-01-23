import { RedirectType, redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

export default async function Page() {
  redirect(ROUTES.ADMIN.SETTINGS.PROFILE, RedirectType.replace)
}
