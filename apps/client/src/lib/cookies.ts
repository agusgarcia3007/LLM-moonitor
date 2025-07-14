export const COOKIE_NAMES = {
  HAS_SUBSCRIPTION: 'hasSubscription',
} as const;

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

export const setCookie = (name: string, value: string, days = 30): void => {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  const isSecure = window.location.protocol === 'https:';
  const secureFlag = isSecure ? '; Secure' : '';
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${secureFlag}`;
};

export const deleteCookie = (name: string): void => {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

export const hasSubscription = (): boolean => {
  return getCookie(COOKIE_NAMES.HAS_SUBSCRIPTION) === 'true';
};

export const setHasSubscription = (value: boolean): void => {
  setCookie(COOKIE_NAMES.HAS_SUBSCRIPTION, value.toString());
};

export const clearSubscriptionCookie = (): void => {
  deleteCookie(COOKIE_NAMES.HAS_SUBSCRIPTION);
};