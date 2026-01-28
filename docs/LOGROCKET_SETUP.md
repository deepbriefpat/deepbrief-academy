# LogRocket Session Replay Setup

LogRocket provides session replay and analytics to help identify conversion drop-off points and optimize user experience.

## Why LogRocket?

- **Session Replay**: Watch recordings of user sessions to see exactly where they struggle
- **Conversion Funnels**: Track demo → subscription conversion with visual funnels
- **Error Tracking**: Automatically capture JavaScript errors with full context
- **Performance Monitoring**: Identify slow pages and API calls
- **Privacy Controls**: Built-in input sanitization and network request filtering

## Setup Instructions

### 1. Create LogRocket Account

1. Go to [https://logrocket.com](https://logrocket.com)
2. Sign up for a free account (14-day trial, then $99/month for 10,000 sessions)
3. Create a new application called "The Deep Brief"
4. Copy your App ID (format: `abc123/your-app-name`)

### 2. Enable LogRocket in Your Site

1. Open `client/index.html`
2. Find the LogRocket comment block (around line 31)
3. Uncomment the script block
4. Replace `YOUR_APP_ID` with your actual LogRocket App ID
5. Save and deploy

### 3. Identify Users (Optional but Recommended)

To track authenticated users, add this code after successful login:

```typescript
// In client/src/contexts/AuthContext.tsx or similar
if (window.LogRocket && user) {
  window.LogRocket.identify(user.id.toString(), {
    name: user.name,
    email: user.email,
    // Add other relevant user properties
  });
}
```

### 4. Track Custom Events

Track key conversion events:

```typescript
// Demo started
if (window.LogRocket) {
  window.LogRocket.track('Demo Started');
}

// Demo completed
if (window.LogRocket) {
  window.LogRocket.track('Demo Completed');
}

// Subscription started
if (window.LogRocket) {
  window.LogRocket.track('Subscription Started');
}
```

## Privacy & Data Sanitization

The default configuration in `index.html` includes:

- **Input Sanitization**: Automatically redacts sensitive input fields (passwords, credit cards)
- **Network Request Sanitization**: Removes Authorization headers from recorded network requests
- **Console Error Aggregation**: Groups similar errors to reduce noise

### Additional Privacy Controls

To exclude specific elements from recording:

```html
<!-- Add class to any element you want to hide from recordings -->
<div class="lr-hide">Sensitive content here</div>
```

To block specific network requests:

```javascript
window.LogRocket.init('YOUR_APP_ID', {
  network: {
    isEnabled: (request) => {
      // Block requests to sensitive endpoints
      return !request.url.includes('/api/sensitive');
    },
  },
});
```

## What to Monitor

### Key Metrics

1. **Demo Conversion Rate**: % of visitors who start demo → complete 10 interactions
2. **Subscription Conversion Rate**: % of demo completers who subscribe
3. **Drop-off Points**: Where users abandon the demo or subscription flow
4. **Error Rate**: JavaScript errors that impact user experience
5. **Session Duration**: How long users engage with AI Coach

### Recommended Funnels

Create these funnels in LogRocket dashboard:

1. **Demo Funnel**:
   - Visit /ai-coach → Start Demo → Complete Demo → Subscribe

2. **Assessment Funnel**:
   - Visit /assessment → Start Assessment → Complete Assessment → View Results → Try AI Coach

3. **Subscription Funnel**:
   - View Pricing → Click Subscribe → Complete Payment → Access Dashboard

## Cost Optimization

- **Free Tier**: 1,000 sessions/month (good for early testing)
- **Starter Plan**: $99/month for 10,000 sessions
- **Growth Plan**: $249/month for 50,000 sessions

### Tips to Stay Within Limits

1. **Sampling**: Record only 50% of sessions initially
2. **Conditional Recording**: Only record demo and subscription flows
3. **User-Based Recording**: Record all authenticated users, sample anonymous visitors

```javascript
// Example: 50% sampling for anonymous users
const shouldRecord = user || Math.random() < 0.5;
if (shouldRecord && window.LogRocket) {
  window.LogRocket.init('YOUR_APP_ID', { /* config */ });
}
```

## Alternative Tools

If LogRocket doesn't fit your needs:

- **FullStory**: Similar features, different pricing model
- **Hotjar**: Cheaper, but less developer-focused (no error tracking)
- **Clarity (Microsoft)**: Free, but limited features and slower
- **PostHog**: Open-source, self-hosted option

## Support

- LogRocket Docs: https://docs.logrocket.com
- Support: support@logrocket.com
- Community: https://community.logrocket.com
