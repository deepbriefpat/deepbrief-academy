# Stripe Webhook Configuration Guide

This guide explains how to configure Stripe webhooks to enable automatic subscription management for the AI Executive Coach feature.

## Overview

The AI Coach uses Stripe for subscription payments (£19.95/month with 3-day free trial). Webhooks automatically update subscription status in your database when payment events occur.

## Webhook Endpoint

Your webhook endpoint is already implemented at:

```
https://your-domain.com/api/stripe/webhook
```

**Important:** Replace `your-domain.com` with your actual deployed domain.

## Required Stripe Configuration

### Step 1: Access Stripe Dashboard

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **Webhooks**
3. Click **Add endpoint**

### Step 2: Configure Webhook Endpoint

1. **Endpoint URL:** Enter your webhook URL
   ```
   https://your-domain.com/api/stripe/webhook
   ```

2. **Description:** (Optional) Add a description
   ```
   AI Coach Subscription Management
   ```

3. **Events to send:** Select the following events:

#### Required Events

- `checkout.session.completed` - Triggered when payment succeeds
  - Creates initial subscription record in database
  - Links subscription to user account
  
- `customer.subscription.created` - Triggered when subscription is created
  - Confirms subscription creation
  - Sets initial status (usually "trialing" for 3-day trial)
  
- `customer.subscription.updated` - Triggered when subscription changes
  - Updates subscription status (trialing → active)
  - Handles trial end and first payment
  - Updates payment method changes
  
- `customer.subscription.deleted` - Triggered when subscription is canceled
  - Marks subscription as canceled in database
  - Blocks dashboard access for canceled users

### Step 3: Save Webhook Secret

After creating the webhook, Stripe will provide a **Signing Secret** (starts with `whsec_`).

1. Copy the signing secret
2. Add it to your environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

**Security Note:** Never commit this secret to version control. Use environment variables or secrets management.

### Step 4: Test Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. Click **Send test webhook**
4. Select an event type (e.g., `customer.subscription.updated`)
5. Click **Send test webhook**
6. Verify the webhook receives a `200 OK` response

## Webhook Implementation Details

The webhook handler is located at `server/_core/stripeWebhook.ts` and handles:

### Event: `checkout.session.completed`

```typescript
// Creates subscription record after successful payment
{
  userId: session.client_reference_id,
  stripeCustomerId: session.customer,
  stripeSubscriptionId: session.subscription,
  status: "trialing",
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
  trialEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
}
```

### Event: `customer.subscription.updated`

```typescript
// Updates subscription status (trial → active, payment changes)
{
  status: subscription.status, // "trialing", "active", "past_due", etc.
  currentPeriodStart: new Date(subscription.current_period_start * 1000),
  currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  cancelAtPeriodEnd: subscription.cancel_at_period_end
}
```

### Event: `customer.subscription.deleted`

```typescript
// Marks subscription as canceled
{
  status: "canceled",
  canceledAt: new Date()
}
```

## Subscription Flow

### New Subscriber Journey

1. User clicks "Start 3-Day Free Trial" → Redirected to Stripe Checkout
2. User completes payment → `checkout.session.completed` webhook fired
3. Subscription created → `customer.subscription.created` webhook fired
4. User redirected to `/ai-coach/welcome` → Can access dashboard immediately
5. Trial active for 3 days → Status: "trialing"
6. After 3 days → First payment processed → `customer.subscription.updated` webhook fired
7. Status changes to "active" → User continues with full access

### Cancellation Journey

1. User cancels subscription in Stripe portal
2. `customer.subscription.deleted` webhook fired
3. Subscription status set to "canceled"
4. Dashboard access blocked → User redirected to landing page

## Testing in Development

### Using Stripe CLI

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger customer.subscription.updated
   stripe trigger customer.subscription.deleted
   ```

### Manual Testing

1. Use Stripe test mode (test API keys)
2. Create test subscription with test card: `4242 4242 4242 4242`
3. Monitor webhook delivery in Stripe Dashboard
4. Check database for subscription records

## Troubleshooting

### Webhook Not Receiving Events

- Verify endpoint URL is correct and publicly accessible
- Check webhook signing secret matches environment variable
- Review Stripe Dashboard → Webhooks → Event logs for errors
- Ensure server is running and `/api/stripe/webhook` route is accessible

### Subscription Not Updating

- Check database connection
- Verify `stripeSubscriptionId` matches between Stripe and database
- Review server logs for errors in webhook handler
- Confirm all required events are selected in Stripe webhook configuration

### 401 Unauthorized Errors

- Webhook signing secret may be incorrect
- Verify `STRIPE_WEBHOOK_SECRET` environment variable is set correctly
- Check that webhook handler is validating signature properly

## Security Best Practices

1. **Always verify webhook signatures** - Prevents unauthorized requests
2. **Use HTTPS in production** - Stripe requires HTTPS for webhook endpoints
3. **Store secrets securely** - Use environment variables, never hardcode
4. **Log webhook events** - Monitor for suspicious activity
5. **Handle idempotency** - Webhooks may be sent multiple times, ensure handlers are idempotent

## Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)

## Support

For issues with Stripe webhook configuration, contact:
- Stripe Support: https://support.stripe.com
- Project maintainer: [Your contact information]
