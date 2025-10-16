import type { Route } from "./+types/verify-otp";
import VerifyOtpPage from "../pages/verify-otp";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Verify OTP - Joynix Admin" },
    { name: "description", content: "Verify OTP for authentication" },
  ];
}

export default function VerifyOtp() {
  return <VerifyOtpPage />;
}
