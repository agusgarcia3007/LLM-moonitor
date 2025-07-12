import { useState, useEffect } from "react";

export const useAuthState = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthenticated = document.cookie.includes("isAuthenticated=true");
      setIsLoggedIn(isAuthenticated);
    }
  }, []);

  return { isLoggedIn };
};
