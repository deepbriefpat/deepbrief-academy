import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("Stripe Checkout Configuration", () => {
  it("should have STRIPE_PRICE_ID configured", () => {
    expect(ENV.stripePriceId).toBeDefined();
    expect(ENV.stripePriceId).not.toBe("");
    expect(ENV.stripePriceId).toMatch(/^price_/);
  });

  it("should have STRIPE_SECRET_KEY configured", () => {
    expect(ENV.stripeSecretKey).toBeDefined();
    expect(ENV.stripeSecretKey).not.toBe("");
    expect(ENV.stripeSecretKey).toMatch(/^sk_/);
  });

  it("should be able to validate price ID format", () => {
    const priceId = ENV.stripePriceId;
    // Price IDs should start with price_ and be at least 20 characters
    expect(priceId.startsWith("price_")).toBe(true);
    expect(priceId.length).toBeGreaterThan(20);
  });
});
