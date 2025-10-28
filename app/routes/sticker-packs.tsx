import type { Route } from "./+types/sticker-packs";
import { StickerPacksPage } from "../pages/sticker-packs";
import { DashboardLayout } from "../components/layout/dashboard-layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sticker Packs - Joynix Admin" },
    { name: "description", content: "Manage Sticker Packs" },
  ];
}

export default function StickerPacks() {
  return (
    <DashboardLayout>
      <StickerPacksPage />
    </DashboardLayout>
  );
}
