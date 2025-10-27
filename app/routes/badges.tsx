import type { Route } from "./+types/badges";
import { BadgesPage } from "../pages/badges";
import { DashboardLayout } from "../components/layout/dashboard-layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Badges - Joynix Admin" },
    { name: "description", content: "Manage Badges" },
  ];
}

export default function Badges() {
  return (
    <DashboardLayout>
      <BadgesPage />
    </DashboardLayout>
  );
}
