export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Google OAuth login URL
export const getLoginUrl = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/api/auth/google/callback`;
  
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", googleClientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  return url.toString();
};

// Demo mode check
export const isDemoMode = () => {
  const demoInteractions = localStorage.getItem("demoInteractions");
  return demoInteractions !== null;
};

export const DEMO_LIMIT = 10;
