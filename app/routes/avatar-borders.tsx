import type { Route } from "./+types/avatar-borders";
import { AvatarBordersPage } from "../pages/avatar-borders";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { RouteGuard } from "../components/route-guard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Avatar Borders - Joynix Admin" },
    { name: "description", content: "Manage Avatar Borders" },
  ];
}

export default function AvatarBorders() {
  return (
    <DashboardLayout>
      <RouteGuard resourcePath="gamifications">
        <AvatarBordersPage />
      </RouteGuard>
    </DashboardLayout>
  );
}
