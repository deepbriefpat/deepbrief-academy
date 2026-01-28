import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Guest Pass System", () => {
  let adminCaller: ReturnType<typeof appRouter.createCaller>;
  let publicCaller: ReturnType<typeof appRouter.createCaller>;
  let testGuestPassCode: string;

  beforeAll(async () => {
    // Create admin context
    const adminContext: TrpcContext = {
      user: {
        id: 1,
        openId: "test-admin",
        name: "Test Admin",
        email: "admin@test.com",
        role: "admin",
        loginMethod: "test",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      req: {
        protocol: "https",
        headers: {},
      } as any,
      res: {} as any,
    };
    adminCaller = appRouter.createCaller(adminContext);

    // Create public context
    const publicContext: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as any,
      res: {} as any,
    };
    publicCaller = appRouter.createCaller(publicContext);
  });

  it("should create a guest pass with admin privileges", async () => {
    const result = await adminCaller.aiCoach.createGuestPass({
      label: "Test Guest Pass",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    });

    expect(result).toHaveProperty("passId");
    expect(result).toHaveProperty("code");
    expect(result.code).toMatch(/^GUEST-\d{4}-[A-Z0-9]{6}$/);
    
    testGuestPassCode = result.code;
  });

  it("should validate a valid guest pass", async () => {
    const result = await publicCaller.aiCoach.validateGuestPass({
      code: testGuestPassCode,
    });

    expect(result.valid).toBe(true);
    expect(result.passId).toBeGreaterThan(0);
  });

  it("should reject an invalid guest pass code", async () => {
    const result = await publicCaller.aiCoach.validateGuestPass({
      code: "INVALID-CODE-123",
    });

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Invalid code");
  });

  it("should allow guest chat with valid code", async () => {
    const result = await publicCaller.aiCoach.guestChat({
      message: "What is delegation?",
      guestPassCode: testGuestPassCode,
      fingerprint: "test-fingerprint-123",
      coachGender: "female",
      coachName: "Maya Patel",
    });

    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("messageCount");
    expect(typeof result.message).toBe("string");
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.messageCount).toBeGreaterThan(0);
  });

  it("should reject guest chat with invalid code", async () => {
    await expect(
      publicCaller.aiCoach.guestChat({
        message: "Test message",
        guestPassCode: "INVALID-CODE",
        fingerprint: "test-fingerprint",
      })
    ).rejects.toThrow();
  });

  it("should list guest passes for admin", async () => {
    const passes = await adminCaller.aiCoach.getGuestPasses();

    expect(Array.isArray(passes)).toBe(true);
    expect(passes.length).toBeGreaterThan(0);
    
    const testPass = passes.find(p => p.code === testGuestPassCode);
    expect(testPass).toBeDefined();
    expect(testPass?.label).toBe("Test Guest Pass");
    expect(testPass?.isActive).toBe(true);
    expect(testPass?.usageCount).toBeGreaterThan(0); // Should have usage from previous test
  });

  it("should revoke a guest pass", async () => {
    const passes = await adminCaller.aiCoach.getGuestPasses();
    const testPass = passes.find(p => p.code === testGuestPassCode);
    
    if (!testPass) throw new Error("Test pass not found");

    await adminCaller.aiCoach.revokeGuestPass({
      passId: testPass.id,
    });

    // Verify it's revoked
    const validation = await publicCaller.aiCoach.validateGuestPass({
      code: testGuestPassCode,
    });

    expect(validation.valid).toBe(false);
    expect(validation.reason).toBe("Code has been revoked");
  });

  it("should reject guest chat with revoked code", async () => {
    await expect(
      publicCaller.aiCoach.guestChat({
        message: "Test message",
        guestPassCode: testGuestPassCode,
        fingerprint: "test-fingerprint",
      })
    ).rejects.toThrow("Code has been revoked");
  });
});
