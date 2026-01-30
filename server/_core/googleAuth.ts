/**
 * Google OAuth Authentication Handler
 * 
 * Handles Google OAuth 2.0 flow for DeepBrief Academy
 */

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
  // ALWAYS use APP_URL in production to avoid proxy issues
  if (ENV.appUrl && ENV.appUrl !== "http://localhost:3000") {
    const redirectUri = `${ENV.appUrl}/api/auth/google/callback`;
    console.log("[GoogleAuth] Using APP_URL redirect_uri:", redirectUri);
    return redirectUri;
  }
  
  // Fallback for local development
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;
  console.log("[GoogleAuth] Using request-based redirect_uri:", redirectUri);
  return redirectUri;
}

export function registerGoogleAuthRoutes(app: Express) {
  // Check if Google OAuth is configured
  if (!ENV.googleClientId || !ENV.googleClientSecret) {
    console.warn("[GoogleAuth] Google OAuth not configured - GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing");
    return;
  }
  
  console.log("[GoogleAuth] Registering Google OAuth routes");
  console.log("[GoogleAuth] APP_URL from env:", ENV.appUrl);
  console.log("[GoogleAuth] Expected redirect_uri:", `${ENV.appUrl}/api/auth/google/callback`);
  
  // Initiate Google OAuth flow
  app.get("/api/auth/google", (req: Request, res: Response) => {
    const returnTo = (req.query.returnTo as string) || "/ai-coach/dashboard";
    
    const state = Buffer.from(JSON.stringify({
      returnTo,
      timestamp: Date.now(),
    })).toString("base64");
    
    const redirectUri = getRedirectUri(req);
    
    const params = new URLSearchParams({
      client_id: ENV.googleClientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      state,
      prompt: "select_account",
    });
    
    const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;
    console.log("[GoogleAuth] Initiating OAuth flow");
    console.log("[GoogleAuth] redirect_uri being sent:", redirectUri);
    res.redirect(authUrl);
  });
  
  // Google OAuth callback
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    try {
      const { code, state, error } = req.query;
      
      if (error) {
        console.error("[GoogleAuth] OAuth error:", error);
        return res.redirect("/?error=oauth_denied");
      }
      
      if (!code) {
        console.error("[GoogleAuth] No code received");
        return res.redirect("/?error=no_code");
      }
      
      // Parse state to get return URL
      let returnTo = "/ai-coach/dashboard";
      try {
        if (state) {
          const stateData = JSON.parse(Buffer.from(state as string, "base64").toString());
          returnTo = stateData.returnTo || "/ai-coach/dashboard";
        }
      } catch (e) {
        console.warn("[GoogleAuth] Could not parse state");
      }
      
      const redirectUri = getRedirectUri(req);
      
      // Exchange code for tokens
      console.log("[GoogleAuth] Exchanging code for tokens...");
      console.log("[GoogleAuth] redirect_uri for token exchange:", redirectUri);
      
      const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          client_id: ENV.googleClientId,
          client_secret: ENV.googleClientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("[GoogleAuth] Token exchange failed:", tokenResponse.status, errorText);
        return res.redirect("/?error=token_exchange_failed");
      }
      
      const tokens = await tokenResponse.json() as { access_token: string; id_token?: string };
      
      // Get user info
      console.log("[GoogleAuth] Fetching user info...");
      const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      
      if (!userInfoResponse.ok) {
        console.error("[GoogleAuth] User info fetch failed");
        return res.redirect("/?error=userinfo_failed");
      }
      
      const userInfo = await userInfoResponse.json() as {
        id: string;
        email: string;
        name: string;
        picture?: string;
      };
      
      console.log("[GoogleAuth] User authenticated:", userInfo.email);
      
      // Create/update user in database
      const openId = `google_${userInfo.id}`;
      
      // Check if this user should be admin
      const isAdmin = ENV.adminEmail && userInfo.email.toLowerCase() === ENV.adminEmail.toLowerCase();
      
      await db.upsertUser({
        openId,
        name: userInfo.name || null,
        email: userInfo.email,
        loginMethod: "google",
        lastSignedIn: new Date(),
        ...(isAdmin ? { role: "admin" as const } : {}),
      });
      
      // Get the user from database to get their ID and role
      const user = await db.getUserByOpenId(openId);
      if (!user) {
        console.error("[GoogleAuth] User not found after upsert");
        return res.redirect("/?error=user_creation_failed");
      }
      
      // Create session token using jose (same as SDK)
      const secret = new TextEncoder().encode(ENV.cookieSecret || "default-secret-change-me");
      const sessionToken = await new SignJWT({
        openId,
        appId: ENV.appId || "deepbrief-academy",
        name: userInfo.name || userInfo.email,
        email: userInfo.email,
        userId: user.id,
        role: user.role || "user",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1y")
        .sign(secret);
      
      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      
      console.log("[GoogleAuth] Login successful, redirecting to:", returnTo);
      res.redirect(returnTo);
      
    } catch (error) {
      console.error("[GoogleAuth] Callback error:", error);
      res.redirect("/?error=callback_failed");
    }
  });
  
  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.json({ success: true });
  });
  
  app.get("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.redirect("/");
  });
}
