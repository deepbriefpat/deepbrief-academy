import { describe, it, expect, beforeEach, vi } from "vitest";
import { 
  trackDemoStarted, 
  trackDemoCompleted, 
  trackSubscriptionStarted, 
  trackSessionMilestone 
} from "../client/src/lib/analytics";

// Mock window object for Node environment
global.window = global.window || ({} as any);

describe("AI Coach Analytics Tracking", () => {
  beforeEach(() => {
    // Mock window.gtag
    (global.window as any).gtag = vi.fn();
    (global.window as any).dataLayer = [];
  });

  it("should track demo_started event with correct parameters", () => {
    trackDemoStarted('guest');
    
    expect(window.gtag).toHaveBeenCalledWith('event', 'demo_started', {
      event_category: 'ai_coach',
      event_label: 'Demo Started - guest',
      access_type: 'guest',
    });
  });

  it("should track demo_completed event with correct parameters", () => {
    trackDemoCompleted('assessment');
    
    expect(window.gtag).toHaveBeenCalledWith('event', 'demo_completed', {
      event_category: 'ai_coach',
      event_label: 'Demo Completed - assessment',
      access_type: 'assessment',
    });
  });

  it("should track subscription_started event with correct parameters", () => {
    trackSubscriptionStarted('dashboard');
    
    expect(window.gtag).toHaveBeenCalledWith('event', 'subscription_started', {
      event_category: 'conversion',
      event_label: 'AI Coach Subscription Started',
      source: 'dashboard',
    });
  });

  it("should track session_milestone event with correct parameters", () => {
    trackSessionMilestone(10);
    
    expect(window.gtag).toHaveBeenCalledWith('event', 'session_milestone', {
      event_category: 'ai_coach',
      event_label: 'Session 10',
      session_count: 10,
    });
  });

  it("should handle missing gtag gracefully", () => {
    window.gtag = undefined;
    
    // Should not throw error
    expect(() => {
      trackDemoStarted('guest');
      trackDemoCompleted('guest');
      trackSubscriptionStarted('dashboard');
      trackSessionMilestone(5);
    }).not.toThrow();
  });
});
