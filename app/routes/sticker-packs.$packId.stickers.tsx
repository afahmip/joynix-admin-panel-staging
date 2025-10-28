import type { Route } from "./+types/sticker-packs.$packId.stickers";
import { StickersPage } from "../pages/stickers";
import { DashboardLayout } from "../components/layout/dashboard-layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Stickers - Joynix Admin" },
    { name: "description", content: "Manage Stickers" },
  ];
}

export default function Stickers() {
  return (
    <DashboardLayout>
      <StickersPage />
    </DashboardLayout>
  );
}
