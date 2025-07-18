import { stripeClient } from "@better-auth/stripe/client";
import {
  adminClient,
  apiKeyClient,
  organizationClient,
  customSessionClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { toast } from "sonner";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  plugins: [
    organizationClient(),
    adminClient(),
    apiKeyClient(),
    customSessionClient(),
    inferAdditionalFields({
      session: {
        activeOrganizationId: {
          type: "string",
        },
        activeProjectId: {
          type: "string",
        },
        subscriptionPlan: {
          type: "string",
        },
        subscriptionStatus: {
          type: "string",
        },
        subscriptionPeriodEnd: {
          type: "string",
        },
      },
    }),
    stripeClient({
      subscription: true,
    }),
  ],
  fetchOptions: {
    onError: (ctx) => {
      toast.error(ctx.error.message);
    },
  },
});
