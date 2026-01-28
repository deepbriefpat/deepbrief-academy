import type { Request, Response } from "express";
import { getDb } from "../db";
import { coachingSubscriptions, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sendWelcomeEmail } from "./emailService";
import Stripe from "stripe";

// Track processed events to prevent duplicate handling
const processedEvents = new Set<string>();
const MAX_PROCESSED_EVENTS = 10000; // Prevent memory leak

function cleanupProcessedEvents() {
  if (processedEvents.size > MAX_PROCESSED_EVENTS) {
    // Clear oldest half
    const entries = Array.from(processedEvents);
    entries.slice(0, MAX_PROCESSED_EVENTS / 2).forEach(e => processedEvents.delete(e));
  }
}

/**
 * Stripe webhook handler for subscription events
 * Handles: checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted
 * 
 * SECURITY: Verifies webhook signature to ensure requests come from Stripe
 * IDEMPOTENCY: Tracks processed event IDs to prevent duplicate handling
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  // Verify webhook signature if secret is configured
  if (webhookSecret) {
    const sig = req.headers['stripe-signature'] as string;
    if (!sig) {
      console.error("[Stripe Webhook] Missing signature header");
      return res.status(400).json({ error: "Missing signature" });
    }
    
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-12-15.clover' });
      // req.body must be raw buffer for signature verification
      // This is handled by express.raw() middleware in the webhook route
      stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("[Stripe Webhook] Signature verification failed:", err);
      return res.status(400).json({ error: "Invalid signature" });
    }
  } else {
    console.warn("[Stripe Webhook] No webhook secret configured - skipping signature verification");
  }

  try {
    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    // Idempotency check - prevent duplicate event processing
    if (processedEvents.has(event.id)) {
      console.log(`[Stripe Webhook] Skipping duplicate event: ${event.id}`);
      return res.json({ received: true, duplicate: true });
    }
    
    // Mark event as processed BEFORE handling to prevent race conditions
    processedEvents.add(event.id);
    cleanupProcessedEvents();

    // Log the event for debugging
    console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

    const db = await getDb();
    if (!db) {
      console.error("[Stripe Webhook] Database not available");
      processedEvents.delete(event.id); // Allow retry
      return res.status(500).json({ error: "Database not available" });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        // Payment successful - create subscription record
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const userId = session.client_reference_id; // We'll pass user ID in checkout

        if (!userId) {
          console.error("[Stripe Webhook] No user ID in checkout session");
          break;
        }

        // Create or update subscription
        const existing = await db
          .select()
          .from(coachingSubscriptions)
          .where(eq(coachingSubscriptions.userId, parseInt(userId)))
          .limit(1);

        if (existing.length > 0) {
          // Update existing
          await db
            .update(coachingSubscriptions)
            .set({
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              status: "trialing", // 3-day trial starts
              updatedAt: new Date(),
            })
            .where(eq(coachingSubscriptions.userId, parseInt(userId)));
        } else {
          // Create new
          await db.insert(coachingSubscriptions).values({
            userId: parseInt(userId),
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            status: "trialing",
          });
        }

        console.log(`[Stripe Webhook] Subscription created for user ${userId}`);
        
        // Send welcome email
        try {
          const userRecord = await db
            .select()
            .from(users)
            .where(eq(users.id, parseInt(userId)))
            .limit(1);
          
          if (userRecord.length > 0) {
            const user = userRecord[0];
            await sendWelcomeEmail(user);
            console.log(`[Stripe Webhook] Welcome email sent to ${user.email}`);
          }
        } catch (emailError) {
          console.error(`[Stripe Webhook] Failed to send welcome email:`, emailError);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        // Subscription status changed
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const subscriptionId = subscription.id;
        const status = subscription.status; // trialing, active, canceled, past_due, etc.
        const currentPeriodStart = new Date(subscription.current_period_start * 1000);
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        const cancelAtPeriodEnd = subscription.cancel_at_period_end;

        // Find subscription by Stripe subscription ID
        const existing = await db
          .select()
          .from(coachingSubscriptions)
          .where(eq(coachingSubscriptions.stripeSubscriptionId, subscriptionId))
          .limit(1);

        if (existing.length > 0) {
          // Map Stripe status to our enum
          let mappedStatus: "active" | "canceled" | "past_due" | "trialing" | "incomplete" = "active";
          if (["active", "trialing"].includes(status)) {
            mappedStatus = status as "active" | "trialing";
          } else if (status === "canceled" || status === "unpaid") {
            mappedStatus = "canceled";
          } else if (status === "past_due") {
            mappedStatus = "past_due";
          } else if (status === "incomplete" || status === "incomplete_expired") {
            mappedStatus = "incomplete";
          }

          await db
            .update(coachingSubscriptions)
            .set({
              status: mappedStatus,
              currentPeriodStart,
              currentPeriodEnd,
              cancelAtPeriodEnd,
              updatedAt: new Date(),
            })
            .where(eq(coachingSubscriptions.id, existing[0].id));

          console.log(`[Stripe Webhook] Subscription ${subscriptionId} updated to ${mappedStatus}`);
        } else {
          console.warn(`[Stripe Webhook] Subscription ${subscriptionId} not found in database`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        // Subscription canceled/ended
        const subscription = event.data.object;
        const subscriptionId = subscription.id;

        await db
          .update(coachingSubscriptions)
          .set({
            status: "canceled",
            updatedAt: new Date(),
          })
          .where(eq(coachingSubscriptions.stripeSubscriptionId, subscriptionId));

        console.log(`[Stripe Webhook] Subscription ${subscriptionId} canceled`);
        break;
      }

      case "invoice.payment_failed": {
        // Payment failed - mark subscription as past_due
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        if (subscriptionId) {
          await db
            .update(coachingSubscriptions)
            .set({
              status: "past_due",
              updatedAt: new Date(),
            })
            .where(eq(coachingSubscriptions.stripeSubscriptionId, subscriptionId as string));
          
          console.log(`[Stripe Webhook] Payment failed for subscription ${subscriptionId}`);
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true, processed: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}
