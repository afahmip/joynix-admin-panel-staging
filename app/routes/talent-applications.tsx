import type { Route } from "./+types/talent-applications";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { RouteGuard } from "../components/route-guard";
import { TalentApplicationsPage } from "../pages/talent-applications";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Talent Applications - Joynix Admin" },
    { name: "description", content: "Manage Talent Applications" },
  ];
}

export default function TalentApplications() {
  return (
    <DashboardLayout>
      <RouteGuard resourcePath="users.talent_applications">
        <TalentApplicationsPage />
      </RouteGuard>
    </DashboardLayout>
  );
}
