import { describe, it, expect } from "vitest";
import { sendEmail } from "./emailService";

describe("Unified Email Service - Mandrill Integration", () => {
  it("should send email using the unified sendEmail function", async () => {
    const testEmail = "patrick.voorma@thedeepbrief.co.uk";
    const subject = "Unified Email Service Test";
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { background-color: #4a5d3f; color: white; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Email Service Test</h1>
          </div>
          <p>This email validates that the unified email service is working with Mandrill.</p>
          <p>All email sending functions now use the Mandrill Transactional API.</p>
        </body>
      </html>
    `;

    const result = await sendEmail(testEmail, subject, htmlContent);

    expect(result).toBe(true);
  }, 30000); // 30 second timeout
});
