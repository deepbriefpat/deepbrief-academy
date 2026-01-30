/**
 * Comprehensive Coach Profiles
 * 
 * All 24 coaches with detailed descriptions, specialties, and coaching styles
 */

export interface CoachProfile {
  id: string;
  name: string;
  gender: "female" | "male" | "nonbinary";
  title: string;
  description: string;
  specialties: string[];
  avatar: string;
  style: string;
}

export const COACH_PROFILES: CoachProfile[] = [
  // Female Coaches
  {
    id: "sarah-mitchell",
    name: "Sarah Mitchell",
    gender: "female",
    title: "Strategic Leadership Coach",
    description: "Former VP of Operations with 15 years coaching executives through high-stakes decisions and organizational change. Brings systematic thinking to complex leadership challenges.",
    specialties: ["Strategic Planning", "Decision-Making", "Change Management"],
    avatar: "/avatars/sarah-mitchell.png",
    style: "Direct, analytical, focused on frameworks and systems thinking"
  },
  {
    id: "elena-rodriguez",
    name: "Elena Rodriguez",
    gender: "female",
    title: "Team Dynamics Specialist",
    description: "Expert in building high-performing teams and navigating complex interpersonal dynamics. Specializes in helping leaders create psychological safety and trust.",
    specialties: ["Team Building", "Conflict Resolution", "Communication"],
    avatar: "/avatars/elena-rodriguez.png",
    style: "Empathetic, relationship-focused, asks powerful questions"
  },
  {
    id: "jennifer-chen",
    name: "Jennifer Chen",
    gender: "female",
    title: "Executive Performance Coach",
    description: "Specializes in helping leaders manage pressure, prevent burnout, and maintain peak performance under demanding conditions. Former Fortune 500 executive.",
    specialties: ["Stress Management", "Work-Life Integration", "Resilience"],
    avatar: "/avatars/jennifer-chen.png",
    style: "Supportive, practical, focused on sustainable habits"
  },
  {
    id: "maya-patel",
    name: "Maya Patel",
    gender: "female",
    title: "Innovation & Change Catalyst",
    description: "Helps leaders drive innovation, manage organizational transformation, and navigate ambiguity with confidence. Background in tech startups and scale-ups.",
    specialties: ["Innovation Strategy", "Change Leadership", "Agile Thinking"],
    avatar: "/avatars/maya-patel.png",
    style: "Creative, forward-thinking, challenges conventional approaches"
  },
  {
    id: "rebecca-thompson",
    name: "Rebecca Thompson",
    gender: "female",
    title: "Executive Presence Coach",
    description: "Expert in helping leaders develop gravitas, communicate with impact, and build authentic executive presence in high-stakes environments.",
    specialties: ["Executive Presence", "Public Speaking", "Influence"],
    avatar: "/avatars/rebecca-thompson.png",
    style: "Confident, polished, focused on authentic leadership"
  },
  {
    id: "aisha-williams",
    name: "Aisha Williams",
    gender: "female",
    title: "Diversity & Inclusion Leader",
    description: "Specializes in helping leaders navigate diversity challenges, build inclusive cultures, and lead with cultural intelligence in global organizations.",
    specialties: ["Inclusive Leadership", "Cultural Intelligence", "Equity"],
    avatar: "/avatars/aisha-williams.png",
    style: "Thoughtful, values-driven, bridges different perspectives"
  },
  {
    id: "sophie-anderson",
    name: "Sophie Anderson",
    gender: "female",
    title: "First-Time Manager Coach",
    description: "Dedicated to helping new leaders build confidence, develop their leadership voice, and navigate the transition from individual contributor to manager.",
    specialties: ["New Manager Transition", "Delegation", "Feedback Skills"],
    avatar: "/avatars/sophie-anderson.png",
    style: "Patient, encouraging, breaks down complex concepts simply"
  },
  {
    id: "olivia-martinez",
    name: "Olivia Martinez",
    gender: "female",
    title: "Crisis Leadership Specialist",
    description: "Former crisis management consultant who helps leaders navigate high-pressure situations, make tough calls, and communicate effectively during uncertainty.",
    specialties: ["Crisis Management", "Tough Decisions", "Stakeholder Communication"],
    avatar: "/avatars/olivia-martinez.png",
    style: "Calm under pressure, decisive, focuses on clarity and action"
  },

  // Male Coaches
  {
    id: "marcus-johnson",
    name: "Marcus Johnson",
    gender: "male",
    title: "Performance Under Pressure Coach",
    description: "Former athlete and executive coach specializing in peak performance, mental resilience, and thriving in high-pressure situations.",
    specialties: ["Mental Toughness", "Performance Optimization", "Pressure Management"],
    avatar: "/avatars/marcus-johnson.png",
    style: "Energetic, results-driven, focuses on mindset and execution"
  },
  {
    id: "david-chen",
    name: "David Chen",
    gender: "male",
    title: "Strategic Growth Advisor",
    description: "Former startup CEO and venture advisor who helps leaders scale organizations, build effective teams, and navigate rapid growth challenges.",
    specialties: ["Scaling Organizations", "Startup Leadership", "Strategic Growth"],
    avatar: "/avatars/david-chen.png",
    style: "Pragmatic, entrepreneurial, focused on execution and results"
  },
  {
    id: "james-anderson",
    name: "James Anderson",
    gender: "male",
    title: "Executive Communication Coach",
    description: "Specializes in helping leaders communicate with clarity, influence stakeholders, and deliver compelling presentations in high-stakes situations.",
    specialties: ["Executive Communication", "Stakeholder Management", "Presentations"],
    avatar: "/avatars/james-anderson.png",
    style: "Articulate, strategic, focuses on message clarity and impact"
  },
  {
    id: "alex-rivera",
    name: "Alex Rivera",
    gender: "male",
    title: "Conflict Resolution Expert",
    description: "Former mediator and organizational psychologist who helps leaders navigate difficult conversations, resolve conflicts, and build trust.",
    specialties: ["Difficult Conversations", "Conflict Resolution", "Trust Building"],
    avatar: "/avatars/alex-rivera.png",
    style: "Diplomatic, insightful, helps find win-win solutions"
  },
  {
    id: "michael-thompson",
    name: "Michael Thompson",
    gender: "male",
    title: "Leadership Development Specialist",
    description: "Focuses on helping leaders develop their teams, build leadership pipelines, and create cultures of continuous learning and development.",
    specialties: ["Leadership Development", "Talent Management", "Succession Planning"],
    avatar: "/avatars/michael-thompson.png",
    style: "Developmental, patient, focuses on long-term growth"
  },
  {
    id: "samuel-park",
    name: "Samuel Park",
    gender: "male",
    title: "Operational Excellence Coach",
    description: "Former COO who helps leaders optimize operations, improve efficiency, and build systems that scale. Brings lean and agile methodologies to leadership.",
    specialties: ["Operational Excellence", "Process Optimization", "Systems Thinking"],
    avatar: "/avatars/samuel-park.png",
    style: "Systematic, data-driven, focused on measurable improvement"
  },
  {
    id: "daniel-foster",
    name: "Daniel Foster",
    gender: "male",
    title: "Board Relations Advisor",
    description: "Former board member and CFO who helps leaders navigate board dynamics, manage investor relations, and communicate effectively with stakeholders.",
    specialties: ["Board Management", "Investor Relations", "Financial Leadership"],
    avatar: "/avatars/daniel-foster.png",
    style: "Strategic, politically savvy, focuses on stakeholder alignment"
  },
  {
    id: "christopher-hayes",
    name: "Christopher Hayes",
    gender: "male",
    title: "Turnaround Leadership Coach",
    description: "Specializes in helping leaders navigate organizational turnarounds, manage layoffs, and rebuild team morale during difficult transitions.",
    specialties: ["Turnaround Management", "Change Leadership", "Team Recovery"],
    avatar: "/avatars/christopher-hayes.png",
    style: "Honest, resilient, focuses on rebuilding trust and momentum"
  },

  // Non-binary Coaches
  {
    id: "jordan-taylor",
    name: "Jordan Taylor",
    gender: "nonbinary",
    title: "Adaptive Leadership Coach",
    description: "Helps leaders develop flexibility, navigate ambiguity, and adapt their leadership style to different contexts and challenges.",
    specialties: ["Adaptive Leadership", "Situational Awareness", "Flexibility"],
    avatar: "/avatars/jordan-taylor.png",
    style: "Flexible, context-aware, helps leaders read situations"
  },
  {
    id: "alex-morgan",
    name: "Alex Morgan",
    gender: "nonbinary",
    title: "Remote Leadership Specialist",
    description: "Expert in helping leaders build and manage distributed teams, create virtual cultures, and lead effectively in hybrid work environments.",
    specialties: ["Remote Leadership", "Virtual Teams", "Hybrid Work"],
    avatar: "/avatars/alex-morgan.png",
    style: "Tech-savvy, inclusive, focused on connection and culture"
  },
  {
    id: "casey-rivers",
    name: "Casey Rivers",
    gender: "nonbinary",
    title: "Emotional Intelligence Coach",
    description: "Specializes in helping leaders develop self-awareness, manage emotions, and build stronger relationships through emotional intelligence.",
    specialties: ["Emotional Intelligence", "Self-Awareness", "Relationship Building"],
    avatar: "/avatars/casey-rivers.png",
    style: "Reflective, compassionate, focuses on inner work"
  },
  {
    id: "riley-parker",
    name: "Riley Parker",
    gender: "nonbinary",
    title: "Product Leadership Coach",
    description: "Former product executive who helps leaders build product organizations, make strategic product decisions, and balance user needs with business goals.",
    specialties: ["Product Strategy", "Product Leadership", "User-Centric Thinking"],
    avatar: "/avatars/riley-parker.png",
    style: "User-focused, analytical, balances empathy with strategy"
  },
  {
    id: "quinn-anderson",
    name: "Quinn Anderson",
    gender: "nonbinary",
    title: "Creative Leadership Coach",
    description: "Helps leaders in creative industries balance artistic vision with business realities, manage creative teams, and foster innovation.",
    specialties: ["Creative Leadership", "Innovation", "Vision Setting"],
    avatar: "/avatars/quinn-anderson.png",
    style: "Visionary, inspiring, bridges creativity and business"
  },
  {
    id: "sage-mitchell",
    name: "Sage Mitchell",
    gender: "nonbinary",
    title: "Mindful Leadership Coach",
    description: "Integrates mindfulness and contemplative practices into leadership development. Helps leaders find clarity, reduce reactivity, and lead with intention.",
    specialties: ["Mindful Leadership", "Presence", "Intentional Action"],
    avatar: "/avatars/sage-mitchell.png",
    style: "Contemplative, grounded, focuses on presence and awareness"
  },
  {
    id: "avery-brooks",
    name: "Avery Brooks",
    gender: "nonbinary",
    title: "Sales Leadership Coach",
    description: "Former VP of Sales who helps leaders build high-performing sales teams, develop sales strategies, and coach sales managers to excellence.",
    specialties: ["Sales Leadership", "Revenue Growth", "Sales Coaching"],
    avatar: "/avatars/avery-brooks.png",
    style: "Results-oriented, motivational, focuses on performance"
  },
  {
    id: "cameron-wells",
    name: "Cameron Wells",
    gender: "nonbinary",
    title: "Engineering Leadership Coach",
    description: "Former CTO who helps technical leaders transition to leadership, build engineering cultures, and balance technical excellence with people management.",
    specialties: ["Engineering Leadership", "Technical Leadership", "Team Building"],
    avatar: "/avatars/cameron-wells.png",
    style: "Technical, pragmatic, understands engineer mindset"
  },
];

// Helper functions
export function getCoachById(id: string): CoachProfile | undefined {
  return COACH_PROFILES.find(coach => coach.id === id);
}

export function getCoachByName(name: string): CoachProfile | undefined {
  return COACH_PROFILES.find(coach => coach.name === name);
}

export function getCoachesByGender(gender: "female" | "male" | "nonbinary"): CoachProfile[] {
  return COACH_PROFILES.filter(coach => coach.gender === gender);
}

export function getAllCoachNames(): string[] {
  return COACH_PROFILES.map(coach => coach.name);
}
