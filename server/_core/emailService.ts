// @ts-nocheck
// Email service using Mailchimp Transactional (Mandrill) API
// See EMAIL_TROUBLESHOOTING.md in project root for debugging guide
import { ENV } from "./env";
import type { User } from "../../drizzle/schema";
import mailchimpClient from "@mailchimp/mailchimp_transactional";

// Initialize Mandrill client
// NOTE: @mailchimp/mailchimp_transactional uses Mandrill API keys, NOT Mailchimp Marketing API keys
// Mandrill keys typically start with a different prefix than Marketing keys
const MANDRILL_API_KEY = process.env.MANDRILL_API_KEY || process.env.MAILCHIMP_API_KEY;

if (!MANDRILL_API_KEY) {
  console.error("[Email] ⚠️ WARNING: No MANDRILL_API_KEY or MAILCHIMP_API_KEY found in environment!");
}

// @ts-ignore - Mailchimp types not available
const mailchimp = mailchimpClient(MANDRILL_API_KEY);

/**
 * Test the Mandrill API connection
 * Returns details about the API key and account
 */
export async function testMandrillConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  if (!MANDRILL_API_KEY) {
    return {
      success: false,
      message: "No MANDRILL_API_KEY or MAILCHIMP_API_KEY configured"
    };
  }
  
  try {
    // Ping the Mandrill API to verify the key works
    const response = await mailchimp.users.ping();
    console.log("[Email] Mandrill ping response:", response);
    
    if (response === "PONG!") {
      // Get more info about the account
      const info = await mailchimp.users.info();
      return {
        success: true,
        message: "Mandrill API connection successful",
        details: {
          username: info.username,
          reputation: info.reputation,
          hourlyQuota: info.hourly_quota,
          backlog: info.backlog
        }
      };
    } else {
      return {
        success: false,
        message: `Unexpected ping response: ${response}`
      };
    }
  } catch (error: any) {
    console.error("[Email] Mandrill ping failed:", error);
    return {
      success: false,
      message: error?.message || "Failed to connect to Mandrill API",
      details: {
        error: error?.response?.data || error?.message
      }
    };
  }
}

/**
 * Send a generic transactional email using Mailchimp Transactional (Mandrill) API
 * 
 * IMPORTANT: This uses the Mandrill Transactional API, which requires:
 * 1. A Mandrill account (separate from Mailchimp Marketing)
 * 2. A Mandrill API key (set as MANDRILL_API_KEY or MAILCHIMP_API_KEY)
 * 3. A verified sending domain
 */
export async function sendTransactionalEmail(
  toEmail: string,
  toName: string,
  subject: string,
  htmlContent: string,
  textContent?: string
): Promise<boolean> {
  // Pre-flight checks
  if (!MANDRILL_API_KEY) {
    console.error("[Email] ❌ Cannot send email: No API key configured");
    console.error("[Email] Set MANDRILL_API_KEY or MAILCHIMP_API_KEY in your environment");
    return false;
  }
  
  try {
    console.log(`[Email] Sending transactional email to ${toEmail} with subject: ${subject}`);
    console.log(`[Email] API key present: ${!!MANDRILL_API_KEY} (starts with: ${MANDRILL_API_KEY?.substring(0, 4)}...)`);
    
    const message = {
      from_email: "patrick@thedeepbrief.co.uk",
      from_name: "Patrick Voorma",
      subject,
      to: [
        {
          email: toEmail,
          name: toName,
          type: "to" as const,
        },
      ],
      html: htmlContent,
      text: textContent,
    };

    const response = await mailchimp.messages.send({ message });
    console.log(`[Email] Transactional email sent to ${toEmail} - Full Response:`, JSON.stringify(response, null, 2));
    
    if (!response || response.length === 0) {
      console.error('[Email] Empty response from Mandrill API - this usually means the API key is invalid');
      return false;
    }
    
    const status = response[0]?.status;
    const rejectReason = response[0]?.reject_reason;
    const _id = response[0]?._id;
    
    console.log(`[Email] Response details - Status: ${status}, Reject Reason: ${rejectReason || 'none'}, ID: ${_id}`);
    
    if (status === 'rejected') {
      console.error(`[Email] ❌ Email REJECTED by Mandrill. Reason: ${rejectReason}`);
      console.error(`[Email] Common rejection reasons:`);
      console.error(`  - "invalid-sender": From email domain not verified in Mandrill`);
      console.error(`  - "soft-bounce": Temporary delivery issue`);
      console.error(`  - "hard-bounce": Email address doesn't exist`);
      console.error(`  - "spam": Email flagged as spam`);
      return false;
    }
    
    if (status === 'invalid') {
      console.error(`[Email] ❌ Email INVALID. The recipient email may be malformed.`);
      return false;
    }
    
    if (status === "sent" || status === "queued") {
      console.log(`[Email] ✅ Email ${status} successfully to ${toEmail}`);
      return true;
    }
    
    console.warn(`[Email] ⚠️ Unexpected status: ${status}`);
    return false;
  } catch (error: any) {
    console.error(`[Email] ❌ EXCEPTION sending email to ${toEmail}`);
    
    // Check for common Mandrill API errors
    if (error?.response?.status === 401) {
      console.error(`[Email] 401 Unauthorized - Invalid Mandrill API key`);
      console.error(`[Email] Make sure you're using a MANDRILL API key, not a Mailchimp Marketing API key`);
    } else if (error?.response?.status === 500) {
      console.error(`[Email] 500 Server Error - Mandrill may be experiencing issues`);
    } else if (error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
      console.error(`[Email] Network error - Cannot reach Mandrill API`);
    } else {
      console.error(`[Email] Error details:`, error?.message || error);
    }
    
    return false;
  }
}

export async function sendWelcomeEmail(user: User): Promise<boolean> {
  try {
    const message = {
      from_email: "patrick@thedeepbrief.co.uk",
      from_name: "Patrick Voorma",
      subject: "You're In",
      to: [
        {
          email: user.email,
          name: user.name,
          type: "to" as const,
        },
      ],
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f3ee; color: #2d3436;">
            <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              
              <!-- Header -->
              <div style="background-color: #2c3e50; padding: 32px 40px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                  You're In
                </h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px;">
                
                <!-- Opening - Grounded -->
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px; color: #2d3436;">
                  ${user.name?.split(' ')[0] || 'There'},
                </p>
                
                <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px; color: #2d3436;">
                  If you're here, something in your thinking has started to feel heavier than it used to.
                </p>
                
                ${false ? `
                <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 16px; margin: 0 0 24px; border-radius: 4px;">
                  <p style="margin: 0; font-size: 15px; color: #2e7d32; font-weight: 600;">
                    Your 3-day trial is active.
                  </p>
                  <p style="margin: 8px 0 0; font-size: 14px; color: #388e3c; line-height: 1.5;">
                    Full access to all coaching features. If this doesn't help you think more clearly under pressure, cancel before ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} and you won't be charged.
                  </p>
                </div>
                ` : ''}
                
                <!-- What This Is -->
                <h2 style="font-size: 20px; font-weight: 600; margin: 30px 0 16px; color: #4a5d3f;">
                  What This Is
                </h2>
                
                <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #636e72;">
                  This isn't ChatGPT with a prompt. It's trained from real pressure situations—the kind where getting it wrong meant people died. As an Army Captain during civil unrest. As a technical diver at 70 metres where a bad decision doesn't give you a second chance.
                </p>
                
                <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #636e72;">
                  I've seen the same distortion at depth and in boardrooms. Different environments. Same physics.
                </p>
                
                <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #636e72;">
                  This system is built to locate where pressure is distorting your judgement before anything looks broken on the outside.
                </p>
                
                <!-- What You Get -->
                <h2 style="font-size: 20px; font-weight: 600; margin: 30px 0 16px; color: #4a5d3f;">
                  What You Get
                </h2>
                
                <ul style="margin: 0 0 20px; padding-left: 20px; color: #636e72; line-height: 1.8;">
                  <li style="margin-bottom: 10px;"><strong style="color: #2d3436;">Unlimited coaching conversations</strong> powered by Claude Sonnet 4</li>
                  <li style="margin-bottom: 10px;"><strong style="color: #2d3436;">C.A.L.M. Protocol</strong> for tactical pressure management</li>
                  <li style="margin-bottom: 10px;"><strong style="color: #2d3436;">Commitment tracking</strong> that actually holds you accountable</li>
                  <li style="margin-bottom: 10px;"><strong style="color: #2d3436;">15 scenario templates</strong> for common high-stakes situations</li>
                  <li style="margin-bottom: 10px;"><strong style="color: #2d3436;">Quick Coaching mode</strong> for urgent pre-meeting moments</li>
                </ul>
                
                <!-- Privacy & Data -->
                <h2 style="font-size: 20px; font-weight: 600; margin: 30px 0 16px; color: #4a5d3f;">
                  Your Data
                </h2>
                
                <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 16px; margin: 20px 0; border-radius: 4px;">
                  <ul style="margin: 0; padding-left: 20px; color: #2d3436; line-height: 1.8;">
                    <li style="margin-bottom: 10px;"><strong style="color: #2e7d32;">Complete confidentiality:</strong> No one can see your sessions. Not me. Not anyone.</li>
                    <li style="margin-bottom: 10px;"><strong style="color: #2e7d32;">Encrypted at rest and in transit:</strong> Industry-standard encryption. Your conversations stay yours.</li>
                    <li style="margin-bottom: 10px;"><strong style="color: #2e7d32;">You control it:</strong> Delete your account and all data at any time from settings. No questions asked.</li>
                    <li style="margin-bottom: 10px;"><strong style="color: #2e7d32;">Never shared:</strong> Your data never leaves our secure infrastructure and is never used to train other models or shared with third parties.</li>
                  </ul>
                </div>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0 30px;">
                  <a href="${process.env.VITE_APP_URL}/ai-coach/dashboard" style="display: inline-block; background-color: #4a5d3f; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Start Session
                  </a>
                </div>
                
                <!-- Footer -->
                <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e6e2d6; text-align: center;">
                  <p style="font-size: 13px; color: #95a5a6; margin: 0 0 8px;">
                    Patrick Voorma<br/>
                    Former Army Captain, PADI Territory Director (52 countries)<br/>
                    Founder, The Deep Brief
                  </p>
                  <p style="font-size: 12px; color: #95a5a6; margin: 16px 0 0;">
                    <a href="${process.env.VITE_APP_URL}/ai-coach/dashboard" style="color: #4a5d3f; text-decoration: none;">Dashboard</a> · 
                    <a href="${process.env.VITE_APP_URL}" style="color: #4a5d3f; text-decoration: none;">The Deep Brief</a>
                  </p>
                </div>
                
              </div>
            </div>
          </body>
        </html>
      `,
    };

    const response = await mailchimp.messages.send({ message });
    console.log("[Email] Welcome email sent to", user.email, "- Response:", response[0]?.status);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send welcome email:", error);
    return false;
  }
}
