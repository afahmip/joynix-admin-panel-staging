import type { Route } from "./+types/sticker-packs.$packId.stickers";
import { StickersPage } from "../pages/stickers";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { RouteGuard } from "../components/route-guard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stickers - Joynix Admin" },
    { name: "description", content: "Manage Stickers" },
  ];
}

export default function Stickers() {
  return (
    <DashboardLayout>
      <RouteGuard resourcePath="gamifications">
        <StickersPage />
      </RouteGuard>
    </DashboardLayout>
  );
}
