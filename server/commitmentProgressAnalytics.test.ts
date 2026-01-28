import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users, coachingUsers, coachingCommitments } from "../drizzle/schema";

describe("Commitment Progress Tracking & Analytics", () => {
  let testUserId: number;
  let testCoachingUserId: number;
  let testCommitmentId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const [user] = await db.insert(users).values({
      openId: `test-progress-${Date.now()}`,
      name: "Test Progress User",
      email: "progress@test.com",
    });
    testUserId = user.insertId;

    // Create coaching user
    const [coachingUser] = await db.insert(coachingUsers).values({
      userId: testUserId,
      role: "Test Manager",
      experienceLevel: "mid_level",
      goals: JSON.stringify(["Test goal"]),
      pressures: JSON.stringify(["Test pressure"]),
      challenges: JSON.stringify(["Test challenge"]),
    });
    testCoachingUserId = coachingUser.insertId;

    // Create test commitment
    const [commitment] = await db.insert(coachingCommitments).values({
      coachingUserId: testCoachingUserId,
      userId: testUserId,
      action: "Test commitment for progress tracking",
      context: "Testing progress updates",
      status: "pending",
      progress: 0,
    });
    testCommitmentId = commitment.insertId;
  });

  it("should update commitment progress and create history entry", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: `test-progress-${testUserId}`, name: "Test User", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // Update progress to 50%
    const result = await caller.coaching.updateCommitmentProgress({
      commitmentId: testCommitmentId,
      progress: 50,
      status: "in_progress",
      progressNote: "Halfway there!",
    });

    expect(result.success).toBe(true);

    // Check that history was created
    const history = await caller.coaching.getCommitmentProgressHistory({
      commitmentId: testCommitmentId,
    });

    expect(history.length).toBeGreaterThan(0);
    expect(history[0].previousProgress).toBe(0);
    expect(history[0].newProgress).toBe(50);
    expect(history[0].previousStatus).toBe("pending");
    expect(history[0].newStatus).toBe("in_progress");
    expect(history[0].progressNote).toBe("Halfway there!");
  });

  it("should track multiple progress updates in history", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: `test-progress-${testUserId}`, name: "Test User", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // Update to 75%
    await caller.coaching.updateCommitmentProgress({
      commitmentId: testCommitmentId,
      progress: 75,
      progressNote: "Almost done!",
    });

    // Update to 100% and mark complete
    await caller.coaching.updateCommitmentProgress({
      commitmentId: testCommitmentId,
      progress: 100,
      status: "completed",
      progressNote: "Finished!",
    });

    // Check history has all updates
    const history = await caller.coaching.getCommitmentProgressHistory({
      commitmentId: testCommitmentId,
    });

    expect(history.length).toBeGreaterThanOrEqual(3); // Initial + 2 updates
    
    // Most recent should be 100% completion
    expect(history[0].newProgress).toBe(100);
    expect(history[0].newStatus).toBe("completed");
  });

  it("should calculate commitment analytics correctly", async () => {
    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: `test-progress-${testUserId}`, name: "Test User", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    const analytics = await caller.coaching.getCommitmentAnalytics({
      dateRange: "all",
    });

    expect(analytics.totalCommitments).toBeGreaterThan(0);
    expect(analytics.completionRate).toBeGreaterThanOrEqual(0);
    expect(analytics.completionRate).toBeLessThanOrEqual(100);
    expect(analytics.inProgressCount).toBeGreaterThanOrEqual(0);
    expect(analytics.overdueCount).toBeGreaterThanOrEqual(0);
    expect(analytics.avgDaysToComplete).toBeGreaterThanOrEqual(0);
  });

  it("should handle progress updates with only progress percentage", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create another commitment
    const [commitment] = await db.insert(coachingCommitments).values({
      coachingUserId: testCoachingUserId,
      userId: testUserId,
      action: "Another test commitment",
      status: "pending",
      progress: 0,
    });

    const caller = appRouter.createCaller({
      user: { id: testUserId, openId: `test-progress-${testUserId}`, name: "Test User", role: "user" },
      req: {} as any,
      res: {} as any,
    });

    // Update only progress, no status or note
    const result = await caller.coaching.updateCommitmentProgress({
      commitmentId: commitment.insertId,
      progress: 30,
    });

    expect(result.success).toBe(true);

    const history = await caller.coaching.getCommitmentProgressHistory({
      commitmentId: commitment.insertId,
    });

    expect(history[0].newProgress).toBe(30);
    expect(history[0].newStatus).toBe("pending"); // Status unchanged
  });
});
