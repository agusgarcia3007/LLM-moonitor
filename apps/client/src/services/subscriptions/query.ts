import { useQuery } from "@tanstack/react-query";
import { SubscriptionService } from "./service";

export const useOrganizationSubscription = (organizationId?: string) => {
  return useQuery({
    queryKey: ["subscriptions", "organization", organizationId],
    queryFn: () => SubscriptionService.getSubscriptions(organizationId!),
    enabled: !!organizationId,
  });
};
