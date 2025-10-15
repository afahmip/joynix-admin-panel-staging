import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/layout/dashboard-layout'
import { UserReportsPage } from '../pages/user-reports'

export const Route = createFileRoute('/user-reports')({
  component: () => (
    <DashboardLayout>
      <UserReportsPage />
    </DashboardLayout>
  ),
})


