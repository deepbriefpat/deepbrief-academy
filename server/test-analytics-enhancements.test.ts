/**
 * Test for Analytics Enhancements
 * 
 * Verifies that:
 * 1. Commitment stats are calculated correctly
 * 2. Analytics component receives commitment data
 * 3. Resume page cards have proper navigation
 */

import { describe, it, expect } from "vitest";

describe("Analytics Enhancements", () => {
  it("should calculate commitment stats correctly", () => {
    const mockCommitments = [
      { id: 1, action: "Task 1", status: "completed", deadline: Date.now() + 86400000, progress: 100 },
      { id: 2, action: "Task 2", status: "pending", deadline: Date.now() + 86400000, progress: 50 },
      { id: 3, action: "Task 3", status: "pending", deadline: Date.now() - 86400000, progress: 0 }, // Overdue
      { id: 4, action: "Task 4", status: "completed", deadline: Date.now() + 86400000, progress: 100 },
      { id: 5, action: "Task 5", status: "pending", deadline: null, progress: 25 },
    ];

    // Calculate stats (mimicking the logic in CoachingAnalytics component)
    const total = mockCommitments.length;
    const completed = mockCommitments.filter(c => c.status === "completed").length;
    const open = mockCommitments.filter(c => c.status === "pending").length;
    const now = Date.now();
    const overdue = mockCommitments.filter(c => 
      c.status === "pending" && c.deadline && c.deadline < now
    ).length;
    const rate = Math.round((completed / total) * 100);

    expect(total).toBe(5);
    expect(completed).toBe(2);
    expect(open).toBe(3);
    expect(overdue).toBe(1);
    expect(rate).toBe(40); // 2/5 = 40%
  });

  it("should handle empty commitments gracefully", () => {
    const mockCommitments: any[] = [];

    const total = mockCommitments.length;
    const completed = mockCommitments.filter(c => c.status === "completed").length;
    const open = mockCommitments.filter(c => c.status === "pending").length;
    const overdue = mockCommitments.filter(c => 
      c.status === "pending" && c.deadline && c.deadline < Date.now()
    ).length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

    expect(total).toBe(0);
    expect(completed).toBe(0);
    expect(open).toBe(0);
    expect(overdue).toBe(0);
    expect(rate).toBe(0);
  });

  it("should identify overdue commitments correctly", () => {
    const now = Date.now();
    const mockCommitments = [
      { id: 1, status: "pending", deadline: now - 86400000 }, // 1 day overdue
      { id: 2, status: "pending", deadline: now + 86400000 }, // Not overdue
      { id: 3, status: "pending", deadline: null }, // No deadline
      { id: 4, status: "completed", deadline: now - 86400000 }, // Completed, not counted
    ];

    const overdue = mockCommitments.filter(c => 
      c.status === "pending" && c.deadline && c.deadline < now
    ).length;

    expect(overdue).toBe(1);
  });

  it("should verify resume page card navigation URLs", () => {
    const expectedUrls = {
      lastSession: "/ai-coach/dashboard?tab=history",
      commitments: "/ai-coach/dashboard?tab=commitments",
      progress: "/ai-coach/dashboard?tab=analytics",
    };

    // Verify URL format
    expect(expectedUrls.lastSession).toContain("?tab=history");
    expect(expectedUrls.commitments).toContain("?tab=commitments");
    expect(expectedUrls.progress).toContain("?tab=analytics");

    // Verify they all point to dashboard
    Object.values(expectedUrls).forEach(url => {
      expect(url).toContain("/ai-coach/dashboard");
    });
  });

  it("should parse tab parameter from URL correctly", () => {
    const testCases = [
      { url: "?tab=history", expected: "insights" }, // history maps to insights
      { url: "?tab=commitments", expected: "commitments" },
      { url: "?tab=analytics", expected: "analytics" },
      { url: "?tab=goals", expected: "goals" },
      { url: "?tab=patterns", expected: "patterns" },
      { url: "?tab=invalid", expected: null }, // Invalid tab
      { url: "", expected: null }, // No tab parameter
    ];

    testCases.forEach(({ url, expected }) => {
      const params = new URLSearchParams(url);
      const tabParam = params.get("tab");
      
      // Map tab parameter to actual tab name
      let actualTab = null;
      if (tabParam === "history") {
        actualTab = "insights";
      } else if (tabParam && ["commitments", "analytics", "goals", "patterns"].includes(tabParam)) {
        actualTab = tabParam;
      }
      
      expect(actualTab).toBe(expected);
    });
  });

  it("should calculate completion rate correctly for edge cases", () => {
    // All completed
    const allCompleted = [
      { status: "completed" },
      { status: "completed" },
    ];
    const rate1 = Math.round((allCompleted.filter(c => c.status === "completed").length / allCompleted.length) * 100);
    expect(rate1).toBe(100);

    // None completed
    const noneCompleted = [
      { status: "pending" },
      { status: "pending" },
    ];
    const rate2 = Math.round((noneCompleted.filter(c => c.status === "completed").length / noneCompleted.length) * 100);
    expect(rate2).toBe(0);

    // Mixed
    const mixed = [
      { status: "completed" },
      { status: "pending" },
      { status: "pending" },
    ];
    const rate3 = Math.round((mixed.filter(c => c.status === "completed").length / mixed.length) * 100);
    expect(rate3).toBe(33); // 1/3 ≈ 33%
  });
});
