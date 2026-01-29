# DeepBrief Academy - Complete Build

A world-class executive coaching platform with AI-powered coaching, 24 coaches, 50+ tactical templates, and comprehensive admin dashboard.

## Features

- **24 AI Coaches** - Male, female, and non-binary coaches with different specialties
- **50+ Tactical Templates** - Real-world leadership scenarios
- **AI Executive Coaching** - Powered by GPT-4o with C.A.L.M. Protocol
- **Pressure Audit Assessment** - 25 questions across 5 dimensions
- **Commitment Tracking** - Automatic extraction from conversations
- **Session History** - Full transcript and summary storage
- **Guest Pass System** - Trial access for prospects
- **Stripe Subscriptions** - Monthly recurring billing
- **Admin Dashboard** - Analytics, user management, content control

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Radix UI
- **Backend**: Express, tRPC, Drizzle ORM
- **Database**: MySQL
- **AI**: OpenAI GPT-4o
- **Auth**: Google OAuth 2.0
- **Payments**: Stripe

## Environment Variables

```
# Database
DATABASE_URL=mysql://user:pass@host:3306/dbname

# Authentication
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_random_secret_string
JWT_SECRET=your_jwt_secret

# Application
APP_URL=https://your-domain.com
NODE_ENV=production
ADMIN_EMAIL=admin@example.com

# AI
OPENAI_API_KEY=sk-your-openai-key

# Payments
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PRICE_ID=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
MANDRILL_API_KEY=your_mandrill_key
MAILCHIMP_API_KEY=your_mailchimp_key
MAILCHIMP_AUDIENCE_ID=your_audience_id

# Frontend (prefix with VITE_)
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Deployment (Railway)

1. Connect this repo to Railway
2. Add MySQL database service
3. Set all environment variables
4. Deploy

Build command: `npm run build`
Start command: `npm start`

## Local Development

```bash
npm install
npm run dev
```

## Database

Push schema to database:
```bash
npm run db:push
```

## Pages Included

### Public Pages (12)
- Home, About, Contact, Resources, Stories
- Assessment, Assessment Results
- AI Coach Landing, AI Coach Demo
- Clarity Program, Book Call
- Privacy Policy, Terms of Service

### AI Coach Pages (9)
- Dashboard, Templates, Session History
- Onboarding, Welcome, Subscribe
- Guest Access, Resume Session
- Progress Dashboard

### Admin Pages (10)
- Admin Dashboard, Analytics
- AI Coach Management, Users
- Resources, Email Analytics
- Guest Passes, Commitments
- Pressure Profiles, Onboarding Analytics

## Coach Avatars

24 professional headshots in `/client/public/avatars/`:
- 8 female coaches
- 8 male coaches  
- 8 non-binary coaches
