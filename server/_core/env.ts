export const ENV = {
  // Database
  databaseUrl: process.env.DATABASE_URL ?? "",
  
  // Authentication
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  sessionSecret: process.env.SESSION_SECRET ?? process.env.JWT_SECRET ?? "",
  
  // Application
  appUrl: process.env.APP_URL ?? "http://localhost:5000",
  isProduction: process.env.NODE_ENV === "production",
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  
  // AI
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  
  // Payments
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripePriceId: process.env.STRIPE_PRICE_ID ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  
  // Email
  mandrillApiKey: process.env.MANDRILL_API_KEY ?? "",
  mailchimpApiKey: process.env.MAILCHIMP_API_KEY ?? "",
  mailchimpAudienceId: process.env.MAILCHIMP_AUDIENCE_ID ?? "",
};
