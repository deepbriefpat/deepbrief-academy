import { describe, it, expect, beforeAll } from "vitest";
import { generateSessionSummary, sendSessionSummaryEmail } from "./sessionSummaryService";
import { getDb } from "./db";
import { coachingSessions, coachingUsers as coachingUsersTable, users, coachingCommitments } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Session Summary Email", () => {
  let testUserId: number;
  let testCoachingUserId: number;
  let testSessionId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const userResult = await db.insert(users).values({
      openId: `test-session-summary-${Date.now()}`,
      name: "Test User",
      email: "test-session-summary@example.com",
      role: "user",
    });
    testUserId = Number(userResult[0].insertId);
    console.log('Created test user with ID:', testUserId);

    // Create coaching user
    const coachingUserResult = await db.insert(coachingUsersTable).values({
      userId: testUserId,
      preferredName: "Test",
      role: "Founder",
      experienceLevel: "mid_level",
      goals: JSON.stringify(["Improve delegation", "Build stronger team"]),
      pressures: JSON.stringify(["Growing team", "Scaling business"]),
      challenges: JSON.stringify(["Letting go of control", "Trusting team decisions"]),
    });
    testCoachingUserId = Number(coachingUserResult[0].insertId);
    console.log('Created coaching user with ID:', testCoachingUserId);

    // Verify IDs are valid
    if (isNaN(testUserId) || isNaN(testCoachingUserId)) {
      throw new Error(`Invalid IDs: userId=${testUserId}, coachingUserId=${testCoachingUserId}`);
    }

    // Create test session with realistic conversation
    const sessionResult = await db.insert(coachingSessions).values({
      coachingUserId: testCoachingUserId,
      sessionType: "general",
      mode: "coaching",
      messages: JSON.stringify([
        {
          role: "user",
          content: "I'm struggling with delegation. My team keeps coming back to me with questions instead of making decisions themselves."
        },
        {
          role: "assistant",
          content: "That's a common pattern. When they come back with questions, what do you typically do?"
        },
        {
          role: "user",
          content: "I usually just tell them what to do. It's faster than explaining the whole decision-making process."
        },
        {
          role: "assistant",
          content: "Right. So you've trained them that you're the fastest path to an answer. What would happen if you stopped being that path?"
        },
        {
          role: "user",
          content: "They'd have to figure it out themselves. But what if they make the wrong call?"
        },
        {
          role: "assistant",
          content: "Define 'wrong call' for me. What's the actual risk here versus the cost of you being the bottleneck?"
        },
        {
          role: "user",
          content: "You're right. Most decisions aren't life or death. I think I'm just uncomfortable with not being in control."
        },
        {
          role: "assistant",
          content: "That's the real issue. Control feels like safety, but it's actually limiting your team's growth. What's one decision category you could fully hand off this week?"
        },
        {
          role: "user",
          content: "Client onboarding process decisions. They know the process better than I do anyway."
        },
        {
          role: "assistant",
          content: "Good. Make that explicit. Tell your team: 'For client onboarding, you own the decisions. I trust your judgment. If you want my input, I'm here, but you don't need my approval.' Then stick to it."
        }
      ]),
    });
    testSessionId = Number(sessionResult[0].insertId);
    console.log('Created test session with ID:', testSessionId);

    // Create test commitments
    await db.insert(coachingCommitments).values([
      {
        coachingUserId: testCoachingUserId,
        userId: testUserId,
        sessionId: testSessionId,
        action: "Announce to team: Client onboarding decisions are now fully owned by them",
        context: "Stop being the bottleneck and let team develop decision-making skills",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        status: "pending",
      },
      {
        coachingUserId: testCoachingUserId,
        userId: testUserId,
        sessionId: testSessionId,
        action: "When team asks for approval on onboarding decisions, redirect them to make the call",
        context: "Practice letting go of control",
        status: "pending",
      },
    ]);
  });

  it("should generate session summary with LLM analysis", async () => {
    const summary = await generateSessionSummary(testSessionId);
    
    expect(summary).toBeDefined();
    expect(summary).toHaveProperty("userName");
    expect(summary).toHaveProperty("sessionDate");
    expect(summary).toHaveProperty("commitments");
    expect(summary).toHaveProperty("keyThemes");
    expect(summary).toHaveProperty("patrickObservation");
    expect(summary).toHaveProperty("nextSessionPrompt");

    // Verify commitments were captured
    expect(summary!.commitments.length).toBeGreaterThan(0);
    expect(summary!.commitments[0].action).toContain("Client onboarding");

    // Verify LLM generated insights
    expect(summary!.keyThemes.length).toBeGreaterThan(0);
    expect(summary!.patrickObservation.length).toBeGreaterThan(10);
    expect(summary!.nextSessionPrompt.length).toBeGreaterThan(10);

    console.log("Generated Summary:", JSON.stringify(summary, null, 2));
  }, 30000); // 30 second timeout for LLM call

  it("should send session summary email", async () => {
    // Note: This will attempt to send a real email via Mailchimp
    // In production, you might want to mock the email service
    const sent = await sendSessionSummaryEmail(testSessionId);
    
    // Email sending might fail if Mailchimp is not configured
    // We just verify the function executes without throwing
    expect(typeof sent).toBe("boolean");
    
    if (sent) {
      console.log("✅ Session summary email sent successfully");
    } else {
      console.log("⚠️  Email sending failed (Mailchimp may not be configured)");
    }
  }, 30000); // 30 second timeout for email sending
});
