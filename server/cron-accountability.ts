/**
 * Cron Job for Accountability Email Reminders
 * 
 * This script should be run daily to send accountability emails:
 * - 2-3 day follow-ups after commitments
 * - Weekly check-ins
 * - Overdue commitment alerts
 * 
 * Setup:
 * 1. Add to package.json scripts: "cron:accountability": "tsx server/cron-accountability.ts"
 * 2. Set up cron job: 0 9 * * * cd /path/to/project && pnpm cron:accountability
 *    (Runs daily at 9 AM)
 */

import { processAccountabilityReminders, sendWeeklyAccountabilityEmails } from "./accountability-reminders";

async function runAccountabilityReminders() {
  
  try {
    // Process daily reminders (2-3 day follow-ups, overdue alerts)
    await processAccountabilityReminders();
    
    // Check if it's Monday (day 1) to send weekly check-ins
    const today = new Date().getDay();
    if (today === 1) {
      await sendWeeklyAccountabilityEmails();
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Accountability reminder cron job failed:`, error);
    process.exit(1);
  }
}

// Run the job
runAccountabilityReminders();
