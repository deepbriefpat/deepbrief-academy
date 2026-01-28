/**
 * Commitment Check-In Service
 * 
 * Sends automated email reminders 3 days after commitments are made.
 * Runs as a scheduled job to check for commitments needing check-ins.
 */

import { getDb } from "./db";
import { sendEmail } from "./emailService";
import { generateCommitmentCheckInEmail } from "./templates/commitmentCheckInEmail";
import { eq, and, sql, lt } from "drizzle-orm";

/**
 * Check for commitments that need check-in emails (created 3 days ago, not yet sent)
 */
export async function processCommitmentCheckIns(): Promise<{
  processed: number;
  sent: number;
  errors: number;
}> {
  const db = await getDb();
  if (!db) {
    console.error("[CommitmentCheckIn] Database not available");
    return { processed: 0, sent: 0, errors: 0 };
  }

  const { coachingCommitments, coachingUsers } = await import("../drizzle/schema");

  // Find commitments created 3 days ago that haven't received check-in email
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  threeDaysAgo.setHours(0, 0, 0, 0);

  const fourDaysAgo = new Date();
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
  fourDaysAgo.setHours(0, 0, 0, 0);

  try {
    // Get commitments that need check-ins
    const { users } = await import("../drizzle/schema");
    
    const commitmentsNeedingCheckIn = await db
      .select({
        commitmentId: coachingCommitments.id,
        commitmentText: coachingCommitments.action,
        deadline: coachingCommitments.deadline,
        userId: coachingCommitments.userId,
        createdAt: coachingCommitments.createdAt,
        checkInEmailSent: coachingCommitments.checkInEmailSent,
        userName: coachingUsers.preferredName,
        userEmail: users.email,
      })
      .from(coachingCommitments)
      .innerJoin(coachingUsers, eq(coachingCommitments.coachingUserId, coachingUsers.id))
      .innerJoin(users, eq(coachingUsers.userId, users.id))
      .where(
        and(
          sql`${coachingCommitments.createdAt} >= ${fourDaysAgo}`,
          sql`${coachingCommitments.createdAt} < ${threeDaysAgo}`,
          eq(coachingCommitments.status, "pending"),
          sql`${coachingCommitments.checkInEmailSent} = false`
        )
      );

    let sent = 0;
    let errors = 0;

    for (const commitment of commitmentsNeedingCheckIn) {
      try {
        // Generate email
        const progressUpdateUrl = `${process.env.VITE_APP_URL || 'https://thedeepbrief.com'}/ai-coach/dashboard?tab=commitments&highlight=${commitment.commitmentId}`;
        
        const emailContent = generateCommitmentCheckInEmail({
          userName: commitment.userName || "there",
          commitmentText: commitment.commitmentText,
          deadline: commitment.deadline ? new Date(commitment.deadline).toLocaleDateString() : "",
          commitmentId: commitment.commitmentId,
          progressUpdateUrl,
        });

        // Send email
        if (!commitment.userEmail) {
          console.error(`[CommitmentCheckIn] No email for commitment ${commitment.commitmentId}`);
          errors++;
          continue;
        }
        
        const emailSent = await sendEmail(
          commitment.userEmail,
          emailContent.subject,
          emailContent.htmlBody
        );

        if (emailSent) {
          // Mark as sent
          await db
            .update(coachingCommitments)
            .set({ checkInEmailSent: true })
            .where(eq(coachingCommitments.id, commitment.commitmentId));
          
          sent++;
          console.log(`[CommitmentCheckIn] Sent check-in email for commitment ${commitment.commitmentId} to ${commitment.userEmail}`);
        } else {
          errors++;
          console.error(`[CommitmentCheckIn] Failed to send email for commitment ${commitment.commitmentId}`);
        }
      } catch (error) {
        errors++;
        console.error(`[CommitmentCheckIn] Error processing commitment ${commitment.commitmentId}:`, error);
      }
    }

    return {
      processed: commitmentsNeedingCheckIn.length,
      sent,
      errors,
    };
  } catch (error) {
    console.error("[CommitmentCheckIn] Error in processCommitmentCheckIns:", error);
    return { processed: 0, sent: 0, errors: 1 };
  }
}

/**
 * Start the commitment check-in scheduler
 * Runs every hour to check for commitments needing check-ins
 */
export function startCommitmentCheckInScheduler() {
  // Run immediately on startup
  processCommitmentCheckIns().then(result => {
    console.log(`[CommitmentCheckIn] Initial run: processed=${result.processed}, sent=${result.sent}, errors=${result.errors}`);
  });

  // Run every hour
  setInterval(() => {
    processCommitmentCheckIns().then(result => {
      console.log(`[CommitmentCheckIn] Hourly run: processed=${result.processed}, sent=${result.sent}, errors=${result.errors}`);
    });
  }, 60 * 60 * 1000); // 1 hour

  console.log("[CommitmentCheckIn] Scheduler started (runs every hour)");
}
