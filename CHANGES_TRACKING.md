# DeepBrief Academy - Changes Tracking Document

## Repository Location
- Working directory: `/home/claude/deepbrief-academy-main/`
- GitHub repo: `deepbriefpat/deepbrief-academy`
- Production URL: `https://deepbrief-academy-production-ef5e.up.railway.app`

## Files Modified (Session Date: January 30, 2026)

### Client-Side Files

| File Path | Status | Changes |
|-----------|--------|---------|
| `client/src/pages/AICoachDashboard.tsx` | ✅ MODIFIED | Fixed session resume crash, added null checks for messages array |
| `client/src/components/CoachingAnalytics.tsx` | ✅ MODIFIED | Made stats cards responsive, shortened labels |
| `client/src/components/ai-coach/CoachComparison.tsx` | ✅ MODIFIED | Fixed coach card layout, made grid 4 columns |
| `client/src/components/ai-coach/FocusGoals.tsx` | ✅ MODIFIED | Fixed Other Goals display, added title/description visibility |
| `client/src/pages/Assessment.tsx` | ✅ MODIFIED | Added fresh start URL param, improved saved progress handling |
| `client/src/pages/LeadershipPressureProfile.tsx` | ✅ MODIFIED | Added demo/coaching CTAs after profile completion |
| `client/src/pages/ClarityProgram.tsx` | ✅ MODIFIED | Made pricing professional, added AI coaching section |
| `client/src/components/DemoIntro.tsx` | ✅ NEW FILE | Introduction page for demo (not yet integrated) |

### Server-Side Files

| File Path | Status | Changes |
|-----------|--------|---------|
| `server/routers.ts` | ✅ MODIFIED | Fixed profile picture upload (base64), added coach personalities to sendMessage |
| `server/_core/voiceTranscription.ts` | ✅ MODIFIED | Changed from Forge to direct OpenAI Whisper API |

## Summary of Bug Fixes

### Critical Fixes
1. **Session Resume Crash** - Fixed null pointer when messages array is undefined
2. **Profile Picture Upload** - Changed from Forge storage to base64 data URL
3. **Voice Transcription** - Changed from Forge API to direct OpenAI Whisper API
4. **Coach Personalities** - Now sends selected coach personality to LLM

### UI/UX Fixes
1. **Analytics Cards** - Now responsive on mobile (2 columns) and desktop (6 columns)
2. **Coach Comparison** - Cards display properly in 4-column grid
3. **Other Goals** - Title, description and time remaining now visible
4. **Assessment** - Can start fresh with `?fresh=true` URL param
5. **Pressure Profile CTAs** - Added buttons for demo, coaching, and booking call
6. **Clarity Program** - Professional pricing layout, added AI coaching option

## Environment Variables Required

```
ANTHROPIC_API_KEY=xxx          # For Claude LLM (main coaching)
OPENAI_API_KEY=xxx             # For voice transcription (Whisper)
DATABASE_URL=xxx               # MySQL connection
GOOGLE_CLIENT_ID=xxx           # Google OAuth
GOOGLE_CLIENT_SECRET=xxx       # Google OAuth
STRIPE_SECRET_KEY=xxx          # Payments
STRIPE_PRICE_ID=xxx            # Subscription price
APP_URL=xxx                    # Production URL
```

## How to Deploy

1. Download the ZIP from outputs
2. Extract and push to GitHub (replace entire repo contents)
3. Railway will auto-deploy from main branch

## Known Issues / Future Work

1. **Demo Dashboard** - Could be enhanced to mirror full dashboard experience
2. **Mobile Testing** - Full responsive testing recommended
3. **Calendar Button** - Working but may need z-index adjustment in some contexts
4. **Commitments Auto-Extract** - Working via AI but may miss some edge cases

## File Locations Quick Reference

```
/home/claude/deepbrief-academy-main/
├── client/src/
│   ├── pages/
│   │   ├── AICoachDashboard.tsx    # Main coaching dashboard
│   │   ├── AICoachDemo.tsx         # Free demo page
│   │   ├── Assessment.tsx          # Pressure Audit
│   │   ├── LeadershipPressureProfile.tsx  # Profile results
│   │   └── ClarityProgram.tsx      # Sales page
│   └── components/
│       ├── CoachingAnalytics.tsx   # Stats cards
│       ├── DemoIntro.tsx           # Demo intro (NEW)
│       └── ai-coach/
│           ├── CoachComparison.tsx # Coach comparison modal
│           └── FocusGoals.tsx      # Goals display
├── server/
│   ├── routers.ts                  # Main API routes
│   ├── coachPersonalities.ts       # 24 coach definitions
│   └── _core/
│       └── voiceTranscription.ts   # Voice to text
└── CHANGES_TRACKING.md             # This file
```
