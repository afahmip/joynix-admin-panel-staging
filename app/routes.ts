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
  route("group-calls/new", "routes/group-calls.new.tsx"),
  route("group-calls/:id", "routes/group-calls.$id.tsx"),
  route("user-reports", "routes/user-reports.tsx"),
  route("verify-talent", "routes/verify-talent.tsx"),
  route("avatar-borders", "routes/avatar-borders.tsx"),
  route("badges", "routes/badges.tsx"),
  route("coin-transactions", "routes/coin-transactions.tsx"),
  route("sticker-packs", "routes/sticker-packs.tsx"),
  route("sticker-packs/:packId/stickers", "routes/sticker-packs.$packId.stickers.tsx"),
  route("talent-applications", "routes/talent-applications.tsx"),
  route("users", "routes/users.tsx"),
] satisfies RouteConfig;
