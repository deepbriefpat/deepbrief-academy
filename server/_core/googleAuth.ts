import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { SignJWT } from "jose";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

function getRedirectUri(req: Request): string {
  // Use APP_URL env var or construct from request
  const baseUrl = ENV.appUrl || `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/api/auth/google/callback`;
}

export function registerGoogleAuthRoutes(app: Express) {
  // Initiate Google OAuth flow
  app.get("/api/auth/google", (req: Request, res: Response) => {
    if (!ENV.googleClientId) {
      console.error("[Google Auth] GOOGLE_CLIENT_ID not configured");
      res.status(500).json({ error: "Google OAuth not configured" });
      return;
    }

    const redirectUri = getRedirectUri(req);
    const state = Buffer.from(JSON.stringify({ 
      returnTo: req.query.returnTo || "/",
      timestamp: Date.now() 
    })).toString("base64");

    const params = new URLSearchParams({
      client_id: ENV.googleClientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      state: state,
      prompt: "select_account",
    });

    const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;
    console.log("[Google Auth] Redirecting to Google OAuth:", authUrl);
    res.redirect(authUrl);
  });

  // Handle Google OAuth callback
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const { code, state, error } = req.query;

    if (error) {
      console.error("[Google Auth] OAuth error:", error);
      res.redirect("/?error=oauth_failed");
      return;
    }

    if (!code || typeof code !== "string") {
      console.error("[Google Auth] No code received");
      res.redirect("/?error=no_code");
      return;
    }

    try {
      const redirectUri = getRedirectUri(req);
      
      // Exchange code for tokens
      const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: ENV.googleClientId,
          client_secret: ENV.googleClientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("[Google Auth] Token exchange failed:", errorText);
        res.redirect("/?error=token_exchange_failed");
        return;
      }

      const tokens = await tokenResponse.json() as { access_token: string; id_token?: string };
      
      // Get user info
      const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!userInfoResponse.ok) {
        console.error("[Google Auth] Failed to get user info");
        res.redirect("/?error=userinfo_failed");
        return;
      }

      const userInfo = await userInfoResponse.json() as {
        id: string;
        email: string;
        name: string;
        picture?: string;
      };

      console.log("[Google Auth] User authenticated:", userInfo.email);

      // Determine if user should be admin
      const isAdmin = ENV.adminEmail && userInfo.email.toLowerCase() === ENV.adminEmail.toLowerCase();
      
      // Create or update user in database
      const openId = `google_${userInfo.id}`;
      await db.upsertUser({
        openId,
        name: userInfo.name || null,
        email: userInfo.email,
        loginMethod: "google",
        lastSignedIn: new Date(),
        // Set admin role if email matches ADMIN_EMAIL
        ...(isAdmin ? { role: "admin" as const } : {}),
      });

      // If admin email matches, ensure role is admin (for existing users)
      if (isAdmin) {
        await db.updateUserRole(openId, "admin");
      }

      // Create session token
      const secret = new TextEncoder().encode(ENV.cookieSecret || "default-secret-change-me");
      const sessionToken = await new SignJWT({ 
        openId,
        email: userInfo.email,
        name: userInfo.name,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1y")
        .sign(secret);

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Parse state to get return URL
      let returnTo = "/";
      if (state && typeof state === "string") {
        try {
          const stateData = JSON.parse(Buffer.from(state, "base64").toString());
          returnTo = stateData.returnTo || "/";
        } catch {
          // Ignore state parsing errors
        }
      }

      console.log("[Google Auth] Login successful, redirecting to:", returnTo);
      res.redirect(returnTo);
    } catch (error) {
      console.error("[Google Auth] Callback error:", error);
      res.redirect("/?error=callback_failed");
    }
  });

  // Logout endpoint
  app.get("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME, getSessionCookieOptions(req));
    res.redirect("/");
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME, getSessionCookieOptions(req));
    res.json({ success: true });
  });
}
