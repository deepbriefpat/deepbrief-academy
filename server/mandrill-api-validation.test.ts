import { describe, it, expect } from "vitest";
import { testMandrillConnection, sendTransactionalEmail } from "./_core/emailService";

describe("Mandrill API Integration Validation", () => {
  it("should successfully connect to Mandrill API with provided key", async () => {
    console.log("\n🔑 Testing Mandrill API connection...");
    
    const result = await testMandrillConnection();
    
    console.log("Connection result:", JSON.stringify(result, null, 2));
    
    expect(result.success).toBe(true);
    expect(result.message).toContain("successful");
    expect(result.details).toBeDefined();
    
    if (result.details) {
      console.log("✅ Mandrill account details:");
      console.log(`   Username: ${result.details.username}`);
      console.log(`   Reputation: ${result.details.reputation}`);
      console.log(`   Hourly Quota: ${result.details.hourlyQuota}`);
    }
  }, 15000);

  it("should send a test email using Mandrill API", async () => {
    console.log("\n📧 Sending test email via Mandrill...");
    
    const testEmail = "patrick.voorma@thedeepbrief.co.uk";
    const subject = "Mandrill API Test - The Deep Brief";
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;">
            <h1 style="color: #2c3e50;">Mandrill API Test Successful</h1>
            <p style="font-size: 16px; color: #555;">
              This email confirms that your Mandrill API integration is working correctly.
            </p>
            <p style="font-size: 14px; color: #777; margin-top: 20px;">
              API Key: md-b-kcwDtvVN_bGopC6ldjgA<br/>
              From: patrick@thedeepbrief.co.uk<br/>
              Test Date: ${new Date().toLocaleString()}
            </p>
            <div style="margin-top: 30px; padding: 15px; background-color: #e8f5e9; border-left: 4px solid #4caf50;">
              <strong>✅ All email functionality is now active:</strong>
              <ul style="margin: 10px 0 0 0;">
                <li>Guest pass invitations</li>
                <li>Session summaries</li>
                <li>Commitment reminders</li>
                <li>Weekly digest emails</li>
              </ul>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const textContent = "Mandrill API Test Successful. This email confirms that your Mandrill API integration is working correctly.";
    
    const result = await sendTransactionalEmail(
      testEmail,
      "Patrick Voorma",
      subject,
      htmlContent,
      textContent
    );
    
    console.log(`Email send result: ${result ? "✅ SUCCESS" : "❌ FAILED"}`);
    
    expect(result).toBe(true);
  }, 20000);
});
