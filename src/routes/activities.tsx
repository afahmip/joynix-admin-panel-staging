import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/layout/dashboard-layout'
import { ActivitiesPage } from '../pages/activities'

export const Route = createFileRoute('/activities')({
  component: () => (
    <DashboardLayout>
      <ActivitiesPage />
    </DashboardLayout>
  ),
})


