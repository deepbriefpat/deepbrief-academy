/**
 * Coach Recommendation Algorithm
 * 
 * Analyzes user's goals, conversation topics, and challenges
 * to recommend the top 3 best-matched coaches
 */

import type { CoachProfile } from "../client/src/data/coachProfiles";
import { COACH_PROFILES } from "../client/src/data/coachProfiles";

interface UserProfile {
  goals: Array<{ title: string; description: string }>;
  sessions: Array<{ messages: Array<{ content: string }> }>;
  patterns: Array<{ pattern: string; description: string }>;
}

interface CoachRecommendation {
  coach: CoachProfile;
  matchScore: number;
  reasons: string[];
}

/**
 * Extract key topics and themes from conversation history
 */
function extractTopics(sessions: UserProfile['sessions']): string[] {
  const allContent = sessions
    .flatMap(s => s.messages)
    .map(m => m.content.toLowerCase())
    .join(' ');
  
  const topicKeywords = {
    'team': ['team', 'people', 'hiring', 'conflict', 'delegation', 'culture'],
    'strategy': ['strategy', 'planning', 'vision', 'roadmap', 'direction'],
    'decision': ['decision', 'choice', 'options', 'uncertain', 'risk'],
    'growth': ['growth', 'scale', 'expansion', 'opportunity'],
    'crisis': ['crisis', 'urgent', 'problem', 'emergency', 'pressure'],
    'innovation': ['innovation', 'change', 'transformation', 'new'],
    'performance': ['performance', 'results', 'metrics', 'goals'],
    'communication': ['communication', 'feedback', 'conversation', 'message'],
    'stress': ['stress', 'burnout', 'overwhelm', 'anxiety', 'balance'],
    'confidence': ['confidence', 'doubt', 'imposter', 'fear'],
  };
  
  const detectedTopics: string[] = [];
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    const matches = keywords.filter(kw => allContent.includes(kw)).length;
    if (matches >= 2) {
      detectedTopics.push(topic);
    }
  }
  
  return detectedTopics;
}

/**
 * Calculate match score between user needs and coach specialties
 */
function calculateMatchScore(
  userTopics: string[],
  userGoals: string[],
  coach: CoachProfile
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  // Match specialties with topics (high weight)
  const specialtyMatches = coach.specialties.filter(specialty => 
    userTopics.some(topic => 
      specialty.toLowerCase().includes(topic) || 
      topic.includes(specialty.toLowerCase().split(' ')[0])
    )
  );
  score += specialtyMatches.length * 15;
  if (specialtyMatches.length > 0) {
    reasons.push(`Specializes in ${specialtyMatches.slice(0, 2).join(' and ')}`);
  }
  
  // Match title/description with topics (medium weight)
  const titleDesc = `${coach.title} ${coach.description}`.toLowerCase();
  const titleMatches = userTopics.filter(topic => titleDesc.includes(topic));
  score += titleMatches.length * 10;
  
  // Match goals with coach focus (medium weight)
  const goalMatches = userGoals.filter(goal => 
    coach.specialties.some(specialty => 
      goal.toLowerCase().includes(specialty.toLowerCase().split(' ')[0]) ||
      specialty.toLowerCase().includes(goal.toLowerCase().split(' ')[0])
    )
  );
  score += goalMatches.length * 12;
  if (goalMatches.length > 0) {
    reasons.push(`Aligns with your goals around ${goalMatches[0]}`);
  }
  
  // Coaching style bonus for specific needs
  if (userTopics.includes('crisis') || userTopics.includes('decision')) {
    if (coach.style.toLowerCase().includes('direct') || coach.style.toLowerCase().includes('decisive')) {
      score += 8;
      reasons.push('Direct, decisive coaching style for urgent situations');
    }
  }
  
  if (userTopics.includes('confidence') || userTopics.includes('stress')) {
    if (coach.style.toLowerCase().includes('supportive') || coach.style.toLowerCase().includes('empathetic')) {
      score += 8;
      reasons.push('Supportive, empathetic approach for building confidence');
    }
  }
  
  if (userTopics.includes('innovation') || userTopics.includes('growth')) {
    if (coach.style.toLowerCase().includes('creative') || coach.style.toLowerCase().includes('challenge')) {
      score += 8;
      reasons.push('Creative, challenging style to drive innovation');
    }
  }
  
  // Add variety bonus - prefer coaches with diverse specialties
  if (coach.specialties.length >= 3) {
    score += 5;
  }
  
  return { score, reasons };
}

/**
 * Get top 3 coach recommendations for a user
 */
export function getCoachRecommendations(profile: UserProfile): CoachRecommendation[] {
  // Extract topics from conversation history
  const topics = extractTopics(profile.sessions);
  
  // Extract key terms from goals
  const goalTerms = profile.goals.map(g => 
    g.title.toLowerCase().split(' ').filter(w => w.length > 4)
  ).flat();
  
  // Score all coaches
  const scoredCoaches = COACH_PROFILES.map(coach => {
    const { score, reasons } = calculateMatchScore(topics, goalTerms, coach);
    return {
      coach,
      matchScore: score,
      reasons,
    };
  });
  
  // Sort by score and return top 3
  return scoredCoaches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)
    .map(rec => ({
      ...rec,
      // Ensure at least one reason
      reasons: rec.reasons.length > 0 
        ? rec.reasons 
        : ['Experienced coach with diverse specialties'],
    }));
}
