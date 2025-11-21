import type { Route } from "./+types/talent-applications";
import { DashboardLayout } from "../components/layout/dashboard-layout";
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
      <TalentApplicationsPage />
    </DashboardLayout>
  );
}
