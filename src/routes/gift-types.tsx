import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/layout/dashboard-layout'
import { GiftTypesPage } from '../pages/gift-types'

export const Route = createFileRoute('/gift-types')({
  component: () => (
    <DashboardLayout>
      <GiftTypesPage />
    </DashboardLayout>
  ),
})
