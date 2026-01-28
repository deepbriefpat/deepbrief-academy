import { getDb } from "./db";
import { coachingSessions, coachingCommitments, coachingUsers as coachingUsersTable, users } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
import { sendTransactionalEmail } from "./_core/emailService";
import { generateSessionSummaryEmail, generateSessionSummaryPlainText, SessionSummaryData } from "./templates/sessionSummaryEmail";

/**
 * Generate a session summary using LLM analysis of conversation history
 */
export async function generateSessionSummary(sessionId: number): Promise<SessionSummaryData | null> {
  const db = await getDb();
  if (!db) {
    console.error("[SessionSummary] Database not available");
    return null;
  }

  try {
    // Get session data
    const sessions = await db
      .select()
      .from(coachingSessions)
      .where(eq(coachingSessions.id, sessionId))
      .limit(1);

    if (sessions.length === 0) {
      console.error(`[SessionSummary] Session ${sessionId} not found`);
      return null;
    }

    const session = sessions[0];
    const messages = JSON.parse(session.messages || "[]");

    // Get coaching user
    const coachingUserResults = await db
      .select()
      .from(coachingUsersTable)
      .where(eq(coachingUsersTable.id, session.coachingUserId))
      .limit(1);
    
    if (coachingUserResults.length === 0) {
      console.error(`[SessionSummary] Coaching user not found for session ${sessionId}`);
      return null;
    }
    
    const coachingUser = coachingUserResults[0];
    
    // Get user data
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.id, coachingUser.userId))
      .limit(1);
    
    if (userResults.length === 0) {
      console.error(`[SessionSummary] User not found for session ${sessionId}`);
      return null;
    }
    
    const user = userResults[0];

    // Get commitments from this session
    const sessionCommitments = await db
      .select()
      .from(coachingCommitments)
      .where(eq(coachingCommitments.sessionId, sessionId))
      .orderBy(desc(coachingCommitments.createdAt));

    // Build conversation context for LLM
    const conversationText = messages
      .map((m: any) => `${m.role === "user" ? "User" : "Coach"}: ${m.content}`)
      .join("\n\n");

    // Use LLM to generate summary insights
    const summaryPrompt = `You are Patrick Voorma, reviewing a coaching session to create a brief, direct summary email.

CONVERSATION HISTORY:
${conversationText}

Generate a session summary with:
1. KEY THEMES: 2-4 main topics or patterns (as an array of strings)
2. PATRICK'S OBSERVATION: One powerful, direct observation about what you noticed (1-2 sentences, in Patrick's voice - no corporate jargon, straight talk)
3. NEXT SESSION PROMPT: What the user should think about before the next session (1-2 sentences, action-oriented)

Return ONLY valid JSON in this exact format:
{
  "keyThemes": ["theme 1", "theme 2", "theme 3"],
  "patrickObservation": "Your observation here",
  "nextSessionPrompt": "What to think about next"
}`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are Patrick Voorma, an executive coach. Be direct, tactical, and authentic. No corporate jargon." },
        { role: "user", content: summaryPrompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "session_summary",
          strict: true,
          schema: {
            type: "object",
            properties: {
              keyThemes: {
                type: "array",
                items: { type: "string" },
                description: "2-4 main themes from the session"
              },
              patrickObservation: {
                type: "string",
                description: "One powerful observation in Patrick's voice"
              },
              nextSessionPrompt: {
                type: "string",
                description: "What to think about before next session"
              }
            },
            required: ["keyThemes", "patrickObservation", "nextSessionPrompt"],
            additionalProperties: false
          }
        }
      }
    });

    const summaryData = JSON.parse(response.choices[0].message.content as string);

    // Format commitments for email
    const commitments = sessionCommitments.map(c => ({
      action: c.action,
      context: c.context || undefined,
      deadline: c.deadline ? new Date(c.deadline).toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }) : undefined,
    }));

    // Build final summary data
    const sessionSummary: SessionSummaryData = {
      userName: user.name || "there",
      sessionDate: new Date(session.createdAt).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      commitments,
      keyThemes: summaryData.keyThemes,
      patrickObservation: summaryData.patrickObservation,
      nextSessionPrompt: summaryData.nextSessionPrompt,
    };

    return sessionSummary;

  } catch (error) {
    console.error(`[SessionSummary] Failed to generate summary for session ${sessionId}:`, error);
    return null;
  }
}

/**
 * Send post-session summary email to user
 */
export async function sendSessionSummaryEmail(sessionId: number): Promise<boolean> {
  console.log(`[SessionSummary] ===== START sendSessionSummaryEmail for session ${sessionId} =====`);
  console.log(`[SessionSummary] MAILCHIMP_API_KEY present: ${!!process.env.MAILCHIMP_API_KEY}`);
  console.log(`[SessionSummary] MAILCHIMP_API_KEY starts with: ${process.env.MAILCHIMP_API_KEY?.substring(0, 5)}`);
  
  const db = await getDb();
  if (!db) {
    console.error("[SessionSummary] Database not available");
    return false;
  }

  try {
    // Get session data to find user email
    const sessions = await db
      .select()
      .from(coachingSessions)
      .where(eq(coachingSessions.id, sessionId))
      .limit(1);

    if (sessions.length === 0) {
      console.error(`[SessionSummary] Session ${sessionId} not found`);
      return false;
    }

    const session = sessions[0];

    // Get coaching user
    const coachingUserResults = await db
      .select()
      .from(coachingUsersTable)
      .where(eq(coachingUsersTable.id, session.coachingUserId))
      .limit(1);
    
    if (coachingUserResults.length === 0) {
      console.error(`[SessionSummary] Coaching user not found for session ${sessionId}`);
      return false;
    }
    
    const coachingUser = coachingUserResults[0];
    
    // Get user data
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.id, coachingUser.userId))
      .limit(1);
    
    if (userResults.length === 0 || !userResults[0].email) {
      console.error(`[SessionSummary] User email not found for session ${sessionId}`);
      return false;
    }
    
    const userEmail = userResults[0].email;

    // Generate summary
    const summaryData = await generateSessionSummary(sessionId);
    if (!summaryData) {
      console.error(`[SessionSummary] Failed to generate summary for session ${sessionId}`);
      return false;
    }

    // Generate email HTML and plain text
    const emailHtml = generateSessionSummaryEmail(summaryData);
    const emailPlainText = generateSessionSummaryPlainText(summaryData);
    
    // Send email using Transactional API (same as welcome emails)
    console.log(`[SessionSummary] About to call sendTransactionalEmail`);
    console.log(`[SessionSummary] - To: ${userEmail}`);
    console.log(`[SessionSummary] - Name: ${summaryData.userName}`);
    console.log(`[SessionSummary] - HTML length: ${emailHtml.length}`);
    console.log(`[SessionSummary] - Plain text length: ${emailPlainText.length}`);
    
    const sent = await sendTransactionalEmail(
      userEmail,
      summaryData.userName,
      "Your Coaching Session Summary",
      emailHtml,
      emailPlainText
    );

    console.log(`[SessionSummary] sendTransactionalEmail returned: ${sent}`);
    
    if (sent) {
      console.log(`[SessionSummary] ✅ Successfully sent summary email for session ${sessionId} to ${userEmail}`);
    } else {
      console.error(`[SessionSummary] ❌ Failed to send summary email for session ${sessionId} - sendTransactionalEmail returned false`);
    }

    return sent;

  } catch (error) {
    console.error(`[SessionSummary] ❌ EXCEPTION in sendSessionSummaryEmail for session ${sessionId}`);
    console.error(`[SessionSummary] Error type: ${error instanceof Error ? error.constructor.name : typeof error}`);
    console.error(`[SessionSummary] Error message: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`[SessionSummary] Full error:`, error);
    if (error instanceof Error && error.stack) {
      console.error(`[SessionSummary] Stack trace:`, error.stack);
    }
    return false;
  } finally {
    console.log(`[SessionSummary] ===== END sendSessionSummaryEmail for session ${sessionId} =====`);
  }
}
