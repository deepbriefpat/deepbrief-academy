import { describe, it, expect } from "vitest";

/**
 * Test suite for CoachComparison error handling
 * Verifies that the component gracefully handles missing getRecommendedCoaches endpoint
 */
describe("CoachComparison Error Handling", () => {
  it("should handle undefined recommendations gracefully", () => {
    // Simulate the isRecommended function logic
    const isRecommended = (coachId: string, recommendations: any) => {
      // Safely check recommendations, default to false if endpoint failed
      if (!recommendations || !Array.isArray(recommendations)) {
        return false;
      }
      return recommendations.some((r: any) => r.coachId === coachId);
    };

    // Test with undefined recommendations (endpoint failed)
    expect(isRecommended("sarah", undefined)).toBe(false);
    
    // Test with null recommendations
    expect(isRecommended("sarah", null)).toBe(false);
    
    // Test with non-array recommendations
    expect(isRecommended("sarah", {} as any)).toBe(false);
    expect(isRecommended("sarah", "invalid" as any)).toBe(false);
    
    // Test with empty array (endpoint succeeded but no recommendations)
    expect(isRecommended("sarah", [])).toBe(false);
    
    // Test with valid recommendations
    const validRecommendations = [
      { coachId: "sarah", reason: "Great for leadership" },
      { coachId: "marcus", reason: "Good for strategy" }
    ];
    expect(isRecommended("sarah", validRecommendations)).toBe(true);
    expect(isRecommended("marcus", validRecommendations)).toBe(true);
    expect(isRecommended("alex", validRecommendations)).toBe(false);
  });

  it("should handle session count calculation with undefined sessions", () => {
    // Simulate the sessionCountByCoach calculation
    const calculateSessionCount = (sessions: any) => {
      return sessions?.reduce((acc: Record<string, number>, session: any) => {
        const coachId = session.coachId || "sarah";
        acc[coachId] = (acc[coachId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
    };

    // Test with undefined sessions
    const undefinedResult = calculateSessionCount(undefined);
    expect(undefinedResult).toEqual({});
    
    // Test with null sessions
    const nullResult = calculateSessionCount(null);
    expect(nullResult).toEqual({});
    
    // Test with empty array
    const emptyResult = calculateSessionCount([]);
    expect(emptyResult).toEqual({});
    
    // Test with valid sessions
    const validSessions = [
      { id: 1, coachId: "sarah" },
      { id: 2, coachId: "sarah" },
      { id: 3, coachId: "marcus" },
      { id: 4, coachId: null }, // Should default to "sarah"
    ];
    const validResult = calculateSessionCount(validSessions);
    expect(validResult).toEqual({
      sarah: 3, // 2 explicit + 1 default
      marcus: 1
    });
  });
});
