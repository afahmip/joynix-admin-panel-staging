import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("signin", "routes/signin.tsx"),
  route("verify-otp", "routes/verify-otp.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("activities", "routes/activities.tsx"),
  route("categories", "routes/categories.tsx"),
  route("gift-types", "routes/gift-types.tsx"),
  route("group-calls", "routes/group-calls.tsx"),
  route("user-reports", "routes/user-reports.tsx"),
  route("verify-talent", "routes/verify-talent.tsx"),
] satisfies RouteConfig;
