import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

export type SessionPayload = {
  odpenId: string;
  email: string;
  name: string;
};

// Google OAuth token verification
async function verifyGoogleToken(idToken: string): Promise<{
  sub: string;
  email: string;
  name: string;
  picture?: string;
}> {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
  );
  
  if (!response.ok) {
    throw new Error("Invalid Google token");
  }
  
  const data = await response.json();
  
  // Verify the token is for our app
  if (data.aud !== ENV.googleClientId) {
    throw new Error("Token not issued for this application");
  }
  
  return {
    sub: data.sub,
    email: data.email,
    name: data.name || data.email.split("@")[0],
    picture: data.picture,
  };
}

class SDKServer {
  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    const secret = ENV.sessionSecret;
    if (!secret) {
      throw new Error("SESSION_SECRET not configured");
    }
    return new TextEncoder().encode(secret);
  }

  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; email?: string; name?: string } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId,
      email: options.email || "",
      name: options.name || "",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<{ openId: string; email: string; name: string } | null> {
    if (!cookieValue) {
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      
      const { openId, email, name } = payload as Record<string, unknown>;

      if (typeof openId !== "string" || openId.length === 0) {
        return null;
      }

      return {
        openId,
        email: (email as string) || "",
        name: (name as string) || "",
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed:", error);
      return null;
    }
  }

  async authenticateWithGoogle(idToken: string): Promise<{
    user: User;
    sessionToken: string;
  }> {
    // Verify the Google token
    const googleUser = await verifyGoogleToken(idToken);
    
    // Use Google's sub (subject) as the openId
    const openId = `google_${googleUser.sub}`;
    const signedInAt = new Date();
    
    // Upsert the user
    await db.upsertUser({
      openId,
      name: googleUser.name,
      email: googleUser.email,
      loginMethod: "google",
      lastSignedIn: signedInAt,
    });
    
    const user = await db.getUserByOpenId(openId);
    
    if (!user) {
      throw new Error("Failed to create user");
    }
    
    // Create session token
    const sessionToken = await this.createSessionToken(openId, {
      email: googleUser.email,
      name: googleUser.name,
    });
    
    return { user, sessionToken };
  }

  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const user = await db.getUserByOpenId(session.openId);

    if (!user) {
      throw ForbiddenError("User not found");
    }

    // Update last signed in
    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: new Date(),
    });

    return user;
  }
}

export const sdk = new SDKServer();
