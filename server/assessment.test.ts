import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("assessment.submit", () => {
  it("should save assessment response and return session ID", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      sessionId: "test-session-123",
      responses: { "0": 3, "1": 4, "2": 2 },
      depthLevel: "thermocline" as const,
      score: 45,
    };

    const result = await caller.assessment.submit(input);

    expect(result).toEqual({ success: true, sessionId: "test-session-123" });
  });

  it("should handle different response patterns", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      sessionId: "test-session-456",
      responses: { "0": 3, "1": 2, "2": 4 },
      depthLevel: "surface" as const,
      score: 15,
    };

    const result = await caller.assessment.submit(input);
    expect(result.success).toBe(true);
  });

  it("should accept valid depth levels", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const depthLevels: Array<"surface" | "thermocline" | "deep_water" | "crush_depth"> = [
      "surface",
      "thermocline",
      "deep_water",
      "crush_depth",
    ];

    for (const depthLevel of depthLevels) {
      const input = {
        sessionId: `test-${depthLevel}`,
        responses: { "0": 3 },
        depthLevel,
        score: 30,
      };

      const result = await caller.assessment.submit(input);
      expect(result.sessionId).toBe(`test-${depthLevel}`);
    }
  });
});

describe("assessment.getBySession", () => {
  it("should return null for non-existent session", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.assessment.getBySession({
      sessionId: "non-existent-session",
    });

    expect(result).toBeNull();
  });

  it("should retrieve saved assessment by session ID", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const sessionId = `test-retrieve-${Date.now()}`;
    
    // First save an assessment
    await caller.assessment.submit({
      sessionId,
      responses: { "0": 5, "1": 4 },
      depthLevel: "deep_water",
      score: 85,
    });

    // Then retrieve it
    const result = await caller.assessment.getBySession({ sessionId });

    expect(result).not.toBeNull();
    expect(result?.sessionId).toBe(sessionId);
    expect(result?.depthLevel).toBe("deep_water");
    expect(result?.score).toBe(85);
  });
});
