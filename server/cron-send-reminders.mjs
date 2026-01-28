/**
 * Cron Job: Send Commitment Reminder Emails
 * 
 * Runs daily to check for commitments due within user's preference window
 * (1, 3, or 7 days) and sends reminder emails via Mailchimp
 * 
 * Usage: node server/cron-send-reminders.mjs
 */

import { db } from "./db.ts";
import { users, commitments } from "../drizzle/schema.ts";
import { eq, and, gte, lte, isNull, or } from "drizzle-orm";
import { sendEmail } from "./_core/emailService.ts";

async function sendCommitmentReminders() {
  console.log("[Cron] Starting commitment reminder job...");
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  try {
    // Get all users with reminder preferences set (any of the valid options)
    const usersWithPreferences = await db
      .select()
      .from(users)
      .where(or(
        eq(users.reminderPreference, "1_day"),
        eq(users.reminderPreference, "3_days"),
        eq(users.reminderPreference, "7_days")
      ));
    
    console.log(`[Cron] Found ${usersWithPreferences.length} users with reminder preferences`);
    
    for (const user of usersWithPreferences) {
      // Calculate reminder window based on user preference
      let daysAhead = 1;
      if (user.reminderPreference === "3_days") daysAhead = 3;
      if (user.reminderPreference === "7_days") daysAhead = 7;
      
      const reminderDate = new Date(today);
      reminderDate.setDate(reminderDate.getDate() + daysAhead);
      
      // Find commitments due on the reminder date
      const userCommitments = await db
        .select()
        .from(commitments)
        .where(and(
          eq(commitments.userId, user.id),
          or(
            eq(commitments.status, "open"),
            eq(commitments.status, "in_progress")
          ),
          gte(commitments.deadline, reminderDate),
          lte(commitments.deadline, new Date(reminderDate.getTime() + 24 * 60 * 60 * 1000))
        ));
      
      if (userCommitments.length === 0) {
        console.log(`[Cron] No commitments due for ${user.email} in ${daysAhead} days`);
        continue;
      }
      
      console.log(`[Cron] Sending reminder to ${user.email} for ${userCommitments.length} commitment(s)`);
      
      // Build email content
      const commitmentList = userCommitments
        .map(c => `• ${c.action} (Due: ${new Date(c.deadline).toLocaleDateString()})`)
        .join("\n");
      
      const emailContent = `
Hi ${user.name || "there"},

This is your ${daysAhead}-day reminder about the following commitment${userCommitments.length > 1 ? "s" : ""} you made:

${commitmentList}

${userCommitments.length > 1 ? "These commitments are" : "This commitment is"} due in ${daysAhead} day${daysAhead > 1 ? "s" : ""}. 

Every commitment is a promise you made to yourself. The coach remembers all of them.

Ready to update your progress? Visit your coaching dashboard:
${process.env.VITE_APP_URL}/ai-coach

---
The Deep Brief
Leadership Clarity Under Pressure
      `.trim();
      
      try {
        await sendEmail({
          to: user.email,
          subject: `Reminder: ${userCommitments.length} commitment${userCommitments.length > 1 ? "s" : ""} due in ${daysAhead} day${daysAhead > 1 ? "s" : ""}`,
          text: emailContent,
          html: emailContent.replace(/\n/g, "<br>"),
        });
        
        console.log(`[Cron] ✓ Sent reminder to ${user.email}`);
      } catch (emailError) {
        console.error(`[Cron] ✗ Failed to send email to ${user.email}:`, emailError);
      }
    }
    
    console.log("[Cron] Commitment reminder job completed");
  } catch (error) {
    console.error("[Cron] Error in commitment reminder job:", error);
    throw error;
  }
}

// Run the job
sendCommitmentReminders()
  .then(() => {
    console.log("[Cron] Job finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[Cron] Job failed:", error);
    process.exit(1);
  });
