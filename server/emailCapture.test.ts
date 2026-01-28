import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { emailSubscribers } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Email Capture", () => {
  const caller = appRouter.createCaller({
    user: null,
    req: {} as any,
    res: {} as any,
  });

  beforeEach(async () => {
    // Clean up test emails
    const db = await getDb();
    if (db) {
      await db.delete(emailSubscribers).where(eq(emailSubscribers.email, "test@example.com"));
    }
  });

  it("should subscribe a new email", async () => {
    const result = await caller.emailCapture.subscribe({
      email: "test@example.com",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Subscribed successfully");

    // Verify in database
    const db = await getDb();
    if (db) {
      const subscribers = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, "test@example.com"));
      expect(subscribers.length).toBe(1);
      expect(subscribers[0].source).toBe("pressure_guide_modal");
    }
  });

  it("should handle duplicate email subscriptions", async () => {
    // Subscribe once
    await caller.emailCapture.subscribe({
      email: "test@example.com",
    });

    // Try to subscribe again
    const result = await caller.emailCapture.subscribe({
      email: "test@example.com",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Already subscribed");

    // Verify only one record exists
    const db = await getDb();
    if (db) {
      const subscribers = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, "test@example.com"));
      expect(subscribers.length).toBe(1);
    }
  });

  it("should reject invalid email format", async () => {
    await expect(
      caller.emailCapture.subscribe({
        email: "invalid-email",
      })
    ).rejects.toThrow();
  });
});
