import { RedirectType, redirect } from 'next/navigation'

export default async function Page() {
  redirect('/admin/settings/profile', RedirectType.replace)
}
