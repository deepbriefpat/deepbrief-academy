# Commitment Reminder Email Cron Setup

This document explains how to set up the automated commitment reminder email system.

## Overview

The system sends reminder emails to users based on their reminder preferences (1, 3, or 7 days before commitment deadlines).

## Cron Script

**File:** `server/cron-send-reminders.mjs`

**What it does:**
1. Queries all users with reminder preferences set
2. For each user, calculates their reminder window (1/3/7 days ahead)
3. Finds commitments due within that window
4. Sends reminder emails via Mailchimp

## Setup Options

### Option 1: Manus Scheduled Tasks (Recommended)

Use Manus's built-in scheduling system:

```javascript
// In your Manus dashboard or via schedule tool
{
  type: "cron",
  cron: "0 9 * * *",  // Daily at 9 AM
  repeat: true,
  name: "commitment_reminders",
  prompt: "Run the commitment reminder email cron job: node server/cron-send-reminders.mjs"
}
```

### Option 2: System Cron (Linux/Mac)

Add to crontab (`crontab -e`):

```bash
# Run daily at 9 AM
0 9 * * * cd /path/to/thinking_patterns_hub && node server/cron-send-reminders.mjs >> /var/log/commitment-reminders.log 2>&1
```

### Option 3: Node-cron (In-app)

Add to your server startup:

```typescript
import cron from "node-cron";

// Run daily at 9 AM
cron.schedule("0 9 * * *", async () => {
  console.log("Running commitment reminder job...");
  await import("./server/cron-send-reminders.mjs");
});
```

## Testing

Run manually to test:

```bash
cd /path/to/thinking_patterns_hub
node server/cron-send-reminders.mjs
```

Expected output:
```
[Cron] Starting commitment reminder job...
[Cron] Found 5 users with reminder preferences
[Cron] Sending reminder to user@example.com for 2 commitment(s)
[Cron] ✓ Sent reminder to user@example.com
[Cron] Commitment reminder job completed
[Cron] Job finished successfully
```

## Environment Variables Required

- `DATABASE_URL` - Database connection string
- `MAILCHIMP_API_KEY` - Mailchimp API key
- `MAILCHIMP_AUDIENCE_ID` - Mailchimp audience/list ID
- `VITE_APP_URL` - Frontend URL for links in emails

## User Configuration

Users set their reminder preference in Settings:
- **1 day before** - Get reminded the day before deadline
- **3 days before** - Get reminded 3 days before deadline
- **7 days before** - Get reminded a week before deadline

The preference is stored in `users.reminderPreference` field.

## Email Content

Emails include:
- User's name (if available)
- List of commitments due within reminder window
- Deadline dates
- Link to coaching dashboard
- Motivational accountability message

## Monitoring

Check logs for:
- Number of users processed
- Number of emails sent
- Any errors during sending

## Troubleshooting

**No emails being sent:**
- Check that users have `reminderPreference` set (not null)
- Verify commitments have `deadline` dates set
- Confirm Mailchimp credentials are correct

**Emails not received:**
- Check spam folder
- Verify email addresses in database are correct
- Check Mailchimp sending limits and quota

**Cron not running:**
- Verify cron service is active: `systemctl status cron`
- Check crontab syntax: `crontab -l`
- Review cron logs: `/var/log/syslog` or `/var/log/cron`
