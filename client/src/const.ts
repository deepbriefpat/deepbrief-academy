export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Google OAuth login URL - uses server-side handler
export const getLoginUrl = (returnTo?: string) => {
  const baseUrl = window.location.origin;
  let url = `${baseUrl}/api/auth/google`;
  
  if (returnTo) {
    url += `?returnTo=${encodeURIComponent(returnTo)}`;
  }
  
  return url;
};

// Demo mode check
export const isDemoMode = () => {
  const demoInteractions = localStorage.getItem("demoInteractions");
  return demoInteractions !== null;
};

export const DEMO_LIMIT = 10;
