import { DashboardLayout } from "@/components/layout/dashboard";
import { createFileRoute, redirect } from "@tanstack/react-router";

function isAuthenticated() {
  return (
    typeof document !== "undefined" &&
    document.cookie.includes("isAuthenticated=true")
  );
}

export const Route = createFileRoute("/_dashboard")({
  beforeLoad: async ({ location }) => {
    if (!isAuthenticated()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: DashboardLayout,
});
