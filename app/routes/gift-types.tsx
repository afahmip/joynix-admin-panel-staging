import type { Route } from "./+types/gift-types";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { GiftTypesPage } from "../pages/gift-types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Gift Types - Joynix Admin" },
    { name: "description", content: "Manage Gift Types" },
  ];
}

export default function GiftTypes() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <GiftTypesPage />
      </div>
    </DashboardLayout>
  );
}
