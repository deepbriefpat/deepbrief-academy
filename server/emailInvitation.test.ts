import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Email Invitation System", () => {
  let adminCaller: ReturnType<typeof appRouter.createCaller>;
  let testGuestPassId: number;
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

    // Create a test guest pass for invitation testing
    const result = await adminCaller.aiCoach.createGuestPass({
      label: "Test Pass for Email Invitations",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    
    testGuestPassId = result.passId;
    testGuestPassCode = result.code;
  });

  it("should send email invitation with all fields", async () => {
    const result = await adminCaller.aiCoach.sendGuestPassInvitation({
      guestPassId: testGuestPassId,
      recipientEmail: "test@example.com",
      recipientName: "Test User",
      personalMessage: "I think you'll find this coaching tool helpful for your leadership development.",
    });

    expect(result.success).toBe(true);
    expect(result.invitationId).toBeGreaterThan(0);
    expect(result.message).toContain("test@example.com");
  });

  it("should send email invitation with only required fields", async () => {
    const result = await adminCaller.aiCoach.sendGuestPassInvitation({
      guestPassId: testGuestPassId,
      recipientEmail: "minimal@example.com",
    });

    expect(result.success).toBe(true);
    expect(result.invitationId).toBeGreaterThan(0);
  });

  it("should reject invalid email address", async () => {
    await expect(
      adminCaller.aiCoach.sendGuestPassInvitation({
        guestPassId: testGuestPassId,
        recipientEmail: "not-an-email",
      })
    ).rejects.toThrow();
  });

  it("should reject invitation for non-existent guest pass", async () => {
    await expect(
      adminCaller.aiCoach.sendGuestPassInvitation({
        guestPassId: 999999,
        recipientEmail: "test@example.com",
      })
    ).rejects.toThrow("Guest pass not found");
  });

  it("should retrieve invitations for a guest pass", async () => {
    const invitations = await adminCaller.aiCoach.getGuestPassInvitations({
      guestPassId: testGuestPassId,
    });

    expect(Array.isArray(invitations)).toBe(true);
    expect(invitations.length).toBeGreaterThan(0);
    
    const firstInvitation = invitations[0];
    expect(firstInvitation).toHaveProperty("recipientEmail");
    expect(firstInvitation).toHaveProperty("status");
    expect(firstInvitation.guestPassId).toBe(testGuestPassId);
  });

  it("should track invitation status as 'sent'", async () => {
    const invitations = await adminCaller.aiCoach.getGuestPassInvitations({
      guestPassId: testGuestPassId,
    });

    const sentInvitation = invitations.find(inv => inv.status === "sent");
    expect(sentInvitation).toBeDefined();
    expect(sentInvitation?.sentAt).toBeDefined();
  });
});
