import type { Route } from "./+types/gift-types";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { RouteGuard } from "../components/route-guard";
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
      <RouteGuard resourcePath="gamifications">
        <div className="p-6">
          <GiftTypesPage />
        </div>
      </RouteGuard>
    </DashboardLayout>
  );
}
