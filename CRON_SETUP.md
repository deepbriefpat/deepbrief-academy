# Accountability Email Reminder Cron Job Setup

This document explains how to set up automated accountability email reminders for the AI coaching platform.

## What It Does

The accountability reminder system sends three types of emails:

1. **2-3 Day Follow-ups**: Sent 2-3 days after a commitment is made, asking "How did it go?"
2. **Weekly Check-ins**: Sent every Monday to users with open commitments
3. **Overdue Alerts**: Sent when commitments are past their deadline

## Setup Instructions

### Option 1: Using Cron (Linux/Mac Production)

1. Open your crontab:
   ```bash
   crontab -e
   ```

2. Add this line to run daily at 9 AM:
   ```
   0 9 * * * cd /path/to/thinking_patterns_hub && pnpm cron:accountability >> /var/log/accountability-cron.log 2>&1
   ```

3. Save and exit. The cron job will now run automatically every day at 9 AM.

### Option 2: Using Manus Schedule Tool (Recommended)

Use the `schedule` tool in Manus to create a recurring task:

```typescript
schedule({
  type: "cron",
  cron: "0 9 * * *", // Daily at 9 AM
  repeat: true,
  name: "Accountability Email Reminders",
  prompt: "Run the accountability reminder cron job by executing: cd /home/ubuntu/thinking_patterns_hub && pnpm cron:accountability"
});
```

### Option 3: Manual Testing

To test the cron job manually:

```bash
cd /home/ubuntu/thinking_patterns_hub
pnpm cron:accountability
```

## How It Works

The cron script (`server/cron-accountability.ts`) does the following:

1. Calls `processAccountabilityReminders()` to send 2-3 day follow-ups and overdue alerts
2. Checks if it's Monday - if yes, calls `sendWeeklyAccountabilityEmails()`
3. Logs all activity for debugging
4. Exits with status 0 on success, 1 on failure

## Email Functions

The actual email logic is in `server/accountability-reminders.ts`:

- `processAccountabilityReminders()`: Processes daily reminders
- `sendWeeklyAccountabilityEmails()`: Sends weekly check-ins (Mondays only)
- `sendOverdueCommitmentAlert()`: Sends overdue alerts

## Monitoring

Check the cron log to verify emails are being sent:

```bash
tail -f /var/log/accountability-cron.log
```

Or check the server logs if running via Manus schedule tool.

## Troubleshooting

**Emails not sending?**
- Check that the email service is configured correctly in `server/accountability-reminders.ts`
- Verify the database connection is working
- Check the cron log for errors

**Cron job not running?**
- Verify crontab is set up correctly: `crontab -l`
- Check system cron service is running: `systemctl status cron`
- Ensure the path to the project is correct

## Next Steps

After setting up the cron job, monitor the first few runs to ensure emails are being sent correctly. You can also add additional email templates or adjust the timing in `server/accountability-reminders.ts`.
