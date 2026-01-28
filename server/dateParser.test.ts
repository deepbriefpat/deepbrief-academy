/**
 * Tests for Smart Date Parser
 */

import { describe, it, expect } from "vitest";
import { parseRelativeDate, formatDeadline } from "./dateParser";

describe("Smart Date Parser", () => {
  it("should parse 'today' correctly", () => {
    const result = parseRelativeDate("today");
    expect(result).toBeDefined();
    
    const now = new Date();
    expect(result?.getDate()).toBe(now.getDate());
    expect(result?.getMonth()).toBe(now.getMonth());
  });

  it("should parse 'tomorrow' correctly", () => {
    const result = parseRelativeDate("tomorrow");
    expect(result).toBeDefined();
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(result?.getDate()).toBe(tomorrow.getDate());
  });

  it("should parse day names (Monday, Tuesday, etc.)", () => {
    const monday = parseRelativeDate("Monday");
    expect(monday).toBeDefined();
    expect(monday?.getDay()).toBe(1); // Monday is day 1
    
    const friday = parseRelativeDate("Friday");
    expect(friday).toBeDefined();
    expect(friday?.getDay()).toBe(5); // Friday is day 5
    
    const wednesday = parseRelativeDate("wednesday");
    expect(wednesday).toBeDefined();
    expect(wednesday?.getDay()).toBe(3); // Wednesday is day 3
  });

  it("should parse 'end of week' correctly", () => {
    const result = parseRelativeDate("end of week");
    expect(result).toBeDefined();
    expect(result?.getDay()).toBe(0); // Sunday is day 0
  });

  it("should parse 'this week' correctly", () => {
    const result = parseRelativeDate("this week");
    expect(result).toBeDefined();
    expect(result?.getDay()).toBe(0); // Should return Sunday
  });

  it("should parse 'in X days' format", () => {
    const in2days = parseRelativeDate("in 2 days");
    expect(in2days).toBeDefined();
    
    const expected = new Date();
    expected.setDate(expected.getDate() + 2);
    expect(in2days?.getDate()).toBe(expected.getDate());
    
    const in7days = parseRelativeDate("in 7 days");
    expect(in7days).toBeDefined();
  });

  it("should parse 'in X weeks' format", () => {
    const in2weeks = parseRelativeDate("in 2 weeks");
    expect(in2weeks).toBeDefined();
    
    const expected = new Date();
    expected.setDate(expected.getDate() + 14);
    expect(in2weeks?.getDate()).toBe(expected.getDate());
  });

  it("should parse 'by Friday' format", () => {
    const result = parseRelativeDate("by Friday");
    expect(result).toBeDefined();
    expect(result?.getDay()).toBe(5); // Friday
  });

  it("should parse month + day format", () => {
    const jan30 = parseRelativeDate("January 30");
    expect(jan30).toBeDefined();
    expect(jan30?.getMonth()).toBe(0); // January is month 0
    expect(jan30?.getDate()).toBe(30);
    
    const feb15 = parseRelativeDate("Feb 15");
    expect(feb15).toBeDefined();
    expect(feb15?.getMonth()).toBe(1); // February is month 1
    expect(feb15?.getDate()).toBe(15);
  });

  it("should parse day + month format", () => {
    const result = parseRelativeDate("30 January");
    expect(result).toBeDefined();
    expect(result?.getMonth()).toBe(0);
    expect(result?.getDate()).toBe(30);
    
    const result2 = parseRelativeDate("15th Feb");
    expect(result2).toBeDefined();
    expect(result2?.getMonth()).toBe(1);
    expect(result2?.getDate()).toBe(15);
  });

  it("should parse numeric date format (M/D)", () => {
    const result = parseRelativeDate("1/30");
    expect(result).toBeDefined();
    expect(result?.getMonth()).toBe(0); // January
    expect(result?.getDate()).toBe(30);
  });

  it("should return undefined for invalid dates", () => {
    expect(parseRelativeDate("invalid date")).toBeUndefined();
    expect(parseRelativeDate("xyz")).toBeUndefined();
    expect(parseRelativeDate("")).toBeUndefined();
    expect(parseRelativeDate("N/A")).toBeUndefined();
  });

  it("should handle case-insensitive input", () => {
    expect(parseRelativeDate("MONDAY")).toBeDefined();
    expect(parseRelativeDate("FrIdAy")).toBeDefined();
    expect(parseRelativeDate("END OF WEEK")).toBeDefined();
  });

  it("should parse ISO date strings", () => {
    const isoDate = "2026-02-15T12:00:00Z";
    const result = parseRelativeDate(isoDate);
    expect(result).toBeDefined();
    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(1); // February
    // Use getUTCDate() to avoid timezone issues
    expect(result?.getUTCDate()).toBe(15);
  });
});

describe("formatDeadline", () => {
  it("should format today as 'today'", () => {
    const today = new Date();
    expect(formatDeadline(today)).toBe("today");
  });

  it("should format tomorrow as 'tomorrow'", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(formatDeadline(tomorrow)).toBe("tomorrow");
  });

  it("should format days within a week as day names", () => {
    const in3days = new Date();
    in3days.setDate(in3days.getDate() + 3);
    const formatted = formatDeadline(in3days);
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    expect(dayNames).toContain(formatted);
  });

  it("should format dates beyond a week with month and day", () => {
    const in10days = new Date();
    in10days.setDate(in10days.getDate() + 10);
    const formatted = formatDeadline(in10days);
    
    // Should be in format like "Feb 5"
    expect(formatted).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });
});
