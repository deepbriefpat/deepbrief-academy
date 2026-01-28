import { describe, it, expect } from "vitest";
import Mailchimp from "@mailchimp/mailchimp_marketing";

describe("Mailchimp Integration", () => {
  it("should validate Mailchimp API credentials", async () => {
    const apiKey = process.env.MAILCHIMP_API_KEY;
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

    expect(apiKey).toBeDefined();
    expect(audienceId).toBeDefined();

    // Extract datacenter from API key (e.g., "us6" from "xxxxx-us6")
    const datacenter = apiKey!.split("-")[1];
    expect(datacenter).toBeDefined();

    // Configure Mailchimp client
    Mailchimp.setConfig({
      apiKey: apiKey!,
      server: datacenter,
    });

    // Test API connection by pinging the server
    const response = await Mailchimp.ping.get();
    expect(response).toBeDefined();
    expect(response.health_status).toBeDefined();

    // Verify audience exists
    const audience = await Mailchimp.lists.getList(audienceId!);
    expect(audience).toBeDefined();
    expect(audience.id).toBe(audienceId);
    
    console.log(`✓ Mailchimp connected successfully`);
    console.log(`✓ Audience: ${audience.name} (${audience.stats?.member_count || 0} members)`);
  });
});
