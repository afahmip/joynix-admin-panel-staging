import type { Route } from "./+types/group-calls.new";
import { DashboardLayout } from "../components/layout/dashboard-layout";
import { RouteGuard } from "../components/route-guard";
import { GroupCallsNewPage } from "../pages/group-calls-new";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Group Call - Joynix Admin" },
    { name: "description", content: "Create New Group Call" },
  ];
}

export default function GroupCallsNew() {
  return (
    <DashboardLayout>
      <RouteGuard resourcePath="group_calls">
        <div className="p-6">
          <GroupCallsNewPage />
        </div>
      </RouteGuard>
    </DashboardLayout>
  );
}
