/**
 * Commitment Reminder Service
 * 
 * Sends email reminders for upcoming and overdue commitments.
 * Designed to run as a scheduled job (daily).
 */

import { getDb } from "./db";
import { coachingCommitments, coachingUsers, users } from "../drizzle/schema";
import { eq, and, lt, gte, isNull, or } from "drizzle-orm";
import { sendEmail } from "./_core/notification";

interface CommitmentWithUser {
  commitment: typeof coachingCommitments.$inferSelect;
  user: {
    email: string;
    name: string;
  };
}

/**
 * Get commitments that need reminders
 * - Due in the next 24 hours (upcoming)
 * - Overdue but not yet reminded this week
 */
async function getCommitmentsNeedingReminders(): Promise<{
  upcoming: CommitmentWithUser[];
  overdue: CommitmentWithUser[];
}> {
  const db = await getDb();
  if (!db) {
    console.error("[CommitmentReminders] Database not available");
    return { upcoming: [], overdue: [] };
  }

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    // Get all pending commitments with deadlines
    const pendingCommitments = await db
      .select({
        commitment: coachingCommitments,
        coachingUser: coachingUsers,
        user: users,
      })
      .from(coachingCommitments)
      .innerJoin(coachingUsers, eq(coachingCommitments.coachingUserId, coachingUsers.id))
      .innerJoin(users, eq(coachingUsers.userId, users.id))
      .where(
        and(
          eq(coachingCommitments.status, "pending"),
          // Has a deadline set
          // Note: deadline column exists in schema
        )
      );

    const upcoming: CommitmentWithUser[] = [];
    const overdue: CommitmentWithUser[] = [];

    for (const row of pendingCommitments) {
      if (!row.commitment.deadline || !row.user.email) continue;

      const deadline = new Date(row.commitment.deadline);
      const lastReminder = row.commitment.lastReminderSent 
        ? new Date(row.commitment.lastReminderSent) 
        : null;

      // Check if due in next 24 hours (upcoming reminder)
      if (deadline > now && deadline <= tomorrow) {
        // Only send if we haven't reminded in the last 24 hours
        if (!lastReminder || lastReminder < new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
          upcoming.push({
            commitment: row.commitment,
            user: { email: row.user.email, name: row.user.name || "there" }
          });
        }
      }
      // Check if overdue
      else if (deadline < now) {
        // Only send weekly overdue reminders
        if (!lastReminder || lastReminder < weekAgo) {
          overdue.push({
            commitment: row.commitment,
            user: { email: row.user.email, name: row.user.name || "there" }
          });
        }
      }
    }

    return { upcoming, overdue };
  } catch (error) {
    console.error("[CommitmentReminders] Error fetching commitments:", error);
    return { upcoming: [], overdue: [] };
  }
}

/**
 * Generate upcoming commitment email
 */
function generateUpcomingEmail(userName: string, commitments: typeof coachingCommitments.$inferSelect[]): { subject: string; html: string; text: string } {
  const count = commitments.length;
  const subject = count === 1 
    ? `Reminder: "${commitments[0].action}" is due tomorrow`
    : `Reminder: ${count} commitments due tomorrow`;

  const commitmentList = commitments.map(c => {
    const deadline = c.deadline ? new Date(c.deadline).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }) : 'No deadline';
    return `• ${c.action} (${deadline})`;
  }).join('\n');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2C2C2C; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4A6741 0%, #3d5636 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #E6E2D6; border-top: none; border-radius: 0 0 8px 8px; }
    .commitment { background: #F7F5F0; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #D4A853; }
    .cta { display: inline-block; background: #4A6741; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #6B6B60; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">⏰ Commitment Reminder</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>Quick reminder - you have ${count === 1 ? 'a commitment' : `${count} commitments`} due tomorrow:</p>
      ${commitments.map(c => `
        <div class="commitment">
          <strong>${c.action}</strong>
          ${c.context ? `<p style="margin: 8px 0 0; font-size: 14px; color: #6B6B60;">${c.context}</p>` : ''}
        </div>
      `).join('')}
      <p>What's one thing you can do today to make progress on ${count === 1 ? 'this' : 'these'}?</p>
      <a href="https://deepbrief.academy/ai-coach/dashboard" class="cta">Open Dashboard</a>
    </div>
    <div class="footer">
      <p>DeepBrief Academy - Executive Coaching</p>
      <p><a href="https://deepbrief.academy/settings/notifications">Manage notifications</a></p>
    </div>
  </div>
</body>
</html>`;

  const text = `Hi ${userName},

Quick reminder - you have ${count === 1 ? 'a commitment' : `${count} commitments`} due tomorrow:

${commitmentList}

What's one thing you can do today to make progress on ${count === 1 ? 'this' : 'these'}?

Open your dashboard: https://deepbrief.academy/ai-coach/dashboard

---
DeepBrief Academy`;

  return { subject, html, text };
}

/**
 * Generate overdue commitment email
 */
function generateOverdueEmail(userName: string, commitments: typeof coachingCommitments.$inferSelect[]): { subject: string; html: string; text: string } {
  const count = commitments.length;
  const subject = count === 1 
    ? `Checking in: "${commitments[0].action}" is overdue`
    : `Checking in: ${count} commitments are overdue`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2C2C2C; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #D4A853 0%, #c49643 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .content { background: #fff; padding: 30px; border: 1px solid #E6E2D6; border-top: none; border-radius: 0 0 8px 8px; }
    .commitment { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #D97706; }
    .cta { display: inline-block; background: #4A6741; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .secondary-cta { display: inline-block; background: transparent; color: #4A6741; padding: 12px 24px; text-decoration: none; border: 2px solid #4A6741; border-radius: 6px; margin-top: 10px; margin-left: 10px; }
    .footer { text-align: center; padding: 20px; color: #6B6B60; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">📋 Commitment Check-in</h1>
    </div>
    <div class="content">
      <p>Hi ${userName},</p>
      <p>No judgment - just checking in. ${count === 1 ? 'This commitment is' : 'These commitments are'} past ${count === 1 ? 'its' : 'their'} deadline:</p>
      ${commitments.map(c => {
        const daysOverdue = Math.floor((Date.now() - new Date(c.deadline!).getTime()) / (1000 * 60 * 60 * 24));
        return `
        <div class="commitment">
          <strong>${c.action}</strong>
          <p style="margin: 8px 0 0; font-size: 13px; color: #D97706;">${daysOverdue} days overdue</p>
          ${c.context ? `<p style="margin: 8px 0 0; font-size: 14px; color: #6B6B60;">${c.context}</p>` : ''}
        </div>
      `}).join('')}
      <p>Sometimes priorities shift, and that's okay. You can:</p>
      <ul style="color: #4A6741;">
        <li>Update the deadline if circumstances changed</li>
        <li>Mark it complete if you've done it</li>
        <li>Remove it if it's no longer relevant</li>
        <li>Discuss it with your coach in your next session</li>
      </ul>
      <a href="https://deepbrief.academy/ai-coach/dashboard" class="cta">Open Dashboard</a>
      <a href="https://deepbrief.academy/ai-coach/dashboard?tab=commitments" class="secondary-cta">Review Commitments</a>
    </div>
    <div class="footer">
      <p>DeepBrief Academy - Executive Coaching</p>
      <p><a href="https://deepbrief.academy/settings/notifications">Manage notifications</a></p>
    </div>
  </div>
</body>
</html>`;

  const text = `Hi ${userName},

No judgment - just checking in. ${count === 1 ? 'This commitment is' : 'These commitments are'} past ${count === 1 ? 'its' : 'their'} deadline:

${commitments.map(c => {
  const daysOverdue = Math.floor((Date.now() - new Date(c.deadline!).getTime()) / (1000 * 60 * 60 * 24));
  return `• ${c.action} (${daysOverdue} days overdue)`;
}).join('\n')}

Sometimes priorities shift, and that's okay. You can:
- Update the deadline if circumstances changed
- Mark it complete if you've done it
- Remove it if it's no longer relevant
- Discuss it with your coach in your next session

Open your dashboard: https://deepbrief.academy/ai-coach/dashboard

---
DeepBrief Academy`;

  return { subject, html, text };
}

/**
 * Update last reminder sent timestamp
 */
async function markReminderSent(commitmentIds: number[]): Promise<void> {
  const db = await getDb();
  if (!db || commitmentIds.length === 0) return;

  try {
    await db
      .update(coachingCommitments)
      .set({ lastReminderSent: new Date() })
      .where(
        or(...commitmentIds.map(id => eq(coachingCommitments.id, id)))
      );
  } catch (error) {
    console.error("[CommitmentReminders] Error updating reminder timestamps:", error);
  }
}

/**
 * Main function to process and send commitment reminders
 */
export async function processCommitmentReminders(): Promise<{
  upcomingSent: number;
  overdueSent: number;
  errors: string[];
}> {
  console.log("[CommitmentReminders] Starting reminder processing...");
  
  const { upcoming, overdue } = await getCommitmentsNeedingReminders();
  const errors: string[] = [];
  let upcomingSent = 0;
  let overdueSent = 0;

  // Group commitments by user email
  const upcomingByUser = new Map<string, { user: { email: string; name: string }; commitments: typeof coachingCommitments.$inferSelect[] }>();
  const overdueByUser = new Map<string, { user: { email: string; name: string }; commitments: typeof coachingCommitments.$inferSelect[] }>();

  for (const item of upcoming) {
    const existing = upcomingByUser.get(item.user.email);
    if (existing) {
      existing.commitments.push(item.commitment);
    } else {
      upcomingByUser.set(item.user.email, { user: item.user, commitments: [item.commitment] });
    }
  }

  for (const item of overdue) {
    const existing = overdueByUser.get(item.user.email);
    if (existing) {
      existing.commitments.push(item.commitment);
    } else {
      overdueByUser.set(item.user.email, { user: item.user, commitments: [item.commitment] });
    }
  }

  // Send upcoming reminders
  for (const [email, data] of upcomingByUser) {
    try {
      const { subject, html, text } = generateUpcomingEmail(data.user.name, data.commitments);
      await sendEmail({
        to: email,
        subject,
        html,
        text,
      });
      await markReminderSent(data.commitments.map(c => c.id));
      upcomingSent++;
      console.log(`[CommitmentReminders] Sent upcoming reminder to ${email}`);
    } catch (error) {
      const msg = `Failed to send upcoming reminder to ${email}: ${error}`;
      console.error(`[CommitmentReminders] ${msg}`);
      errors.push(msg);
    }
  }

  // Send overdue reminders
  for (const [email, data] of overdueByUser) {
    try {
      const { subject, html, text } = generateOverdueEmail(data.user.name, data.commitments);
      await sendEmail({
        to: email,
        subject,
        html,
        text,
      });
      await markReminderSent(data.commitments.map(c => c.id));
      overdueSent++;
      console.log(`[CommitmentReminders] Sent overdue reminder to ${email}`);
    } catch (error) {
      const msg = `Failed to send overdue reminder to ${email}: ${error}`;
      console.error(`[CommitmentReminders] ${msg}`);
      errors.push(msg);
    }
  }

  console.log(`[CommitmentReminders] Complete. Upcoming: ${upcomingSent}, Overdue: ${overdueSent}, Errors: ${errors.length}`);
  
  return { upcomingSent, overdueSent, errors };
}

/**
 * Re-engagement email for users who haven't had a session in X days
 */
export async function sendReengagementEmails(daysSinceLastSession: number = 7): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // This would require a more complex query to find users who:
  // 1. Have an active subscription
  // 2. Haven't had a session in X days
  // 3. Haven't received a re-engagement email recently
  
  // For now, return 0 - implement full logic when schema supports it
  console.log("[ReEngagement] Re-engagement emails not yet implemented");
  return 0;
}
