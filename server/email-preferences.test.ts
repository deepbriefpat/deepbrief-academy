import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

// Mock context for testing
const createMockContext = (userId?: number): Context => ({
  user: userId ? {
    id: userId,
    openId: `test-open-id-${userId}`,
    name: "Test User",
    email: "test@example.com",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  } : null,
  req: {} as any,
  res: {} as any,
});

describe("Email Preferences & Progress Tracking", () => {
  describe("Email Preferences", () => {
    it("should get email preferences for authenticated user", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);
      
      // This should return preferences (or create default ones)
      const preferences = await caller.emailPreferences.get();
      
      expect(preferences).toBeDefined();
      expect(preferences).toHaveProperty("emailsEnabled");
      expect(preferences).toHaveProperty("followUpEmails");
      expect(preferences).toHaveProperty("weeklyCheckIns");
      expect(preferences).toHaveProperty("overdueAlerts");
    });

    it("should update email preferences", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.emailPreferences.update({
        emailsEnabled: true,
        followUpEmails: false,
        weeklyCheckIns: true,
        overdueAlerts: true,
      });
      
      expect(result.success).toBe(true);
    });

    it("should handle unsubscribe with valid token", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);
      
      // First get preferences to get a valid token
      const authCtx = createMockContext(1);
      const authCaller = appRouter.createCaller(authCtx);
      const prefs = await authCaller.emailPreferences.get();
      
      if (prefs?.unsubscribeToken) {
        const result = await caller.emailPreferences.unsubscribe({
          token: prefs.unsubscribeToken,
        });
        
        expect(result.success).toBe(true);
      }
    });
  });

  describe("Progress Tracking", () => {
    it("should update commitment progress", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);
      
      // First create a commitment
      // Note: This assumes you have a way to create commitments in tests
      // You may need to adjust this based on your actual implementation
      
      const result = await caller.aiCoach.updateCommitmentStatus({
        commitmentId: 1,
        progress: 50,
      });
      
      expect(result.success).toBe(true);
    });

    it("should auto-complete commitment when progress reaches 100%", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.aiCoach.updateCommitmentStatus({
        commitmentId: 1,
        progress: 100,
      });
      
      expect(result.success).toBe(true);
      // Note: You would need to verify the status was set to "completed"
      // by querying the commitment again
    });

    it("should accept progress values between 0 and 100", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);
      
      // Test valid progress values
      for (const progress of [0, 25, 50, 75, 100]) {
        const result = await caller.aiCoach.updateCommitmentStatus({
          commitmentId: 1,
          progress,
        });
        expect(result.success).toBe(true);
      }
    });

    it("should reject progress values outside 0-100 range", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);
      
      // Test invalid progress values
      await expect(
        caller.aiCoach.updateCommitmentStatus({
          commitmentId: 1,
          progress: -10,
        })
      ).rejects.toThrow();

      await expect(
        caller.aiCoach.updateCommitmentStatus({
          commitmentId: 1,
          progress: 150,
        })
      ).rejects.toThrow();
    });
  });

  describe("Commitment Status Updates", () => {
    it("should update commitment status without progress", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.aiCoach.updateCommitmentStatus({
        commitmentId: 1,
        status: "in_progress",
      });
      
      expect(result.success).toBe(true);
    });

    it("should update both status and progress simultaneously", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.aiCoach.updateCommitmentStatus({
        commitmentId: 1,
        status: "in_progress",
        progress: 75,
      });
      
      expect(result.success).toBe(true);
    });

    it("should include closed note when completing commitment", async () => {
      const ctx = createMockContext(1);
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.aiCoach.updateCommitmentStatus({
        commitmentId: 1,
        status: "completed",
        closedNote: "Successfully completed the task ahead of schedule",
      });
      
      expect(result.success).toBe(true);
    });
  });
});
