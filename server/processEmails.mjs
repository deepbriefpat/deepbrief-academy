/**
 * Process pending emails that should be sent
 * Run this script daily via cron job: node server/processEmails.mjs
 */

import { processPendingEmails } from "./emailService.ts";

async function main() {
  console.log(`[${new Date().toISOString()}] Starting email processing...`);
  
  try {
    const sentCount = await processPendingEmails();
    console.log(`[${new Date().toISOString()}] Successfully sent ${sentCount} emails`);
    process.exit(0);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error processing emails:`, error);
    process.exit(1);
  }
}

main();
