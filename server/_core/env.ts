export const ENV = {
  // App identification
  appId: process.env.VITE_APP_ID ?? "deepbrief-academy",
  
  // Session/Cookie secrets
  cookieSecret: process.env.JWT_SECRET ?? process.env.SESSION_SECRET ?? "",
  
  // Database
  databaseUrl: process.env.DATABASE_URL ?? "",
  
  // Legacy Manus OAuth (not used in Railway deployment)
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  
  // Production flag
  isProduction: process.env.NODE_ENV === "production",
  
  // LLM - Anthropic Claude (primary)
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  
  // LLM - OpenAI (fallback)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o",
  
  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripePriceId: process.env.STRIPE_PRICE_ID ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  appUrl: process.env.APP_URL ?? process.env.VITE_APP_URL ?? "http://localhost:3000",
  
  // Admin configuration - user with this email gets admin role
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  
  // Email (Mandrill/Mailchimp)
  mandrillApiKey: process.env.MANDRILL_API_KEY ?? "",
  mailchimpApiKey: process.env.MAILCHIMP_API_KEY ?? "",
  mailchimpAudienceId: process.env.MAILCHIMP_AUDIENCE_ID ?? "",
};
