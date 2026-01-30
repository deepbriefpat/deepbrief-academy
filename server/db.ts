import { eq, desc, sql, and, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, assessmentResponses, InsertAssessmentResponse, resources, InsertResource, stories, InsertStory, testimonials, InsertTestimonial, inquiries, InsertInquiry, supportNetworkAssessments, InsertSupportNetworkAssessment, emailSubscribers, InsertEmailSubscriber, resourceReactions, resourceComments, pressureAuditResponses, guestPasses, InsertGuestPass, guestPassSessions, InsertGuestPassSession, guestPassInvitations, InsertGuestPassInvitation, coachingCommitments, InsertCoachingCommitment, sessionContexts, InsertSessionContext, behavioralInsights, InsertBehavioralInsight, emailPreferences, InsertEmailPreference } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    
    // Admin role determination - check multiple conditions
    const isAdminByOpenId = user.openId === ENV.ownerOpenId;
    const isAdminByEmail = ENV.adminEmail && user.email && 
      user.email.toLowerCase() === ENV.adminEmail.toLowerCase();
    
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (isAdminByOpenId || isAdminByEmail) {
      values.role = 'admin';
      updateSet.role = 'admin';
      console.log(`[Database] Setting admin role for user: ${user.email || user.openId}`);
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

/**
 * Update user role directly (useful for fixing existing users)
 */
export async function updateUserRole(openId: string, role: 'user' | 'admin'): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user role: database not available");
    return;
  }

  try {
    await db.update(users)
      .set({ role })
      .where(eq(users.openId, openId));
    console.log(`[Database] Updated role to ${role} for user: ${openId}`);
  } catch (error) {
    console.error("[Database] Failed to update user role:", error);
    throw error;
  }
}

/**
 * Get user by email (useful for admin checks)
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] || null;
}

// NOTE: The rest of the db.ts file continues below this point
// This is just the updated section for upsertUser
