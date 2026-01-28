/**
 * Test script to verify commitment extraction works correctly
 * Run with: node test-commitment-extraction.mjs
 */

import { invokeLLM } from "./server/_core/llm.ts";

// Sample conversation from user's screenshot
const testConversation = [
  {
    role: "user",
    content: "I need to have a difficult conversation with an underperforming team member. I've been putting it off for weeks."
  },
  {
    role: "assistant",
    content: "What's making you avoid it? What's the cost of waiting another week versus having it tomorrow?"
  },
  {
    role: "user",
    content: "You're right. I need to do this. I'll schedule the meeting for tomorrow afternoon and prepare talking points tonight."
  },
  {
    role: "assistant",
    content: "Good. Let's make this concrete.\n\nYour commitment for the next two days:\n1. **Tonight (by 9pm)**: Write down 3 specific examples of underperformance and what good looks like\n2. **Tomorrow afternoon**: Have the conversation. Start with \"I want to talk about your performance on X, Y, Z\"\n\nWhat time tomorrow will you block for this?"
  },
  {
    role: "user",
    content: "I'll do 2pm tomorrow. And I'll write the examples tonight after dinner."
  }
];

console.log("Testing commitment extraction...\n");
console.log("Sample conversation:");
testConversation.forEach((msg, i) => {
  console.log(`${i + 1}. ${msg.role}: ${msg.content.substring(0, 100)}...`);
});
console.log("\n");

try {
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
        content: `Extract commitments from this conversation:\n\n${testConversation.map(m => `${m.role}: ${m.content}`).join('\n\n')}`
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
                  dueDate: { type: ["string", "null"] },
                  priority: { type: "string", enum: ["low", "medium", "high"] },
                  category: { type: "string" }
                },
                required: ["description", "dueDate", "priority", "category"],
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

  const content = response.choices[0].message.content;
  const result = JSON.parse(content);
  
  console.log("✅ Commitment extraction SUCCESS!\n");
  console.log(`Found ${result.commitments.length} commitments:\n`);
  
  result.commitments.forEach((c, i) => {
    console.log(`${i + 1}. ${c.description}`);
    console.log(`   Due: ${c.dueDate || 'No deadline'}`);
    console.log(`   Priority: ${c.priority}`);
    console.log(`   Category: ${c.category}`);
    console.log();
  });
  
  if (result.commitments.length === 0) {
    console.log("⚠️  WARNING: No commitments extracted from conversation that clearly contains commitments!");
    console.log("This indicates the extraction logic may not be working correctly.");
    process.exit(1);
  }
  
  if (result.commitments.length < 2) {
    console.log("⚠️  WARNING: Only extracted", result.commitments.length, "commitment(s)");
    console.log("Expected at least 2 commitments from this conversation:");
    console.log("1. Write down 3 examples tonight by 9pm");
    console.log("2. Have the conversation tomorrow at 2pm");
    process.exit(1);
  }
  
  console.log("✅ Test PASSED - Commitment extraction is working correctly!");
  process.exit(0);
  
} catch (error) {
  console.error("❌ Commitment extraction FAILED:");
  console.error(error);
  process.exit(1);
}
