import { getDb } from "./db";
import { emailSequences, sentEmails, emailSubscribers } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { sendTransactionalEmail } from "./_core/emailService";

/**
 * Send an email using Mandrill Transactional API
 * This is a wrapper around the core email service for backwards compatibility
 */
export async function sendEmail(to: string, subject: string, htmlBody: string): Promise<boolean> {
  console.log(`[EmailService] Sending email via Mandrill to ${to} with subject: ${subject}`);
  
  // Extract plain text from HTML for better email client compatibility
  const textContent = htmlBody
    .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return await sendTransactionalEmail(
    to,
    to.split('@')[0], // Use email prefix as name fallback
    subject,
    htmlBody,
    textContent
  );
}

/**
 * Send an email from a sequence to a subscriber
 */
export async function sendSequenceEmail(
  subscriberId: number,
  sequenceId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.error("[EmailService] Database not available");
    return false;
  }

  try {
    // Get subscriber info
    const subscribers = await db
      .select()
      .from(emailSubscribers)
      .where(eq(emailSubscribers.id, subscriberId))
      .limit(1);

    if (subscribers.length === 0) {
      console.error(`[EmailService] Subscriber ${subscriberId} not found`);
      return false;
    }

    const subscriber = subscribers[0];

    // Get sequence info
    const sequences = await db
      .select()
      .from(emailSequences)
      .where(eq(emailSequences.id, sequenceId))
      .limit(1);

    if (sequences.length === 0) {
      console.error(`[EmailService] Sequence ${sequenceId} not found`);
      return false;
    }

    const sequence = sequences[0];

    // Check if already sent
    const alreadySent = await db
      .select()
      .from(sentEmails)
      .where(
        and(
          eq(sentEmails.subscriberId, subscriberId),
          eq(sentEmails.sequenceId, sequenceId)
        )
      )
      .limit(1);

    if (alreadySent.length > 0) {
      return true;
    }

    // Replace email placeholder in body
    const emailBody = sequence.body.replace(/{{email}}/g, subscriber.email);
    
    // Send the email
    const success = await sendEmail(subscriber.email, sequence.subject, emailBody);

    // Record the sent email
    await db.insert(sentEmails).values({
      subscriberId,
      sequenceId,
      status: success ? "sent" : "failed",
    });

    return success;
  } catch (error) {
    console.error("[EmailService] Error sending sequence email:", error);
    return false;
  }
}

/**
 * Process pending emails that should be sent based on delay
 * This should be called by a scheduled task (e.g., daily cron job)
 */
export async function processPendingEmails(): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.error("[EmailService] Database not available");
    return 0;
  }

  try {
    // Get all active sequences
    const sequences = await db
      .select()
      .from(emailSequences)
      .where(eq(emailSequences.active, 1));

    let sentCount = 0;

    for (const sequence of sequences) {
      // Find subscribers who should receive this email
      // (subscribed from the right source, haven't received this email yet, and delay period has passed)
      const subscribers = await db
        .select({
          id: emailSubscribers.id,
          email: emailSubscribers.email,
          createdAt: emailSubscribers.createdAt,
        })
        .from(emailSubscribers)
        .where(
          and(
            eq(emailSubscribers.source, sequence.triggerSource as any),
            eq(emailSubscribers.subscribed, 1),
            sql`DATE_ADD(${emailSubscribers.createdAt}, INTERVAL ${sequence.delayDays} DAY) <= NOW()`
          )
        );

      for (const subscriber of subscribers) {
        // Check if already sent
        const alreadySent = await db
          .select()
          .from(sentEmails)
          .where(
            and(
              eq(sentEmails.subscriberId, subscriber.id),
              eq(sentEmails.sequenceId, sequence.id)
            )
          )
          .limit(1);

        if (alreadySent.length === 0) {
          const success = await sendSequenceEmail(subscriber.id, sequence.id);
          if (success) {
            sentCount++;
          }
        }
      }
    }

    return sentCount;
  } catch (error) {
    console.error("[EmailService] Error processing pending emails:", error);
    return 0;
  }
}
