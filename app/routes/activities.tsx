import type { Route } from "./+types/activities";
import { ActivitiesPage } from "../pages/activities";
import { DashboardLayout } from "../components/layout/dashboard-layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Activities - Joynix Admin" },
    { name: "description", content: "Manage Activities" },
  ];
}

export default function Activities() {
  return (
    <DashboardLayout>
      <ActivitiesPage />
    </DashboardLayout>
  );
}
