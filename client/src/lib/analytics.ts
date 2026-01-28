/**
 * Google Analytics 4 Event Tracking Utility
 * 
 * Provides type-safe wrappers for tracking custom events throughout the funnel.
 * Events are sent to GA4 via the gtag() function loaded in index.html.
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Track when a user starts the assessment
 */
export function trackAssessmentStarted() {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'assessment_started', {
      event_category: 'engagement',
      event_label: 'Pressure Audit Started',
    });
  }
}

/**
 * Track when a user submits their email at the assessment gate
 */
export function trackEmailCaptured(source: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'email_captured', {
      event_category: 'conversion',
      event_label: `Email Captured - ${source}`,
      source,
    });
  }
}

/**
 * Track when a user completes the assessment and views results
 */
export function trackAssessmentCompleted(depthLevel: string, score: number) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'assessment_completed', {
      event_category: 'conversion',
      event_label: `Assessment Completed - ${depthLevel}`,
      depth_level: depthLevel,
      score,
    });
  }
}

/**
 * Track when a user clicks "Book a Call" CTA
 */
export function trackCallBookingClicked(location: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'call_booking_clicked', {
      event_category: 'conversion',
      event_label: `Book Call Clicked - ${location}`,
      location,
    });
  }
}

/**
 * Track when a user views a resource article
 */
export function trackResourceViewed(resourceTitle: string, theme: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'resource_viewed', {
      event_category: 'engagement',
      event_label: resourceTitle,
      theme,
    });
  }
}

/**
 * Track when a user adds a reaction to a resource
 */
export function trackReactionAdded(resourceTitle: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'reaction_added', {
      event_category: 'engagement',
      event_label: resourceTitle,
    });
  }
}

/**
 * Track when a user posts a comment on a resource
 */
export function trackCommentPosted(resourceTitle: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'comment_posted', {
      event_category: 'engagement',
      event_label: resourceTitle,
    });
  }
}

/**
 * Track when a user shares assessment results on social media
 */
export function trackSocialShare(platform: string, depthLevel: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'share', {
      method: platform,
      content_type: 'assessment_results',
      item_id: depthLevel,
    });
  }
}

/**
 * Track when a user navigates to Clarity Program page
 */
export function trackClarityProgramViewed() {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'clarity_program_viewed', {
      event_category: 'engagement',
      event_label: 'Clarity Program Page Viewed',
    });
  }
}

/**
 * Track when a user starts the AI Coach demo (first interaction)
 */
export function trackDemoStarted(accessType: 'guest' | 'assessment') {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'demo_started', {
      event_category: 'ai_coach',
      event_label: `Demo Started - ${accessType}`,
      access_type: accessType,
    });
  }
}

/**
 * Track when a user completes the AI Coach demo (10 interactions)
 */
export function trackDemoCompleted(accessType: 'guest' | 'assessment') {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'demo_completed', {
      event_category: 'ai_coach',
      event_label: `Demo Completed - ${accessType}`,
      access_type: accessType,
    });
  }
}

/**
 * Track when a user starts a paid AI Coach subscription
 */
export function trackSubscriptionStarted(source: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'subscription_started', {
      event_category: 'conversion',
      event_label: 'AI Coach Subscription Started',
      source,
    });
  }
}

/**
 * Track AI Coach session count milestones
 */
export function trackSessionMilestone(sessionCount: number) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'session_milestone', {
      event_category: 'ai_coach',
      event_label: `Session ${sessionCount}`,
      session_count: sessionCount,
    });
  }
}
