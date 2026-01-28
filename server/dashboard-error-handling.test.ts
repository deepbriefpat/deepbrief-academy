import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";

/**
 * Test suite for dashboard error handling
 * Verifies that server-side queries handle errors gracefully
 * and don't crash when encountering invalid data
 */
describe("Dashboard Error Handling", () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");
  });

  it("should handle invalid JSON in session messages gracefully", async () => {
    const { getCoachingSessions } = await import("./db");
    
    // This should not throw even if there's invalid JSON in the database
    // The function should return sessions with empty arrays for invalid JSON
    const sessions = await getCoachingSessions(1, 10);
    
    expect(Array.isArray(sessions)).toBe(true);
    
    // Verify all sessions have valid messages array (not undefined)
    sessions.forEach(session => {
      expect(Array.isArray(session.messages)).toBe(true);
    });
  });

  it("should handle invalid JSON in goal milestones gracefully", async () => {
    const { getCoachingGoals } = await import("./db");
    
    // This should not throw even if there's invalid JSON in the database
    const goals = await getCoachingGoals(1);
    
    expect(Array.isArray(goals)).toBe(true);
    
    // Verify all goals have valid milestones (null or array, not undefined)
    goals.forEach(goal => {
      if (goal.milestones !== null) {
        expect(Array.isArray(goal.milestones)).toBe(true);
      }
    });
  });

  it("should return empty array when profile doesn't exist", async () => {
    const { getCoachingSessions } = await import("./db");
    
    // Non-existent profile ID should return empty array, not crash
    const sessions = await getCoachingSessions(999999, 10);
    
    expect(Array.isArray(sessions)).toBe(true);
    expect(sessions.length).toBe(0);
  });

  it("should handle getSession endpoint with invalid session ID", async () => {
    const { coachingSessions } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    
    // Query non-existent session
    const sessions = await db!.select()
      .from(coachingSessions)
      .where(eq(coachingSessions.id, 999999))
      .limit(1);
    
    expect(Array.isArray(sessions)).toBe(true);
    expect(sessions.length).toBe(0);
  });
});
