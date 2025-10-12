import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/layout/dashboard-layout'
import { VerifyTalentPage } from '../pages/verify-talent'

export const Route = createFileRoute('/verify-talent')({
  component: () => (
    <DashboardLayout>
      <VerifyTalentPage />
    </DashboardLayout>
  ),
})