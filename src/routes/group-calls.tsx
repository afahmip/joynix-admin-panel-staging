import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/layout/dashboard-layout'
import { GroupCallsPage } from '../pages/group-calls'

export const Route = createFileRoute('/group-calls')({
  component: () => (
    <DashboardLayout>
      <GroupCallsPage />
    </DashboardLayout>
  ),
})


