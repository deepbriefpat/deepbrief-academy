/**
 * Test to verify commitment extraction works correctly
 */

import { describe, it, expect } from "vitest";
import { extractCommitments } from "./ai-helpers";

describe("Commitment Extraction", () => {
  it("should extract commitments from coaching conversation", async () => {
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

    const commitments = await extractCommitments(testConversation, 1);
    
    console.log(`\n✅ Extracted ${commitments.length} commitments:`);
    commitments.forEach((c, i) => {
      console.log(`${i + 1}. ${c.description}`);
      console.log(`   Due: ${c.dueDate || 'No deadline'}`);
      console.log(`   Priority: ${c.priority}`);
      console.log(`   Category: ${c.category}\n`);
    });

    // Verify we extracted at least some commitments
    expect(commitments.length).toBeGreaterThan(0);
    
    // Verify commitments have required fields
    commitments.forEach(c => {
      expect(c.description).toBeDefined();
      expect(c.description.length).toBeGreaterThan(0);
      expect(c.priority).toMatch(/^(low|medium|high)$/);
      expect(c.category).toBeDefined();
    });
    
    // Check if we found the key commitments
    const descriptions = commitments.map(c => c.description.toLowerCase());
    const hasWriteExamples = descriptions.some(d => 
      d.includes('write') || d.includes('examples') || d.includes('talking points')
    );
    const hasConversation = descriptions.some(d => 
      d.includes('conversation') || d.includes('meeting') || d.includes('2pm')
    );
    
    console.log(`Found "write examples" commitment: ${hasWriteExamples}`);
    console.log(`Found "have conversation" commitment: ${hasConversation}`);
    
    // At least one of the key commitments should be found
    expect(hasWriteExamples || hasConversation).toBe(true);
  }, 30000); // 30 second timeout for LLM call
});
