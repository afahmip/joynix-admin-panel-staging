import type { Route } from "./+types/signin";
import SignInPage from "../pages/signin";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign In - Joynix Admin" },
    { name: "description", content: "Sign in to Joynix Admin Panel" },
  ];
}

export default function SignIn() {
  return <SignInPage />;
}
