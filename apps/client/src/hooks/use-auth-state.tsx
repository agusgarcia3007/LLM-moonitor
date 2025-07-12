export const useAuthState = () => {
  const isAuthenticated = document.cookie.includes("isAuthenticated=true");
  return { isLoggedIn: isAuthenticated };
};
