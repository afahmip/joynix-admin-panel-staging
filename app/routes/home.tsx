import type { Route } from "./+types/home";
import { Navigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Joynix Admin" },
    { name: "description", content: "Joynix Admin Panel" },
  ];
}

export default function Home() {
  return <Navigate to="/dashboard" />;
}
