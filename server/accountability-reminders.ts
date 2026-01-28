/**
 * Accountability Reminder System
 * 
 * Sends automated follow-up emails 2-3 days after commitments are made
 * and weekly check-ins for ongoing accountability
 */

import { generateFollowUpEmail, generateWeeklyCheckInEmail, generateOverdueAlertEmail } from "./commitmentEmailTemplates";

export interface CommitmentReminder {
  userId: number;
  userEmail: string;
  userName: string;
  commitmentId: number;
  commitmentDescription: string;
  dueDate: Date | null;
  daysSinceCommitment: number;
}

/**
 * Send follow-up email for a specific commitment
 * This creates "pressure" by checking in 2-3 days after commitment
 */
export async function sendCommitmentFollowUp(reminder: CommitmentReminder) {
  const { sendEmail } = await import("./emailService");
  const { getOrCreateEmailPreferences } = await import("./db");
  
  // Get user's email preferences and unsubscribe token
  const preferences = await getOrCreateEmailPreferences(reminder.userId);
  
  // Check if user has unsubscribed or disabled follow-up emails
  if (!preferences.emailsEnabled || !preferences.followUpEmails) {
    return { success: true, skipped: true };
  }
  
  const { subject, html } = generateFollowUpEmail({
    userName: reminder.userName,
    commitmentDescription: reminder.commitmentDescription,
    dueDate: reminder.dueDate,
    daysSinceCommitment: reminder.daysSinceCommitment,
    unsubscribeToken: preferences.unsubscribeToken,
  });

  try {
    // Send actual email via Mailchimp
    const success = await sendEmail(reminder.userEmail, subject, html);
    
    if (!success) {
      console.error("Failed to send commitment follow-up email");
      return { success: false, error: "Email sending failed" };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Failed to send commitment follow-up:", error);
    return { success: false, error };
  }
}

/**
 * Send weekly accountability check-in
 * Reviews all open commitments and asks for updates
 */
export async function sendWeeklyAccountabilityEmail(data: {
  userId: number;
  userEmail: string;
  userName: string;
  openCommitments: Array<{
    id: number;
    description: string;
    dueDate: Date | null;
    daysSinceCreated: number;
  }>;
  completedThisWeek: number;
  missedThisWeek: number;
}) {
  const { sendEmail } = await import("./emailService");
  const { getOrCreateEmailPreferences } = await import("./db");
  
  // Get user's email preferences and unsubscribe token
  const preferences = await getOrCreateEmailPreferences(data.userId);
  
  // Check if user has unsubscribed or disabled weekly check-ins
  if (!preferences.emailsEnabled || !preferences.weeklyCheckIns) {
    return { success: true, skipped: true };
  }
  
  const { subject, html } = generateWeeklyCheckInEmail({
    userName: data.userName,
    openCommitments: data.openCommitments.map(c => ({
      description: c.description,
      deadline: c.dueDate,
      daysSinceCreated: c.daysSinceCreated,
    })),
    unsubscribeToken: preferences.unsubscribeToken,
  });

  try {
    // Send actual email via Mailchimp
    const success = await sendEmail(data.userEmail, subject, html);
    
    if (!success) {
      console.error("Failed to send weekly accountability email");
      return { success: false, error: "Email sending failed" };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Failed to send weekly accountability email:", error);
    return { success: false, error };
  }
}

/**
 * Check for overdue commitments and send urgent reminders
 */
export async function sendOverdueCommitmentAlert(data: {
  userId: number;
  userEmail: string;
  userName: string;
  overdueCommitments: Array<{
    id: number;
    description: string;
    dueDate: Date;
    daysOverdue: number;
  }>;
}) {
  const { sendEmail } = await import("./emailService");
  const { getOrCreateEmailPreferences } = await import("./db");
  
  // Get user's email preferences and unsubscribe token
  const preferences = await getOrCreateEmailPreferences(data.userId);
  
  // Check if user has unsubscribed or disabled overdue alerts
  if (!preferences.emailsEnabled || !preferences.overdueAlerts) {
    return { success: true, skipped: true };
  }
  
  const { subject, html } = generateOverdueAlertEmail({
    userName: data.userName,
    overdueCommitments: data.overdueCommitments.map(c => ({
      description: c.description,
      deadline: c.dueDate,
      daysOverdue: c.daysOverdue,
    })),
    unsubscribeToken: preferences.unsubscribeToken,
  });

  try {
    // Send actual email via Mailchimp
    const success = await sendEmail(data.userEmail, subject, html);
    
    if (!success) {
      console.error("Failed to send overdue commitment alert");
      return { success: false, error: "Email sending failed" };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Failed to send overdue commitment alert:", error);
    return { success: false, error };
  }
}

/**
 * Process all pending reminders
 * This should be called by a scheduled job (cron)
 */
export async function processAccountabilityReminders() {
  const { getDb } = await import("./db");
  const { coachingCommitments, users } = await import("../drizzle/schema");
  const { eq, and, sql, lt } = await import("drizzle-orm");
  
  const db = await getDb();
  if (!db) {
    console.error("Database not available for reminder processing");
    return;
  }
  
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  
  // Find commitments that are 2-3 days old and haven't been followed up
  const commitmentsNeedingFollowUp = await db
    .select({
      commitmentId: coachingCommitments.id,
      userId: coachingCommitments.userId,
      action: coachingCommitments.action,
      deadline: coachingCommitments.deadline,
      createdAt: coachingCommitments.createdAt,
      followUpCount: coachingCommitments.followUpCount,
      userEmail: users.email,
      userName: users.name,
    })
    .from(coachingCommitments)
    .leftJoin(users, eq(coachingCommitments.userId, users.id))
    .where(
      and(
        sql`${coachingCommitments.status} IN ('open', 'pending', 'in_progress')`,
        lt(coachingCommitments.createdAt, threeDaysAgo),
        eq(coachingCommitments.followUpCount, 0) // Haven't followed up yet
      )
    );
  
  // Send follow-up emails
  for (const commitment of commitmentsNeedingFollowUp) {
    if (!commitment.userId || !commitment.userEmail) continue;
    
    const daysSince = Math.floor(
      (now.getTime() - commitment.createdAt.getTime()) / (24 * 60 * 60 * 1000)
    );
    
    await sendCommitmentFollowUp({
      userId: commitment.userId,
      userEmail: commitment.userEmail,
      userName: commitment.userName || "there",
      commitmentId: commitment.commitmentId,
      commitmentDescription: commitment.action,
      dueDate: commitment.deadline,
      daysSinceCommitment: daysSince,
    });
    
    // Update follow-up count
    await db
      .update(coachingCommitments)
      .set({
        followUpCount: commitment.followUpCount + 1,
        lastFollowUpAt: now,
      })
      .where(eq(coachingCommitments.id, commitment.commitmentId));
  }
  
}

/**
 * Send weekly accountability emails to all active users
 * This should be called by a weekly scheduled job
 */
export async function sendWeeklyAccountabilityEmails() {
  const { getDb } = await import("./db");
  const { coachingCommitments, users, coachingSessions } = await import("../drizzle/schema");
  const { eq, and, sql, gte } = await import("drizzle-orm");
  
  const db = await getDb();
  if (!db) {
    console.error("Database not available for weekly emails");
    return;
  }
  
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Get all users with recent activity
  const { coachingUsers } = await import("../drizzle/schema");
  
  const activeUsers = await db
    .selectDistinct({
      userId: users.id,
      userEmail: users.email,
      userName: users.name,
    })
    .from(users)
    .leftJoin(coachingUsers, eq(coachingUsers.userId, users.id))
    .leftJoin(coachingSessions, eq(coachingSessions.coachingUserId, coachingUsers.id))
    .where(
      and(
        gte(coachingSessions.createdAt, oneWeekAgo),
        sql`${users.email} IS NOT NULL`
      )
    );
  
  for (const user of activeUsers) {
    if (!user.userId || !user.userEmail) continue;
    
    // Get open commitments
    const openCommitments = await db
      .select()
      .from(coachingCommitments)
      .where(
        and(
          eq(coachingCommitments.userId, user.userId),
          sql`${coachingCommitments.status} IN ('open', 'pending', 'in_progress')`
        )
      );
    
    // Get completed/missed this week
    const completedThisWeek = await db
      .select()
      .from(coachingCommitments)
      .where(
        and(
          eq(coachingCommitments.userId, user.userId),
          eq(coachingCommitments.status, "completed"),
          gte(coachingCommitments.completedAt!, oneWeekAgo)
        )
      );
    
    const missedThisWeek = await db
      .select()
      .from(coachingCommitments)
      .where(
        and(
          eq(coachingCommitments.userId, user.userId),
          eq(coachingCommitments.status, "missed"),
          gte(coachingCommitments.updatedAt, oneWeekAgo)
        )
      );
    
    await sendWeeklyAccountabilityEmail({
      userId: user.userId,
      userEmail: user.userEmail,
      userName: user.userName || "there",
      openCommitments: openCommitments.map(c => ({
        id: c.id,
        description: c.action,
        dueDate: c.deadline,
        daysSinceCreated: Math.floor(
          (now.getTime() - c.createdAt.getTime()) / (24 * 60 * 60 * 1000)
        ),
      })),
      completedThisWeek: completedThisWeek.length,
      missedThisWeek: missedThisWeek.length,
    });
  }
  
}
