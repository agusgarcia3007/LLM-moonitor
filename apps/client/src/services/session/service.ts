import { authClient } from "@/lib/auth-client";

export class SessionService {
  public static async getSession() {
    const { data } = await authClient.getSession();
    return data;
  }
}
