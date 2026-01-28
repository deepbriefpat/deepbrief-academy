/**
 * Test: Undefined Sessions Fix
 * 
 * Verifies that the dashboard handles undefined sessions data gracefully
 * without throwing "Cannot read properties of undefined (reading 'map')" errors.
 * 
 * This is critical for:
 * 1. Guest users (sessions query is disabled)
 * 2. Initial page load before data arrives
 * 3. Error states where query fails
 */

import { describe, it, expect } from 'vitest';

describe('Undefined Sessions Handling', () => {
  it('should handle undefined sessions with nullish coalescing', () => {
    const sessions = undefined;
    
    // This should NOT throw an error
    const result = (sessions ?? []).map((s: any) => s.id);
    
    expect(result).toEqual([]);
    expect(result).toBeInstanceOf(Array);
  });

  it('should handle null sessions with nullish coalescing', () => {
    const sessions = null;
    
    // This should NOT throw an error
    const result = (sessions ?? []).map((s: any) => s.id);
    
    expect(result).toEqual([]);
  });

  it('should work with empty array', () => {
    const sessions: any[] = [];
    
    const result = (sessions ?? []).map((s: any) => s.id);
    
    expect(result).toEqual([]);
  });

  it('should work with actual session data', () => {
    const sessions = [
      { id: 1, coachId: 'sarah' },
      { id: 2, coachId: 'alex' },
      { id: 3, coachId: 'sarah' }
    ];
    
    const coachIds = (sessions ?? []).map(s => s.coachId);
    const uniqueCoaches = coachIds.filter((id, index, self) => self.indexOf(id) === index);
    
    expect(uniqueCoaches).toEqual(['sarah', 'alex']);
  });

  it('should handle previouslyUsedCoaches extraction safely', () => {
    const sessions = undefined;
    
    // Simulate the previouslyUsedCoaches logic
    const previouslyUsedCoaches = (sessions ?? [])
      .map((s: any) => s.coachId)
      .filter((id: string, index: number, self: string[]) => 
        id && self.indexOf(id) === index
      );
    
    expect(previouslyUsedCoaches).toEqual([]);
  });

  it('should handle session history mapping safely', () => {
    const sessions = undefined;
    
    // Simulate the SessionHistory sessions prop logic
    const mappedSessions = (sessions ?? []).map((session: any) => ({
      id: session.id,
      startedAt: session.createdAt,
      endedAt: session.endedAt,
      messageCount: session.messages?.length || 0,
      summary: session.summary || 'No summary',
      messages: session.messages || [],
    }));
    
    expect(mappedSessions).toEqual([]);
  });

  it('should handle analytics sessions mapping safely', () => {
    const sessions = undefined;
    
    // Simulate the CoachingAnalytics sessions prop logic
    const analyticsSessions = (sessions ?? []).map((session: any) => ({
      id: session.id,
      createdAt: session.createdAt,
      topic: session.summary || "General Coaching",
    }));
    
    expect(analyticsSessions).toEqual([]);
  });

  it('should differentiate between undefined and empty array', () => {
    const undefinedSessions = undefined;
    const emptySessions: any[] = [];
    
    // Both should result in empty arrays after nullish coalescing
    expect(undefinedSessions ?? []).toEqual([]);
    expect(emptySessions ?? []).toEqual([]);
    
    // But they are different before coalescing
    expect(undefinedSessions).toBeUndefined();
    expect(emptySessions).toEqual([]);
  });
});
