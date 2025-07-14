import { authClient } from "@/lib/auth-client";
import { deleteCookie, COOKIE_NAMES } from "@/lib/cookies";

export const logout = async (onSuccess?: () => void) => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        deleteCookie('isAuthenticated');
        deleteCookie(COOKIE_NAMES.HAS_SUBSCRIPTION);
        onSuccess?.();
      },
    },
  });
};