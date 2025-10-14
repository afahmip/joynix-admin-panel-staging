import { createFileRoute } from '@tanstack/react-router'
import VerifyOtpPage from '../pages/verify-otp'

export const Route = createFileRoute('/verify-otp')({
  component: () => <VerifyOtpPage />,
})

