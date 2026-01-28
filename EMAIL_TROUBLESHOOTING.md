# Email Service Troubleshooting Guide

## Current Configuration

**Email Provider:** Mailchimp Transactional (Mandrill)  
**API Key Location:** Environment variable `MANDRILL_API_KEY` or `MAILCHIMP_API_KEY`  
**From Email:** patrick@thedeepbrief.co.uk  
**From Name:** Patrick Voorma

## Recent Fixes Applied

1. **Dual API Key Support** - Checks both `MANDRILL_API_KEY` and `MAILCHIMP_API_KEY` environment variables
2. **Comprehensive Error Logging** - Logs HTTP status codes (401, 500), network errors, and rejection reasons
3. **Connection Test Function** - `testMandrillConnection()` available for diagnostics
4. **Detailed Response Logging** - Logs full Mandrill API response including status, reject_reason, and message ID

## How to Debug Email Failures

### Step 1: Check Browser Console
1. Open browser console (F12 → Console tab)
2. Click "End & Email" button
3. Look for log messages with prefixes:
   - `[Email]` - Email service logs
   - `[SessionSummary]` - Summary generation logs

### Step 2: Identify the Error Type

**If you see "❌ 401 Unauthorized":**
- The Mandrill API key is invalid
- Make sure you're using a MANDRILL API key (starts with `md-`), not a Mailchimp Marketing key
- Check Settings → Secrets to verify the key is correct

**If you see "❌ Email REJECTED":**
- Check the reject_reason in the logs
- Common reasons:
  - `invalid-sender`: Domain not verified in Mandrill
  - `hard-bounce`: Email address doesn't exist
  - `spam`: Email flagged as spam
  - `soft-bounce`: Temporary delivery issue

**If you see "❌ Network error":**
- Cannot reach Mandrill API
- Check internet connection
- Mandrill may be experiencing downtime

**If you see "Empty response from Mandrill API":**
- Usually means the API key is completely invalid
- Double-check the API key format

### Step 3: Verify Mandrill Configuration

1. Log into Mandrill dashboard: https://mandrillapp.com/
2. Check **Sending Domains** settings
3. Verify `thedeepbrief.co.uk` is added and verified
4. Add SPF and DKIM DNS records if not already done

### Step 4: Test API Connection

The email service includes a test function. To use it:

```typescript
import { testMandrillConnection } from './server/_core/emailService';

const result = await testMandrillConnection();
console.log(result);
```

This will return:
- `success: true` if the API key works
- Account details (username, reputation, hourly quota)
- Error details if connection fails

## Common Issues and Solutions

### Issue: "Session ended, but email failed to send"
**Cause:** Backend email service is failing  
**Solution:** Check browser console for detailed error logs

### Issue: No console logs appearing
**Cause:** Old code is still deployed  
**Solution:** Ensure latest checkpoint is published

### Issue: Emails not arriving in inbox
**Cause:** Domain not verified or emails going to spam  
**Solution:** 
1. Verify domain in Mandrill
2. Add SPF/DKIM DNS records
3. Check spam folder

### Issue: 500 Internal Server Error
**Cause:** Backend code is crashing before reaching email logic  
**Solution:** Check server logs for runtime errors

## Environment Variables Required

```
MANDRILL_API_KEY=md-xxxxxxxxxxxxxxxxxx
# OR
MAILCHIMP_API_KEY=md-xxxxxxxxxxxxxxxxxx
```

The system will check both variables and use whichever is available.

## Testing Checklist

- [ ] Environment variable is set correctly
- [ ] API key starts with `md-` (Mandrill format)
- [ ] Domain is verified in Mandrill dashboard
- [ ] SPF/DKIM DNS records are configured
- [ ] Test email sends successfully
- [ ] Session summary email arrives in inbox
- [ ] Console logs show detailed error messages if failure occurs

## Support Resources

- Mandrill Dashboard: https://mandrillapp.com/
- Mandrill API Docs: https://mailchimp.com/developer/transactional/
- DNS Configuration: Check with your domain registrar
- Email Deliverability: Check Mandrill's sending reputation and domain health

---

**Last Updated:** January 27, 2026  
**Version:** fccaabc7
