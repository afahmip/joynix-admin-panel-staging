import type { Route } from "./+types/dashboard";
import { DashboardPage } from "../pages/dashboard";
import { DashboardLayout } from "../components/layout/dashboard-layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Joynix Admin" },
    { name: "description", content: "Joynix Admin Dashboard" },
  ];
}

export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
}
