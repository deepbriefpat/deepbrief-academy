import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { coachingSessions, users, coachingUsers } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Resume Session Summary Feature", () => {
  let testUserId: number;
  let testCoachingUserId: number;
  let testSessionId: number;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const [user] = await db
      .insert(users)
      .values({
        openId: `test-resume-summary-${Date.now()}`,
        name: "Test Resume Summary User",
        email: `test-resume-summary-${Date.now()}@example.com`,
        role: "user",
      })
      .$returningId();
    testUserId = user.id;

    // Create coaching user
    const [coachingUser] = await db
      .insert(coachingUsers)
      .values({
        userId: testUserId,
        preferredName: "Test",
        role: "Founder",
        experienceLevel: "mid_level",
        goals: JSON.stringify(["Improve prioritization"]),
        pressures: JSON.stringify(["Product roadmap decisions"]),
        challenges: JSON.stringify(["Competing priorities"]),
      })
      .$returningId();
    testCoachingUserId = coachingUser.id;

    // Create test session with multiple messages
    const messages = JSON.stringify([
      { role: "user", content: "I'm struggling with prioritizing my product roadmap." },
      { role: "assistant", content: "Let's explore that. What are the main competing priorities?" },
      { role: "user", content: "We have customer requests, technical debt, and new features." },
      { role: "assistant", content: "Those are common tensions. How do you currently decide?" },
      { role: "user", content: "Usually by whoever shouts loudest, which isn't sustainable." },
      { role: "assistant", content: "That's a great insight. Let's work on a framework for decision-making." },
    ]);

    const [session] = await db
      .insert(coachingSessions)
      .values({
        coachingUserId: testCoachingUserId,
        sessionType: "general",
        mode: "coaching",
        messages,
      })
      .$returningId();
    testSessionId = session.id;

    // Create caller with test user context
    caller = appRouter.createCaller({
      user: {
        id: testUserId,
        openId: `test-resume-summary-${Date.now()}`,
        name: "Test Resume Summary User",
        email: `test-resume-summary-${Date.now()}@example.com`,
        role: "user",
      },
    });
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Clean up test data
    await db.delete(coachingSessions).where(eq(coachingSessions.id, testSessionId));
    await db.delete(coachingUsers).where(eq(coachingUsers.id, testCoachingUserId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  it("should generate a session summary when resuming a session", async () => {
    // Call generateSessionSummary
    const result = await caller.aiCoach.generateSessionSummary({
      sessionId: testSessionId,
    });

    // Verify summary was returned
    expect(result).toBeDefined();
    expect(result.summary).toBeDefined();
    expect(typeof result.summary).toBe("string");
    expect(result.summary.length).toBeGreaterThan(0);

    // Verify summary contains relevant context
    const summaryLower = result.summary.toLowerCase();
    expect(
      summaryLower.includes("priorit") || 
      summaryLower.includes("roadmap") || 
      summaryLower.includes("decision")
    ).toBe(true);
  }, 30000); // 30 second timeout for LLM call

  it("should save the summary to the database", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Generate summary
    await caller.aiCoach.generateSessionSummary({
      sessionId: testSessionId,
    });

    // Verify summary was saved to database
    const [session] = await db
      .select()
      .from(coachingSessions)
      .where(eq(coachingSessions.id, testSessionId))
      .limit(1);

    expect(session.summary).toBeDefined();
    expect(session.summary).not.toBeNull();
    expect(typeof session.summary).toBe("string");
    expect(session.summary!.length).toBeGreaterThan(0);
  }, 30000); // 30 second timeout for LLM call

  it("should handle sessions with too few messages", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create session with only 2 messages
    const shortMessages = JSON.stringify([
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there! How can I help?" },
    ]);

    const [shortSession] = await db
      .insert(coachingSessions)
      .values({
        coachingUserId: testCoachingUserId,
        sessionType: "general",
        mode: "coaching",
        messages: shortMessages,
      })
      .$returningId();

    // Generate summary for short session
    const result = await caller.aiCoach.generateSessionSummary({
      sessionId: shortSession.id,
    });

    // Should return a default message
    expect(result.summary).toContain("just started");

    // Clean up
    await db.delete(coachingSessions).where(eq(coachingSessions.id, shortSession.id));
  });

  it("should handle invalid session IDs gracefully", async () => {
    // Try to generate summary for non-existent session
    await expect(
      caller.aiCoach.generateSessionSummary({
        sessionId: 999999,
      })
    ).rejects.toThrow("Session not found");
  });
});
