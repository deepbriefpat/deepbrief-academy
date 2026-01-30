import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { z } from "zod";
import { eq, and, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { coachingUsers } from "../drizzle/schema";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;
      
      // Enrich with database fields like preferredName
      const db = await getDb();
      if (!db) return ctx.user;
      
      const [profile] = await db
        .select()
        .from(coachingUsers)
        .where(eq(coachingUsers.userId, ctx.user.id))
        .limit(1);
      
      if (profile?.preferredName) {
        return {
          ...ctx.user,
          preferredName: profile.preferredName,
        };
      }
      
      return ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  resources: router({
    list: publicProcedure.query(async () => {
      const { getAllResources } = await import("./db");
      return getAllResources();
    }),
    byTheme: publicProcedure
      .input(z.object({ theme: z.enum(["pressure_management", "diving_metaphors", "leadership_isolation", "vulnerability"]) }))
      .query(async ({ input }) => {
        const { getResourcesByTheme } = await import("./db");
        return getResourcesByTheme(input.theme);
      }),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const { getResourceBySlug } = await import("./db");
        return getResourceBySlug(input.slug);
      }),
    trackView: publicProcedure
      .input(z.object({ resourceId: z.number() }))
      .mutation(async ({ input }) => {
        const { trackResourceView } = await import("./db");
        await trackResourceView(input.resourceId);
        return { success: true };
      }),
  }),

  stories: router({
    list: publicProcedure.query(async () => {
      const { getAllStories } = await import("./db");
      return getAllStories();
    }),
    featured: publicProcedure.query(async () => {
      const { getFeaturedStories } = await import("./db");
      return getFeaturedStories();
    }),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const { getStoryBySlug } = await import("./db");
        return getStoryBySlug(input.slug);
      }),
  }),

  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string(),
          email: z.string().email(),
          inquiryType: z.string(),
          message: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { saveInquiry } = await import("./db");
        await saveInquiry({
          ...input,
          message: input.message || "",
          inquiryType: input.inquiryType as "pressure_audit" | "peer_group" | "general",
        });
        return { success: true };
      }),
  }),

  testimonials: router({
    list: publicProcedure.query(async () => {
      const { getAllTestimonials } = await import("./db");
      return getAllTestimonials();
    }),
    featured: publicProcedure.query(async () => {
      const { getFeaturedTestimonials } = await import("./db");
      return getFeaturedTestimonials();
    }),
  }),

  dashboard: router({
    myAssessments: protectedProcedure.query(async ({ ctx }) => {
      const { getUserAssessments } = await import("./db");
      return getUserAssessments(ctx.user.id);
    }),
  }),

  assessment: router({
    submit: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          responses: z.record(z.string(), z.number()),
          depthLevel: z.enum(["surface", "thermocline", "deep_water", "crush_depth"]),
          score: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { saveAssessmentResponse } = await import("./db");
        await saveAssessmentResponse({
          sessionId: input.sessionId,
          userId: ctx.user?.id, // Link to user if authenticated
          responses: JSON.stringify(input.responses),
          depthLevel: input.depthLevel,
          score: input.score,
        });
        return { success: true, sessionId: input.sessionId };
      }),
    getBySession: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const { getDb } = await import("./db");
        const { assessmentResponses } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) return null;
        const results = await db
          .select()
          .from(assessmentResponses)
          .where(eq(assessmentResponses.sessionId, input.sessionId))
          .limit(1);
        return results[0] || null;
      }),
  }),

  emailSubscriber: router({
    subscribe: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          name: z.string().optional(),
          source: z.enum(["assessment_results", "booking_confirmation", "general", "calm_protocol", "pressure_audit"]),
        })
      )
      .mutation(async ({ input }) => {
        const { subscribeEmail } = await import("./db");
        const { addSubscriberToMailchimp } = await import("./_core/mailchimp");
        
        // Save to database
        await subscribeEmail({
          email: input.email,
          name: input.name,
          source: input.source,
        });
        
        // Sync to Mailchimp
        const mailchimpResult = await addSubscriberToMailchimp(
          input.email,
          input.source,
          input.name ? { FNAME: input.name } : undefined
        );
        
        return { success: true, mailchimp: mailchimpResult.success };
      }),
  }),

  // Admin Dashboard - protected procedures for admin users only
  admin: router({
    // Get all email subscribers with filtering
    subscribers: protectedProcedure
      .input(
        z.object({
          source: z.enum(["all", "assessment_results", "booking_confirmation", "general", "calm_protocol", "pressure_audit"]).optional(),
          search: z.string().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        // Check if user is admin
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { getAllEmailSubscribers, searchEmailSubscribers } = await import("./db");
        
        if (input.search) {
          return await searchEmailSubscribers(input.search, input.source === "all" ? undefined : input.source);
        }
        
        return await getAllEmailSubscribers(input.source === "all" ? undefined : input.source);
      }),

    // Get subscriber statistics
    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const { getSubscriberStats } = await import("./db");
      return await getSubscriberStats();
    }),

    // Get email analytics
    emailAnalytics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const { getDb } = await import("./db");
      const { emailSubscribers, sentEmails, emailSequences } = await import("../drizzle/schema");
      
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }
      
      // Total subscribers
      const totalSubscribers = await db.select({ count: sql<number>`count(*)` }).from(emailSubscribers);
      const activeSubscribers = await db.select({ count: sql<number>`count(*)` }).from(emailSubscribers).where(eq(emailSubscribers.subscribed, 1));
      
      // Subscribers this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const subscribersThisWeek = await db
        .select({ count: sql<number>`count(*)` })
        .from(emailSubscribers)
        .where(sql`${emailSubscribers.createdAt} >= ${weekAgo.toISOString()}`);
      
      // Total emails sent
      const totalEmailsSent = await db.select({ count: sql<number>`count(*)` }).from(sentEmails);
      const successfulEmails = await db.select({ count: sql<number>`count(*)` }).from(sentEmails).where(eq(sentEmails.status, "sent"));
      
      // Subscriptions by source
      const subscriptionsBySource = await db
        .select({
          source: emailSubscribers.source,
          count: sql<number>`count(*)`
        })
        .from(emailSubscribers)
        .groupBy(emailSubscribers.source);
      
      // Emails by sequence
      const emailsBySequence = await db
        .select({
          sequenceName: emailSequences.name,
          totalSent: sql<number>`count(*)`,
          successful: sql<number>`sum(case when ${sentEmails.status} = 'sent' then 1 else 0 end)`,
          failed: sql<number>`sum(case when ${sentEmails.status} = 'failed' then 1 else 0 end)`
        })
        .from(sentEmails)
        .leftJoin(emailSequences, eq(sentEmails.sequenceId, emailSequences.id))
        .groupBy(emailSequences.name);
      
      // Recent subscribers
      const recentSubscribers = await db
        .select()
        .from(emailSubscribers)
        .orderBy(sql`${emailSubscribers.createdAt} desc`)
        .limit(10);
      
      return {
        totalSubscribers: totalSubscribers[0]?.count || 0,
        activeSubscribers: activeSubscribers[0]?.count || 0,
        subscribersThisWeek: subscribersThisWeek[0]?.count || 0,
        totalEmailsSent: totalEmailsSent[0]?.count || 0,
        successfulEmails: successfulEmails[0]?.count || 0,
        subscriptionsBySource,
        emailsBySequence,
        recentSubscribers,
      };
    }),

    // Delete a subscriber
    deleteSubscriber: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { deleteEmailSubscriber } = await import("./db");
        await deleteEmailSubscriber(input.id);
        return { success: true };
      }),

    // Unsubscribe a subscriber
    unsubscribeSubscriber: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { unsubscribeEmailSubscriber } = await import("./db");
        await unsubscribeEmailSubscriber(input.id);
        return { success: true };
      }),

    // Coaching user management
    getCoachingUsers: protectedProcedure
      .input(z.object({ search: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { getDb } = await import("./db");
        const { coachingUsers, users, coachingSessions, coachingCommitments, coachingSubscriptions } = await import("../drizzle/schema");
        const { eq, or, like, sql } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const baseQuery = db
          .select({
            id: coachingUsers.id,
            userId: coachingUsers.userId,
            preferredName: coachingUsers.preferredName,
            role: coachingUsers.role,
            experienceLevel: coachingUsers.experienceLevel,
            createdAt: coachingUsers.createdAt,
            user: {
              id: users.id,
              name: users.name,
              email: users.email,
            },
            sessionCount: sql<number>`COUNT(DISTINCT ${coachingSessions.id})`,
            commitmentCount: sql<number>`COUNT(DISTINCT ${coachingCommitments.id})`,
          })
          .from(coachingUsers)
          .leftJoin(users, eq(coachingUsers.userId, users.id))
          .leftJoin(coachingSessions, eq(coachingUsers.id, coachingSessions.coachingUserId))
          .leftJoin(coachingCommitments, eq(coachingUsers.id, coachingCommitments.coachingUserId))
          .groupBy(coachingUsers.id, users.id);
        
        if (input.search) {
          return await baseQuery.where(
            or(
              like(users.name, `%${input.search}%`),
              like(users.email, `%${input.search}%`),
              like(coachingUsers.preferredName, `%${input.search}%`)
            )
          );
        }
        
        return await baseQuery;
      }),

    getCoachingUserStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { getDb } = await import("./db");
        const { coachingUsers, coachingSubscriptions, coachingSessions } = await import("../drizzle/schema");
        const { eq, gte, count, sql } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const totalUsers = await db.select({ count: count() }).from(coachingUsers);
        
        // Count active users based on recent sessions (last 30 days)
        const activeUsersResult = await db
          .select({ count: sql<number>`COUNT(DISTINCT ${coachingUsers.id})` })
          .from(coachingUsers)
          .leftJoin(coachingSessions, eq(coachingUsers.id, coachingSessions.coachingUserId))
          .where(gte(coachingSessions.createdAt, thirtyDaysAgo));
        
        const subscribers = await db
          .select({ count: count() })
          .from(coachingSubscriptions)
          .where(eq(coachingSubscriptions.status, "active"));
        
        const newThisMonth = await db
          .select({ count: count() })
          .from(coachingUsers)
          .where(gte(coachingUsers.createdAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1)));
        
        return {
          totalUsers: totalUsers[0]?.count || 0,
          activeUsers: activeUsersResult[0]?.count || 0,
          subscribers: subscribers[0]?.count || 0,
          newThisMonth: newThisMonth[0]?.count || 0,
        };
      }),

    getAnalytics: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { getResourceAnalytics } = await import("./db");
        return await getResourceAnalytics();
      }),

    getGuestPassAnalytics: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { getDb } = await import("./db");
        const { guestPasses, guestPassSessions, guestPassInvitations } = await import("../drizzle/schema");
        const { count, sql, gte } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const totalPasses = await db.select({ count: count() }).from(guestPasses);
        const activePasses = await db.select({ count: count() }).from(guestPasses).where(sql`${guestPasses.expiresAt} > NOW()`);
        const totalSessions = await db.select({ count: count() }).from(guestPassSessions);
        const totalInvitations = await db.select({ count: count() }).from(guestPassInvitations);
        
        // Get recent passes
        const recentPasses = await db.select().from(guestPasses).orderBy(sql`${guestPasses.createdAt} DESC`).limit(10);
        
        // Get conversion rate (passes with sessions / total passes)
        const passesWithSessions = await db
          .select({ count: sql<number>`COUNT(DISTINCT ${guestPasses.id})` })
          .from(guestPasses)
          .leftJoin(guestPassSessions, eq(guestPasses.id, guestPassSessions.guestPassId))
          .where(sql`${guestPassSessions.id} IS NOT NULL`);
        
        return {
          totalPasses: totalPasses[0]?.count || 0,
          activePasses: activePasses[0]?.count || 0,
          totalSessions: totalSessions[0]?.count || 0,
          totalInvitations: totalInvitations[0]?.count || 0,
          conversionRate: totalPasses[0]?.count ? (passesWithSessions[0]?.count || 0) / totalPasses[0].count : 0,
          recentPasses,
        };
      }),

    getCoachingSessionsOverview: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { getDb } = await import("./db");
        const { coachingSessions, coachingUsers, users } = await import("../drizzle/schema");
        const { eq, count, sql, desc } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const totalSessions = await db.select({ count: count() }).from(coachingSessions);
        
        // Sessions by type
        const sessionsByType = await db
          .select({
            sessionType: coachingSessions.sessionType,
            count: count(),
          })
          .from(coachingSessions)
          .groupBy(coachingSessions.sessionType);
        
        // Recent sessions
        const recentSessions = await db
          .select({
            id: coachingSessions.id,
            sessionType: coachingSessions.sessionType,
            createdAt: coachingSessions.createdAt,
            messageCount: sql<number>`JSON_LENGTH(${coachingSessions.messages})`,
            user: {
              preferredName: coachingUsers.preferredName,
              email: users.email,
            },
          })
          .from(coachingSessions)
          .leftJoin(coachingUsers, eq(coachingSessions.coachingUserId, coachingUsers.id))
          .leftJoin(users, eq(coachingUsers.userId, users.id))
          .orderBy(desc(coachingSessions.createdAt))
          .limit(20);
        
        return {
          totalSessions: totalSessions[0]?.count || 0,
          sessionsByType,
          recentSessions,
        };
      }),

    // Resource management procedures
    createResource: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          slug: z.string().min(1),
          excerpt: z.string().min(1),
          content: z.string().min(1),
          theme: z.enum(["pressure_management", "diving_metaphors", "leadership_isolation", "vulnerability"]),
          publishedAt: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        const { createResource } = await import("./db");
        const result = await createResource({
          ...input,
          publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
        });
        return { success: true, insertId: Number((result as any).insertId) };
      }),

    updateResource: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          slug: z.string().min(1).optional(),
          excerpt: z.string().min(1).optional(),
          content: z.string().min(1).optional(),
          theme: z.enum(["pressure_management", "diving_metaphors", "leadership_isolation", "vulnerability"]).optional(),
          publishedAt: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        const { id, ...updates } = input;
        const { updateResource } = await import("./db");
        await updateResource(id, {
          ...updates,
          publishedAt: updates.publishedAt ? new Date(updates.publishedAt) : undefined,
        });
        return { success: true };
      }),

    deleteResource: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        const { deleteResource } = await import("./db");
        await deleteResource(input.id);
        return { success: true };
      }),

    // Get resource analytics
    resourceAnalytics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const { getResourceAnalytics } = await import("./db");
      return await getResourceAnalytics();
    }),

    // Get pressure profile statistics
    getPressureProfileStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const { getDb } = await import("./db");
      const { pressureAuditResponses } = await import("../drizzle/schema");
      
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Total completions
      const totalResult = await db.select({ count: sql<number>`count(*)` }).from(pressureAuditResponses);
      const totalCompletions = totalResult[0]?.count || 0;

      // Average score
      const avgResult = await db.select({ avg: sql<number>`avg(${pressureAuditResponses.totalScore})` }).from(pressureAuditResponses);
      const avgScore = avgResult[0]?.avg || 0;

      // Completions this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(pressureAuditResponses)
        .where(sql`${pressureAuditResponses.createdAt} >= ${weekAgo}`);
      const completionsThisWeek = weekResult[0]?.count || 0;

      // Completions this month
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(pressureAuditResponses)
        .where(sql`${pressureAuditResponses.createdAt} >= ${monthAgo}`);
      const completionsThisMonth = monthResult[0]?.count || 0;

      // Tier distribution
      const tierDist = await db
        .select({
          tier: pressureAuditResponses.tier,
          count: sql<number>`count(*)`
        })
        .from(pressureAuditResponses)
        .groupBy(pressureAuditResponses.tier);

      // Question averages (parse responses JSON and calculate)
      const allResponses = await db.select().from(pressureAuditResponses);
      const questionScores: { [key: number]: number[] } = {};
      
      allResponses.forEach(response => {
        try {
          const responses = JSON.parse(response.responses);
          Object.entries(responses).forEach(([qNum, score]) => {
            const questionNum = parseInt(qNum);
            if (!questionScores[questionNum]) {
              questionScores[questionNum] = [];
            }
            questionScores[questionNum].push(score as number);
          });
        } catch (e) {
          // Skip invalid JSON
        }
      });

      const questionAverages = Object.entries(questionScores).map(([qNum, scores]) => ({
        questionNumber: parseInt(qNum),
        avgScore: scores.reduce((a, b) => a + b, 0) / scores.length
      })).sort((a, b) => a.questionNumber - b.questionNumber);

      // Recent completions
      const recentCompletions = await db
        .select()
        .from(pressureAuditResponses)
        .orderBy(sql`${pressureAuditResponses.createdAt} desc`)
        .limit(10);

      return {
        totalCompletions,
        avgScore,
        completionsThisWeek,
        completionsThisMonth,
        tierDistribution: tierDist,
        questionAverages,
        recentCompletions,
      };
    }),

    // Get all commitments across all users (admin only)
    getAllCommitments: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { getAllCommitments } = await import("./db");
        return await getAllCommitments();
      }),

    // Get commitment statistics (admin only)
    getCommitmentStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { getCommitmentStats } = await import("./db");
        return await getCommitmentStats();
      }),

    // Get all guest passes with invitations (admin only)
    getGuestPasses: protectedProcedure
      .input(z.object({ search: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { getDb } = await import("./db");
        const { guestPasses, guestPassInvitations, guestPassSessions } = await import("../drizzle/schema");
        const { eq, like, or, sql, desc, count } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        let query = db
          .select({
            id: guestPasses.id,
            code: guestPasses.code,
            label: guestPasses.label,
            isActive: guestPasses.isActive,
            expiresAt: guestPasses.expiresAt,
            usageCount: sql<number>`COUNT(DISTINCT ${guestPassSessions.id})`,
            createdAt: guestPasses.createdAt,
          })
          .from(guestPasses)
          .leftJoin(guestPassSessions, eq(guestPassSessions.guestPassId, guestPasses.id))
          .groupBy(guestPasses.id)
          .orderBy(desc(guestPasses.createdAt));

        const passes = await query;

        // Get invitations for each pass
        const passesWithInvitations = await Promise.all(
          passes.map(async (pass) => {
            const invitations = await db
              .select()
              .from(guestPassInvitations)
              .where(eq(guestPassInvitations.guestPassId, pass.id));
            return { ...pass, invitations };
          })
        );

        // Filter by search if provided
        if (input.search) {
          const searchLower = input.search.toLowerCase();
          return passesWithInvitations.filter(
            (pass) =>
              pass.code.toLowerCase().includes(searchLower) ||
              pass.label?.toLowerCase().includes(searchLower) ||
              pass.invitations.some(
                (inv) =>
                  inv.recipientEmail.toLowerCase().includes(searchLower) ||
                  inv.recipientName?.toLowerCase().includes(searchLower)
              )
          );
        }

        return passesWithInvitations;
      }),
  }), // Resource Reactions and Comments
  reactions: router({
    add: protectedProcedure
      .input(z.object({ resourceId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Authentication required");
        const { addResourceReaction } = await import("./db");
        return await addResourceReaction(input.resourceId, ctx.user.id);
      }),

    remove: protectedProcedure
      .input(z.object({ resourceId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Authentication required");
        const { removeResourceReaction } = await import("./db");
        return await removeResourceReaction(input.resourceId, ctx.user.id);
      }),

    getCount: publicProcedure
      .input(z.object({ resourceId: z.number() }))
      .query(async ({ input }) => {
        const { getResourceReactionCount } = await import("./db");
        return await getResourceReactionCount(input.resourceId);
      }),

    hasReacted: protectedProcedure
      .input(z.object({ resourceId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (!ctx.user) return false;
        const { hasUserReacted } = await import("./db");
        return await hasUserReacted(input.resourceId, ctx.user.id);
      }),
  }),

  comments: router({
    create: protectedProcedure
      .input(
        z.object({
          resourceId: z.number(),
          content: z.string().min(1),
          parentId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Authentication required");
        const { createResourceComment } = await import("./db");
        return await createResourceComment({
          resourceId: input.resourceId,
          userId: ctx.user.id,
          content: input.content,
          parentId: input.parentId,
        });
      }),

    list: publicProcedure
      .input(z.object({ resourceId: z.number() }))
      .query(async ({ input }) => {
        const { getResourceComments } = await import("./db");
        return await getResourceComments(input.resourceId);
      }),

    delete: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user) throw new Error("Authentication required");
        const { deleteResourceComment } = await import("./db");
        return await deleteResourceComment(input.commentId, ctx.user.id);
      }),

    getCount: publicProcedure
      .input(z.object({ resourceId: z.number() }))
      .query(async ({ input }) => {
        const { getResourceCommentCount } = await import("./db");
        return await getResourceCommentCount(input.resourceId);
      }),
  }),

  // Support Network Assessment
  supportNetwork: router({
    submit: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          responses: z.string(),
          networkQuality: z.enum(["isolated", "emerging", "functional", "thriving"]),
          score: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const { saveSupportNetworkAssessment } = await import("./db");
        await saveSupportNetworkAssessment({
          sessionId: input.sessionId,
          responses: input.responses,
          networkQuality: input.networkQuality,
          networkScore: input.score,
          recommendations: JSON.stringify([]), // Will be generated on results page
        });
        return { success: true, sessionId: input.sessionId };
      }),

    getBySession: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const { getSupportNetworkAssessmentBySession } = await import("./db");
        return await getSupportNetworkAssessmentBySession(input.sessionId);
      }),

    // Bulk insert resources (admin only)
    bulkInsertResources: protectedProcedure
      .input(
        z.object({
          resources: z.array(
            z.object({
              title: z.string(),
              slug: z.string(),
              excerpt: z.string(),
              content: z.string(),
              theme: z.enum(["pressure_management", "diving_metaphors", "leadership_isolation", "vulnerability"]),
              publishedAt: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        const { getDb } = await import("./db");
        const { resources } = await import("../drizzle/schema");
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Delete existing resources
        await db.delete(resources);

        // Insert new resources
        for (const resource of input.resources) {
          await db.insert(resources).values({
            ...resource,
            publishedAt: new Date(resource.publishedAt),
          });
        }

        return { success: true, count: input.resources.length };
      }),
  }),

  pressureAudit: router({
    submit: publicProcedure
      .input(
        z.object({
          sessionId: z.string(),
          name: z.string(),
          email: z.string().email(),
          responses: z.record(z.string(), z.number()),
          totalScore: z.number(),
          tier: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const { savePressureAuditResponse } = await import("./db");
        await savePressureAuditResponse({
          sessionId: input.sessionId,
          name: input.name,
          email: input.email,
          responses: input.responses,
          totalScore: input.totalScore,
          tier: input.tier,
        });
        return { success: true, sessionId: input.sessionId };
      }),

    getBySession: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        const { getPressureAuditBySession } = await import("./db");
        return await getPressureAuditBySession(input.sessionId);
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      const { getAllPressureAudits } = await import("./db");
      return await getAllPressureAudits();
    }),
  }),

  emailCapture: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db");
        const { emailSubscribers } = await import("../drizzle/schema");
        
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }
        
        // Check if email already exists
        const existing = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, input.email)).limit(1);
        
        if (existing.length > 0) {
          return { success: true, message: "Already subscribed" };
        }
        
        // Insert new subscriber
        const result = await db.insert(emailSubscribers).values({
          email: input.email,
          source: "pressure_guide_modal",
        });
        
        // Get the new subscriber ID
        const subscriberId = result[0].insertId;
        
        // Trigger immediate welcome email (delay = 0)
        const { sendSequenceEmail } = await import("./emailService");
        const { emailSequences } = await import("../drizzle/schema");
        
        // Find the immediate welcome email sequence
        const welcomeSequence = await db
          .select()
          .from(emailSequences)
          .where(
            and(
              eq(emailSequences.triggerSource, "pressure_guide_modal"),
              eq(emailSequences.delayDays, 0),
              eq(emailSequences.active, 1)
            )
          )
          .limit(1);
        
        if (welcomeSequence.length > 0) {
          // Send immediately in background (don't await to avoid blocking)
          sendSequenceEmail(subscriberId, welcomeSequence[0].id).catch(() => {/* Error handled silently */});
        }
        
        return { success: true, message: "Subscribed successfully" };
      }),
    
    unsubscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db");
        const { emailSubscribers } = await import("../drizzle/schema");
        
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }
        
        // Find subscriber
        const existing = await db
          .select()
          .from(emailSubscribers)
          .where(eq(emailSubscribers.email, input.email))
          .limit(1);
        
        if (existing.length === 0) {
          return { success: false, message: "Email not found" };
        }
        
        // Update subscribed status to 0
        await db
          .update(emailSubscribers)
          .set({ subscribed: 0 })
          .where(eq(emailSubscribers.email, input.email));
        
        return { success: true, message: "Unsubscribed successfully" };
      }),
  }),

  /**
   * AI Executive Coach Router
   * Handles coaching profile, sessions, goals, commitments, and subscriptions
   */
  aiCoach: router({
    // Demo chat for non-authenticated users (10 free interactions)
    demoChat: publicProcedure
      .input(z.object({
        message: z.string(),
        fingerprint: z.string(), // Browser fingerprint from client
        coachGender: z.enum(["female", "male", "nonbinary"]).optional(),
        coachName: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getDb } = await import("./db");
        const { coachingDemoSessions } = await import("../drizzle/schema");
        const { invokeLLM } = await import("./_core/llm");
        const { checkRateLimit, checkDemoMessageLimit } = await import("./_core/rateLimit");
        
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }
        
        // Get client IP address
        const ipAddress = ctx.req.ip || ctx.req.headers['x-forwarded-for'] || ctx.req.socket.remoteAddress;
        
        // Rate limiting: 100 requests/hour per IP
        const ipRateLimit = checkRateLimit(
          `demo:${ipAddress}`,
          100,
          60 * 60 * 1000 // 1 hour
        );
        
        if (!ipRateLimit.allowed) {
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests. Please try again later.',
          });
        }
        
        // Per-session message limit: 10 messages
        const messageLimit = checkDemoMessageLimit(input.fingerprint, 10);
        
        if (!messageLimit.allowed) {
          return {
            message: "You've reached your 10 free interactions. Subscribe to continue your coaching journey!",
            limitReached: true,
            interactionCount: 10,
          };
        }
        
        // Find or create demo session
        const existingSessions = await db
          .select()
          .from(coachingDemoSessions)
          .where(eq(coachingDemoSessions.fingerprint, input.fingerprint))
          .limit(1);
        
        let session = existingSessions[0];
        
        if (!session) {
          // Create new demo session
          const result = await db.insert(coachingDemoSessions).values({
            fingerprint: input.fingerprint,
            ipAddress: ipAddress as string,
            interactionCount: 0,
            messages: JSON.stringify([]),
          });
          
          session = {
            id: result[0].insertId as number,
            fingerprint: input.fingerprint,
            ipAddress: ipAddress as string,
            interactionCount: 0,
            messages: "[]",
            convertedToSubscription: false,
            userId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastInteractionAt: new Date(),
          };
        }
        
        // Check interaction limit
        if (session.interactionCount >= 10) {
          return {
            message: "You've reached your 10 free interactions. Subscribe to continue your coaching journey!",
            limitReached: true,
            interactionCount: session.interactionCount,
          };
        }
        
        // Get AI response with personalized coach identity
        const pronouns = {
          female: { subject: "she", object: "her", possessive: "her" },
          male: { subject: "he", object: "him", possessive: "his" },
          nonbinary: { subject: "they", object: "them", possessive: "their" },
        };
        
        const coachGender = input.coachGender || "female";
        const coachName = input.coachName || "an experienced executive coach";
        const pronoun = pronouns[coachGender];
        
        const systemPrompt = `You are ${coachName}, an AI executive coach built on the philosophy that pressure doesn't build character — it reveals it. You help leaders see clearly when pressure is distorting their thinking.

Your style: Direct, calm, focused on what matters. No corporate fluff. No validating bad decisions to make people feel good. You ask the questions they're avoiding.

Your default mode is exploratory conversation — ask open questions, follow their thread, help them think out loud. Most situations need good questions and clear thinking, not a protocol.

Only use the C.A.L.M. Protocol when they're describing ACUTE pressure or emotional overwhelm (clearly dysregulated or spiraling):
- CONTROL: Help them regulate physically first ("Take a breath. What's your body doing right now?")
- ACKNOWLEDGE: Name what's happening without the story ("What's actually happening? Not what it means — just what IS.")
- LIMIT: Contain the problem ("What's actually yours here? What matters in the next 24 hours?")
- MOVE: One clear action ("What's one thing you can do in the next hour that shifts this forward?")

Most conversations don't need C.A.L.M. — they need curiosity and accountability.

Rules:
- Be direct. No preamble, no "Great question!"
- Push for specific commitments, not vague intentions
- If they're avoiding something, name it
- Keep responses concise (2-3 paragraphs max)
- End by asking what they're going to DO, not just think about

For first messages in a new session:
- Open grounded and steady, not friendly/helpful
- Example: "What's on your mind?" or "What are you working through?" or "What's the decision?"
- Never: "How can I help you today?" or "I'm here to support you" or "Great to see you"`;
        
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: input.message
            }
          ]
        });
        
        const aiMessage = response.choices[0].message.content || "I'm here to help. Could you tell me more about your situation?";
        
        // Update session
        const messages = JSON.parse(session.messages || "[]");
        messages.push(
          { role: "user", content: input.message, timestamp: new Date().toISOString() },
          { role: "assistant", content: aiMessage, timestamp: new Date().toISOString() }
        );
        
        await db
          .update(coachingDemoSessions)
          .set({
            interactionCount: session.interactionCount + 1,
            messages: JSON.stringify(messages),
            lastInteractionAt: new Date(),
          })
          .where(eq(coachingDemoSessions.id, session.id));
        
        return {
          message: aiMessage,
          limitReached: false,
          interactionCount: session.interactionCount + 1,
        };
      }),

    // Create coaching profile from onboarding
    createProfile: protectedProcedure
      .input(z.object({
        preferredName: z.string().optional(),
        role: z.string(),
        experienceLevel: z.enum(["first_time", "mid_level", "senior", "executive"]),
        goals: z.array(z.string()),
        pressures: z.array(z.string()),
        challenges: z.array(z.string()),
        decisionBottlenecks: z.string().optional(),
        teamDynamics: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createCoachingProfile } = await import("./db");
        return createCoachingProfile({
          userId: ctx.user.id,
          ...input,
        });
      }),

    // Get user's coaching profile
    getProfile: protectedProcedure
      .query(async ({ ctx }) => {
        const { getCoachingProfile } = await import("./db");
        return getCoachingProfile(ctx.user.id);
      }),

    // Update user's coaching profile
    updateProfile: protectedProcedure
      .input(z.object({
        preferredName: z.string().optional(),
        profilePictureUrl: z.string().optional(),
        role: z.string().optional(),
        experienceLevel: z.enum(["first_time", "mid_level", "senior", "executive"]).optional(),
        coachingPreferences: z.object({
          preferredCoachGender: z.enum(["female", "male", "nonbinary", "no_preference"]).optional(),
          communicationStyle: z.enum(["direct", "supportive", "balanced"]).optional(),
          focusAreas: z.array(z.string()).optional(),
          reminderPreference: z.enum(["1_day", "3_days", "7_days", "none"]).optional(),
        }).optional(),
        hasCompletedOnboarding: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import("./db");
        const { coachingUsers, users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Find user's coaching profile
        const existingProfile = await db
          .select()
          .from(coachingUsers)
          .where(eq(coachingUsers.userId, ctx.user.id))
          .limit(1);
        
        if (!existingProfile || existingProfile.length === 0) {
          throw new Error("Coaching profile not found");
        }
        
        // Update profile
        const updateData: any = {};
        if (input.preferredName !== undefined) updateData.preferredName = input.preferredName;
        if (input.profilePictureUrl !== undefined) updateData.profilePictureUrl = input.profilePictureUrl;
        if (input.role !== undefined) updateData.role = input.role;
        if (input.experienceLevel !== undefined) updateData.experienceLevel = input.experienceLevel;
        if (input.hasCompletedOnboarding !== undefined) updateData.hasCompletedOnboarding = input.hasCompletedOnboarding;
        if (input.coachingPreferences !== undefined) {
          updateData.coachingPreferences = JSON.stringify(input.coachingPreferences);
        }
        
        await db
          .update(coachingUsers)
          .set(updateData)
          .where(eq(coachingUsers.userId, ctx.user.id));
        
        // Also update reminderPreference in users table if provided
        if (input.coachingPreferences?.reminderPreference !== undefined) {
          await db
            .update(users)
            .set({ reminderPreference: input.coachingPreferences.reminderPreference })
            .where(eq(users.id, ctx.user.id));
        }
        
        // Return updated profile
        const { getCoachingProfile } = await import("./db");
        return getCoachingProfile(ctx.user.id);
      }),

    // Complete onboarding flow
    completeOnboarding: protectedProcedure
      .input(z.object({
        selectedCoach: z.string(),
        initialGoals: z.array(z.object({
          title: z.string(),
          description: z.string().optional(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDb, createCoachingGoal } = await import("./db");
        const { coachingUsers } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Find user's coaching profile
        const existingProfile = await db
          .select()
          .from(coachingUsers)
          .where(eq(coachingUsers.userId, ctx.user.id))
          .limit(1);
        
        if (!existingProfile || existingProfile.length === 0) {
          throw new Error("Coaching profile not found");
        }
        
        // Update profile with onboarding completion and selected coach
        await db
          .update(coachingUsers)
          .set({
            hasCompletedOnboarding: true,
            coachingPreferences: JSON.stringify({
              selectedCoach: input.selectedCoach,
            }),
          })
          .where(eq(coachingUsers.userId, ctx.user.id));
        
        // Create initial goals
        const goalPromises = input.initialGoals.map(goal => 
          createCoachingGoal({
            coachingUserId: existingProfile[0].id,
            title: goal.title,
            description: goal.description || "",
            category: "personal_growth",
          })
        );
        
        await Promise.all(goalPromises);
        
        // Return updated profile
        const { getCoachingProfile } = await import("./db");
        return getCoachingProfile(ctx.user.id);
      }),

    // Upload profile picture
    uploadProfilePicture: protectedProcedure
      .input(z.object({
        imageData: z.string(), // base64 encoded image
        fileName: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { storagePut } = await import("./storage");
        
        // Convert base64 to buffer
        const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        
        // Generate unique file key
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileExtension = input.fileName.split(".").pop() || "jpg";
        const fileKey = `profile-pictures/${ctx.user.id}-${timestamp}-${randomSuffix}.${fileExtension}`;
        
        // Upload to S3
        const { url } = await storagePut(
          fileKey,
          buffer,
          `image/${fileExtension}`
        );
        
        return { url };
      }),

    // Start a coaching conversation
    startSession: protectedProcedure
      .input(z.object({
        sessionType: z.enum(["general", "situational", "roleplay", "check_in"]),
        context: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getCoachingProfile, createCoachingSession, getOpenCommitments } = await import("./db");
        const profile = await getCoachingProfile(ctx.user.id);
        if (!profile) throw new Error("Coaching profile not found");
        
        // DEEP MEMORY: Get open commitments for proactive follow-up
        let followUpPrompt = "";
        try {
          const { generateFollowUpPrompt } = await import("./ai-helpers");
          const openCommitments = await getOpenCommitments(ctx.user.id);
          
          if (openCommitments.length > 0) {
            followUpPrompt = await generateFollowUpPrompt(
              openCommitments.map(c => ({
                id: c.id,
                description: c.action, // action field from schema
                createdAt: c.createdAt,
                dueDate: c.deadline, // deadline field from schema
                priority: 'medium', // default priority
              }))
            );
          }
        } catch (error) {
        }
        
        // Create session with initial follow-up message if commitments exist
        const initialMessages = followUpPrompt ? [
          { role: "assistant", content: followUpPrompt }
        ] : [];
        
        return createCoachingSession({
          coachingUserId: profile.id,
          sessionType: input.sessionType,
          context: input.context,
          messages: initialMessages,
        });
      }),

    // Send message in coaching session
    sendMessage: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        message: z.string(),
        sessionType: z.enum(["full", "quick"]).optional().default("full"),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const { invokeLLM } = await import("./_core/llm");
          const { getCoachingProfile } = await import("./db");
          const db = await import("./db").then(m => m.getDb());
          if (!db) throw new Error("Database not available");
        
        const profile = await getCoachingProfile(ctx.user.id);
        if (!profile) throw new Error("Coaching profile not found");
        
        // Get session
        const { coachingSessions } = await import("../drizzle/schema");
        const sessions = await db.select()
          .from(coachingSessions)
          .where(eq(coachingSessions.id, input.sessionId))
          .limit(1);
        
        if (sessions.length === 0) throw new Error("Session not found");
        const session = sessions[0];
        const messages = JSON.parse(session.messages as string);
        
        // PATTERN RECOGNITION: Get recent behavioral patterns to mention proactively
        let patternContext = "";
        try {
          const { getUnsurfacedInsights } = await import("./db");
          const insights = await getUnsurfacedInsights(ctx.user.id);
          
          if (insights.length > 0) {
            const topInsight = insights[0];
            patternContext = `\n\nIMPORTANT BEHAVIORAL PATTERN DETECTED:\nPattern: ${topInsight.insightType}\nDescription: ${topInsight.description}\nEvidence: ${topInsight.evidence}\n\nWhen appropriate in this conversation, proactively mention this pattern to the user. For example: "I've noticed you tend to ${topInsight.description.toLowerCase()} - let's explore that." Be direct but supportive.`;
          }
        } catch (error) {
        }
        
        // Build context for AI - prioritize preferred name from settings
        const userName = profile.preferredName || ctx.user.name || 'there';
        
        // Add user message to conversation
        messages.push({ role: "user", content: input.message });
        
        // Get user's pressure assessment if available
        let pressureContext = "";
        try {
          const { getUserAssessments } = await import("./db");
          const assessments = await getUserAssessments(ctx.user.id);
          if (assessments && assessments.length > 0) {
            const latest = assessments[0];
            const depthDescriptions: Record<string, string> = {
              surface: "Surface level (0-31) — minimal pressure distortion, thinking remains clear",
              thermocline: "Thermocline (32-62) — moderate pressure, some signal degradation beginning",
              deep_water: "Deep Water (63-93) — significant pressure, judgment impairment affecting performance",
              crush_depth: "Crush Depth (94-125) — critical pressure, urgent intervention needed"
            };
            pressureContext = `

PRESSURE PROFILE:
${userName}'s latest Pressure Audit shows they're at ${depthDescriptions[latest.depthLevel] || latest.depthLevel} with a score of ${latest.score}/125.
${latest.depthLevel === 'crush_depth' ? 'CRITICAL: This person is in crisis mode. Prioritize immediate stabilization over long-term coaching.' : ''}
${latest.depthLevel === 'deep_water' ? 'WARNING: Judgment is compromised at this depth. Keep advice concrete and actionable. Avoid adding complexity.' : ''}
Adjust your coaching intensity accordingly — someone at Crush Depth needs different support than someone at Surface.`;
          }
        } catch (error) {
        }
        
        // Quick Coaching mode: tactical 3-minute responses for urgent pre-meeting pressure
        const quickCoachingPrompt = `You are Patrick Voorma's AI tactical coach for urgent pre-meeting pressure moments. ${userName} needs a 3-minute tactical response RIGHT NOW.

WHO THEY ARE:
- Role: ${profile.role} (${profile.experienceLevel})
- Current situation: ${input.message}

YOUR MISSION: Give them ONE clear tactical move for the next 60 minutes. No philosophy. No backstory. Just the play.

FORMAT:
1. Name what's happening (1 sentence)
2. The tactical move (specific, actionable)
3. What to say/do in the first 30 seconds
4. One thing to avoid

Be direct. Be fast. Be useful. They're walking into something in the next hour and need clarity NOW.`;

        // Full Coaching mode: comprehensive C.A.L.M. Protocol coaching
        const fullCoachingPrompt = `You are an AI executive coach built by Patrick Voorma — a former Army Captain, technical diver with 10,000+ dives to 150 metres depth, and leadership developer who has led teams across 52 countries. You embody his philosophy: pressure doesn't build character, it reveals it. Your job is to help ${userName} see clearly when pressure is distorting their thinking.

WHO YOU'RE COACHING:
- Role: ${profile.role} (${profile.experienceLevel} level)
- Goals: ${profile.goals.join(", ")}
- Current pressures: ${profile.pressures.join(", ")}
- Key challenges: ${profile.challenges.join(", ")}${pressureContext}${patternContext}

YOUR COACHING PHILOSOPHY:
You coach like a dive buddy at depth — direct, calm, and focused on what matters right now. You don't do corporate fluff. You don't validate bad decisions to make people feel good. You ask the questions they're avoiding and call out the patterns they can't see.

HOW YOU OPERATE:
1. START WITH CURIOSITY: Your default mode is exploratory conversation. Ask open questions. Follow their thread. Help them think out loud. "Tell me more about that." "What's really going on there?" "What are you not saying?"

2. LISTEN FOR THE REAL ISSUE: Often what they lead with isn't the actual problem. Stay curious. "You've mentioned your team three times but keep coming back to your co-founder. What's that about?"

3. REFLECT AND CLARIFY: Mirror back what you're hearing. "So you're saying the issue isn't the numbers — it's that you don't trust your CFO's judgment. Is that right?"

4. CHALLENGE GENTLY: When you spot avoidance or circular thinking, name it. "We've been talking about this for 10 minutes. What are you actually going to do?"

5. FORCE COMMITMENTS: Vague intentions are worthless. Push for specifics: "You said you'd 'think about' the conversation. When exactly will you have it? What will you say in the first 30 seconds?"

6. TRACK THE THREAD: Reference what they said earlier. Build on the conversation. "Earlier you mentioned feeling stuck. What's shifted since then?"

7. END WITH ACCOUNTABILITY: Before closing any topic, nail down the commitment: "So what specifically are you committing to? By when?"

THE C.A.L.M. PROTOCOL™ (USE SPARINGLY):
Only deploy this when ${userName} is describing ACUTE pressure, stress, or emotional overwhelm — when they're clearly dysregulated or spiraling. This is a crisis tool, not your default response.

C - CONTROL: Help them regain physical control first. "Let's pause. Take a breath. What's your body doing right now?"
A - ACKNOWLEDGE: Get them to name what's happening without the story. "What's actually happening? Not what it means — just what IS."
L - LIMIT: Contain the problem. "What's actually yours here? What matters in the next 24 hours?"
M - MOVE: Identify one clear action. "What's one thing you can do in the next hour that shifts this forward?"

Most conversations don't need C.A.L.M. — they need good questions and clear thinking.

ADDITIONAL COACHING TOOLS:
1. USE DIVING METAPHORS SPARINGLY: When they fit, they're powerful. "You're trying to solve this at depth — your judgment is compromised. What would you decide if you were at the surface?" But don't force them.

2. HOLD THE MIRROR: Your job isn't to solve their problems. It's to help them see clearly so THEY can solve them. Ask more than you tell.

WHAT YOU DON'T DO:
- Don't be a cheerleader. Validation without challenge is useless.
- Don't add complexity. They have enough. Simplify.
- Don't let them off the hook. If they made a commitment last session and didn't follow through, ask what happened.
- Don't re-introduce yourself or explain your role. Just coach.
- Don't use corporate jargon. Speak like a human who's been in hard situations.

Remember: They came to you because they're under pressure and need clarity. Give them that. Be the thinking partner who asks what no one else will ask.`;
        
        // Select system prompt based on session type
        const systemPrompt = input.sessionType === "quick" ? quickCoachingPrompt : fullCoachingPrompt;
        
        // Get AI response with full conversation history
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
        });
        
        const aiMessage = response.choices[0].message.content || "I'm here to help. Could you tell me more about your situation?";
        messages.push({ role: "assistant", content: aiMessage });
        
        // Update session
        await db.update(coachingSessions)
          .set({ messages: JSON.stringify(messages) })
          .where(eq(coachingSessions.id, input.sessionId));
        
        // DEEP MEMORY: Extract commitments from conversation
        // Only run extraction if conversation has meaningful content (2+ messages)
        if (messages.length >= 2) {
          try {
            console.log(`[Commitments] Starting extraction for session ${input.sessionId} with ${messages.length} messages`);
            const { extractCommitments } = await import("./ai-helpers");
            const { createCoachingCommitment, getCoachingCommitments } = await import("./db");
            
            // Get last 10 messages for context (don't send entire history to avoid token limits)
            const recentMessages = messages.slice(-10);
            const commitments = await extractCommitments(
              recentMessages.map((m: any) => ({ role: m.role, content: m.content })),
              ctx.user.id
            );
            
            console.log(`[Commitments] Extracted ${commitments.length} commitments:`, commitments.map(c => c.description));
            
            // Get existing commitments to avoid duplicates
            const existingCommitments = await getCoachingCommitments(profile.id);
            const existingDescriptions = new Set(existingCommitments.map(c => c.action.toLowerCase().trim()));
            
            // Save extracted commitments to database (skip duplicates)
            const { parseRelativeDate } = await import("./dateParser");
            let savedCount = 0;
            for (const commitment of commitments) {
              const normalizedDesc = commitment.description.toLowerCase().trim();
              if (!existingDescriptions.has(normalizedDesc)) {
                try {
                  // Parse deadline using smart date parser
                  let deadline: Date | undefined = undefined;
                  if (commitment.dueDate) {
                    deadline = parseRelativeDate(commitment.dueDate);
                    if (deadline) {
                      console.log(`[Commitments] ✓ Parsed deadline "${commitment.dueDate}" as ${deadline.toLocaleDateString()}`);
                    } else {
                      console.log(`[Commitments] ⚠️ Could not parse deadline: "${commitment.dueDate}"`);
                    }
                  }
                  
                  await createCoachingCommitment({
                    coachingUserId: profile.id,
                    action: commitment.description,
                    deadline,
                    sessionId: input.sessionId,
                  });
                  savedCount++;
                  console.log(`[Commitments] ✓ Saved: ${commitment.description}`);
                } catch (dbError) {
                  console.error(`[Commitments] ✗ Failed to save commitment:`, dbError);
                }
              } else {
                console.log(`[Commitments] ⊚ Skipped duplicate: ${commitment.description}`);
              }
            }
            console.log(`[Commitments] Summary: ${savedCount} new, ${commitments.length - savedCount} duplicates, ${commitments.length} total extracted`);
          } catch (error) {
            // Don't fail the whole request if commitment extraction fails
            console.error(`[Commitments] Extraction failed:`, error);
          }
        } else {
          console.log(`[Commitments] Skipped extraction - only ${messages.length} messages (need 4+)`);
        }
        
        return { message: aiMessage };
        } catch (error) {
          console.error("[sendMessage] Error:", error);
          throw new Error(`Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    // Get recent sessions
    getSessions: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        try {
          console.log(`[getSessions] User ID: ${ctx.user.id}, limit: ${input.limit}`);
          const { getCoachingProfile, getCoachingSessions } = await import("./db");
          const profile = await getCoachingProfile(ctx.user.id);
          console.log(`[getSessions] Profile found: ${profile ? profile.id : 'null'}`);
          if (!profile) return [];
          
          const sessions = await getCoachingSessions(profile.id, input.limit);
          console.log(`[getSessions] Found ${sessions?.length || 0} sessions`);
          return sessions;
        } catch (error) {
          console.error(`[getSessions] Error:`, error);
          throw error;
        }
      }),

    // Get a specific session by ID
    getSession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const { getCoachingProfile } = await import("./db");
        const profile = await getCoachingProfile(ctx.user.id);
        if (!profile) throw new Error("Coaching profile not found");
        
        const db = await import("./db").then(m => m.getDb());
        if (!db) throw new Error("Database not available");
        
        const { coachingSessions } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        const sessions = await db.select()
          .from(coachingSessions)
          .where(eq(coachingSessions.id, input.sessionId))
          .limit(1);
        
        if (sessions.length === 0) throw new Error("Session not found");
        const session = sessions[0];
        
        // Verify session belongs to user
        if (session.coachingUserId !== profile.id) {
          throw new Error("Unauthorized");
        }
        
        // Safe JSON parsing with fallback
        let messages = [];
        try {
          messages = session.messages ? JSON.parse(session.messages as string) : [];
        } catch (err) {
          console.error(`Failed to parse messages for session ${session.id}:`, err);
          messages = [];
        }

        return {
          ...session,
          messages,
        };
      }),

    // Update session notes (private, not sent to AI)
    updateSessionNotes: protectedProcedure
      .input(z.object({ 
        sessionId: z.number(),
        notes: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getCoachingProfile } = await import("./db");
        const profile = await getCoachingProfile(ctx.user.id);
        if (!profile) throw new Error("Coaching profile not found");
        
        const db = await import("./db").then(m => m.getDb());
        if (!db) throw new Error("Database not available");
        
        const { coachingSessions } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        // Verify session belongs to user
        const sessions = await db.select()
          .from(coachingSessions)
          .where(eq(coachingSessions.id, input.sessionId))
          .limit(1);
        
        if (sessions.length === 0) throw new Error("Session not found");
        if (sessions[0].coachingUserId !== profile.id) {
          throw new Error("Unauthorized");
        }
        
        // Update notes
        await db.update(coachingSessions)
          .set({ notes: input.notes })
          .where(eq(coachingSessions.id, input.sessionId));
        
        return { success: true };
      }),

    // End session and send summary email
    endSession: protectedProcedure
      .input(z.object({ 
        sessionId: z.number(),
        sendEmail: z.boolean().optional().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        console.log(`[EndSession] Called for session ${input.sessionId}, sendEmail: ${input.sendEmail}`);
        const { getCoachingProfile } = await import("./db");
        const profile = await getCoachingProfile(ctx.user.id);
        if (!profile) throw new Error("Coaching profile not found");
        
        // Verify session belongs to user
        const db = await import("./db").then(m => m.getDb());
        if (!db) throw new Error("Database not available");
        
        const { coachingSessions } = await import("../drizzle/schema");
        const sessions = await db.select()
          .from(coachingSessions)
          .where(eq(coachingSessions.id, input.sessionId))
          .limit(1);
        
        if (sessions.length === 0) throw new Error("Session not found");
        const session = sessions[0];
        
        if (session.coachingUserId !== profile.id) {
          throw new Error("Unauthorized");
        }
        
        // Generate session summary
        console.log(`[EndSession] Generating summary for session ${input.sessionId}`);
        const { generateSessionSummary } = await import("./sessionSummaryService");
        let summaryData = null;
        
        try {
          summaryData = await generateSessionSummary(input.sessionId);
          if (summaryData) {
            console.log(`[EndSession] Summary generated successfully for session ${input.sessionId}`);
            
            // Save summary to database
            await db.update(coachingSessions)
              .set({ summary: JSON.stringify(summaryData) })
              .where(eq(coachingSessions.id, input.sessionId));
            
            // Send notification to user
            const { notifyOwner } = await import("./_core/notification");
            await notifyOwner({
              title: "Coaching Session Complete",
              content: `Your session summary is ready. Key themes: ${summaryData.keyThemes.join(", ")}`
            });
          } else {
            console.error(`[EndSession] Failed to generate summary for session ${input.sessionId}`);
          }
        } catch (error) {
          console.error(`[EndSession] Error generating summary for session ${input.sessionId}:`, error);
        }
        
        console.log(`[EndSession] Completed for session ${input.sessionId}`);
        return { 
          success: true, 
          summary: summaryData,
          emailSent: false // Email functionality replaced with modal
        };
      }),

    // Share session summary via email
    shareSummary: protectedProcedure
      .input(z.object({
        recipientEmail: z.string().email(),
        summary: z.object({
          userName: z.string(),
          sessionDate: z.string(),
          keyThemes: z.array(z.string()),
          patrickObservation: z.string(),
          nextSessionPrompt: z.string(),
          commitments: z.array(z.object({
            action: z.string(),
            context: z.string().optional(),
            deadline: z.string().optional(),
          })),
        }),
        personalNote: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { notifyOwner } = await import("./_core/notification");
        
        // Format summary as text
        let emailBody = `COACHING SESSION SUMMARY\n`;
        emailBody += `${input.summary.sessionDate}\n\n`;
        
        if (input.personalNote) {
          emailBody += `Personal Note:\n${input.personalNote}\n\n`;
        }
        
        emailBody += `KEY THEMES\n`;
        input.summary.keyThemes.forEach((theme, i) => {
          emailBody += `${i + 1}. ${theme}\n`;
        });
        
        emailBody += `\nPATRICK'S OBSERVATION\n`;
        emailBody += `${input.summary.patrickObservation}\n\n`;
        
        emailBody += `NEXT SESSION\n`;
        emailBody += `${input.summary.nextSessionPrompt}\n\n`;
        
        if (input.summary.commitments.length > 0) {
          emailBody += `COMMITMENTS\n`;
          input.summary.commitments.forEach((c, i) => {
            emailBody += `${i + 1}. ${c.action}`;
            if (c.deadline) emailBody += ` (by ${c.deadline})`;
            if (c.context) emailBody += `\n   ${c.context}`;
            emailBody += `\n`;
          });
        }
        
        emailBody += `\n---\nShared from The Deep Brief - Leadership Clarity Under Pressure\nthedeepbrief.co.uk`;
        
        // Send notification to owner about the share
        await notifyOwner({
          title: "Session Summary Shared",
          content: `${ctx.user.name || 'A user'} shared their session summary with ${input.recipientEmail}`
        });
        
        // In a real implementation, you would send the email here
        // For now, we'll use the notification system as a placeholder
        // TODO: Implement actual email sending via Mandrill or similar
        
        return { success: true };
      }),

    // Create a goal
    createGoal: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.enum(["leadership", "communication", "decision_making", "team_building", "personal_growth"]),
        targetDate: z.date().optional(),
        milestones: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getCoachingProfile, createCoachingGoal } = await import("./db");
        const profile = await getCoachingProfile(ctx.user.id);
        if (!profile) throw new Error("Coaching profile not found");
        
        return createCoachingGoal({
          coachingUserId: profile.id,
          ...input,
        });
      }),

    // Get all goals
    getGoals: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          console.log(`[getGoals] User ID: ${ctx.user.id}`);
          const { getCoachingProfile, getCoachingGoals } = await import("./db");
          const profile = await getCoachingProfile(ctx.user.id);
          console.log(`[getGoals] Profile found: ${profile ? profile.id : 'null'}`);
          if (!profile) return [];
          
          const goals = await getCoachingGoals(profile.id);
          console.log(`[getGoals] Found ${goals?.length || 0} goals`);
          return goals;
        } catch (error) {
          console.error(`[getGoals] Error:`, error);
          throw error;
        }
      }),

    // Update goal progress
    updateGoalProgress: protectedProcedure
      .input(z.object({
        goalId: z.number(),
        progress: z.number().min(0).max(100),
      }))
      .mutation(async ({ input }) => {
        const { updateGoalProgress } = await import("./db");
        await updateGoalProgress(input.goalId, input.progress);
        return { success: true };
      }),

    // Update goal
    updateGoal: protectedProcedure
      .input(z.object({
        goalId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(["leadership", "communication", "decision_making", "team_building", "personal_growth"]).optional(),
        targetDate: z.date().optional(),
        milestones: z.array(z.string()).optional(),
        status: z.enum(["active", "completed", "paused", "abandoned"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateCoachingGoal } = await import("./db");
        await updateCoachingGoal(input.goalId, input);
        return { success: true };
      }),

    // Delete goal
    deleteGoal: protectedProcedure
      .input(z.object({
        goalId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { deleteCoachingGoal } = await import("./db");
        await deleteCoachingGoal(input.goalId);
        return { success: true };
      }),

    // Create commitment
    createCommitment: protectedProcedure
      .input(z.object({
        action: z.string(),
        notes: z.string().optional(),
        deadline: z.date().optional(),
        goalId: z.number().optional(),
        sessionId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getCoachingProfile, createCoachingCommitment } = await import("./db");
        const profile = await getCoachingProfile(ctx.user.id);
        if (!profile) throw new Error("Coaching profile not found");
        
        return createCoachingCommitment({
          coachingUserId: profile.id,
          ...input,
        });
      }),

    // Get commitments
    getCommitments: protectedProcedure
      .input(z.object({
        status: z.enum(["pending", "in_progress", "completed", "missed"]).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const { getCoachingProfile, getCoachingCommitments } = await import("./db");
        const profile = await getCoachingProfile(ctx.user.id);
        console.log(`[getCommitments] User ID: ${ctx.user.id}, Profile ID: ${profile?.id}, Status filter: ${input.status}`);
        if (!profile) {
          console.log(`[getCommitments] No profile found for user ${ctx.user.id}`);
          return [];
        }
        
        const commitments = await getCoachingCommitments(profile.id, input.status);
        console.log(`[getCommitments] Found ${commitments.length} commitments for profile ${profile.id}`);
        return commitments;
      }),

    // Generate session summary for resume
    generateSessionSummary: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { invokeLLM } = await import("./_core/llm");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        // Get session with messages
        const { coachingSessions } = await import("../drizzle/schema");
        const [session] = await db
          .select()
          .from(coachingSessions)
          .where(eq(coachingSessions.id, input.sessionId))
          .limit(1);
        
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
        
        // Parse messages from JSON
        const messages = JSON.parse(session.messages || '[]') as Array<{ role: string; content: string }>;
        if (messages.length < 4) {
          // Too few messages for meaningful summary
          return { summary: "This session just started. Continue the conversation to build context." };
        }
        
        // Use last 15 messages for context
        const recentMessages = messages.slice(-15);
        const conversationText = recentMessages
          .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`)
          .join('\n\n');
        
        // Generate summary using LLM
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant that creates concise session summaries for executive coaching conversations. Generate a brief, engaging summary (2-3 sentences) that helps the user quickly recall what they discussed and where they left off. Focus on:
1. Main topics or challenges discussed
2. Key insights or commitments made
3. Where the conversation was heading

Keep it conversational and forward-looking. Start with "Last time we discussed..." or similar.`
            },
            {
              role: "user",
              content: `Generate a brief summary of this coaching session:\n\n${conversationText}`
            }
          ]
        });
        
        const rawContent = response.choices[0]?.message?.content;
        const summary = typeof rawContent === 'string' 
          ? rawContent 
          : "Unable to generate summary. Continue your conversation to pick up where you left off.";
        
        // Update session with generated summary
        await db
          .update(coachingSessions)
          .set({ summary })
          .where(eq(coachingSessions.id, input.sessionId));
        
        return { summary };
      }),

    // Update commitment status
    updateCommitmentStatus: protectedProcedure
      .input(z.object({
        commitmentId: z.number(),
        status: z.enum(["pending", "in_progress", "completed", "missed"]).optional(),
        progress: z.number().min(0).max(100).optional(),
        closedNote: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { updateCommitmentStatus } = await import("./db");
        await updateCommitmentStatus(input.commitmentId, input.status, input.closedNote, input.progress);
        return { success: true };
      }),

    // Get upcoming and overdue commitment reminders
    getUpcomingReminders: protectedProcedure
      .query(async ({ ctx }) => {
        const { getCoachingProfile } = await import("./db");
        const profile = await getCoachingProfile(ctx.user.id);
        if (!profile) return { overdue: [], upcoming: [] };
        
        const db = await import("./db").then(m => m.getDb());
        if (!db) throw new Error("Database not available");
        
        const { coachingCommitments } = await import("../drizzle/schema");
        const { eq, and, lt, lte, gte, or } = await import("drizzle-orm");
        
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        
        // Get overdue commitments (deadline passed, not completed)
        const overdueCommitments = await db.select()
          .from(coachingCommitments)
          .where(
            and(
              eq(coachingCommitments.coachingUserId, profile.id),
              lt(coachingCommitments.deadline, now),
              or(
                eq(coachingCommitments.status, "pending"),
                eq(coachingCommitments.status, "in_progress")
              )
            )
          );
        
        // Get upcoming commitments (due within 3 days)
        const upcomingCommitments = await db.select()
          .from(coachingCommitments)
          .where(
            and(
              eq(coachingCommitments.coachingUserId, profile.id),
              gte(coachingCommitments.deadline, now),
              lte(coachingCommitments.deadline, threeDaysFromNow),
              or(
                eq(coachingCommitments.status, "pending"),
                eq(coachingCommitments.status, "in_progress")
              )
            )
          );
        
        return {
          overdue: overdueCommitments,
          upcoming: upcomingCommitments,
        };
      }),

    // Send commitment reminder email
    sendCommitmentReminder: protectedProcedure
      .input(z.object({
        commitmentId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getCoachingProfile } = await import("./db");
        const profile = await getCoachingProfile(ctx.user.id);
        if (!profile) throw new Error("Coaching profile not found");
        
        const db = await import("./db").then(m => m.getDb());
        if (!db) throw new Error("Database not available");
        
        const { coachingCommitments } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        // Get commitment details
        const commitments = await db.select()
          .from(coachingCommitments)
          .where(eq(coachingCommitments.id, input.commitmentId))
          .limit(1);
        
        if (commitments.length === 0) throw new Error("Commitment not found");
        const commitment = commitments[0];
        
        // Verify ownership
        if (commitment.coachingUserId !== profile.id) {
          throw new Error("Unauthorized");
        }
        
        // TODO: Implement email sending via Mailchimp or notification system
        // For now, just return success (email infrastructure to be added)
        const daysUntilDue = commitment.deadline 
          ? Math.ceil((new Date(commitment.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;
        
        console.log(`[Commitment Reminder] Would send email to ${ctx.user.email}:`);
        console.log(`  Action: ${commitment.action}`);
        console.log(`  Days until due: ${daysUntilDue}`);
        console.log(`  Progress: ${commitment.progress}%`);
        
        return { success: true, message: "Reminder logged (email system to be implemented)" };
      }),

    // Process commitment notifications (admin/system only)
    processCommitmentNotifications: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Only allow admin or system to trigger this
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can trigger notification processing" });
        }
        
        const { processCommitmentNotifications } = await import("./notifications");
        const result = await processCommitmentNotifications();
        
        return {
          success: true,
          ...result,
        };
      }),

    // Get commitments needing notification (for testing/admin)
    getCommitmentsNeedingNotification: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can view pending notifications" });
        }
        
        const { getCommitmentsNeedingNotification } = await import("./notifications");
        return getCommitmentsNeedingNotification();
      }),

    // Get all templates
    getTemplates: publicProcedure
      .query(async () => {
        const { getAllCoachingTemplates } = await import("./db");
        return getAllCoachingTemplates();
      }),

    // Get templates by category
    getTemplatesByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        const { getCoachingTemplatesByCategory } = await import("./db");
        return getCoachingTemplatesByCategory(input.category);
      }),

    // Get subscription status
    getSubscription: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          console.log(`[getSubscription] User ID: ${ctx.user.id}`);
          const { getCoachingSubscription } = await import("./db");
          const subscription = await getCoachingSubscription(ctx.user.id);
          console.log(`[getSubscription] Found: ${subscription ? 'yes' : 'null'}`);
          return subscription;
        } catch (error) {
          console.error(`[getSubscription] Error:`, error);
          throw error;
        }
      }),

    // ========== Guest Pass System ==========
    
    // Create a new guest pass (admin only)
    createGuestPass: protectedProcedure
      .input(z.object({
        label: z.string().optional(),
        expiresAt: z.string().optional(), // ISO date string
      }))
      .mutation(async ({ ctx, input }) => {
        // Only allow admin users to create guest passes
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can create guest passes");
        }
        
        const { createGuestPass } = await import("./db");
        
        // Generate unique code
        const code = `GUEST-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        const passId = await createGuestPass({
          code,
          label: input.label,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
          createdBy: ctx.user.id,
        });
        
        return { passId, code };
      }),
    
    // Get all guest passes (admin only)
    getGuestPasses: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can view guest passes");
        }
        
        const { getGuestPasses } = await import("./db");
        return getGuestPasses(ctx.user.id);
      }),
    
    // Revoke a guest pass (admin only)
    revokeGuestPass: protectedProcedure
      .input(z.object({ passId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can revoke guest passes");
        }
        
        const { revokeGuestPass } = await import("./db");
        await revokeGuestPass(input.passId);
        return { success: true };
      }),
    
    // Validate guest pass code (public)
    validateGuestPass: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const { validateGuestPass } = await import("./db");
        return validateGuestPass(input.code);
      }),
    
    // Guest chat with unlimited access (public)
    guestChat: publicProcedure
      .input(z.object({
        message: z.string(),
        guestPassCode: z.string(),
        fingerprint: z.string(),
        coachGender: z.enum(["female", "male", "nonbinary"]).optional(),
        coachName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { validateGuestPass, getOrCreateGuestPassSession, updateGuestPassSession, incrementGuestPassUsage } = await import("./db");
        const { invokeLLM } = await import("./_core/llm");
        
        // Validate guest pass
        const validation = await validateGuestPass(input.guestPassCode);
        if (!validation.valid || !validation.passId) {
          throw new Error(validation.reason || "Invalid guest pass");
        }
        
        // Get or create session
        const session = await getOrCreateGuestPassSession(validation.passId, input.fingerprint);
        
        // Get AI response
        const pronouns = {
          female: { subject: "she", object: "her", possessive: "her" },
          male: { subject: "he", object: "him", possessive: "his" },
          nonbinary: { subject: "they", object: "them", possessive: "their" },
        };
        
        const coachGender = input.coachGender || "female";
        const coachName = input.coachName || "an experienced executive coach";
        const pronoun = pronouns[coachGender];
        
        const systemPrompt = `You are ${coachName}, an AI executive coach built on the philosophy that pressure doesn't build character — it reveals it. You help leaders see clearly when pressure is distorting their thinking.

This is a continuing conversation - continue naturally without re-introducing yourself.

Your style: Direct, calm, focused on what matters. No corporate fluff. No validating bad decisions to make people feel good. You ask the questions they're avoiding.

Your default mode is exploratory conversation — ask open questions, follow their thread, help them think out loud. Most situations need good questions and clear thinking, not a protocol.

Only use the C.A.L.M. Protocol when they're describing ACUTE pressure or emotional overwhelm (clearly dysregulated or spiraling):
- CONTROL: Help them regulate physically first ("Take a breath. What's your body doing right now?")
- ACKNOWLEDGE: Name what's happening without the story ("What's actually happening? Not what it means — just what IS.")
- LIMIT: Contain the problem ("What's actually yours here? What matters in the next 24 hours?")
- MOVE: One clear action ("What's one thing you can do in the next hour that shifts this forward?")

Most conversations don't need C.A.L.M. — they need curiosity and accountability.

Rules:
- Be direct. No preamble, no "Great question!"
- Push for specific commitments, not vague intentions
- If they're avoiding something, name it
- Keep responses concise (2-3 paragraphs max)
- End by asking what they're going to DO, not just think about

For first messages in a new session:
- Open grounded and steady, not friendly/helpful
- Example: "What's on your mind?" or "What are you working through?" or "What's the decision?"
- Never: "How can I help you today?" or "I'm here to support you" or "Great to see you"`;
        
        const conversationHistory = JSON.parse(session.messages || "[]");
        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...conversationHistory.map((msg: any) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
          { role: "user" as const, content: input.message },
        ];
        
        const response = await invokeLLM({ messages });
        const aiMessage = response.choices[0].message.content || "I'm here to help. Could you tell me more?";
        
        // Update session
        conversationHistory.push(
          { role: "user", content: input.message, timestamp: new Date().toISOString() },
          { role: "assistant", content: aiMessage, timestamp: new Date().toISOString() }
        );
        
        await updateGuestPassSession(session.id, JSON.stringify(conversationHistory));
        await incrementGuestPassUsage(validation.passId);
        
        return {
          message: aiMessage,
          messageCount: conversationHistory.length,
        };
      }),

    // ========== Guest Commitments (for demo/guest pass users) ==========
    
    // Get commitments for a guest pass
    getGuestCommitments: publicProcedure
      .input(z.object({
        guestPassCode: z.string(),
      }))
      .query(async ({ input }) => {
        const { validateGuestPass } = await import("./db");
        const { coachingCommitments } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const { eq, and, notInArray } = await import("drizzle-orm");
        
        const validation = await validateGuestPass(input.guestPassCode);
        if (!validation.valid) {
          return [];
        }
        
        const db = await getDb();
        if (!db) return [];
        
        // Get commitments by guest pass code
        const commitments = await db
          .select()
          .from(coachingCommitments)
          .where(and(
            eq(coachingCommitments.guestPassCode, input.guestPassCode),
            notInArray(coachingCommitments.status, ["missed", "abandoned"])
          ))
          .orderBy(coachingCommitments.createdAt);
        
        return commitments;
      }),
    
    // Create commitment for guest pass user
    createGuestCommitment: publicProcedure
      .input(z.object({
        guestPassCode: z.string(),
        action: z.string(),
        deadline: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { validateGuestPass } = await import("./db");
        const { coachingCommitments } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        
        const validation = await validateGuestPass(input.guestPassCode);
        if (!validation.valid) {
          throw new Error("Invalid guest pass");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db
          .insert(coachingCommitments)
          .values({
            guestPassCode: input.guestPassCode,
            action: input.action,
            deadline: input.deadline,
            status: "pending",
          })
          .$returningId();
        
        return { id: result[0].id, action: input.action };
      }),
    
    // Update guest commitment status
    updateGuestCommitmentStatus: publicProcedure
      .input(z.object({
        guestPassCode: z.string(),
        commitmentId: z.number(),
        status: z.enum(["pending", "in_progress", "completed", "missed"]).optional(),
        progress: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ input }) => {
        const { validateGuestPass } = await import("./db");
        const { coachingCommitments } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const { eq, and } = await import("drizzle-orm");
        
        const validation = await validateGuestPass(input.guestPassCode);
        if (!validation.valid) {
          throw new Error("Invalid guest pass");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db
          .update(coachingCommitments)
          .set({
            status: input.status,
            progress: input.progress,
            updatedAt: new Date(),
          })
          .where(and(
            eq(coachingCommitments.id, input.commitmentId),
            eq(coachingCommitments.guestPassCode, input.guestPassCode)
          ));
        
        return { success: true };
      }),
    
    // ========== Email Invitation System ==========
    
    // Send guest pass invitation via email (admin only)
    sendGuestPassInvitation: protectedProcedure
      .input(z.object({
        guestPassId: z.number(),
        recipientEmail: z.string().email(),
        recipientName: z.string().optional(),
        personalMessage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can send invitations");
        }
        
        const { getGuestPassByCode, createGuestPassInvitation, updateInvitationStatus } = await import("./db");
        const { guestPasses } = await import("../drizzle/schema");
        const { getDb } = await import("./db");
        const { eq } = await import("drizzle-orm");
        
        // Get guest pass details
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const passes = await db
          .select()
          .from(guestPasses)
          .where(eq(guestPasses.id, input.guestPassId))
          .limit(1);
        
        const pass = passes[0];
        if (!pass) throw new Error("Guest pass not found");
        
        // Create invitation record
        const invitationId = await createGuestPassInvitation({
          guestPassId: input.guestPassId,
          recipientEmail: input.recipientEmail,
          recipientName: input.recipientName,
          personalMessage: input.personalMessage,
        });
        
        // Generate guest access URL
        const guestUrl = `${process.env.VITE_OAUTH_PORTAL_URL || 'https://thedeepbrief.co.uk'}/ai-coach/guest?code=${pass.code}`;
        
        // Build email content
        const expirationText = pass.expiresAt 
          ? `\n\nThis invitation expires on ${new Date(pass.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`
          : '';
        
        const personalMessageText = input.personalMessage 
          ? `\n\n${input.personalMessage}\n\n`
          : '\n\n';
        
        const emailContent = `Hi${input.recipientName ? ` ${input.recipientName}` : ''},

You've been invited to access unlimited AI Executive Coaching from The Deep Brief.${personalMessageText}Your personal coaching link:
${guestUrl}${expirationText}

What you can explore:
- Navigate leadership challenges
- Improve decision-making skills
- Handle difficult conversations
- Develop delegation strategies
- Resolve team conflicts

Click the link above to start your coaching session.

Best regards,
The Deep Brief Team`;
        
        try {
          // Send email using notification system
          const { notifyOwner } = await import("./_core/notification");
          
          // For now, notify owner about the invitation (in production, this would use a proper email service)
          await notifyOwner({
            title: `Guest Pass Invitation Sent`,
            content: `Invitation sent to ${input.recipientEmail} for guest pass ${pass.code}`,
          });
          
          // Update invitation status
          await updateInvitationStatus(invitationId, "sent", {
            sentAt: new Date(),
          });
          
          return { 
            success: true, 
            invitationId,
            message: `Invitation sent to ${input.recipientEmail}`,
          };
        } catch (error) {
          // Update invitation status to failed
          await updateInvitationStatus(invitationId, "failed");
          throw new Error(`Failed to send invitation: ${error}`);
        }
      }),
    
    // Get invitations for a guest pass (admin only)
    getGuestPassInvitations: protectedProcedure
      .input(z.object({ guestPassId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can view invitations");
        }
        
        const { getGuestPassInvitations } = await import("./db");
        return getGuestPassInvitations(input.guestPassId);
      }),
    
    // Update user's coach preference
    updateCoachPreference: protectedProcedure
      .input(z.object({ coachId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { updateUserCoachPreference } = await import("./db");
        await updateUserCoachPreference(ctx.user.id, input.coachId);
        return { success: true };
      }),
    
    // Get user's current coach preference
    getCoachPreference: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserCoachPreference } = await import("./db");
        const coachId = await getUserCoachPreference(ctx.user.id);
        return { coachId };
      }),
    
    // Transcribe audio to text using voice transcription API
    transcribeAudio: protectedProcedure
      .input(z.object({
        audioData: z.string(), // Base64 encoded audio
        mimeType: z.string(), // audio/webm, audio/mp3, etc.
      }))
      .mutation(async ({ input }) => {
        const { transcribeAudio } = await import("./_core/voiceTranscription");
        
        // Convert base64 to buffer
        const audioBuffer = Buffer.from(input.audioData, 'base64');
        
        // Upload to storage first to get a URL
        const { storagePut } = await import("./storage");
        const timestamp = Date.now();
        const fileKey = `voice-input/${timestamp}.webm`;
        const { url: audioUrl } = await storagePut(
          fileKey,
          audioBuffer,
          input.mimeType
        );
        
        // Transcribe the audio
        const result = await transcribeAudio({
          audioUrl,
          language: "en",
        });
        
        // Check if transcription was successful
        if ('error' in result) {
          throw new Error(result.error);
        }
        
        return {
          text: result.text,
          language: result.language,
        };
      }),

    // PATTERN RECOGNITION: Analyze behavioral patterns
    analyzePatterns: protectedProcedure
      .query(async ({ ctx }) => {
        const { getCoachingProfile, getCoachingSessions } = await import("./db");
        const { detectBehavioralPatterns } = await import("./ai-helpers");
        
        const profile = await getCoachingProfile(ctx.user.id);
        if (!profile) return [];
        
        // Get recent sessions (last 30 days)
        const sessions = await getCoachingSessions(profile.id, 20);
        
        if (sessions.length < 3) {
          return []; // Need at least 3 sessions to detect patterns
        }
        
        // Convert sessions to format expected by AI
        const sessionsWithMessages = sessions.map(s => ({
          sessionId: s.id,
          createdAt: s.createdAt,
          messages: JSON.parse(s.messages as string),
        }));
        
        const patterns = await detectBehavioralPatterns(sessionsWithMessages);
        
        // Save patterns to database
        const { createBehavioralInsight } = await import("./db");
        for (const pattern of patterns) {
          await createBehavioralInsight({
            userId: ctx.user.id,
            insightType: pattern.patternType as any,
            title: pattern.description,
            description: pattern.insight,
            evidence: pattern.examples,
            confidence: pattern.frequency >= 5 ? 0.9 : pattern.frequency >= 3 ? 0.7 : 0.5,
          });
        }
        
        return patterns;
      }),

    // PATTERN RECOGNITION: Get saved behavioral insights
    getInsights: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUnsurfacedInsights } = await import("./db");
        return getUnsurfacedInsights(ctx.user.id);
      }),

    // PATTERN RECOGNITION: Generate monthly report
    generateMonthlyReport: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { getCoachingProfile, getCoachingSessions, getOpenCommitments } = await import("./db");
        const { generateMonthlyReport, detectBehavioralPatterns } = await import("./ai-helpers");
        const db = await import("./db").then(m => m.getDb());
        if (!db) throw new Error("Database not available");
        
        const profile = await getCoachingProfile(ctx.user.id);
        if (!profile) throw new Error("Coaching profile not found");
        
        // Get last 30 days of data
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const sessions = await getCoachingSessions(profile.id, 50);
        const recentSessions = sessions.filter(s => s.createdAt >= thirtyDaysAgo);
        
        // Get commitments from last 30 days
        const { coachingCommitments } = await import("../drizzle/schema");
        const { gte, eq } = await import("drizzle-orm");
        
        const commitments = await db.select()
          .from(coachingCommitments)
          .where(
            eq(coachingCommitments.userId, ctx.user.id)
          );
        
        const recentCommitments = commitments.filter(c => c.createdAt >= thirtyDaysAgo);
        
        // Detect patterns
        const sessionsWithMessages = recentSessions.map(s => ({
          sessionId: s.id,
          createdAt: s.createdAt,
          messages: JSON.parse(s.messages as string),
        }));
        
        const patterns = await detectBehavioralPatterns(sessionsWithMessages);
        
        // Generate report
        const report = await generateMonthlyReport(
          ctx.user.id,
          sessionsWithMessages,
          recentCommitments.map(c => ({
            description: c.action,
            status: c.status,
            createdAt: c.createdAt,
            completedAt: c.completedAt,
          })),
          patterns
        );
        
        return { report, patterns };
      }),

    // PATTERN RECOGNITION: Get session insights after conversation
    getSessionInsights: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { generateSessionInsights } = await import("./ai-helpers");
        const db = await import("./db").then(m => m.getDb());
        if (!db) throw new Error("Database not available");
        
        const { coachingSessions } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        const sessions = await db.select()
          .from(coachingSessions)
          .where(eq(coachingSessions.id, input.sessionId))
          .limit(1);
        
        if (sessions.length === 0) throw new Error("Session not found");
        
        const messages = JSON.parse(sessions[0].messages as string);
        const insights = await generateSessionInsights(messages);
        
        return insights;
      }),

    // USER PROFILE & PROGRESS: Get user progress statistics
    getProgressStats: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserProgressStats } = await import("./db");
        return await getUserProgressStats(ctx.user.id);
      }),

    // USER PROFILE & PROGRESS: Get user commitments
    getUserCommitments: protectedProcedure
      .input(z.object({
        status: z.enum(["pending", "in_progress", "completed", "missed", "open", "closed", "overdue", "abandoned"]).optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { getUserCommitments } = await import("./db");
        return await getUserCommitments(ctx.user.id, input);
      }),

    // USER PROFILE & PROGRESS: Update commitment progress
    updateCommitmentProgress: protectedProcedure
      .input(z.object({
        commitmentId: z.number(),
        progress: z.number().min(0).max(100),
        status: z.enum(["pending", "in_progress", "completed", "missed"]).optional(),
        progressNote: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { coachingCommitments, commitmentProgressHistory } = await import("../drizzle/schema");
        
        // Get current commitment to track changes
        const [current] = await db
          .select()
          .from(coachingCommitments)
          .where(eq(coachingCommitments.id, input.commitmentId))
          .limit(1);
        
        if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "Commitment not found" });
        
        // Record progress history
        await db.insert(commitmentProgressHistory).values({
          commitmentId: input.commitmentId,
          userId: ctx.user.id,
          previousProgress: current.progress || 0,
          newProgress: input.progress,
          previousStatus: current.status,
          newStatus: input.status || current.status,
          progressNote: input.progressNote || null,
        });
        
        // Update commitment
        const updateData: any = {
          progress: input.progress,
          updatedAt: new Date(),
        };
        
        if (input.status) {
          updateData.status = input.status;
          if (input.status === "completed") {
            updateData.completedAt = new Date();
          }
        }
        
        if (input.progressNote) {
          updateData.notes = input.progressNote;
        }
        
        await db
          .update(coachingCommitments)
          .set(updateData)
          .where(eq(coachingCommitments.id, input.commitmentId));
        
        return { success: true };
      }),

    // Get commitment progress history
    getCommitmentProgressHistory: protectedProcedure
      .input(z.object({
        commitmentId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { commitmentProgressHistory } = await import("../drizzle/schema");
        
        const history = await db
          .select()
          .from(commitmentProgressHistory)
          .where(eq(commitmentProgressHistory.commitmentId, input.commitmentId))
          .orderBy(desc(commitmentProgressHistory.createdAt));
        
        return history;
      }),

    // Get commitment analytics
    getCommitmentAnalytics: protectedProcedure
      .input(z.object({
        dateRange: z.enum(["week", "month", "all"]).optional().default("all"),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        
        const { coachingCommitments } = await import("../drizzle/schema");
        const { getCoachingProfile } = await import("./db");
        
        const profile = await getCoachingProfile(ctx.user.id);
        if (!profile) {
          return {
            totalCommitments: 0,
            completionRate: 0,
            avgDaysToComplete: 0,
            overdueCount: 0,
            inProgressCount: 0,
            streak: 0,
          };
        }
        
        // Calculate date filter
        let dateFilter = null;
        if (input.dateRange === "week") {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          dateFilter = weekAgo;
        } else if (input.dateRange === "month") {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          dateFilter = monthAgo;
        }
        
        // Get all commitments for the user
        const allCommitments = await db
          .select()
          .from(coachingCommitments)
          .where(
            and(
              eq(coachingCommitments.coachingUserId, profile.id),
              dateFilter ? sql`${coachingCommitments.createdAt} >= ${dateFilter}` : sql`1=1`
            )
          );
        
        const totalCommitments = allCommitments.length;
        const completedCommitments = allCommitments.filter(c => c.status === "completed");
        const completionRate = totalCommitments > 0 
          ? Math.round((completedCommitments.length / totalCommitments) * 100) 
          : 0;
        
        // Calculate average days to complete
        const completedWithDates = completedCommitments.filter(c => c.createdAt && c.completedAt);
        const avgDaysToComplete = completedWithDates.length > 0
          ? Math.round(
              completedWithDates.reduce((sum, c) => {
                const days = (new Date(c.completedAt!).getTime() - new Date(c.createdAt!).getTime()) / (1000 * 60 * 60 * 24);
                return sum + days;
              }, 0) / completedWithDates.length
            )
          : 0;
        
        // Count overdue and in-progress
        const now = new Date();
        const overdueCount = allCommitments.filter(c => 
          c.status !== "completed" && c.deadline && new Date(c.deadline) < now
        ).length;
        
        const inProgressCount = allCommitments.filter(c => c.status === "in_progress").length;
        
        // Calculate streak (consecutive days with completed commitments)
        const sortedCompleted = completedCommitments
          .filter(c => c.completedAt)
          .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());
        
        let streak = 0;
        if (sortedCompleted.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          let currentDate = new Date(today);
          for (const commitment of sortedCompleted) {
            const completedDate = new Date(commitment.completedAt!);
            completedDate.setHours(0, 0, 0, 0);
            
            const daysDiff = Math.floor((currentDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 0 || daysDiff === 1) {
              streak++;
              currentDate = completedDate;
            } else {
              break;
            }
          }
        }
        
        return {
          totalCommitments,
          completionRate,
          avgDaysToComplete,
          overdueCount,
          inProgressCount,
          streak,
        };
      }),

    // USER PROFILE & PROGRESS: Mark commitment as complete
    completeCommitment: protectedProcedure
      .input(z.object({
        commitmentId: z.number(),
        closedNote: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { completeCommitment } = await import("./db");
        await completeCommitment(input.commitmentId, input.closedNote);
        return { success: true };
      }),

    // SESSION FEEDBACK: Submit feedback on coaching message
    submitFeedback: protectedProcedure
      .input(z.object({
        sessionId: z.number().optional(),
        demoSessionId: z.number().optional(),
        guestPassSessionId: z.number().optional(),
        messageIndex: z.number(),
        feedbackType: z.enum(["helpful", "not_helpful"]),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await import("./db").then(m => m.getDb());
        if (!db) throw new Error("Database not available");
        
        const { sessionFeedback } = await import("../drizzle/schema");
        
        await db.insert(sessionFeedback).values({
          userId: ctx.user.id,
          sessionId: input.sessionId || null,
          demoSessionId: input.demoSessionId || null,
          guestPassSessionId: input.guestPassSessionId || null,
          messageIndex: input.messageIndex,
          feedbackType: input.feedbackType,
          comment: input.comment || null,
        });
        
        return { success: true };
      }),

    // Get coach recommendations based on user profile
    getCoachRecommendations: protectedProcedure
      .query(async ({ ctx }) => {
        const { getCoachingGoals, getCoachingSessions } = await import("./db");
        const { getCoachRecommendations } = await import("./coach-recommendations");
        
        // Gather user data
        const goals = await getCoachingGoals(ctx.user.id);
        const sessions = await getCoachingSessions(ctx.user.id);
        
        // Get recommendations
        const recommendations = getCoachRecommendations({
          goals: goals.map(g => ({ title: g.title, description: g.description || '' })),
          sessions: sessions.map(s => ({
            messages: s.messages || []
          })),
          patterns: [] // Patterns not yet implemented
        });
        
        return recommendations;
      }),

    // STRIPE: Create Customer Portal session for subscription management
    createPortalSession: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { getCoachingSubscription } = await import("./db");
        const { createPortalSession } = await import("./_core/stripe");
        
        const subscription = await getCoachingSubscription(ctx.user.id);
        
        if (!subscription || !subscription.stripeCustomerId) {
          throw new Error("No active subscription found");
        }
        
        const session = await createPortalSession({
          customerId: subscription.stripeCustomerId,
          returnUrl: `${process.env.VITE_APP_URL || "http://localhost:3000"}/ai-coach/dashboard`,
        });
        
        return { url: session.url };
      }),

    // TEST: Send test email to verify email service
    testEmail: protectedProcedure
      .mutation(async ({ ctx }) => {
        console.log('[testEmail] Starting test email send');
        const { sendTransactionalEmail } = await import("./_core/emailService");
        
        try {
          if (!ctx.user.email) {
            throw new Error('User email not found');
          }
          
          const sent = await sendTransactionalEmail(
            ctx.user.email,
            ctx.user.name || "User",
            "Test Email from The Deep Brief",
            "<h1>Test Email</h1><p>If you're reading this, the email service is working correctly!</p>",
            "Test Email\n\nIf you're reading this, the email service is working correctly!"
          );
          
          console.log('[testEmail] Email sent result:', sent);
          return { success: sent, email: ctx.user.email };
        } catch (error) {
          console.error('[testEmail] Error:', error);
          throw error;
        }
      }),

    // STRIPE: Create Checkout Session for new subscription
    createCheckoutSession: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { createCheckoutSession } = await import("./_core/stripe");
        
        const priceId = ENV.stripePriceId;
        if (!priceId) {
          throw new Error("Stripe price ID not configured");
        }
        
        const appUrl = process.env.VITE_APP_URL || "http://localhost:3000";
        
        const session = await createCheckoutSession({
          userId: ctx.user.id,
          userEmail: ctx.user.email || '',
          priceId,
          successUrl: `${appUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${appUrl}/ai-coach/subscribe`,
        });
        
        return { url: session.url };
      }),
  }),

  // Email Preferences - public procedures for managing email settings
  emailPreferences: router({
    // Get preferences by token (for unsubscribe page)
    getByToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const { getEmailPreferencesByToken } = await import("./db");
        return await getEmailPreferencesByToken(input.token);
      }),

    // Get preferences for logged-in user
    get: protectedProcedure.query(async ({ ctx }) => {
      const { getOrCreateEmailPreferences } = await import("./db");
      return await getOrCreateEmailPreferences(ctx.user.id);
    }),

    // Update preferences
    update: protectedProcedure
      .input(
        z.object({
          emailsEnabled: z.boolean().optional(),
          followUpEmails: z.boolean().optional(),
          weeklyCheckIns: z.boolean().optional(),
          overdueAlerts: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { getOrCreateEmailPreferences } = await import("./db");
        const db = await import("./db").then(m => m.getDb());
        if (!db) throw new Error("Database not available");
        
        const { emailPreferences } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        // Get or create preferences first
        const prefs = await getOrCreateEmailPreferences(ctx.user.id);
        
        // Update preferences
        await db
          .update(emailPreferences)
          .set(input)
          .where(eq(emailPreferences.userId, ctx.user.id));
        
        return { success: true };
      }),

    // Unsubscribe by token (one-click unsubscribe)
    unsubscribe: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const { unsubscribeByToken } = await import("./db");
        const success = await unsubscribeByToken(input.token);
        return { success };
      }),
  }),

  // Onboarding analytics
  onboarding: router({
    trackStep: protectedProcedure
      .input(z.object({
        step: z.number(),
        action: z.enum(["view", "complete", "skip", "abandon"]),
        timeSpent: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getDb } = await import("./db");
        const { onboardingAnalytics } = await import("../drizzle/schema");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.insert(onboardingAnalytics).values({
          userId: ctx.user.id,
          step: input.step,
          action: input.action,
          timeSpent: input.timeSpent,
        });
        return { success: true };
      }),

    getAnalytics: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const { getDb } = await import("./db");
        const { onboardingAnalytics } = await import("../drizzle/schema");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const analytics = await db
          .select()
          .from(onboardingAnalytics)
          .orderBy(onboardingAnalytics.createdAt);
        
        // Calculate abandonment rates per step
        const stepStats = analytics.reduce((acc, record) => {
          if (!acc[record.step]) {
            acc[record.step] = { views: 0, completes: 0, skips: 0, abandons: 0 };
          }
          if (record.action === "view") acc[record.step].views++;
          if (record.action === "complete") acc[record.step].completes++;
          if (record.action === "skip") acc[record.step].skips++;
          if (record.action === "abandon") acc[record.step].abandons++;
          return acc;
        }, {} as Record<number, { views: number; completes: number; skips: number; abandons: number }>);

        return { analytics, stepStats };
      }),
  }),
});

export type AppRouter = typeof appRouter;
