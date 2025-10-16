import type { Route } from "../../types/app/routes/+types/categories";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { CategoriesPage } from "../pages/categories";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Categories - Joynix Admin" },
    { name: "description", content: "Manage Categories" },
  ];
}

export default function Categories() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <CategoriesPage />
      </div>
    </DashboardLayout>
  );
}
