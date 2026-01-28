// @ts-ignore - No type definitions available for @mailchimp/mailchimp_marketing
import mailchimp from "@mailchimp/mailchimp_marketing";

// Mailchimp credentials from environment
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY || "";
const MAILCHIMP_SERVER_PREFIX = MAILCHIMP_API_KEY.split("-")[1] || "us6";
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID || "96b6737e0c";

// Configure Mailchimp client
mailchimp.setConfig({
  apiKey: MAILCHIMP_API_KEY,
  server: MAILCHIMP_SERVER_PREFIX,
});

/**
 * Add or update a subscriber in Mailchimp
 * @param email - Subscriber email address
 * @param source - Source of subscription (e.g., "assessment_results", "booking_confirmation")
 * @param mergeFields - Additional subscriber data
 */
export async function addSubscriberToMailchimp(
  email: string,
  source: string,
  mergeFields?: Record<string, string>
) {
  try {
    const response = await mailchimp.lists.addListMember(MAILCHIMP_AUDIENCE_ID, {
      email_address: email,
      status: "subscribed",
      merge_fields: mergeFields || {},
      tags: [source],
    });
    
    return { success: true, data: response };
  } catch (error: any) {
    // If subscriber already exists, update their tags
    if (error.status === 400 && error.response?.body?.title === "Member Exists") {
      try {
        const subscriberHash = require("crypto")
          .createHash("md5")
          .update(email.toLowerCase())
          .digest("hex");
        
        await mailchimp.lists.updateListMemberTags(
          MAILCHIMP_AUDIENCE_ID,
          subscriberHash,
          {
            tags: [{ name: source, status: "active" }],
          }
        );
        
        return { success: true, data: { message: "Subscriber updated with new tag" } };
      } catch (updateError: any) {
        console.error("Mailchimp update error:", updateError);
        return { success: false, error: updateError.message };
      }
    }
    
    console.error("Mailchimp error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Test Mailchimp connection
 */
export async function testMailchimpConnection() {
  try {
    const response = await mailchimp.ping.get();
    return { success: true, data: response };
  } catch (error: any) {
    console.error("Mailchimp connection error:", error);
    return { success: false, error: error.message };
  }
}
