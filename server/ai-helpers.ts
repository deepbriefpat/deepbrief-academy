/**
 * AI Helper Functions for Pressure Mirror Coaching
 * 
 * These functions use LLM to extract commitments, detect patterns,
 * and generate insights from coaching conversations.
 */

import { invokeLLM } from "./_core/llm";
import { parseRelativeDate } from "./dateParser";

export interface ExtractedCommitment {
  description: string;
  dueDate?: string; // Optional ISO date string
  priority: "low" | "medium" | "high";
  category: string; // e.g., "leadership", "communication", "decision-making"
}

export interface BehavioralPattern {
  patternType: "avoidance" | "over_indexing" | "pressure_response" | "recurring_theme";
  description: string;
  frequency: number;
  firstObserved: string; // ISO date
  lastObserved: string; // ISO date
  examples: string[];
  insight: string;
}

export interface SessionInsight {
  keyThemes: string[];
  emotionalState: "stressed" | "confident" | "uncertain" | "overwhelmed" | "clear";
  progressIndicators: string[];
  concerningPatterns: string[];
  coachingRecommendations: string[];
}

/**
 * Extract commitments from a coaching conversation
 * Looks for promises, action items, and stated intentions
 */
/**
 * Parse commitments from coach's markdown table format
 * Fallback parser for when coach formats commitments in a table
 */
function parseCommitmentTable(content: string): ExtractedCommitment[] {
  const commitments: ExtractedCommitment[] = [];
  
  // Look for "Commitments Logged:" section followed by a markdown table
  const tableMatch = content.match(/Commitments Logged:[\s\S]*?\|.*?\|.*?\|.*?\|.*?\|([\s\S]*?)(?=\n\n|$)/i);
  if (!tableMatch) return commitments;
  
  const tableContent = tableMatch[0];
  const lines = tableContent.split('\n').filter(line => line.trim() && !line.includes('---'));
  
  // Skip header line and separator
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
    
    if (cells.length >= 3) {
      const commitment = cells[0];
      const description = cells[1];
      const deadline = cells[2];
      
      // Parse deadline to ISO date
      let dueDate: string | null = null;
      if (deadline && deadline.toLowerCase() !== 'pending' && deadline.toLowerCase() !== 'status') {
        const today = new Date();
        if (deadline.toLowerCase().includes('today')) {
          dueDate = today.toISOString();
        } else if (deadline.toLowerCase().includes('tomorrow')) {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          dueDate = tomorrow.toISOString();
        } else if (deadline.toLowerCase().includes('two days')) {
          const twoDays = new Date(today);
          twoDays.setDate(twoDays.getDate() + 2);
          dueDate = twoDays.toISOString();
        } else if (deadline.toLowerCase().includes('week')) {
          const week = new Date(today);
          week.setDate(week.getDate() + 7);
          dueDate = week.toISOString();
        }
      }
      
      commitments.push({
        description: `${commitment}: ${description}`,
        dueDate: dueDate || undefined,
        priority: deadline?.toLowerCase().includes('today') ? 'high' : 'medium',
        category: 'action-item'
      });
    }
  }
  
  return commitments;
}

export async function extractCommitments(
  conversationHistory: Array<{ role: string; content: string }>,
  userId: number
): Promise<ExtractedCommitment[]> {
  // First, try to parse structured commitment tables from coach messages
  const tableCommitments: ExtractedCommitment[] = [];
  for (const message of conversationHistory) {
    if (message.role === 'assistant' && typeof message.content === 'string') {
      const parsed = parseCommitmentTable(message.content);
      tableCommitments.push(...parsed);
    }
  }
  
  // If we found commitments in tables, return them immediately
  if (tableCommitments.length > 0) {
    console.log(`[Commitments] Found ${tableCommitments.length} commitments in coach's table format`);
    return tableCommitments;
  }
  
  // Otherwise, fall back to LLM extraction for natural language commitments
  console.log(`[Commitments] No table format found, using LLM extraction for ${conversationHistory.length} messages`);
  console.log(`[Commitments] Sample messages:`, conversationHistory.slice(-3).map(m => ({ role: m.role, preview: typeof m.content === 'string' ? m.content.substring(0, 100) : 'non-string' })));
  
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert at identifying commitments in executive coaching conversations.
        
Extract ALL commitments, promises, action items, and stated intentions from the conversation.
A commitment is anything the coachee says they will do, should do, or intends to do.

Look for commitments in TWO forms:
1. NATURAL LANGUAGE: User statements like "I'll talk to my team", "I need to decide by Friday", "I should address this"
2. COACH SUMMARIES: When the coach summarizes commitments in tables, lists, or structured formats (e.g., "Commitments Logged:", "Action 1:", "Action 2:", etc.)

Examples of natural language commitments:
- "I'll talk to my team about this tomorrow"
- "I need to make a decision by Friday"
- "I should probably address this with my co-founder"
- "I'm going to try the CALM protocol next time"

Examples of coach-formatted commitments:
- "Termination Meeting - Conduct the termination conversation with the employee"
- "Action 1: Scheduling - Send the calendar invite for the meeting"
- "Commitment: Review the quarterly numbers by end of week"

For each commitment, determine:
1. Clear description of what they committed to
2. Due date (if mentioned or implied - be generous with interpretation)
3. Priority level (high = urgent/important, medium = important, low = nice to have)
4. Category (leadership, communication, decision-making, team-management, self-care, strategy, etc.)

Return ONLY valid JSON array. If no commitments found, return empty array.`
      },
      {
        role: "user",
        content: `Extract commitments from this conversation:\n\n${conversationHistory.map(m => `${m.role}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`).join('\n\n')}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "commitment_extraction",
        strict: true,
        schema: {
          type: "object",
          properties: {
            commitments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  dueDate: { type: "string" },
                  priority: { type: "string", enum: ["low", "medium", "high"] },
                  category: { type: "string" }
                },
                required: ["description", "priority", "category"],
                additionalProperties: false
              }
            }
          },
          required: ["commitments"],
          additionalProperties: false
        }
      }
    }
  });

  console.log("[extractCommitments] LLM Response:", JSON.stringify(response, null, 2));
  
  if (!response.choices || response.choices.length === 0) {
    console.error("[extractCommitments] No response.choices from LLM. Full response:", response);
    return [];
  }
  
  const content = response.choices[0].message.content;
  console.log("[extractCommitments] Content from LLM:", content);
  
  if (!content) {
    console.error("[extractCommitments] No content in response.choices[0].message");
    return [];
  }
  
  try {
    const result = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
    console.log("[extractCommitments] Parsed result:", result);
    console.log("[extractCommitments] Returning", result.commitments?.length || 0, "commitments");
    return result.commitments || [];
  } catch (error) {
    console.error("[extractCommitments] Failed to parse commitments:", error);
    console.error("[extractCommitments] Content was:", content);
    return [];
  }
}

/**
 * Generate proactive follow-up questions based on previous commitments
 * This creates the "pressure" by immediately calling out unfinished business
 */
export async function generateFollowUpPrompt(
  openCommitments: Array<{
    id: number;
    description: string;
    createdAt: Date;
    dueDate: Date | null;
    priority: string;
  }>
): Promise<string> {
  if (openCommitments.length === 0) {
    return "";
  }

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a direct, no-BS executive coach. Your job is to hold people accountable.

Generate a SHORT, SHARP opening that:
1. Immediately calls out the most important unfinished commitment
2. Asks what happened (not "how did it go" - assume they might not have done it)
3. Uses 2-3 sentences MAX
4. Sounds like a real coach, not a chatbot

Tone: Direct but supportive. You're calling them on their shit, but you're on their side.

Examples:
- "Last time you said you'd talk to your co-founder about equity. What happened?"
- "You committed to making that hiring decision by Friday. Did you do it, or are we still circling?"
- "Three days ago you said you'd address the team performance issue. I'm guessing you didn't. Why not?"`
      },
      {
        role: "user",
        content: `Open commitments:\n${openCommitments.map(c => 
          `- ${c.description} (${c.priority} priority, ${c.dueDate ? `due ${c.dueDate.toLocaleDateString()}` : 'no due date'})`
        ).join('\n')}`
      }
    ]
  });

  const content = response.choices[0].message.content;
  return typeof content === 'string' ? content.trim() : '';
}

/**
 * Analyze conversation for behavioral patterns
 * Detects avoidance, over-indexing, pressure responses, etc.
 */
export async function detectBehavioralPatterns(
  recentSessions: Array<{
    sessionId: number;
    createdAt: Date;
    messages: Array<{ role: string; content: string }>;
  }>
): Promise<BehavioralPattern[]> {
  if (recentSessions.length < 3) {
    return []; // Need at least 3 sessions to detect patterns
  }

  const conversationText = recentSessions.map(session => 
    `Session ${session.createdAt.toLocaleDateString()}:\n${session.messages.map(m => `${m.role}: ${m.content}`).join('\n')}`
  ).join('\n\n---\n\n');

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert executive coach analyzing behavioral patterns across multiple coaching sessions.

Identify recurring patterns in how this person:
1. AVOIDS certain topics or decisions
2. OVER-INDEXES on certain behaviors (over-analyzing, seeking permission, etc.)
3. RESPONDS TO PRESSURE (shuts down, gets defensive, takes action, etc.)
4. RECURRING THEMES they keep coming back to

For each pattern:
- Type: avoidance, over_indexing, pressure_response, or recurring_theme
- Description: What specifically are they doing?
- Frequency: How many times did you observe this? (count)
- Examples: Specific quotes or situations from the sessions
- Insight: What does this pattern reveal? What's the underlying issue?

Only include patterns you observed at least 2-3 times. Be specific and direct.
Return ONLY valid JSON array. If no patterns detected, return empty array.`
      },
      {
        role: "user",
        content: `Analyze these coaching sessions for behavioral patterns:\n\n${conversationText}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "pattern_detection",
        strict: true,
        schema: {
          type: "object",
          properties: {
            patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  patternType: { 
                    type: "string", 
                    enum: ["avoidance", "over_indexing", "pressure_response", "recurring_theme"] 
                  },
                  description: { type: "string" },
                  frequency: { type: "number" },
                  firstObserved: { type: "string" },
                  lastObserved: { type: "string" },
                  examples: { 
                    type: "array",
                    items: { type: "string" }
                  },
                  insight: { type: "string" }
                },
                required: ["patternType", "description", "frequency", "firstObserved", "lastObserved", "examples", "insight"],
                additionalProperties: false
              }
            }
          },
          required: ["patterns"],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices[0].message.content;
  const result = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
  return result.patterns;
}

/**
 * Generate session insights for immediate feedback
 * This runs after each conversation to surface key themes and concerns
 */
export async function generateSessionInsights(
  sessionMessages: Array<{ role: string; content: string }>
): Promise<SessionInsight> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert executive coach analyzing a single coaching session.

Extract:
1. KEY THEMES: What topics dominated this conversation? (3-5 items)
2. EMOTIONAL STATE: How is this person feeling? (stressed/confident/uncertain/overwhelmed/clear)
3. PROGRESS INDICATORS: What positive movement or clarity did they gain? (2-4 items)
4. CONCERNING PATTERNS: What red flags or worrying behaviors did you notice? (1-3 items, or empty if none)
5. COACHING RECOMMENDATIONS: What should the next session focus on? (2-3 specific items)

Be direct and specific. Use their actual words when possible.
Return ONLY valid JSON.`
      },
      {
        role: "user",
        content: `Analyze this coaching session:\n\n${sessionMessages.map(m => `${m.role}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`).join('\n\n')}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "session_insights",
        strict: true,
        schema: {
          type: "object",
          properties: {
            keyThemes: {
              type: "array",
              items: { type: "string" }
            },
            emotionalState: {
              type: "string",
              enum: ["stressed", "confident", "uncertain", "overwhelmed", "clear"]
            },
            progressIndicators: {
              type: "array",
              items: { type: "string" }
            },
            concerningPatterns: {
              type: "array",
              items: { type: "string" }
            },
            coachingRecommendations: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["keyThemes", "emotionalState", "progressIndicators", "concerningPatterns", "coachingRecommendations"],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices[0].message.content;
  const result = JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
  return result;
}

/**
 * Generate monthly insight report
 * Comprehensive analysis of patterns, progress, and recommendations
 */
export async function generateMonthlyReport(
  userId: number,
  sessions: Array<{
    sessionId: number;
    createdAt: Date;
    messages: Array<{ role: string; content: string }>;
  }>,
  commitments: Array<{
    description: string;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
  }>,
  patterns: BehavioralPattern[]
): Promise<string> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an executive coach writing a monthly progress report for your client.

Write a direct, honest report (500-800 words) covering:

1. **EXECUTIVE SUMMARY**: What's the headline? What's the most important thing they need to know?

2. **PROGRESS & WINS**: What did they actually accomplish? Be specific.

3. **PATTERNS & CONCERNS**: What behaviors keep showing up? What's getting in their way?

4. **COMMITMENT TRACKING**: 
   - How many commitments did they make?
   - How many did they complete?
   - What does this completion rate tell us?

5. **RECOMMENDATIONS**: What should they focus on next month? (3-5 specific actions)

Tone: Direct but supportive. You're their coach, not their cheerleader. Call out what needs to be called out, but always with the intent to help them grow.

Use markdown formatting for readability.`
      },
      {
        role: "user",
        content: `Generate monthly report:

SESSIONS: ${sessions.length} sessions this month
${sessions.map(s => `- ${s.createdAt.toLocaleDateString()}: ${s.messages.length} messages`).join('\n')}

COMMITMENTS:
Total: ${commitments.length}
Completed: ${commitments.filter(c => c.status === 'completed').length}
Open: ${commitments.filter(c => c.status === 'open').length}
Missed: ${commitments.filter(c => c.status === 'missed').length}

DETECTED PATTERNS:
${patterns.length > 0 ? patterns.map(p => `- ${p.patternType}: ${p.description} (observed ${p.frequency} times)`).join('\n') : 'No patterns detected yet'}

RECENT SESSION THEMES:
${sessions.slice(0, 3).map(s => {
  const userMessages = s.messages.filter(m => m.role === 'user');
  return `- ${s.createdAt.toLocaleDateString()}: ${userMessages.slice(0, 2).map(m => m.content.substring(0, 100)).join('; ')}`;
}).join('\n')}`
      }
    ]
  });

  const content = response.choices[0].message.content;
  return typeof content === 'string' ? content : '';
}
