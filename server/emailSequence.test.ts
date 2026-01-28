import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { emailSubscribers, emailSequences, sentEmails } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sendSequenceEmail, processPendingEmails } from "./emailService";

describe("Email Sequence", () => {
  const caller = appRouter.createCaller({
    user: null,
    req: {} as any,
    res: {} as any,
  });

  beforeEach(async () => {
    // Clean up test data
    const db = await getDb();
    if (db) {
      // Get subscriber ID first
      const subscriber = await db
        .select()
        .from(emailSubscribers)
        .where(eq(emailSubscribers.email, "test-sequence@example.com"))
        .limit(1);
      
      if (subscriber.length > 0) {
        // Delete sent emails first (foreign key constraint)
        await db.delete(sentEmails).where(eq(sentEmails.subscriberId, subscriber[0].id));
        // Then delete subscriber
        await db.delete(emailSubscribers).where(eq(emailSubscribers.id, subscriber[0].id));
      }
    }
  });

  it("should have email sequences seeded in database", async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const sequences = await db.select().from(emailSequences);
    expect(sequences.length).toBeGreaterThanOrEqual(3);

    const welcomeEmail = sequences.find(s => s.delayDays === 0 && s.triggerSource === "pressure_guide_modal");
    expect(welcomeEmail).toBeDefined();
    expect(welcomeEmail?.subject).toContain("Pressure Management Guide");

    const day3Email = sequences.find(s => s.delayDays === 3 && s.triggerSource === "pressure_guide_modal");
    expect(day3Email).toBeDefined();

    const day7Email = sequences.find(s => s.delayDays === 7 && s.triggerSource === "pressure_guide_modal");
    expect(day7Email).toBeDefined();
  });

  it("should send immediate welcome email on subscription", async () => {
    // Subscribe
    const result = await caller.emailCapture.subscribe({
      email: "test-sequence@example.com",
    });

    expect(result.success).toBe(true);

    // Wait a moment for async email sending
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check that welcome email was sent
    const db = await getDb();
    if (db) {
      const subscriber = await db
        .select()
        .from(emailSubscribers)
        .where(eq(emailSubscribers.email, "test-sequence@example.com"))
        .limit(1);

      expect(subscriber.length).toBe(1);

      const sent = await db
        .select()
        .from(sentEmails)
        .where(eq(sentEmails.subscriberId, subscriber[0].id));

      expect(sent.length).toBeGreaterThanOrEqual(1);
      expect(sent[0].status).toBe("sent");
    }
  });

  it("should not send duplicate emails", async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Create test subscriber
    const result = await db.insert(emailSubscribers).values({
      email: "test-duplicate@example.com",
      source: "pressure_guide_modal",
    });

    const subscriberId = result[0].insertId;

    // Get welcome sequence
    const sequences = await db
      .select()
      .from(emailSequences)
      .where(
        and(
          eq(emailSequences.triggerSource, "pressure_guide_modal"),
          eq(emailSequences.delayDays, 0)
        )
      )
      .limit(1);

    expect(sequences.length).toBe(1);

    // Send email twice
    await sendSequenceEmail(subscriberId, sequences[0].id);
    await sendSequenceEmail(subscriberId, sequences[0].id);

    // Check only one sent record exists
    const sent = await db
      .select()
      .from(sentEmails)
      .where(
        and(
          eq(sentEmails.subscriberId, subscriberId),
          eq(sentEmails.sequenceId, sequences[0].id)
        )
      );

    expect(sent.length).toBe(1);

    // Cleanup
    await db.delete(sentEmails).where(eq(sentEmails.subscriberId, subscriberId));
    await db.delete(emailSubscribers).where(eq(emailSubscribers.id, subscriberId));
  });
});
