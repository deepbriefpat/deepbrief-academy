/**
 * Commitment Deadline Notification System
 * 
 * Sends email and in-app notifications for upcoming commitment deadlines
 */

import { getDb } from "./db";
import { coachingCommitments, coachingUsers, users } from "../drizzle/schema";
import { eq, and, lte, gte, isNull } from "drizzle-orm";
import { formatDeadline } from "./dateParser";

export interface CommitmentNotification {
  commitmentId: number;
  userId: number;
  userEmail: string;
  userName: string;
  action: string;
  deadline: Date;
  daysUntilDeadline: number;
  notificationType: "24_hours" | "3_days" | "1_week" | "overdue";
}

/**
 * Find commitments that need notifications
 * Returns commitments approaching their deadlines or overdue
 */
export async function getCommitmentsNeedingNotification(): Promise<CommitmentNotification[]> {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const notifications: CommitmentNotification[] = [];

  // Define notification windows
  const windows = [
    { hours: 24, type: "24_hours" as const },
    { hours: 72, type: "3_days" as const },
    { hours: 168, type: "1_week" as const },
  ];

  // Get all pending commitments with deadlines
  const pendingCommitments = await db
    .select({
      id: coachingCommitments.id,
      action: coachingCommitments.action,
      deadline: coachingCommitments.deadline,
      status: coachingCommitments.status,
      lastNotified: coachingCommitments.lastNotified,
      coachingUserId: coachingCommitments.coachingUserId,
      userId: coachingUsers.userId,
      userName: users.name,
      userEmail: users.email,
    })
    .from(coachingCommitments)
    .innerJoin(coachingUsers, eq(coachingCommitments.coachingUserId, coachingUsers.id))
    .innerJoin(users, eq(coachingUsers.userId, users.id))
    .where(
      eq(coachingCommitments.status, "pending")
    );

  for (const commitment of pendingCommitments) {
    if (!commitment.deadline) continue;

    const deadline = new Date(commitment.deadline);
    const diffMs = deadline.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.ceil(diffHours / 24);

    // Check if overdue
    if (diffHours < 0) {
      // Only notify once for overdue (check if last notification was more than 24 hours ago)
      const shouldNotify = !commitment.lastNotified || 
        (now.getTime() - new Date(commitment.lastNotified).getTime()) > 24 * 60 * 60 * 1000;
      
      if (shouldNotify) {
        notifications.push({
          commitmentId: commitment.id,
          userId: commitment.userId,
          userEmail: commitment.userEmail ?? "",
          userName: commitment.userName ?? "User",
          action: commitment.action,
          deadline,
          daysUntilDeadline: diffDays,
          notificationType: "overdue",
        });
      }
      continue;
    }

    // Check notification windows
    for (const window of windows) {
      const windowStart = window.hours;
      const windowEnd = window.hours - 1; // 1 hour window

      if (diffHours <= windowStart && diffHours > windowEnd) {
        // Check if we already notified for this window
        const lastNotified = commitment.lastNotified ? new Date(commitment.lastNotified) : null;
        const shouldNotify = !lastNotified || 
          (now.getTime() - lastNotified.getTime()) > windowStart * 60 * 60 * 1000;

        if (shouldNotify) {
          notifications.push({
            commitmentId: commitment.id,
          userId: commitment.userId,
          userEmail: commitment.userEmail ?? "",
          userName: commitment.userName ?? "User",
            action: commitment.action,
            deadline,
            daysUntilDeadline: diffDays,
            notificationType: window.type,
          });
        }
      }
    }
  }

  return notifications;
}

/**
 * Send email notification for commitment deadline
 */
export async function sendCommitmentEmail(notification: CommitmentNotification): Promise<boolean> {
  try {
    // TODO: Integrate with email service (Mailchimp, SendGrid, etc.)
    // For now, just log the notification
    console.log(`[Notifications] Would send email to ${notification.userEmail}:`);
    console.log(`  Subject: Commitment Reminder: ${notification.action}`);
    console.log(`  Deadline: ${formatDeadline(notification.deadline)}`);
    console.log(`  Type: ${notification.notificationType}`);
    
    // In production, this would call an email API:
    // await emailService.send({
    //   to: notification.userEmail,
    //   subject: `Commitment Reminder: ${notification.action}`,
    //   template: 'commitment-reminder',
    //   data: {
    //     userName: notification.userName,
    //     action: notification.action,
    //     deadline: formatDeadline(notification.deadline),
    //     daysUntil: notification.daysUntilDeadline,
    //     isOverdue: notification.notificationType === 'overdue'
    //   }
    // });

    return true;
  } catch (error) {
    console.error(`[Notifications] Failed to send email:`, error);
    return false;
  }
}

/**
 * Send in-app notification (browser push or in-app banner)
 */
export async function sendInAppNotification(notification: CommitmentNotification): Promise<boolean> {
  try {
    // TODO: Integrate with push notification service or in-app notification system
    console.log(`[Notifications] Would send in-app notification to user ${notification.userId}:`);
    console.log(`  ${notification.action}`);
    console.log(`  Due: ${formatDeadline(notification.deadline)}`);
    
    // In production, this would:
    // 1. Store notification in database for in-app display
    // 2. Send browser push notification if user has enabled it
    // await notificationService.create({
    //   userId: notification.userId,
    //   type: 'commitment_reminder',
    //   title: 'Commitment Reminder',
    //   message: notification.action,
    //   deadline: notification.deadline,
    //   read: false
    // });

    return true;
  } catch (error) {
    console.error(`[Notifications] Failed to send in-app notification:`, error);
    return false;
  }
}

/**
 * Mark commitment as notified
 */
export async function markCommitmentNotified(commitmentId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(coachingCommitments)
    .set({ lastNotified: new Date() })
    .where(eq(coachingCommitments.id, commitmentId));
}

/**
 * Process all pending notifications
 * This should be called periodically (e.g., every hour via cron job)
 */
export async function processCommitmentNotifications(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  console.log(`[Notifications] Starting notification processing at ${new Date().toISOString()}`);
  
  const notifications = await getCommitmentsNeedingNotification();
  console.log(`[Notifications] Found ${notifications.length} commitments needing notification`);

  let sent = 0;
  let failed = 0;

  for (const notification of notifications) {
    try {
      // Send both email and in-app notification
      const emailSent = await sendCommitmentEmail(notification);
      const inAppSent = await sendInAppNotification(notification);

      if (emailSent || inAppSent) {
        await markCommitmentNotified(notification.commitmentId);
        sent++;
        console.log(`[Notifications] ✓ Sent notification for commitment ${notification.commitmentId}`);
      } else {
        failed++;
        console.log(`[Notifications] ✗ Failed to send notification for commitment ${notification.commitmentId}`);
      }
    } catch (error) {
      failed++;
      console.error(`[Notifications] Error processing notification:`, error);
    }
  }

  console.log(`[Notifications] Processing complete: ${sent} sent, ${failed} failed`);
  
  return {
    processed: notifications.length,
    sent,
    failed,
  };
}
