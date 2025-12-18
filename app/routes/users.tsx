import type { Route } from "./+types/users";
import { UsersPage } from "../pages/users";
import { DashboardLayout } from "../components/layout/dashboard-layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Users - Joynix Admin" },
    { name: "description", content: "View and manage users" },
  ];
}

export default function Users() {
  return (
    <DashboardLayout>
      <UsersPage />
    </DashboardLayout>
  );
}
