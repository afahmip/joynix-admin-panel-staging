import type { Route } from "./+types/user-reports";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { UserReportsPage } from "../pages/user-reports";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "User Reports - Joynix Admin" },
    { name: "description", content: "Manage User Reports" },
  ];
}

export default function UserReports() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <UserReportsPage />
      </div>
    </DashboardLayout>
  );
}
