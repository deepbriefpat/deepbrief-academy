import { boolean, date, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  selectedCoach: varchar("selectedCoach", { length: 64 }).default("sarah"),
  reminderPreference: mysqlEnum("reminderPreference", ["1_day", "3_days", "7_days", "none"]).default("3_days").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Assessment responses table - stores user responses to the Thinking Clarity Assessment
 */
export const assessmentResponses = mysqlTable("assessment_responses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  responses: text("responses").notNull(), // JSON string of question-answer pairs
  depthLevel: mysqlEnum("depth_level", ["surface", "thermocline", "deep_water", "crush_depth"]).notNull(),
  score: int("score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AssessmentResponse = typeof assessmentResponses.$inferSelect;
export type InsertAssessmentResponse = typeof assessmentResponses.$inferInsert;

/**
 * Resources table - stores articles, insights, and content organized by themes
 */
export const resources = mysqlTable("resources", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  theme: mysqlEnum("theme", ["pressure_management", "diving_metaphors", "leadership_isolation", "vulnerability"]).notNull(),
  imageUrl: varchar("image_url", { length: 512 }),
  linkedinUrl: varchar("linkedin_url", { length: 512 }),
  impressions: int("impressions").default(0),
  reactions: int("reactions").default(0),
  comments: int("comments").default(0),
  viewCount: int("view_count").default(0).notNull(),
  lastViewedAt: timestamp("last_viewed_at"),
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

/**
 * Stories table - Patrick's diving experiences and business lessons
 */
export const stories = mysqlTable("stories", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("image_url", { length: 512 }),
  category: mysqlEnum("category", ["diving", "business", "leadership", "personal"]).notNull(),
  featured: int("featured").default(0).notNull(), // 0 or 1 for boolean
  publishedAt: timestamp("published_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Story = typeof stories.$inferSelect;
export type InsertStory = typeof stories.$inferInsert;

/**
 * Testimonials table - anonymized success stories from peer group members
 */
export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  authorRole: varchar("author_role", { length: 255 }).notNull(), // e.g., "Tech Founder", "CEO"
  content: text("content").notNull(),
  outcome: text("outcome"), // What changed after joining peer group
  featured: int("featured").default(0).notNull(),
  displayOrder: int("display_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

/**
 * Inquiries table - contact form submissions for pressure audits and peer groups
 */
export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  company: varchar("company", { length: 255 }),
  inquiryType: mysqlEnum("inquiry_type", ["pressure_audit", "peer_group", "general"]).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "contacted", "closed"]).default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

/**
 * Support network assessments - "Who Are You Thinking With?" reflection tool responses
 */
export const supportNetworkAssessments = mysqlTable("support_network_assessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  responses: text("responses").notNull(), // JSON string of reflection responses
  networkScore: int("network_score").notNull(),
  networkQuality: mysqlEnum("network_quality", ["isolated", "emerging", "functional", "thriving"]).notNull(),
  recommendations: text("recommendations").notNull(), // JSON string of personalized recommendations
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SupportNetworkAssessment = typeof supportNetworkAssessments.$inferSelect;
export type InsertSupportNetworkAssessment = typeof supportNetworkAssessments.$inferInsert;

/**
 * Email subscribers table - captures emails for mailing list from high-value pages
 */
export const emailSubscribers = mysqlTable("email_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  source: mysqlEnum("source", ["assessment_results", "booking_confirmation", "general", "calm_protocol", "pressure_guide_modal", "pressure_audit"]).notNull(),
  subscribed: int("subscribed").default(1).notNull(), // 0 or 1 for boolean
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type InsertEmailSubscriber = typeof emailSubscribers.$inferInsert;

/**
 * Email sequences table - defines automated email campaigns
 */
export const emailSequences = mysqlTable("email_sequences", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  triggerSource: varchar("trigger_source", { length: 100 }).notNull(), // e.g., "pressure_guide_modal"
  delayDays: int("delay_days").notNull(), // 0 for immediate, 3 for 3-day delay, etc.
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(), // HTML email body
  active: int("active").default(1).notNull(), // 0 or 1 for boolean
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EmailSequence = typeof emailSequences.$inferSelect;
export type InsertEmailSequence = typeof emailSequences.$inferInsert;

/**
 * Sent emails table - tracks which emails have been sent to which subscribers
 */
export const sentEmails = mysqlTable("sent_emails", {
  id: int("id").autoincrement().primaryKey(),
  subscriberId: int("subscriber_id").references(() => emailSubscribers.id).notNull(),
  sequenceId: int("sequence_id").references(() => emailSequences.id).notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  status: mysqlEnum("status", ["sent", "failed"]).notNull(),
});

export type SentEmail = typeof sentEmails.$inferSelect;
export type InsertSentEmail = typeof sentEmails.$inferInsert;

/**
 * Resource reactions table - stores user reactions (likes) on resources
 */
export const resourceReactions = mysqlTable("resource_reactions", {
  id: int("id").autoincrement().primaryKey(),
  resourceId: int("resource_id").notNull().references(() => resources.id),
  userId: int("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ResourceReaction = typeof resourceReactions.$inferSelect;
export type InsertResourceReaction = typeof resourceReactions.$inferInsert;

/**
 * Resource comments table - stores user comments on resources with threading support
 */
export const resourceComments = mysqlTable("resource_comments", {
  id: int("id").autoincrement().primaryKey(),
  resourceId: int("resource_id").notNull().references(() => resources.id),
  userId: int("user_id").notNull().references(() => users.id),
  parentId: int("parent_id"), // For threaded replies
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ResourceComment = typeof resourceComments.$inferSelect;
export type InsertResourceComment = typeof resourceComments.$inferInsert;

/**
 * Pressure Audit responses table - stores 10-question pressure audit results
 */
export const pressureAuditResponses = mysqlTable("pressure_audit_responses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  responses: text("responses").notNull(), // JSON string of question-answer pairs
  totalScore: int("total_score").notNull(),
  tier: mysqlEnum("tier", ["Surface Level", "Thermocline", "Deep Water", "Crush Depth"]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PressureAuditResponse = typeof pressureAuditResponses.$inferSelect;
export type InsertPressureAuditResponse = typeof pressureAuditResponses.$inferInsert;

/**
 * Email automation sequences table - tracks scheduled emails for pressure audit follow-ups
 */
export const emailAutomationSequences = mysqlTable("email_sequences", {
  id: int("id").autoincrement().primaryKey(),
  pressureAuditId: int("pressure_audit_id").references(() => pressureAuditResponses.id).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  tier: mysqlEnum("tier", ["Surface Level", "Thermocline", "Deep Water", "Crush Depth"]).notNull(),
  day3Sent: boolean("day3_sent").default(false).notNull(),
  day3SentAt: timestamp("day3_sent_at"),
  day7Sent: boolean("day7_sent").default(false).notNull(),
  day7SentAt: timestamp("day7_sent_at"),
  day14Sent: boolean("day14_sent").default(false).notNull(),
  day14SentAt: timestamp("day14_sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EmailAutomationSequence = typeof emailAutomationSequences.$inferSelect;
export type InsertEmailAutomationSequence = typeof emailAutomationSequences.$inferInsert;

/**
 * AI Executive Coach - Coaching Users Profile
 * Stores baseline assessment and user profile for personalized coaching
 */
export const coachingUsers = mysqlTable("coaching_users", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id).notNull(),
  preferredName: varchar("preferred_name", { length: 100 }), // How the user wants to be addressed
  profilePictureUrl: varchar("profile_picture_url", { length: 500 }), // S3 URL for user's profile picture
  role: varchar("role", { length: 100 }).notNull(), // e.g., "Senior Manager", "VP", "CEO"
  experienceLevel: mysqlEnum("experience_level", ["first_time", "mid_level", "senior", "executive"]).notNull(),
  goals: text("goals").notNull(), // JSON array of leadership goals
  pressures: text("pressures").notNull(), // JSON array of current pressures
  challenges: text("challenges").notNull(), // JSON array of recurring challenges
  decisionBottlenecks: text("decision_bottlenecks"), // JSON array of bottlenecks
  teamDynamics: text("team_dynamics"), // JSON object describing team situation
  baselineScore: int("baseline_score"), // Initial assessment score
  coachingPreferences: text("coaching_preferences"), // JSON object with coaching preferences (coach gender, communication style, etc.)
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false).notNull(), // Track if user has completed onboarding flow
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CoachingUser = typeof coachingUsers.$inferSelect;
export type InsertCoachingUser = typeof coachingUsers.$inferInsert;

/**
 * AI Executive Coach - Coaching Sessions
 * Stores conversation history and context for each coaching interaction
 */
export const coachingSessions = mysqlTable("coaching_sessions", {
  id: int("id").autoincrement().primaryKey(),
  coachingUserId: int("coaching_user_id").references(() => coachingUsers.id).notNull(),
  sessionType: mysqlEnum("session_type", ["general", "situational", "roleplay", "check_in"]).notNull(),
  mode: mysqlEnum("mode", ["coaching", "execution"]).default("coaching").notNull(), // Manus mode: coaching or execution
  context: text("context"), // JSON object with session context
  messages: text("messages").notNull(), // JSON array of conversation messages
  insights: text("insights"), // JSON array of key insights from session
  actionItems: text("action_items"), // JSON array of actions suggested
  notes: text("notes"), // Private user notes (not sent to AI)
  summary: text("summary"), // AI-generated session summary for resume context
  duration: int("duration"), // Session duration in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CoachingSession = typeof coachingSessions.$inferSelect;
export type InsertCoachingSession = typeof coachingSessions.$inferInsert;

/**
 * AI Executive Coach - Goals
 * Tracks user goals and progress over time
 */
export const coachingGoals = mysqlTable("coaching_goals", {
  id: int("id").autoincrement().primaryKey(),
  coachingUserId: int("coaching_user_id").references(() => coachingUsers.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["leadership", "communication", "decision_making", "team_building", "personal_growth"]).notNull(),
  targetDate: timestamp("target_date"),
  status: mysqlEnum("status", ["active", "completed", "paused", "abandoned"]).default("active").notNull(),
  progress: int("progress").default(0), // 0-100
  milestones: text("milestones"), // JSON array of milestones
  evidencePhotos: text("evidence_photos"), // JSON array of S3 URLs for progress photos
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export type CoachingGoal = typeof coachingGoals.$inferSelect;
export type InsertCoachingGoal = typeof coachingGoals.$inferInsert;

/**
 * AI Executive Coach - Commitments
 * Tracks specific actions and commitments made during coaching
 */
export const coachingCommitments = mysqlTable("coaching_commitments", {
  id: int("id").autoincrement().primaryKey(),
  coachingUserId: int("coaching_user_id").references(() => coachingUsers.id),
  userId: int("user_id").references(() => users.id),
  guestPassCode: varchar("guest_pass_code", { length: 64 }), // For guest users
  sessionId: int("session_id").references(() => coachingSessions.id),
  goalId: int("goal_id").references(() => coachingGoals.id),
  action: text("action").notNull(),
  context: text("context"), // Why this matters / what problem it solves
  deadline: timestamp("deadline"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "missed", "open", "closed", "overdue", "abandoned"]).default("pending").notNull(),
  progress: int("progress").default(0).notNull(), // 0-100 percentage
  completedAt: timestamp("completed_at"),
  closedAt: timestamp("closed_at"),
  closedNote: text("closed_note"), // What actually happened
  notes: text("notes"),
  followUpCount: int("follow_up_count").default(0).notNull(), // How many times we've asked about it
  lastFollowUpAt: timestamp("last_follow_up_at"),
  checkInEmailSent: boolean("check_in_email_sent").default(false).notNull(), // Whether 3-day check-in email was sent
  evidencePhotos: text("evidence_photos"), // JSON array of S3 URLs for progress photos
  recurrenceFrequency: mysqlEnum("recurrence_frequency", ["none", "daily", "weekly", "monthly"]).default("none").notNull(),
  nextDueDate: timestamp("next_due_date"), // For recurring commitments
  streakCount: int("streak_count").default(0).notNull(), // Consecutive completions
  lastCompletedDate: timestamp("last_completed_date"), // For streak tracking
  lastNotified: timestamp("last_notified"), // Last time user was notified about this commitment
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CoachingCommitment = typeof coachingCommitments.$inferSelect;
export type InsertCoachingCommitment = typeof coachingCommitments.$inferInsert;

/**
 * AI Executive Coach - Nudges & Reminders
 * Scheduled prompts and check-ins for accountability
 */
export const coachingNudges = mysqlTable("coaching_nudges", {
  id: int("id").autoincrement().primaryKey(),
  coachingUserId: int("coaching_user_id").references(() => coachingUsers.id).notNull(),
  commitmentId: int("commitment_id").references(() => coachingCommitments.id),
  type: mysqlEnum("type", ["reminder", "check_in", "celebration", "course_correct"]).notNull(),
  message: text("message").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  respondedAt: timestamp("responded_at"),
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CoachingNudge = typeof coachingNudges.$inferSelect;
export type InsertCoachingNudge = typeof coachingNudges.$inferInsert;

/**
 * AI Executive Coach - Templates & Playbooks
 * Ready-to-use frameworks for common leadership situations
 */
export const coachingTemplates = mysqlTable("coaching_templates", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["tough_conversation", "goal_setting", "one_on_one", "delegation", "feedback", "conflict_resolution"]).notNull(),
  description: text("description"),
  content: text("content").notNull(), // JSON structure with template content
  prompts: text("prompts"), // JSON array of coaching prompts
  isPublic: boolean("is_public").default(true),
  usageCount: int("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CoachingTemplate = typeof coachingTemplates.$inferSelect;
export type InsertCoachingTemplate = typeof coachingTemplates.$inferInsert;

/**
 * AI Executive Coach - User Template Usage
 * Tracks which templates users have used and customized
 */
export const coachingTemplateUsage = mysqlTable("coaching_template_usage", {
  id: int("id").autoincrement().primaryKey(),
  coachingUserId: int("coaching_user_id").references(() => coachingUsers.id).notNull(),
  templateId: int("template_id").references(() => coachingTemplates.id).notNull(),
  customizations: text("customizations"), // JSON object with user customizations
  isFavorite: boolean("is_favorite").default(false),
  usedAt: timestamp("used_at").defaultNow().notNull(),
});

export type CoachingTemplateUsage = typeof coachingTemplateUsage.$inferSelect;
export type InsertCoachingTemplateUsage = typeof coachingTemplateUsage.$inferInsert;

/**
 * AI Executive Coach - Analytics & Insights
 * Tracks behavior patterns, trends, and growth metrics
 */
export const coachingAnalytics = mysqlTable("coaching_analytics", {
  id: int("id").autoincrement().primaryKey(),
  coachingUserId: int("coaching_user_id").references(() => coachingUsers.id).notNull(),
  weekStartDate: date("week_start_date").notNull(),
  sessionsCount: int("sessions_count").default(0),
  commitmentsCompleted: int("commitments_completed").default(0),
  commitmentsMissed: int("commitments_missed").default(0),
  goalsProgress: text("goals_progress"), // JSON object with goal progress
  behaviorPatterns: text("behavior_patterns"), // JSON array of identified patterns
  confidenceShift: int("confidence_shift"), // -100 to +100
  wins: text("wins"), // JSON array of wins
  lessons: text("lessons"), // JSON array of lessons learned
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CoachingAnalytic = typeof coachingAnalytics.$inferSelect;
export type InsertCoachingAnalytic = typeof coachingAnalytics.$inferInsert;

/**
 * AI Executive Coach - Subscriptions
 * Manages £19.95/month subscription billing via Stripe with 3-day free trial
 */
export const coachingSubscriptions = mysqlTable("coaching_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id).notNull().unique(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).unique(),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing", "incomplete"]).notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CoachingSubscription = typeof coachingSubscriptions.$inferSelect;
export type InsertCoachingSubscription = typeof coachingSubscriptions.$inferInsert;

/**
 * AI Executive Coach - Demo Sessions
 * Tracks anonymous demo usage to prevent abuse and measure conversion
 */
export const coachingDemoSessions = mysqlTable("coaching_demo_sessions", {
  id: int("id").autoincrement().primaryKey(),
  fingerprint: varchar("fingerprint", { length: 255 }).notNull(), // Browser fingerprint or session ID
  ipAddress: varchar("ip_address", { length: 45 }), // IPv4 or IPv6
  interactionCount: int("interaction_count").default(0).notNull(),
  messages: text("messages"), // JSON array of conversation messages
  convertedToSubscription: boolean("converted_to_subscription").default(false),
  userId: int("user_id").references(() => users.id), // Set when user subscribes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  lastInteractionAt: timestamp("last_interaction_at").defaultNow().notNull(),
});

export type CoachingDemoSession = typeof coachingDemoSessions.$inferSelect;
export type InsertCoachingDemoSession = typeof coachingDemoSessions.$inferInsert;

/**
 * Guest passes table - allows owner to generate codes for free unlimited AI coaching access
 */
export const guestPasses = mysqlTable("guest_passes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(), // e.g., "GUEST-2026-ABC123"
  label: varchar("label", { length: 255 }), // Optional label to identify the recipient/purpose
  isActive: boolean("is_active").default(true).notNull(), // Can be revoked by setting to false
  expiresAt: timestamp("expires_at"), // Null means never expires
  usageCount: int("usage_count").default(0).notNull(), // Track how many sessions used this code
  lastUsedAt: timestamp("last_used_at"), // Track when it was last used
  createdBy: int("created_by").references(() => users.id).notNull(), // Owner who created it
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type GuestPass = typeof guestPasses.$inferSelect;
export type InsertGuestPass = typeof guestPasses.$inferInsert;

/**
 * Guest pass sessions table - tracks individual coaching sessions using guest codes
 */
export const guestPassSessions = mysqlTable("guest_pass_sessions", {
  id: int("id").autoincrement().primaryKey(),
  guestPassId: int("guest_pass_id").references(() => guestPasses.id).notNull(),
  fingerprint: varchar("fingerprint", { length: 255 }).notNull(), // Browser fingerprint
  // Guest user registration info (collected on first access)
  guestName: varchar("guest_name", { length: 255 }),
  guestEmail: varchar("guest_email", { length: 320 }),
  guestCompany: varchar("guest_company", { length: 255 }),
  guestRole: varchar("guest_role", { length: 255 }),
  hasRegistered: boolean("has_registered").default(false).notNull(),
  messages: text("messages"), // JSON array of conversation messages
  messageCount: int("message_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  lastInteractionAt: timestamp("last_interaction_at").defaultNow().notNull(),
});

export type GuestPassSession = typeof guestPassSessions.$inferSelect;
export type InsertGuestPassSession = typeof guestPassSessions.$inferInsert;

/**
 * Guest pass email invitations table - tracks emails sent with guest pass codes
 */
export const guestPassInvitations = mysqlTable("guest_pass_invitations", {
  id: int("id").autoincrement().primaryKey(),
  guestPassId: int("guest_pass_id").references(() => guestPasses.id).notNull(),
  recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
  recipientName: varchar("recipient_name", { length: 255 }),
  personalMessage: text("personal_message"), // Optional custom message from sender
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, sent, failed, opened
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  reminderSentAt: timestamp("reminder_sent_at"), // Track if expiration reminder was sent
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type GuestPassInvitation = typeof guestPassInvitations.$inferSelect;
export type InsertGuestPassInvitation = typeof guestPassInvitations.$inferInsert;

/**
 * Session context summaries - running memory of what matters across sessions
 */
export const sessionContexts = mysqlTable("session_contexts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id),
  guestPassCode: varchar("guest_pass_code", { length: 64 }), // For guest users
  keyThemes: text("key_themes").notNull(), // JSON array of recurring themes
  avoidancePatterns: text("avoidance_patterns"), // JSON array of things they dodge
  pressureResponses: text("pressure_responses"), // JSON array of how they react under pressure
  decisionPatterns: text("decision_patterns"), // JSON array of decision-making tendencies
  lastUpdated: timestamp("last_updated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SessionContext = typeof sessionContexts.$inferSelect;
export type InsertSessionContext = typeof sessionContexts.$inferInsert;

/**
 * Behavioral insights - detected patterns that surface in coaching
 */
export const behavioralInsights = mysqlTable("behavioral_insights", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id),
  guestPassCode: varchar("guest_pass_code", { length: 64 }), // For guest users
  insightType: mysqlEnum("insight_type", ["avoidance", "over_indexing", "pressure_response", "decision_pattern", "blind_spot"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(), // e.g., "You avoid delegation conversations"
  description: text("description").notNull(), // Detailed pattern explanation
  evidence: text("evidence").notNull(), // JSON array of supporting examples from sessions
  confidence: int("confidence").notNull(), // 0-100 score
  surfacedAt: timestamp("surfaced_at"), // When we showed this to the user
  acknowledgedAt: timestamp("acknowledged_at"), // When user acknowledged it
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BehavioralInsight = typeof behavioralInsights.$inferSelect;
export type InsertBehavioralInsight = typeof behavioralInsights.$inferInsert;

/**
 * Email preferences - user control over accountability email frequency and types
 */
export const emailPreferences = mysqlTable("email_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id).notNull(),
  unsubscribeToken: varchar("unsubscribe_token", { length: 64 }).notNull().unique(), // For one-click unsubscribe
  emailsEnabled: boolean("emails_enabled").default(true).notNull(), // Master switch
  followUpEmails: boolean("follow_up_emails").default(true).notNull(), // 2-3 day commitment follow-ups
  weeklyCheckIns: boolean("weekly_check_ins").default(true).notNull(), // Monday check-ins
  overdueAlerts: boolean("overdue_alerts").default(true).notNull(), // Past deadline alerts
  frequency: mysqlEnum("frequency", ["daily", "weekly", "off"]).default("daily").notNull(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type EmailPreference = typeof emailPreferences.$inferSelect;
export type InsertEmailPreference = typeof emailPreferences.$inferInsert;

/**
 * Session feedback table - tracks user feedback (thumbs up/down) on coaching messages
 */
export const sessionFeedback = mysqlTable("session_feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id),
  sessionId: int("session_id").references(() => coachingSessions.id),
  demoSessionId: int("demo_session_id").references(() => coachingDemoSessions.id),
  guestPassSessionId: int("guest_pass_session_id").references(() => guestPassSessions.id),
  messageIndex: int("message_index").notNull(), // Which message in the conversation
  feedbackType: mysqlEnum("feedback_type", ["helpful", "not_helpful"]).notNull(),
  comment: text("comment"), // Optional text feedback
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SessionFeedback = typeof sessionFeedback.$inferSelect;
export type InsertSessionFeedback = typeof sessionFeedback.$inferInsert;

/**
 * Onboarding analytics table - tracks step views and abandonment
 */
export const onboardingAnalytics = mysqlTable("onboarding_analytics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id),
  step: int("step").notNull(), // Which step (1-4)
  action: mysqlEnum("action", ["view", "complete", "skip", "abandon"]).notNull(),
  timeSpent: int("time_spent"), // Seconds spent on this step
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type OnboardingAnalytic = typeof onboardingAnalytics.$inferSelect;
export type InsertOnboardingAnalytic = typeof onboardingAnalytics.$inferInsert;

/**
 * Webhook events table - tracks processed webhook events for idempotency
 */
export const webhookEvents = mysqlTable("webhook_events", {
  id: int("id").autoincrement().primaryKey(),
  eventId: varchar("event_id", { length: 255 }).notNull().unique(), // Stripe event ID
  eventType: varchar("event_type", { length: 100 }).notNull(),
  processed: boolean("processed").default(true).notNull(),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
  payload: text("payload"), // Store full event payload for debugging
});

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;

/**
 * Commitment progress history table - tracks all progress updates for commitments
 */
export const commitmentProgressHistory = mysqlTable("commitment_progress_history", {
  id: int("id").autoincrement().primaryKey(),
  commitmentId: int("commitment_id").references(() => coachingCommitments.id).notNull(),
  userId: int("user_id").references(() => users.id),
  previousProgress: int("previous_progress").notNull(), // 0-100
  newProgress: int("new_progress").notNull(), // 0-100
  previousStatus: varchar("previous_status", { length: 50 }),
  newStatus: varchar("new_status", { length: 50 }),
  progressNote: text("progress_note"), // User's update note
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CommitmentProgressHistory = typeof commitmentProgressHistory.$inferSelect;
export type InsertCommitmentProgressHistory = typeof commitmentProgressHistory.$inferInsert;

/**
 * Commitment notifications table - tracks sent deadline notifications
 */
export const commitmentNotifications = mysqlTable("commitment_notifications", {
  id: int("id").autoincrement().primaryKey(),
  commitmentId: int("commitment_id").references(() => coachingCommitments.id).notNull(),
  userId: int("user_id").references(() => users.id),
  notificationType: mysqlEnum("notification_type", ["deadline_24h", "deadline_1h", "overdue", "reminder"]).notNull(),
  channel: mysqlEnum("channel", ["email", "in_app", "push"]).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "read"]).default("pending").notNull(),
  sentAt: timestamp("sent_at"),
  readAt: timestamp("read_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CommitmentNotification = typeof commitmentNotifications.$inferSelect;
export type InsertCommitmentNotification = typeof commitmentNotifications.$inferInsert;
