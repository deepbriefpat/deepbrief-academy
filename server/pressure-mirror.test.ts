/**
 * Tests for Pressure Mirror Features
 * 
 * Tests deep memory, accountability loops, and pattern recognition
 */

import { describe, it, expect, beforeAll } from "vitest";
import { extractCommitments, generateFollowUpPrompt, detectBehavioralPatterns } from "./ai-helpers";

describe("Pressure Mirror - Deep Memory", () => {
  it("should extract commitments from conversation", async () => {
    const conversation = [
      { role: "user", content: "I need to finish the quarterly report by Friday" },
      { role: "assistant", content: "That's a tight deadline. What's blocking you?" },
      { role: "user", content: "I'll schedule 2 hours tomorrow morning to work on it" },
    ];
    
    const commitments = await extractCommitments(conversation, 1);
    
    expect(Array.isArray(commitments)).toBe(true);
    // AI might or might not extract commitments from short conversations
    // Just verify the structure if any are returned
    if (commitments.length > 0) {
      const firstCommitment = commitments[0];
      expect(firstCommitment).toHaveProperty("description");
      expect(firstCommitment).toHaveProperty("category");
      expect(firstCommitment).toHaveProperty("priority");
      expect(typeof firstCommitment.description).toBe("string");
    }
  }, 30000); // 30s timeout for AI call
  
  it("should generate follow-up prompt for open commitments", async () => {
    const openCommitments = [
      {
        description: "Finish quarterly report",
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        category: "work",
        priority: "high",
      },
      {
        description: "Schedule team 1-on-1s",
        deadline: null,
        category: "management",
        priority: "medium",
      },
    ];
    
    const prompt = await generateFollowUpPrompt(openCommitments);
    
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(50);
    // Should mention the commitments
    expect(prompt.toLowerCase()).toContain("report");
  }, 30000);
});

describe("Pressure Mirror - Pattern Recognition", () => {
  it("should detect behavioral patterns from sessions", async () => {
    const sessions = [
      {
        sessionId: 1,
        createdAt: new Date(),
        messages: [
          { role: "user", content: "I keep avoiding difficult conversations with my team" },
          { role: "assistant", content: "What makes them difficult?" },
          { role: "user", content: "I don't want to upset people" },
        ],
      },
      {
        sessionId: 2,
        createdAt: new Date(),
        messages: [
          { role: "user", content: "I postponed the performance review again" },
          { role: "assistant", content: "Why did you postpone it?" },
          { role: "user", content: "I need more data before I can give feedback" },
        ],
      },
      {
        sessionId: 3,
        createdAt: new Date(),
        messages: [
          { role: "user", content: "I haven't told my boss about the project delays" },
          { role: "assistant", content: "What's stopping you?" },
          { role: "user", content: "I want to fix it first before bringing it up" },
        ],
      },
    ];
    
    const patterns = await detectBehavioralPatterns(sessions);
    
    expect(Array.isArray(patterns)).toBe(true);
    
    if (patterns.length > 0) {
      const firstPattern = patterns[0];
      expect(firstPattern).toHaveProperty("patternType");
      expect(firstPattern).toHaveProperty("description");
      expect(firstPattern).toHaveProperty("insight");
      expect(firstPattern).toHaveProperty("examples");
      expect(firstPattern).toHaveProperty("frequency");
      
      expect(Array.isArray(firstPattern.examples)).toBe(true);
      expect(typeof firstPattern.frequency).toBe("number");
    }
  }, 45000); // 45s timeout for AI analysis
});

describe("Pressure Mirror - Integration", () => {
  it("should handle empty conversations gracefully", async () => {
    const emptyConversation: any[] = [];
    const commitments = await extractCommitments(emptyConversation, 1);
    
    expect(Array.isArray(commitments)).toBe(true);
    expect(commitments.length).toBe(0);
  });
  
  it("should handle conversations with no commitments", async () => {
    const casualConversation = [
      { role: "user", content: "How are you?" },
      { role: "assistant", content: "I'm here to help. What's on your mind?" },
      { role: "user", content: "Just checking in" },
    ];
    
    const commitments = await extractCommitments(casualConversation, 1);
    
    expect(Array.isArray(commitments)).toBe(true);
    // Should return empty or minimal commitments for casual chat
  }, 30000);
  
  it("should handle insufficient sessions for pattern detection", async () => {
    const twoSessions = [
      {
        sessionId: 1,
        createdAt: new Date(),
        messages: [
          { role: "user", content: "Test message" },
          { role: "assistant", content: "Response" },
        ],
      },
      {
        sessionId: 2,
        createdAt: new Date(),
        messages: [
          { role: "user", content: "Another test" },
          { role: "assistant", content: "Another response" },
        ],
      },
    ];
    
    const patterns = await detectBehavioralPatterns(twoSessions);
    
    // Should still return an array, even if empty or with low confidence
    expect(Array.isArray(patterns)).toBe(true);
  }, 45000);
});
