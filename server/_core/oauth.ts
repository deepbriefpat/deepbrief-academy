import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Google OAuth callback
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");

    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: ENV.googleClientId,
          client_secret: ENV.googleClientSecret,
          redirect_uri: `${ENV.appUrl}/auth/callback`,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error("[OAuth] Token exchange failed:", error);
        res.redirect("/?error=auth_failed");
        return;
      }

      const tokens = await tokenResponse.json();

      // Verify the ID token and get user info
      const userInfoResponse = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${tokens.id_token}`
      );

      if (!userInfoResponse.ok) {
        console.error("[OAuth] User info fetch failed");
        res.redirect("/?error=auth_failed");
        return;
      }

      const userInfo = await userInfoResponse.json();

      // Create user in database
      const openId = `google_${userInfo.sub}`;
      
      await db.upsertUser({
        openId,
        name: userInfo.name || userInfo.email.split("@")[0],
        email: userInfo.email,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(openId, {
        email: userInfo.email,
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirect to dashboard
      res.redirect(302, "/ai-coach/dashboard");
    } catch (error) {
      console.error("[OAuth] Callback failed:", error);
      res.redirect("/?error=auth_failed");
    }
  });

  // Also keep the old callback path for backwards compatibility
  app.get("/auth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    if (code) {
      res.redirect(`/api/auth/google/callback?code=${code}`);
    } else {
      res.redirect("/?error=no_code");
    }
  });
}
