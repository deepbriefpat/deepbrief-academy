import { describe, it, expect } from "vitest";
import { sendTransactionalEmail } from "./_core/emailService";

describe("Email Service - Mandrill API", () => {
  it("should successfully send a test email using Mandrill API", async () => {
    // This test validates that the Mandrill API key is correct and can send emails
    const testEmail = "patrick.voorma@thedeepbrief.co.uk";
    const testName = "Test User";
    const subject = "Vitest Email Validation";
    const htmlContent = "<h1>Test Email</h1><p>This email validates the Mandrill API key is working.</p>";
    const textContent = "Test Email\n\nThis email validates the Mandrill API key is working.";

    const result = await sendTransactionalEmail(
      testEmail,
      testName,
      subject,
      htmlContent,
      textContent
    );

    expect(result).toBe(true);
  }, 30000); // 30 second timeout for API call
});
