import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

// Mock context helper
function createMockContext(overrides?: Partial<Context>): Context {
  return {
    req: {} as any,
    res: {} as any,
    user: null,
    ...overrides,
  };
}

describe("Admin Procedures", () => {
  describe("admin.subscribers", () => {
    it("should reject non-admin users", async () => {
      const caller = appRouter.createCaller(
        createMockContext({
          user: {
            id: 1,
            openId: "test-user",
            name: "Test User",
            email: "test@example.com",
            loginMethod: "email",
            role: "user", // Not admin
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          },
        })
      );

      await expect(
        caller.admin.subscribers({ source: "all" })
      ).rejects.toThrow("Unauthorized: Admin access required");
    });

    it("should allow admin users to fetch subscribers", async () => {
      const caller = appRouter.createCaller(
        createMockContext({
          user: {
            id: 1,
            openId: "admin-user",
            name: "Admin User",
            email: "admin@example.com",
            loginMethod: "email",
            role: "admin",
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          },
        })
      );

      const result = await caller.admin.subscribers({ source: "all" });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should filter subscribers by source", async () => {
      const caller = appRouter.createCaller(
        createMockContext({
          user: {
            id: 1,
            openId: "admin-user",
            name: "Admin User",
            email: "admin@example.com",
            loginMethod: "email",
            role: "admin",
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          },
        })
      );

      const result = await caller.admin.subscribers({ source: "calm_protocol" });
      expect(Array.isArray(result)).toBe(true);
      // All results should have source "calm_protocol" if any exist
      if (result.length > 0) {
        expect(result.every((sub) => sub.source === "calm_protocol")).toBe(true);
      }
    });
  });

  describe("admin.stats", () => {
    it("should reject non-admin users", async () => {
      const caller = appRouter.createCaller(
        createMockContext({
          user: {
            id: 1,
            openId: "test-user",
            name: "Test User",
            email: "test@example.com",
            loginMethod: "email",
            role: "user",
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          },
        })
      );

      await expect(caller.admin.stats()).rejects.toThrow(
        "Unauthorized: Admin access required"
      );
    });

    it("should return stats for admin users", async () => {
      const caller = appRouter.createCaller(
        createMockContext({
          user: {
            id: 1,
            openId: "admin-user",
            name: "Admin User",
            email: "admin@example.com",
            loginMethod: "email",
            role: "admin",
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          },
        })
      );

      const result = await caller.admin.stats();
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("bySource");
      expect(result).toHaveProperty("recentGrowth");
      expect(typeof result.total).toBe("number");
      expect(typeof result.bySource).toBe("object");
      expect(Array.isArray(result.recentGrowth)).toBe(true);
    });
  });

  describe("admin.deleteSubscriber", () => {
    it("should reject non-admin users", async () => {
      const caller = appRouter.createCaller(
        createMockContext({
          user: {
            id: 1,
            openId: "test-user",
            name: "Test User",
            email: "test@example.com",
            loginMethod: "email",
            role: "user",
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          },
        })
      );

      await expect(
        caller.admin.deleteSubscriber({ id: 999 })
      ).rejects.toThrow("Unauthorized: Admin access required");
    });
  });

  describe("admin.unsubscribeSubscriber", () => {
    it("should reject non-admin users", async () => {
      const caller = appRouter.createCaller(
        createMockContext({
          user: {
            id: 1,
            openId: "test-user",
            name: "Test User",
            email: "test@example.com",
            loginMethod: "email",
            role: "user",
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSignedIn: new Date(),
          },
        })
      );

      await expect(
        caller.admin.unsubscribeSubscriber({ id: 999 })
      ).rejects.toThrow("Unauthorized: Admin access required");
    });
  });
});
