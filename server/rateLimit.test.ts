import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, checkDemoMessageLimit, resetDemoMessageCount } from "./_core/rateLimit";

describe("Rate Limiting", () => {
  describe("checkRateLimit", () => {
    it("should allow requests within limit", () => {
      const identifier = "test-ip-1";
      const limit = 5;
      const windowMs = 60000; // 1 minute

      // First request should be allowed
      const result1 = checkRateLimit(identifier, limit, windowMs);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(4);

      // Second request should be allowed
      const result2 = checkRateLimit(identifier, limit, windowMs);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it("should block requests exceeding limit", () => {
      const identifier = "test-ip-2";
      const limit = 3;
      const windowMs = 60000;

      // Use up all allowed requests
      checkRateLimit(identifier, limit, windowMs);
      checkRateLimit(identifier, limit, windowMs);
      checkRateLimit(identifier, limit, windowMs);

      // Next request should be blocked
      const result = checkRateLimit(identifier, limit, windowMs);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should reset after time window expires", () => {
      const identifier = "test-ip-3";
      const limit = 2;
      const windowMs = 100; // 100ms for fast test

      // Use up limit
      checkRateLimit(identifier, limit, windowMs);
      checkRateLimit(identifier, limit, windowMs);

      // Should be blocked
      const blocked = checkRateLimit(identifier, limit, windowMs);
      expect(blocked.allowed).toBe(false);

      // Wait for window to expire
      return new Promise(resolve => {
        setTimeout(() => {
          // Should be allowed again
          const allowed = checkRateLimit(identifier, limit, windowMs);
          expect(allowed.allowed).toBe(true);
          expect(allowed.remaining).toBe(1);
          resolve(undefined);
        }, 150);
      });
    });
  });

  describe("checkDemoMessageLimit", () => {
    beforeEach(() => {
      // Reset all demo message counts before each test
      // Note: In a real scenario, you'd want a way to clear the internal Map
      // For now, use unique fingerprints per test
    });

    it("should allow messages within limit", () => {
      const fingerprint = "demo-user-1";
      const limit = 10;

      // First message should be allowed
      const result1 = checkDemoMessageLimit(fingerprint, limit);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(9);

      // Second message should be allowed
      const result2 = checkDemoMessageLimit(fingerprint, limit);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(8);
    });

    it("should block messages exceeding limit", () => {
      const fingerprint = "demo-user-2";
      const limit = 3;

      // Use up all messages
      checkDemoMessageLimit(fingerprint, limit);
      checkDemoMessageLimit(fingerprint, limit);
      checkDemoMessageLimit(fingerprint, limit);

      // Next message should be blocked
      const result = checkDemoMessageLimit(fingerprint, limit);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should reset count when resetDemoMessageCount is called", () => {
      const fingerprint = "demo-user-3";
      const limit = 5;

      // Use some messages
      checkDemoMessageLimit(fingerprint, limit);
      checkDemoMessageLimit(fingerprint, limit);
      checkDemoMessageLimit(fingerprint, limit);

      // Reset count
      resetDemoMessageCount(fingerprint);

      // Should be back to full limit (first call after reset uses 1, leaving 4 remaining)
      const result = checkDemoMessageLimit(fingerprint, limit);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("should track different fingerprints independently", () => {
      const fingerprint1 = "demo-user-4";
      const fingerprint2 = "demo-user-5";
      const limit = 10;

      // Use messages for fingerprint1
      checkDemoMessageLimit(fingerprint1, limit);
      checkDemoMessageLimit(fingerprint1, limit);

      // fingerprint2 should have full limit
      const result = checkDemoMessageLimit(fingerprint2, limit);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });
  });
});
