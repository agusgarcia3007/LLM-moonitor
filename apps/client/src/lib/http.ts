import axios from "axios";
import { logout } from "./auth";
import { clearSubscriptionCookie } from "./cookies";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 403 = Authentication error -> logout user
    if (error.response?.status === 403) {
      await logout(() => {
        window.location.href = "/login";
      });
    }
    if (error.response?.status === 402) {
      clearSubscriptionCookie();
      window.location.href = "/pricing";
    }
    // 402 = Payment Required -> subscription issue, don't logout
    // Let the component handle the subscription error appropriately
    return Promise.reject(error);
  }
);
