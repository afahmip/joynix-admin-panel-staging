import type { Route } from "./+types/group-calls.$id";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { GroupCallDetailPage } from "../pages/group-call-detail";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Group Call ${params.id} - Joynix Admin` },
    { name: "description", content: "Group Call Details" },
  ];
}

export default function GroupCallDetail({ params }: Route.ComponentProps) {
  return (
    <DashboardLayout>
      <div className="p-6">
        <GroupCallDetailPage id={parseInt(params.id)} />
      </div>
    </DashboardLayout>
  );
}
