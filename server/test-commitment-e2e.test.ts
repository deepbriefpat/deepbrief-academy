/**
 * End-to-end test for commitment extraction and saving in coaching sessions
 */

import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { coachingUsers, coachingSessions, coachingCommitments } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Commitment E2E Test", () => {
  let testUserId: number;
  let testProfileId: number;
  let testSessionId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user profile
    const profiles = await db.select()
      .from(coachingUsers)
      .where(eq(coachingUsers.userId, 1))
      .limit(1);

    if (profiles.length > 0) {
      testProfileId = profiles[0].id;
      testUserId = profiles[0].userId;
    } else {
      // Create a test profile if none exists
      const result = await db.insert(coachingUsers).values({
        userId: 1,
        role: "Founder",
        experienceLevel: "experienced",
        goals: JSON.stringify(["Test goal"]),
        pressures: JSON.stringify(["Test pressure"]),
        challenges: JSON.stringify(["Test challenge"]),
      });
      testProfileId = result[0].id;
      testUserId = 1;
    }

    // Create a test session
    const sessionResult = await db.insert(coachingSessions).values({
      coachingUserId: testProfileId,
      coachId: "patrick",
      sessionType: "general",
      messages: JSON.stringify([]),
    });
    // MySQL returns insertId in the result array's first element
    testSessionId = Number(sessionResult[0].insertId);
    console.log(`[beforeAll] Created test session with ID: ${testSessionId}`);
    console.log(`[beforeAll] Full result:`, sessionResult);
  });

  it("should extract and save commitments from coaching conversation", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Simulate a coaching conversation with commitments
    const messages = [
      {
        role: "user",
        content: "I need to make a decision about hiring a new CTO by end of week."
      },
      {
        role: "assistant",
        content: "What's stopping you from deciding today? Let's make this concrete.\n\nYour commitments:\n1. **By Wednesday**: Interview the final two candidates\n2. **By Friday**: Make the hiring decision and send the offer"
      },
      {
        role: "user",
        content: "You're right. I'll schedule the interviews for Tuesday and Wednesday, then decide by Friday."
      }
    ];

    // Update session with messages
    await db.update(coachingSessions)
      .set({ messages: JSON.stringify(messages) })
      .where(eq(coachingSessions.id, testSessionId));

    // Now simulate the commitment extraction that happens in sendMessage mutation
    const { extractCommitments } = await import("./ai-helpers");
    const { createCoachingCommitment } = await import("./db");

    const commitments = await extractCommitments(messages, testUserId);
    
    console.log(`\n✅ Extracted ${commitments.length} commitments from conversation`);
    console.log(`[Test] Using session ID: ${testSessionId}`);
    
    // Save commitments to database
    for (const commitment of commitments) {
      // Try to parse the deadline, but skip if invalid
      let deadline: Date | undefined = undefined;
      if (commitment.dueDate) {
        const parsed = new Date(commitment.dueDate);
        if (!isNaN(parsed.getTime())) {
          deadline = parsed;
        } else {
          console.log(`⚠️  Skipping invalid deadline: "${commitment.dueDate}" for commitment: ${commitment.description}`);
        }
      }
      
      await createCoachingCommitment({
        coachingUserId: testProfileId,
        action: commitment.description,
        deadline,
        sessionId: testSessionId,
      });
      console.log(`✅ Saved: ${commitment.description}`);
    }

    // Verify commitments were saved to database
    console.log(`\n[Test] Querying commitments for session ID: ${testSessionId}`);
    const savedCommitments = await db.select()
      .from(coachingCommitments)
      .where(eq(coachingCommitments.sessionId, testSessionId));

    console.log(`\n✅ Found ${savedCommitments.length} commitments in database for session ${testSessionId}`);
    
    savedCommitments.forEach((c, i) => {
      console.log(`${i + 1}. ${c.action}`);
      console.log(`   Deadline: ${c.deadline || 'None'}`);
      console.log(`   Status: ${c.status}`);
    });

    // Assertions
    expect(commitments.length).toBeGreaterThan(0);
    expect(savedCommitments.length).toBeGreaterThan(0);
    expect(savedCommitments.length).toBe(commitments.length);
    
    // Verify commitment fields
    savedCommitments.forEach(c => {
      expect(c.action).toBeDefined();
      expect(c.action.length).toBeGreaterThan(0);
      expect(c.status).toBe("pending");
      expect(c.coachingUserId).toBe(testProfileId);
      expect(c.sessionId).toBe(testSessionId);
    });

    console.log("\n✅ End-to-end test PASSED - Commitments are being extracted and saved correctly!");
  }, 60000); // 60 second timeout for LLM call
});
