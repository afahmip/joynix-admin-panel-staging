import type { Route } from "./+types/group-calls";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { RouteGuard } from "../components/route-guard";
import { GroupCallsPage } from "../pages/group-calls";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Group Calls - Joynix Admin" },
    { name: "description", content: "Manage Group Calls" },
  ];
}

export default function GroupCalls() {
  return (
    <DashboardLayout>
      <RouteGuard resourcePath="group_calls">
        <div className="p-6">
          <GroupCallsPage />
        </div>
      </RouteGuard>
    </DashboardLayout>
  );
}
