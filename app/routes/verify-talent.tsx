import type { Route } from "./+types/verify-talent";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { VerifyTalentPage } from "../pages/verify-talent";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Verify Talent - Joynix Admin" },
    { name: "description", content: "Promote User to Talent" },
  ];
}

export default function VerifyTalent() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <VerifyTalentPage />
      </div>
    </DashboardLayout>
  );
}
