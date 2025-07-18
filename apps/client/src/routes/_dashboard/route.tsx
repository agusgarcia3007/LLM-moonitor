import { DashboardLayout } from "@/components/layout/dashboard";
import { getCookie, setHasSubscription } from "@/lib/cookies";
import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";

function isAuthenticated() {
  return (
    typeof document !== "undefined" && getCookie("isAuthenticated") === "true"
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

    try {
      const { data: sessionData } = await authClient.getSession();

      if (!sessionData?.session) {
        console.error("No session data found");
        throw redirect({
          to: "/login",
          search: { redirect: location.href },
        });
      }

      const hasActiveSubscription =
        sessionData.session.subscriptionStatus === "active" ||
        sessionData.session.subscriptionStatus === "trialing";

      setHasSubscription(hasActiveSubscription);

      if (!hasActiveSubscription) {
        console.log("No active subscription found, redirecting to pricing");
        throw redirect({
          to: "/pricing",
        });
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      if (error && typeof error === "object" && "to" in error) {
        throw error;
      }
      throw redirect({
        to: "/pricing",
      });
    }
  },
  component: DashboardLayout,
});
