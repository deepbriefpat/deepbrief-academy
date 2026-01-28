/**
 * Conversation starter templates for common pressure situations
 * These help users engage with the coach more quickly
 */

export interface ConversationStarter {
  id: string;
  title: string;
  category: "decision" | "conversation" | "delegation" | "conflict" | "pressure" | "leadership";
  icon: string;
  prompt: string;
  description: string;
}

export const conversationStarters: ConversationStarter[] = [
  {
    id: "email-shouldnt-send",
    title: "The email you shouldn't send",
    category: "conversation",
    icon: "📧",
    description: "You've drafted an email in anger or frustration",
    prompt: "I've written an email I'm about to send, but something doesn't feel right. The situation is: [describe what happened]. Here's what I want to say: [paste draft or summarize]. Should I send this, or is there a better move?"
  },
  {
    id: "conversation-avoiding",
    title: "The conversation you're avoiding",
    category: "conversation",
    icon: "💬",
    description: "There's a difficult conversation you need to have",
    prompt: "I need to have a conversation with [person/role] about [issue], but I keep putting it off. The real problem is: [what's actually wrong]. I'm avoiding it because: [your concern]. How do I approach this?"
  },
  {
    id: "decision-keeping-up",
    title: "The decision that's keeping you up",
    category: "decision",
    icon: "🤔",
    description: "You're stuck on a high-stakes decision",
    prompt: "I need to decide about [situation] and it's eating at me. Option A is [describe]. Option B is [describe]. The stakes are: [what happens if I'm wrong]. What am I not seeing here?"
  },
  {
    id: "meeting-about-to-walk-into",
    title: "The meeting you're about to walk into",
    category: "pressure",
    icon: "🎯",
    description: "High-pressure meeting coming up soon",
    prompt: "I have a meeting in [timeframe] with [who] about [topic]. The pressure point is: [what's at stake]. I need to: [your goal]. What's my play here?"
  },
  {
    id: "delegation-cant-let-go",
    title: "The task you can't delegate",
    category: "delegation",
    icon: "🎭",
    description: "You know you should delegate but can't",
    prompt: "I'm drowning in [task/responsibility] but I can't seem to hand it off. The task is: [describe]. I tell myself I can't delegate because: [your reason]. What's really going on here?"
  },
  {
    id: "team-member-failing",
    title: "The team member who's failing",
    category: "leadership",
    icon: "👥",
    description: "Someone on your team isn't performing",
    prompt: "I have a team member [name/role] who's not delivering. Specifically: [what's wrong]. I've tried: [what you've done]. Part of me thinks: [your real concern]. What do I do?"
  },
  {
    id: "boundary-need-to-set",
    title: "The boundary you need to set",
    category: "leadership",
    icon: "🛡️",
    description: "Someone is crossing a line",
    prompt: "Someone [role/relationship] keeps [behavior] and it's affecting [impact]. I haven't said anything because: [why you're hesitating]. How do I set this boundary without blowing things up?"
  },
  {
    id: "conflict-between-team-members",
    title: "The conflict between team members",
    category: "conflict",
    icon: "⚡",
    description: "Two people on your team are at odds",
    prompt: "I have two team members [roles] who are in conflict about [issue]. It's affecting [impact on team/work]. I think the real issue is: [underlying problem]. How do I handle this?"
  },
  {
    id: "pressure-crushing-me",
    title: "The pressure that's crushing you",
    category: "pressure",
    icon: "🌊",
    description: "You're at your limit",
    prompt: "I'm at crush depth. The pressure is: [list what's on you]. I'm sleeping [how much], working [how much], and feeling [how you feel]. I know something has to give, but I don't know what."
  },
  {
    id: "promotion-imposter-syndrome",
    title: "The promotion you don't feel ready for",
    category: "leadership",
    icon: "🎖️",
    description: "New role, massive imposter syndrome",
    prompt: "I just got promoted to [role] and I'm terrified. The new responsibilities are: [what's changed]. I'm worried about: [specific fears]. Everyone thinks I'm ready, but I don't feel it. What do I do?"
  },
];

/**
 * Get starters by category
 */
export function getStartersByCategory(category: ConversationStarter["category"]) {
  return conversationStarters.filter(s => s.category === category);
}

/**
 * Get a random starter
 */
export function getRandomStarter() {
  return conversationStarters[Math.floor(Math.random() * conversationStarters.length)];
}

/**
 * Get starter by ID
 */
export function getStarterById(id: string) {
  return conversationStarters.find(s => s.id === id);
}
