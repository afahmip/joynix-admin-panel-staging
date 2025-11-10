import type { Route } from "./+types/coin-transactions";
import { CoinTransactionsPage } from "../pages/coin-transactions";
import { DashboardLayout } from "../components/layout/dashboard-layout";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Coin Transactions - Joynix Admin" },
    { name: "description", content: "View Coin Transactions" },
  ];
}

export default function CoinTransactions() {
  return (
    <DashboardLayout>
      <CoinTransactionsPage />
    </DashboardLayout>
  );
}

