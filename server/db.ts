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
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
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

export async function getUserAssessments(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get assessments: database not available");
    return [];
  }

  const { assessmentResponses } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");
  
  const results = await db
    .select()
    .from(assessmentResponses)
    .where(eq(assessmentResponses.userId, userId))
    .orderBy(desc(assessmentResponses.createdAt));

  return results;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Assessment Responses
export async function saveAssessmentResponse(data: InsertAssessmentResponse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(assessmentResponses).values(data);
  return result;
}

export async function getAssessmentsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assessmentResponses).where(eq(assessmentResponses.userId, userId));
}

// Resources
export async function getAllResources() {
  const db = await getDb();
  if (!db) return [];
  
  const { count, sql } = await import("drizzle-orm");
  
  const results = await db
    .select({
      id: resources.id,
      title: resources.title,
      content: resources.content,
      excerpt: resources.excerpt,
      theme: resources.theme,
      slug: resources.slug,
      publishedAt: resources.publishedAt,
      viewCount: resources.viewCount,
      lastViewedAt: resources.lastViewedAt,
      reactionCount: sql<number>`COUNT(DISTINCT ${resourceReactions.id})`.as('reactionCount'),
      commentCount: sql<number>`COUNT(DISTINCT ${resourceComments.id})`.as('commentCount'),
    })
    .from(resources)
    .leftJoin(resourceReactions, eq(resources.id, resourceReactions.resourceId))
    .leftJoin(resourceComments, eq(resources.id, resourceComments.resourceId))
    .groupBy(resources.id)
    .orderBy(desc(resources.publishedAt));
  
  return results;
}

export async function getResourcesByTheme(theme: "pressure_management" | "diving_metaphors" | "leadership_isolation" | "vulnerability") {
  const db = await getDb();
  if (!db) return [];
  
  const { sql } = await import("drizzle-orm");
  
  const results = await db
    .select({
      id: resources.id,
      title: resources.title,
      content: resources.content,
      excerpt: resources.excerpt,
      theme: resources.theme,
      slug: resources.slug,
      publishedAt: resources.publishedAt,
      viewCount: resources.viewCount,
      lastViewedAt: resources.lastViewedAt,
      reactionCount: sql<number>`COUNT(DISTINCT ${resourceReactions.id})`.as('reactionCount'),
      commentCount: sql<number>`COUNT(DISTINCT ${resourceComments.id})`.as('commentCount'),
    })
    .from(resources)
    .leftJoin(resourceReactions, eq(resources.id, resourceReactions.resourceId))
    .leftJoin(resourceComments, eq(resources.id, resourceComments.resourceId))
    .where(eq(resources.theme, theme))
    .groupBy(resources.id)
    .orderBy(desc(resources.publishedAt));
  
  return results;
}

export async function getResourceBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(resources).where(eq(resources.slug, slug)).limit(1);
  return result[0];
}

export async function createResource(resource: InsertResource) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(resources).values(resource);
  return result;
}

export async function updateResource(id: number, updates: Partial<InsertResource>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(resources).set(updates).where(eq(resources.id, id));
  return { success: true };
}

export async function deleteResource(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(resources).where(eq(resources.id, id));
  return { success: true };
}

export async function trackResourceView(resourceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Increment view count and update last viewed timestamp
  await db.update(resources)
    .set({ 
      viewCount: sql`${resources.viewCount} + 1`,
      lastViewedAt: new Date()
    })
    .where(eq(resources.id, resourceId));
  
  return { success: true };
}

export async function getResourceAnalytics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get all resources
  const allResources = await db.select().from(resources);
  
  // Calculate total views
  const totalViews = allResources.reduce((sum, r) => sum + (r.viewCount || 0), 0);
  const totalArticles = allResources.length;
  const avgViewsPerArticle = totalArticles > 0 ? totalViews / totalArticles : 0;
  
  // Get top 5 articles by view count
  const topArticles = [...allResources]
    .filter(r => (r.viewCount || 0) > 0)
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5);
  
  // Get recently viewed articles
  const recentlyViewed = [...allResources]
    .filter(r => r.lastViewedAt !== null)
    .sort((a, b) => {
      const aTime = a.lastViewedAt ? new Date(a.lastViewedAt).getTime() : 0;
      const bTime = b.lastViewedAt ? new Date(b.lastViewedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 5);
  
  // Get theme breakdown
  const themeBreakdown = [
    { theme: "pressure_management" as const, count: 0, totalViews: 0 },
    { theme: "diving_metaphors" as const, count: 0, totalViews: 0 },
    { theme: "leadership_isolation" as const, count: 0, totalViews: 0 },
    { theme: "vulnerability" as const, count: 0, totalViews: 0 },
  ];
  
  allResources.forEach(r => {
    const themeEntry = themeBreakdown.find(t => t.theme === r.theme);
    if (themeEntry) {
      themeEntry.count++;
      themeEntry.totalViews += r.viewCount || 0;
    }
  });
  
  return {
    totalViews,
    totalArticles,
    avgViewsPerArticle,
    topArticles,
    recentlyViewed,
    themeBreakdown,
  };
}

// Stories
export async function getAllStories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stories).orderBy(desc(stories.publishedAt));
}

export async function getFeaturedStories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(stories).where(eq(stories.featured, 1)).orderBy(desc(stories.publishedAt));
}

export async function getStoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(stories).where(eq(stories.slug, slug)).limit(1);
  return result[0];
}

// Testimonials
export async function getAllTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).orderBy(testimonials.displayOrder);
}

export async function getFeaturedTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).where(eq(testimonials.featured, 1)).orderBy(testimonials.displayOrder);
}

// Inquiries
export async function saveInquiry(data: InsertInquiry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(inquiries).values(data);
  return result;
}

export async function getAllInquiries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
}

// Support Network Assessments
export async function saveSupportNetworkAssessment(data: InsertSupportNetworkAssessment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(supportNetworkAssessments).values(data);
  return result;
}

export async function getSupportNetworkAssessmentsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supportNetworkAssessments).where(eq(supportNetworkAssessments.userId, userId));
}

// Email Subscribers
export async function subscribeEmail(data: InsertEmailSubscriber) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if email already exists first to avoid error logs
  const existing = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, data.email)).limit(1);
  
  if (existing.length > 0) {
    // Update existing record to resubscribe
    await db.update(emailSubscribers)
      .set({ subscribed: 1, updatedAt: new Date(), source: data.source })
      .where(eq(emailSubscribers.email, data.email));
    return { success: true, existing: true };
  }
  
  // Insert new subscriber
  const result = await db.insert(emailSubscribers).values(data);
  return { success: true, existing: false, insertId: result[0].insertId };
}

export async function getAllEmailSubscribers(source?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const { and } = await import("drizzle-orm");
  
  const conditions = [eq(emailSubscribers.subscribed, 1)];
  
  if (source) {
    conditions.push(eq(emailSubscribers.source, source as any));
  }
  
  return db.select().from(emailSubscribers)
    .where(and(...conditions))
    .orderBy(desc(emailSubscribers.createdAt));
}

export async function searchEmailSubscribers(search: string, source?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const { like, and, or } = await import("drizzle-orm");
  
  let conditions = [
    or(
      like(emailSubscribers.email, `%${search}%`),
      like(emailSubscribers.name, `%${search}%`)
    ),
    eq(emailSubscribers.subscribed, 1)
  ];
  
  if (source) {
    conditions.push(eq(emailSubscribers.source, source as any));
  }
  
  return db.select().from(emailSubscribers)
    .where(and(...conditions))
    .orderBy(desc(emailSubscribers.createdAt));
}

export async function getSubscriberStats() {
  const db = await getDb();
  if (!db) return { total: 0, bySource: {}, recentGrowth: [] };
  
  const { count, sql } = await import("drizzle-orm");
  
  // Get total subscribers
  const totalResult = await db.select({ count: count() })
    .from(emailSubscribers)
    .where(eq(emailSubscribers.subscribed, 1));
  
  const total = totalResult[0]?.count || 0;
  
  // Get subscribers by source
  const bySourceResult = await db.select({
    source: emailSubscribers.source,
    count: count()
  })
  .from(emailSubscribers)
  .where(eq(emailSubscribers.subscribed, 1))
  .groupBy(emailSubscribers.source);
  
  const bySource = bySourceResult.reduce((acc, row) => {
    acc[row.source] = row.count;
    return acc;
  }, {} as Record<string, number>);
  
  // Get growth over last 30 days (daily)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const growthResult = await db.select({
    date: sql<string>`DATE(${emailSubscribers.createdAt})`.as('date'),
    count: count()
  })
  .from(emailSubscribers)
  .where(sql`${emailSubscribers.createdAt} >= ${thirtyDaysAgo}`)
  .groupBy(sql`date`)
  .orderBy(sql`date`);
  
  return {
    total,
    bySource,
    recentGrowth: growthResult.map(r => ({ date: r.date, count: r.count }))
  };
}

export async function deleteEmailSubscriber(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(emailSubscribers).where(eq(emailSubscribers.id, id));
}

export async function unsubscribeEmailSubscriber(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(emailSubscribers)
    .set({ subscribed: 0, updatedAt: new Date() })
    .where(eq(emailSubscribers.id, id));
}

export async function getSupportNetworkAssessmentBySession(sessionId: string) {
  const db = await getDb();
  if (!db) return null;
  const results = await db.select().from(supportNetworkAssessments).where(eq(supportNetworkAssessments.sessionId, sessionId));
  return results[0] || null;
}

// ============================================================================
// Resource Reactions
// ============================================================================

export async function addResourceReaction(resourceId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if reaction already exists
  const existing = await db.select()
    .from(resourceReactions)
    .where(and(
      eq(resourceReactions.resourceId, resourceId),
      eq(resourceReactions.userId, userId)
    ));
  
  if (existing.length > 0) {
    return { success: false, message: "Already reacted" };
  }
  
  await db.insert(resourceReactions).values({ resourceId, userId });
  return { success: true };
}

export async function removeResourceReaction(resourceId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(resourceReactions)
    .where(and(
      eq(resourceReactions.resourceId, resourceId),
      eq(resourceReactions.userId, userId)
    ));
  
  return { success: true };
}

export async function getResourceReactionCount(resourceId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: count() })
    .from(resourceReactions)
    .where(eq(resourceReactions.resourceId, resourceId));
  
  return result[0]?.count || 0;
}

export async function hasUserReacted(resourceId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select()
    .from(resourceReactions)
    .where(and(
      eq(resourceReactions.resourceId, resourceId),
      eq(resourceReactions.userId, userId)
    ));
  
  return result.length > 0;
}

// ============================================================================
// Resource Comments
// ============================================================================

export async function createResourceComment(data: { resourceId: number; userId: number; content: string; parentId?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(resourceComments).values({
    resourceId: data.resourceId,
    userId: data.userId,
    content: data.content,
    parentId: data.parentId || null
  });
  
  return result;
}

export async function getResourceComments(resourceId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const comments = await db.select({
    id: resourceComments.id,
    resourceId: resourceComments.resourceId,
    userId: resourceComments.userId,
    parentId: resourceComments.parentId,
    content: resourceComments.content,
    createdAt: resourceComments.createdAt,
    updatedAt: resourceComments.updatedAt,
    userName: users.name,
    userEmail: users.email
  })
  .from(resourceComments)
  .leftJoin(users, eq(resourceComments.userId, users.id))
  .where(eq(resourceComments.resourceId, resourceId))
  .orderBy(resourceComments.createdAt);
  
  return comments;
}

export async function deleteResourceComment(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Only allow user to delete their own comments
  await db.delete(resourceComments)
    .where(and(
      eq(resourceComments.id, commentId),
      eq(resourceComments.userId, userId)
    ));
  
  return { success: true };
}

export async function getResourceCommentCount(resourceId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: count() })
    .from(resourceComments)
    .where(eq(resourceComments.resourceId, resourceId));
  
  return result[0]?.count || 0;
}

// ============================================================================
// Pressure Audit
// ============================================================================

export async function savePressureAuditResponse(data: {
  sessionId: string;
  name: string;
  email: string;
  responses: Record<string, number>;
  totalScore: number;
  tier: string;
  userId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { pressureAuditResponses } = await import("../drizzle/schema");
  
  await db.insert(pressureAuditResponses).values({
    sessionId: data.sessionId,
    name: data.name,
    email: data.email,
    responses: JSON.stringify(data.responses),
    totalScore: data.totalScore,
    tier: data.tier as any,
    userId: data.userId || null
  });
}

export async function getPressureAuditBySession(sessionId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const { pressureAuditResponses } = await import("../drizzle/schema");
  
  const results = await db.select()
    .from(pressureAuditResponses)
    .where(eq(pressureAuditResponses.sessionId, sessionId));
  
  return results[0] || null;
}

export async function getAllPressureAudits() {
  const db = await getDb();
  if (!db) return [];
  
  const { pressureAuditResponses } = await import("../drizzle/schema");
  const { desc } = await import("drizzle-orm");
  
  return await db.select()
    .from(pressureAuditResponses)
    .orderBy(desc(pressureAuditResponses.createdAt));
}


/**
 * AI Executive Coach - Database Helpers
 */

export async function createCoachingProfile(data: {
  userId: number;
  preferredName?: string;
  role: string;
  experienceLevel: "first_time" | "mid_level" | "senior" | "executive";
  goals: string[];
  pressures: string[];
  challenges: string[];
  decisionBottlenecks?: string;
  teamDynamics?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { coachingUsers } = await import("../drizzle/schema");
  
  const [profile] = await db.insert(coachingUsers).values({
    userId: data.userId,
    preferredName: data.preferredName || null,
    role: data.role,
    experienceLevel: data.experienceLevel,
    goals: JSON.stringify(data.goals),
    pressures: JSON.stringify(data.pressures),
    challenges: JSON.stringify(data.challenges),
    decisionBottlenecks: data.decisionBottlenecks || null,
    teamDynamics: data.teamDynamics || null,
  });
  
  return profile;
}

export async function getCoachingProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { coachingUsers } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  const results = await db.select()
    .from(coachingUsers)
    .where(eq(coachingUsers.userId, userId))
    .limit(1);
  
  if (results.length === 0) return null;
  
  const profile = results[0];
  return {
    ...profile,
    goals: JSON.parse(profile.goals as string),
    pressures: JSON.parse(profile.pressures as string),
    challenges: JSON.parse(profile.challenges as string),
  };
}

export async function createCoachingSession(data: {
  coachingUserId: number;
  sessionType: "general" | "situational" | "roleplay" | "check_in";
  context?: Record<string, unknown>;
  messages: Array<{ role: string; content: string }>;
  insights?: string[];
  actionItems?: string[];
  duration?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { coachingSessions } = await import("../drizzle/schema");
  
  const [session] = await db.insert(coachingSessions).values({
    coachingUserId: data.coachingUserId,
    sessionType: data.sessionType,
    context: data.context ? JSON.stringify(data.context) : null,
    messages: JSON.stringify(data.messages),
    insights: data.insights ? JSON.stringify(data.insights) : null,
    actionItems: data.actionItems ? JSON.stringify(data.actionItems) : null,
    duration: data.duration,
  });
  
  return session;
}

export async function getCoachingSessions(coachingUserId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const { coachingSessions } = await import("../drizzle/schema");
  const { eq, desc } = await import("drizzle-orm");
  
  const sessions = await db.select()
    .from(coachingSessions)
    .where(eq(coachingSessions.coachingUserId, coachingUserId))
    .orderBy(desc(coachingSessions.createdAt))
    .limit(limit);
  
  return sessions.map(session => {
    // Safe JSON parsing with fallbacks
    let messages = [];
    let context = null;
    let insights = null;
    let actionItems = null;

    try {
      messages = session.messages ? JSON.parse(session.messages as string) : [];
    } catch (err) {
      console.error(`Failed to parse messages for session ${session.id}:`, err);
      messages = [];
    }

    try {
      context = session.context ? JSON.parse(session.context as string) : null;
    } catch (err) {
      console.error(`Failed to parse context for session ${session.id}:`, err);
    }

    try {
      insights = session.insights ? JSON.parse(session.insights as string) : null;
    } catch (err) {
      console.error(`Failed to parse insights for session ${session.id}:`, err);
    }

    try {
      actionItems = session.actionItems ? JSON.parse(session.actionItems as string) : null;
    } catch (err) {
      console.error(`Failed to parse actionItems for session ${session.id}:`, err);
    }

    return {
      ...session,
      context,
      messages,
      insights,
      actionItems,
    };
  });
}

export async function createCoachingGoal(data: {
  coachingUserId: number;
  title: string;
  description?: string;
  category: "leadership" | "communication" | "decision_making" | "team_building" | "personal_growth";
  targetDate?: Date;
  milestones?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { coachingGoals } = await import("../drizzle/schema");
  
  const [goal] = await db.insert(coachingGoals).values({
    coachingUserId: data.coachingUserId,
    title: data.title,
    description: data.description || null,
    category: data.category,
    targetDate: data.targetDate || null,
    milestones: data.milestones ? JSON.stringify(data.milestones) : null,
  });
  
  return goal;
}

export async function getCoachingGoals(coachingUserId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { coachingGoals } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  const goals = await db.select()
    .from(coachingGoals)
    .where(eq(coachingGoals.coachingUserId, coachingUserId));
  
  return goals.map(goal => ({
    ...goal,
    milestones: goal.milestones ? JSON.parse(goal.milestones as string) : null,
  }));
}

export async function updateGoalProgress(goalId: number, progress: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { coachingGoals } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  await db.update(coachingGoals)
    .set({ progress, updatedAt: new Date() })
    .where(eq(coachingGoals.id, goalId));
}

export async function updateCoachingGoal(goalId: number, data: {
  title?: string;
  description?: string;
  category?: "leadership" | "communication" | "decision_making" | "team_building" | "personal_growth";
  targetDate?: Date;
  milestones?: string[];
  status?: "active" | "completed" | "paused" | "abandoned";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { coachingGoals } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  const updateData: any = { updatedAt: new Date() };
  
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.targetDate !== undefined) updateData.targetDate = data.targetDate || null;
  if (data.milestones !== undefined) updateData.milestones = JSON.stringify(data.milestones);
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === "completed") {
      updateData.completedAt = new Date();
    }
  }
  
  await db.update(coachingGoals)
    .set(updateData)
    .where(eq(coachingGoals.id, goalId));
}

export async function deleteCoachingGoal(goalId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { coachingGoals } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  await db.delete(coachingGoals)
    .where(eq(coachingGoals.id, goalId));
}

export async function createCoachingCommitment(data: {
  coachingUserId: number;
  sessionId?: number;
  goalId?: number;
  action: string;
  deadline?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { coachingCommitments } = await import("../drizzle/schema");
  
  const [commitment] = await db.insert(coachingCommitments).values({
    coachingUserId: data.coachingUserId,
    sessionId: data.sessionId || null,
    goalId: data.goalId || null,
    action: data.action,
    deadline: data.deadline || null,
  });
  
  return commitment;
}

export async function getCoachingCommitments(coachingUserId: number, status?: "pending" | "in_progress" | "completed" | "missed") {
  const db = await getDb();
  if (!db) return [];
  
  console.log(`[getCoachingCommitments] Querying for coachingUserId: ${coachingUserId}, status: ${status}`);
  
  try {
    // Use raw SQL to avoid Drizzle ORM hanging issues
    const { sql } = await import("drizzle-orm");
    let query;
    if (status) {
      query = sql`SELECT * FROM coaching_commitments WHERE coaching_user_id = ${coachingUserId} AND status = ${status} ORDER BY created_at DESC`;
    } else {
      query = sql`SELECT * FROM coaching_commitments WHERE coaching_user_id = ${coachingUserId} ORDER BY created_at DESC`;
    }
    
    const results = await db.execute(query) as any;
    const rows = (results[0] || []) as any[];
    console.log(`[getCoachingCommitments] Query returned ${rows.length} results`);
    if (rows.length > 0) {
      console.log(`[getCoachingCommitments] Sample commitment:`, rows[0]);
    }
    
    // Map snake_case columns to camelCase for consistency
    return rows.map((row: any) => ({
      id: row.id,
      coachingUserId: row.coaching_user_id,
      userId: row.user_id,
      guestPassCode: row.guest_pass_code,
      sessionId: row.session_id,
      goalId: row.goal_id,
      action: row.action,
      context: row.context,
      deadline: row.deadline,
      status: row.status,
      progress: row.progress,
      completedAt: row.completed_at,
      closedAt: row.closed_at,
      closedNote: row.closed_note,
      notes: row.notes,
      followUpCount: row.follow_up_count,
      lastFollowUpAt: row.last_follow_up_at,
      checkInEmailSent: row.check_in_email_sent,
      evidencePhotos: row.evidence_photos,
      recurrenceFrequency: row.recurrence_frequency,
      nextDueDate: row.next_due_date,
      streakCount: row.streak_count,
      lastCompletedDate: row.last_completed_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    console.error(`[getCoachingCommitments] Query failed:`, error);
    return [];
  }
}

export async function updateCommitmentStatus(
  commitmentId: number,
  status?: "pending" | "in_progress" | "completed" | "missed" | "open" | "closed" | "overdue" | "abandoned",
  closedNote?: string,
  progress?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updates: any = {};
  
  if (status !== undefined) {
    updates.status = status;
    updates.completedAt = (status === "completed" || status === "closed") ? new Date() : null;
    updates.closedAt = (status === "closed" || status === "completed") ? new Date() : null;
    updates.closedNote = closedNote || null;
  }
  
  if (progress !== undefined) {
    updates.progress = progress;
    // Auto-mark as completed when progress reaches 100%
    if (progress === 100 && !status) {
      updates.status = "completed";
      updates.completedAt = new Date();
      updates.closedAt = new Date();
    }
  }
  
  await db
    .update(coachingCommitments)
    .set(updates)
    .where(eq(coachingCommitments.id, commitmentId));
}

export async function getAllCoachingTemplates() {
  const db = await getDb();
  if (!db) return [];
  
  const { coachingTemplates } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  const templates = await db.select()
    .from(coachingTemplates)
    .where(eq(coachingTemplates.isPublic, true));
  
  return templates.map(template => ({
    ...template,
    content: JSON.parse(template.content as string),
    prompts: template.prompts ? JSON.parse(template.prompts as string) : null,
  }));
}

export async function getCoachingTemplatesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  
  const { coachingTemplates } = await import("../drizzle/schema");
  const { eq, and } = await import("drizzle-orm");
  
  const templates = await db.select()
    .from(coachingTemplates)
    .where(and(
      eq(coachingTemplates.category, category as any),
      eq(coachingTemplates.isPublic, true)
    ));
  
  return templates.map(template => ({
    ...template,
    content: JSON.parse(template.content as string),
    prompts: template.prompts ? JSON.parse(template.prompts as string) : null,
  }));
}

export async function getCoachingSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { coachingSubscriptions } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  const results = await db.select()
    .from(coachingSubscriptions)
    .where(eq(coachingSubscriptions.userId, userId))
    .limit(1);
  
  return results[0] || null;
}

export async function createCoachingSubscription(data: {
  userId: number;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { coachingSubscriptions } = await import("../drizzle/schema");
  
  const [subscription] = await db.insert(coachingSubscriptions).values({
    userId: data.userId,
    stripeCustomerId: data.stripeCustomerId,
    stripeSubscriptionId: data.stripeSubscriptionId,
    status: data.status,
    currentPeriodStart: data.currentPeriodStart || null,
    currentPeriodEnd: data.currentPeriodEnd || null,
  });
  
  return subscription;
}

export async function updateCoachingSubscription(userId: number, updates: {
  status?: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { coachingSubscriptions } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  await db.update(coachingSubscriptions)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(coachingSubscriptions.userId, userId));
}

// ============================================================================
// Guest Pass Functions
// ============================================================================

/**
 * Create a new guest pass code
 */
export async function createGuestPass(data: {
  code: string;
  label?: string;
  expiresAt?: Date | null;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(guestPasses).values({
    code: data.code,
    label: data.label || null,
    expiresAt: data.expiresAt || null,
    createdBy: data.createdBy,
    isActive: true,
    usageCount: 0,
  });
  
  return result[0].insertId;
}

/**
 * Get all guest passes created by a user
 */
export async function getGuestPasses(createdBy: number) {
  const db = await getDb();
  if (!db) return [];
  
  const passes = await db
    .select()
    .from(guestPasses)
    .where(eq(guestPasses.createdBy, createdBy))
    .orderBy(desc(guestPasses.createdAt));
  
  return passes;
}

/**
 * Get a guest pass by code
 */
export async function getGuestPassByCode(code: string) {
  const db = await getDb();
  if (!db) return null;
  
  const passes = await db
    .select()
    .from(guestPasses)
    .where(eq(guestPasses.code, code))
    .limit(1);
  
  return passes[0] || null;
}

/**
 * Validate if a guest pass is currently valid
 */
export async function validateGuestPass(code: string): Promise<{ valid: boolean; passId?: number; reason?: string }> {
  const pass = await getGuestPassByCode(code);
  
  if (!pass) {
    return { valid: false, reason: "Invalid code" };
  }
  
  if (!pass.isActive) {
    return { valid: false, reason: "Code has been revoked" };
  }
  
  if (pass.expiresAt && new Date(pass.expiresAt) < new Date()) {
    return { valid: false, reason: "Code has expired" };
  }
  
  return { valid: true, passId: pass.id };
}

/**
 * Revoke a guest pass (set isActive to false)
 */
export async function revokeGuestPass(passId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(guestPasses)
    .set({ isActive: false })
    .where(eq(guestPasses.id, passId));
}

/**
 * Update guest pass usage stats
 */
export async function incrementGuestPassUsage(passId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(guestPasses)
    .set({
      usageCount: sql`${guestPasses.usageCount} + 1`,
      lastUsedAt: new Date(),
    })
    .where(eq(guestPasses.id, passId));
}

/**
 * Create or get guest pass session
 */
export async function getOrCreateGuestPassSession(guestPassId: number, fingerprint: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Try to find existing session
  const existing = await db
    .select()
    .from(guestPassSessions)
    .where(
      and(
        eq(guestPassSessions.guestPassId, guestPassId),
        eq(guestPassSessions.fingerprint, fingerprint)
      )
    )
    .limit(1);
  
  if (existing[0]) {
    return existing[0];
  }
  
  // Create new session
  const result = await db.insert(guestPassSessions).values({
    guestPassId,
    fingerprint,
    messages: JSON.stringify([]),
    messageCount: 0,
  });
  
  return {
    id: result[0].insertId as number,
    guestPassId,
    fingerprint,
    messages: "[]",
    messageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastInteractionAt: new Date(),
  };
}

/**
 * Update guest pass session with new message
 */
export async function updateGuestPassSession(sessionId: number, messages: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const messageCount = JSON.parse(messages).length;
  
  await db
    .update(guestPassSessions)
    .set({
      messages,
      messageCount,
      lastInteractionAt: new Date(),
    })
    .where(eq(guestPassSessions.id, sessionId));
}


// ============================================================================
// Guest Pass Email Invitation Functions
// ============================================================================

/**
 * Create an email invitation for a guest pass
 */
export async function createGuestPassInvitation(data: {
  guestPassId: number;
  recipientEmail: string;
  recipientName?: string;
  personalMessage?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(guestPassInvitations).values({
    guestPassId: data.guestPassId,
    recipientEmail: data.recipientEmail,
    recipientName: data.recipientName || null,
    personalMessage: data.personalMessage || null,
    status: "pending",
  });
  
  return result[0].insertId;
}

/**
 * Get all invitations for a guest pass
 */
export async function getGuestPassInvitations(guestPassId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const invitations = await db
    .select()
    .from(guestPassInvitations)
    .where(eq(guestPassInvitations.guestPassId, guestPassId))
    .orderBy(desc(guestPassInvitations.createdAt));
  
  return invitations;
}

/**
 * Update invitation status
 */
export async function updateInvitationStatus(
  invitationId: number,
  status: "pending" | "sent" | "failed" | "opened",
  additionalData?: {
    sentAt?: Date;
    openedAt?: Date;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(guestPassInvitations)
    .set({
      status,
      ...(additionalData?.sentAt && { sentAt: additionalData.sentAt }),
      ...(additionalData?.openedAt && { openedAt: additionalData.openedAt }),
    })
    .where(eq(guestPassInvitations.id, invitationId));
}

/**
 * Mark invitation reminder as sent
 */
export async function markReminderSent(invitationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(guestPassInvitations)
    .set({ reminderSentAt: new Date() })
    .where(eq(guestPassInvitations.id, invitationId));
}

export async function updateUserCoachPreference(userId: number, coachId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(users)
    .set({ selectedCoach: coachId })
    .where(eq(users.id, userId));
}

export async function getUserCoachPreference(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) return "sarah"; // default coach
  
  const user = await db
    .select({ selectedCoach: users.selectedCoach })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return user[0]?.selectedCoach || "sarah";
}

// ==================== COMMITMENT TRACKING ====================

/**
 * Create a new coaching commitment
 */
export async function createCommitment(data: {
  userId?: number;
  guestPassCode?: string;
  sessionId?: number;
  action: string;
  context?: string;
  deadline?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(coachingCommitments).values({
    userId: data.userId || null,
    coachingUserId: null,
    guestPassCode: data.guestPassCode || null,
    sessionId: data.sessionId || null,
    goalId: null,
    action: data.action,
    context: data.context || null,
    deadline: data.deadline || null,
    status: "open",
    notes: null,
    followUpCount: 0,
  });
  
  return result[0].insertId;
}

/**
 * Get open commitments for a user or guest
 */
export async function getOpenCommitments(userId?: number, guestPassCode?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (userId) conditions.push(eq(coachingCommitments.userId, userId));
  if (guestPassCode) conditions.push(eq(coachingCommitments.guestPassCode, guestPassCode));
  
  if (conditions.length === 0) return [];
  
  const commitments = await db
    .select()
    .from(coachingCommitments)
    .where(
      and(
        ...conditions,
        sql`${coachingCommitments.status} IN ('open', 'pending', 'in_progress')`
      )
    )
    .orderBy(desc(coachingCommitments.createdAt));
  
  return commitments;
}

/**
 * Increment follow-up count for a commitment
 */
export async function trackCommitmentFollowUp(commitmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(coachingCommitments)
    .set({
      followUpCount: sql`${coachingCommitments.followUpCount} + 1`,
      lastFollowUpAt: new Date(),
    })
    .where(eq(coachingCommitments.id, commitmentId));
}

// ==================== SESSION CONTEXT ====================

/**
 * Get or create session context for a user/guest
 */
export async function getSessionContext(userId?: number, guestPassCode?: string) {
  const db = await getDb();
  if (!db) return null;
  
  const conditions = [];
  if (userId) conditions.push(eq(sessionContexts.userId, userId));
  if (guestPassCode) conditions.push(eq(sessionContexts.guestPassCode, guestPassCode));
  
  if (conditions.length === 0) return null;
  
  const contexts = await db
    .select()
    .from(sessionContexts)
    .where(and(...conditions))
    .limit(1);
  
  return contexts[0] || null;
}

/**
 * Update session context with new patterns and themes
 */
export async function updateSessionContext(data: {
  userId?: number;
  guestPassCode?: string;
  keyThemes?: string[];
  avoidancePatterns?: string[];
  pressureResponses?: string[];
  decisionPatterns?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if context exists
  const existing = await getSessionContext(data.userId, data.guestPassCode);
  
  if (existing) {
    // Update existing context
    await db
      .update(sessionContexts)
      .set({
        ...(data.keyThemes && { keyThemes: JSON.stringify(data.keyThemes) }),
        ...(data.avoidancePatterns && { avoidancePatterns: JSON.stringify(data.avoidancePatterns) }),
        ...(data.pressureResponses && { pressureResponses: JSON.stringify(data.pressureResponses) }),
        ...(data.decisionPatterns && { decisionPatterns: JSON.stringify(data.decisionPatterns) }),
        lastUpdated: new Date(),
      })
      .where(eq(sessionContexts.id, existing.id));
  } else {
    // Create new context
    await db.insert(sessionContexts).values({
      userId: data.userId || null,
      guestPassCode: data.guestPassCode || null,
      keyThemes: JSON.stringify(data.keyThemes || []),
      avoidancePatterns: JSON.stringify(data.avoidancePatterns || []),
      pressureResponses: JSON.stringify(data.pressureResponses || []),
      decisionPatterns: JSON.stringify(data.decisionPatterns || []),
    });
  }
}

// ==================== BEHAVIORAL INSIGHTS ====================

/**
 * Create a new behavioral insight
 */
export async function createBehavioralInsight(data: {
  userId?: number;
  guestPassCode?: string;
  insightType: "avoidance" | "over_indexing" | "pressure_response" | "decision_pattern" | "blind_spot";
  title: string;
  description: string;
  evidence: string[];
  confidence: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(behavioralInsights).values({
    userId: data.userId || null,
    guestPassCode: data.guestPassCode || null,
    insightType: data.insightType,
    title: data.title,
    description: data.description,
    evidence: JSON.stringify(data.evidence),
    confidence: data.confidence,
    surfacedAt: null,
    acknowledgedAt: null,
  });
  
  return result[0].insertId;
}

/**
 * Get unsurfaced insights for a user/guest
 */
export async function getUnsurfacedInsights(userId?: number, guestPassCode?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (userId) conditions.push(eq(behavioralInsights.userId, userId));
  if (guestPassCode) conditions.push(eq(behavioralInsights.guestPassCode, guestPassCode));
  
  if (conditions.length === 0) return [];
  
  const insights = await db
    .select()
    .from(behavioralInsights)
    .where(
      and(
        ...conditions,
        sql`${behavioralInsights.surfacedAt} IS NULL`
      )
    )
    .orderBy(desc(behavioralInsights.confidence));
  
  return insights;
}

/**
 * Mark insight as surfaced to user
 */
export async function markInsightSurfaced(insightId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(behavioralInsights)
    .set({ surfacedAt: new Date() })
    .where(eq(behavioralInsights.id, insightId));
}

/**
 * Get or create email preferences for a user
 * Generates a unique unsubscribe token if creating new preferences
 */
export async function getOrCreateEmailPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Try to get existing preferences
  const existing = await db
    .select()
    .from(emailPreferences)
    .where(eq(emailPreferences.userId, userId))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  // Create new preferences with unique unsubscribe token
  const crypto = await import("crypto");
  const unsubscribeToken = crypto.randomBytes(32).toString("hex");
  
  const result = await db.insert(emailPreferences).values({
    userId,
    unsubscribeToken,
    emailsEnabled: true,
    followUpEmails: true,
    weeklyCheckIns: true,
    overdueAlerts: true,
    frequency: "daily",
  });
  
  // Fetch and return the newly created preferences
  const newPrefs = await db
    .select()
    .from(emailPreferences)
    .where(eq(emailPreferences.id, result[0].insertId))
    .limit(1);
  
  return newPrefs[0];
}

/**
 * Update email preferences for a user
 */
export async function updateEmailPreferences(
  userId: number,
  updates: Partial<{
    emailsEnabled: boolean;
    followUpEmails: boolean;
    weeklyCheckIns: boolean;
    overdueAlerts: boolean;
    frequency: "daily" | "weekly" | "off";
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(emailPreferences)
    .set(updates)
    .where(eq(emailPreferences.userId, userId));
}

/**
 * Unsubscribe user from all emails using token
 */
export async function unsubscribeByToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .update(emailPreferences)
    .set({
      emailsEnabled: false,
      unsubscribedAt: new Date(),
    })
    .where(eq(emailPreferences.unsubscribeToken, token));
  
  return result[0].affectedRows > 0;
}

/**
 * Get email preferences by unsubscribe token
 */
export async function getEmailPreferencesByToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  
  const prefs = await db
    .select()
    .from(emailPreferences)
    .where(eq(emailPreferences.unsubscribeToken, token))
    .limit(1);
  
  return prefs.length > 0 ? prefs[0] : null;
}

// ==================== USER PROGRESS & STATS ====================

/**
 * Get user progress statistics for profile dashboard
 */
export async function getUserProgressStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { coachingSessions, coachingCommitments } = await import("../drizzle/schema");
  const { count, eq, and, sql } = await import("drizzle-orm");
  
  // Get total sessions count
  const sessionsResult = await db
    .select({ count: count() })
    .from(coachingSessions)
    .where(sql`${coachingSessions.id} IN (SELECT session_id FROM coaching_commitments WHERE user_id = ${userId})`);
  
  const totalSessions = sessionsResult[0]?.count || 0;
  
  // Get commitments stats
  const allCommitments = await db
    .select()
    .from(coachingCommitments)
    .where(eq(coachingCommitments.userId, userId));
  
  const totalCommitments = allCommitments.length;
  const completedCommitments = allCommitments.filter(c => c.status === 'completed' || c.status === 'closed').length;
  const activeCommitments = allCommitments.filter(c => c.status === 'open' || c.status === 'pending' || c.status === 'in_progress').length;
  const overdueCommitments = allCommitments.filter(c => c.status === 'overdue').length;
  
  // Calculate completion rate
  const completionRate = totalCommitments > 0 ? Math.round((completedCommitments / totalCommitments) * 100) : 0;
  
  // Get recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentCommitments = allCommitments.filter(c => 
    c.createdAt && new Date(c.createdAt) >= thirtyDaysAgo
  );
  
  return {
    totalSessions,
    totalCommitments,
    completedCommitments,
    activeCommitments,
    overdueCommitments,
    completionRate,
    recentActivity: recentCommitments.length,
  };
}

/**
 * Get all commitments for a user with optional status filter
 */
export async function getUserCommitments(
  userId: number,
  options?: {
    status?: "pending" | "in_progress" | "completed" | "missed" | "open" | "closed" | "overdue" | "abandoned";
    limit?: number;
  }
) {
  const db = await getDb();
  if (!db) return [];
  
  const { coachingCommitments } = await import("../drizzle/schema");
  const { eq, and, desc } = await import("drizzle-orm");
  
  let query = db
    .select()
    .from(coachingCommitments)
    .where(eq(coachingCommitments.userId, userId))
    .orderBy(desc(coachingCommitments.createdAt));
  
  if (options?.status) {
    query = db
      .select()
      .from(coachingCommitments)
      .where(
        and(
          eq(coachingCommitments.userId, userId),
          eq(coachingCommitments.status, options.status)
        )
      )
      .orderBy(desc(coachingCommitments.createdAt));
  }
  
  if (options?.limit) {
    query = query.limit(options.limit) as any;
  }
  
  return await query;
}

/**
 * Update commitment progress (0-100)
 */
export async function updateCommitmentProgress(commitmentId: number, progress: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { coachingCommitments } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  // Auto-complete if progress reaches 100
  const updates: any = { progress: clampedProgress };
  if (clampedProgress === 100) {
    updates.status = 'completed';
    updates.completedAt = new Date();
  }
  
  await db
    .update(coachingCommitments)
    .set(updates)
    .where(eq(coachingCommitments.id, commitmentId));
}

/**
 * Mark commitment as complete
 */
export async function completeCommitment(commitmentId: number, closedNote?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { coachingCommitments } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");
  
  await db
    .update(coachingCommitments)
    .set({
      status: 'completed',
      progress: 100,
      completedAt: new Date(),
      closedAt: new Date(),
      closedNote: closedNote || null,
    })
    .where(eq(coachingCommitments.id, commitmentId));
}

/**
 * Get all commitments across all users (admin only)
 */
export async function getAllCommitments() {
  const db = await getDb();
  if (!db) return [];
  
  const { coachingCommitments, users } = await import("../drizzle/schema");
  const { desc, eq, sql } = await import("drizzle-orm");
  
  const commitments = await db
    .select({
      id: coachingCommitments.id,
      userId: coachingCommitments.userId,
      guestPassCode: coachingCommitments.guestPassCode,
      action: coachingCommitments.action,
      context: coachingCommitments.context,
      deadline: coachingCommitments.deadline,
      status: coachingCommitments.status,
      progress: coachingCommitments.progress,
      completedAt: coachingCommitments.completedAt,
      checkInEmailSent: coachingCommitments.checkInEmailSent,
      createdAt: coachingCommitments.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(coachingCommitments)
    .leftJoin(users, eq(coachingCommitments.userId, users.id))
    .orderBy(desc(coachingCommitments.createdAt));
  
  return commitments;
}

/**
 * Get commitment statistics (admin only)
 */
export async function getCommitmentStats() {
  const db = await getDb();
  if (!db) {
    return {
      totalCommitments: 0,
      completedCount: 0,
      completionRate: 0,
      overdueCount: 0,
      checkInEmailsSent: 0,
    };
  }
  
  const { coachingCommitments } = await import("../drizzle/schema");
  const { count, eq, sql } = await import("drizzle-orm");
  
  // Total commitments
  const totalResult = await db
    .select({ count: count() })
    .from(coachingCommitments);
  const totalCommitments = totalResult[0]?.count || 0;
  
  // Completed commitments
  const completedResult = await db
    .select({ count: count() })
    .from(coachingCommitments)
    .where(sql`${coachingCommitments.status} IN ('completed', 'closed')`);
  const completedCount = completedResult[0]?.count || 0;
  
  // Overdue commitments
  const now = new Date();
  const overdueResult = await db
    .select({ count: count() })
    .from(coachingCommitments)
    .where(
      sql`${coachingCommitments.deadline} < ${now.toISOString()} 
          AND ${coachingCommitments.status} NOT IN ('completed', 'closed')`
    );
  const overdueCount = overdueResult[0]?.count || 0;
  
  // Check-in emails sent
  const checkInResult = await db
    .select({ count: count() })
    .from(coachingCommitments)
    .where(eq(coachingCommitments.checkInEmailSent, true));
  const checkInEmailsSent = checkInResult[0]?.count || 0;
  
  // Calculate completion rate
  const completionRate = totalCommitments > 0 
    ? Math.round((completedCount / totalCommitments) * 100) 
    : 0;
  
  return {
    totalCommitments,
    completedCount,
    completionRate,
    overdueCount,
    checkInEmailsSent,
  };
}

