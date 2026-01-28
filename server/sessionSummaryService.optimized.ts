import { getDb } from "./db";
import { coachingSessions, coachingCommitments, coachingUsers as coachingUsersTable, users } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

export interface SessionSummaryData {
  sessionDate: string;
  userName: string;
  userEmail: string;
  keyThemes: string[];
  insights: string[];
  commitments: Array<{
    title: string;
    description: string;
    deadline: string;
  }>;
  nextSteps: string[];
  conversationExcerpts: string[];
}

/**
 * Generate a session summary using LLM analysis of conversation history
 */
export async function generateSessionSummary(sessionId: number): Promise<SessionSummaryData | null> {
  const db = await getDb();
  if (!db) {
    console.error("[SessionSummary] ❌ Database not available");
    return null;
  }

  try {
    console.log(`[SessionSummary] 📊 Generating summary for session ${sessionId}`);
    
    // Get session data
    const sessions = await db
      .select()
      .from(coachingSessions)
      .where(eq(coachingSessions.id, sessionId))
      .limit(1);

    if (sessions.length === 0) {
      console.error(`[SessionSummary] ❌ Session ${sessionId} not found`);
      return null;
    }

    const session = sessions[0];
    const messages = JSON.parse(session.messages || "[]");

    if (messages.length === 0) {
      console.error(`[SessionSummary] ❌ No messages in session ${sessionId}`);
      return null;
    }

    // Get coaching user
    const coachingUserResults = await db
      .select()
      .from(coachingUsersTable)
      .where(eq(coachingUsersTable.id, session.coachingUserId))
      .limit(1);
    
    if (coachingUserResults.length === 0) {
      console.error(`[SessionSummary] ❌ Coaching user not found`);
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
      console.error(`[SessionSummary] ❌ User not found`);
      return null;
    }
    
    const user = userResults[0];

    // Get commitments from this session
    const commitments = await db
      .select()
      .from(coachingCommitments)
      .where(eq(coachingCommitments.sessionId, sessionId))
      .orderBy(desc(coachingCommitments.createdAt));

    console.log(`[SessionSummary] 🤖 Calling LLM to analyze ${messages.length} messages`);

    // Use LLM to analyze the conversation
    const conversationText = messages
      .map((m: any) => `${m.role === 'user' ? 'Leader' : 'Coach'}: ${m.content}`)
      .join('\n\n');

    const llmResponse = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are analyzing a leadership coaching session. Extract:
1. Key themes discussed (3-5 main topics)
2. Core insights or breakthroughs (2-4 key realizations)
3. Next steps or action items (3-5 specific actions)
4. Notable conversation excerpts (2-3 powerful quotes from the leader)

Format as JSON:
{
  "keyThemes": ["theme1", "theme2", ...],
  "insights": ["insight1", "insight2", ...],
  "nextSteps": ["step1", "step2", ...],
  "conversationExcerpts": ["quote1", "quote2", ...]
}`
        },
        {
          role: "user",
          content: `Analyze this coaching session:\n\n${conversationText}`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "session_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              keyThemes: {
                type: "array",
                items: { type: "string" }
              },
              insights: {
                type: "array",
                items: { type: "string" }
              },
              nextSteps: {
                type: "array",
                items: { type: "string" }
              },
              conversationExcerpts: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["keyThemes", "insights", "nextSteps", "conversationExcerpts"],
            additionalProperties: false
          }
        }
      }
    });

    const messageContent = llmResponse.choices[0].message.content;
    const contentString = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
    const analysis = JSON.parse(contentString || "{}");
    console.log(`[SessionSummary] ✅ LLM analysis complete`);

    const summaryData: SessionSummaryData = {
      sessionDate: new Date(session.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      userName: user.name || "Leader",
      userEmail: user.email || "",
      keyThemes: analysis.keyThemes || [],
      insights: analysis.insights || [],
      commitments: commitments.map(c => ({
        title: c.action,
        description: c.context || "",
        deadline: c.deadline ? new Date(c.deadline).toLocaleDateString() : "No deadline set"
      })),
      nextSteps: analysis.nextSteps || [],
      conversationExcerpts: analysis.conversationExcerpts || []
    };

    console.log(`[SessionSummary] ✅ Summary generated successfully`);
    return summaryData;

  } catch (error) {
    console.error("[SessionSummary] ❌ Error generating summary:", error);
    return null;
  }
}

/**
 * Send session summary via notification (simpler than email)
 */
export async function sendSessionSummaryNotification(
  sessionId: number,
  summaryData: SessionSummaryData
): Promise<boolean> {
  try {
    console.log(`[SessionSummary] 📧 Sending notification for session ${sessionId}`);

    // Format as rich notification content
    const content = `
**Session Summary - ${summaryData.sessionDate}**

**Key Themes:**
${summaryData.keyThemes.map(theme => `• ${theme}`).join('\n')}

**Core Insights:**
${summaryData.insights.map(insight => `• ${insight}`).join('\n')}

**Commitments Made:**
${summaryData.commitments.length > 0 
  ? summaryData.commitments.map(c => `• ${c.title} (${c.deadline})`).join('\n')
  : '• No commitments recorded'}

**Next Steps:**
${summaryData.nextSteps.map(step => `• ${step}`).join('\n')}

**Notable Moments:**
${summaryData.conversationExcerpts.map(quote => `> "${quote}"`).join('\n\n')}

---
*Coaching session with ${summaryData.userName}*
    `.trim();

    const success = await notifyOwner({
      title: `Coaching Session Summary - ${summaryData.userName}`,
      content
    });

    if (success) {
      console.log(`[SessionSummary] ✅ Notification sent successfully`);
    } else {
      console.error(`[SessionSummary] ❌ Notification failed to send`);
    }

    return success;

  } catch (error) {
    console.error("[SessionSummary] ❌ Error sending notification:", error);
    return false;
  }
}

/**
 * Generate and send session summary (main entry point)
 */
export async function generateAndSendSessionSummary(sessionId: number): Promise<boolean> {
  console.log(`[SessionSummary] 🚀 Starting summary generation for session ${sessionId}`);
  
  const summaryData = await generateSessionSummary(sessionId);
  
  if (!summaryData) {
    console.error(`[SessionSummary] ❌ Failed to generate summary`);
    return false;
  }

  const sent = await sendSessionSummaryNotification(sessionId, summaryData);
  
  return sent;
}
