import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/layout/dashboard-layout'
import { CategoriesPage } from '../pages/categories'

export const Route = createFileRoute('/categories')({
  component: () => (
    <DashboardLayout>
      <CategoriesPage />
    </DashboardLayout>
  ),
})


