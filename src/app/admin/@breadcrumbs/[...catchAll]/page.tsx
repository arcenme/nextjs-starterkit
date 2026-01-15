import { DynamicBreadcrumbs } from '@/components/shared/breadcrumbs'

interface Props {
  params: Promise<{
    catchAll: string[]
  }>
}

export default async function BreadcrumbsSlot({ params }: Props) {
  const { catchAll } = await params
  return <DynamicBreadcrumbs segments={catchAll} />
}
