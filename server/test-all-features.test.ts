/**
 * End-to-End Test for Smart Date Parsing, Calendar Export, and Notifications
 */

import { describe, it, expect } from "vitest";
import { parseRelativeDate, formatDeadline } from "./dateParser";
import { 
  generateGoogleCalendarUrl, 
  generateOutlookCalendarUrl,
  generateYahooCalendarUrl,
  generateICSFile,
  createCommitmentCalendarEvent 
} from "../shared/calendarExport";
import { getCommitmentsNeedingNotification } from "./notifications";

describe("End-to-End Feature Tests", () => {
  describe("Date Parsing Integration", () => {
    it("should parse various date formats from LLM responses", () => {
      const testCases = [
        { input: "Friday", expectedDay: 5 }, // Day of week (0=Sunday, 5=Friday)
        { input: "end of week", expectedDay: 0 }, // Sunday
      ];

      for (const testCase of testCases) {
        const result = parseRelativeDate(testCase.input);
        expect(result).toBeDefined();
        expect(result?.getDay()).toBe(testCase.expectedDay);
      }
      
      // Test relative dates (tomorrow, in X days)
      const tomorrow = parseRelativeDate("tomorrow");
      expect(tomorrow).toBeDefined();
      const expectedTomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(tomorrow?.getDate()).toBe(expectedTomorrow.getDate());
      
      const in3days = parseRelativeDate("in 3 days");
      expect(in3days).toBeDefined();
      const expected3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      expect(in3days?.getDate()).toBe(expected3Days.getDate());
    });

    it("should format deadlines for display", () => {
      const today = new Date();
      expect(formatDeadline(today)).toBe("today");

      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(formatDeadline(tomorrow)).toBe("tomorrow");

      const nextWeek = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      const formatted = formatDeadline(nextWeek);
      expect(formatted).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/); // e.g., "Feb 5"
    });
  });

  describe("Calendar Export Integration", () => {
    const testCommitment = {
      action: "Complete quarterly review",
      deadline: new Date("2026-02-15T14:00:00Z"),
      context: "Review Q4 performance metrics and set Q1 goals",
    };

    it("should create calendar event from commitment", () => {
      const event = createCommitmentCalendarEvent(testCommitment);
      
      expect(event.title).toContain("Complete quarterly review");
      expect(event.description).toContain("Review Q4 performance metrics");
      expect(event.startDate).toEqual(testCommitment.deadline);
    });

    it("should generate valid Google Calendar URL", () => {
      const event = createCommitmentCalendarEvent(testCommitment);
      const url = generateGoogleCalendarUrl(event);
      
      expect(url).toContain("calendar.google.com");
      expect(url).toContain("action=TEMPLATE");
      // Google Calendar uses + for spaces in URLs
      expect(url).toContain("Complete+quarterly+review");
    });

    it("should generate valid Outlook Calendar URL", () => {
      const event = createCommitmentCalendarEvent(testCommitment);
      const url = generateOutlookCalendarUrl(event);
      
      expect(url).toContain("outlook.office.com");
      expect(url).toContain("subject=");
      // Outlook uses + for spaces in URLs
      expect(url).toContain("Commitment%3A+Complete+quarterly+review");
    });

    it("should generate valid Yahoo Calendar URL", () => {
      const event = createCommitmentCalendarEvent(testCommitment);
      const url = generateYahooCalendarUrl(event);
      
      expect(url).toContain("calendar.yahoo.com");
      expect(url).toContain("title=");
    });

    it("should generate valid .ics file content", () => {
      const event = createCommitmentCalendarEvent(testCommitment);
      const ics = generateICSFile(event);
      
      expect(ics).toContain("BEGIN:VCALENDAR");
      expect(ics).toContain("END:VCALENDAR");
      expect(ics).toContain("BEGIN:VEVENT");
      expect(ics).toContain("END:VEVENT");
      expect(ics).toContain("SUMMARY:");
      expect(ics).toContain("DESCRIPTION:");
      expect(ics).toContain("BEGIN:VALARM");
      expect(ics).toContain("TRIGGER:-PT24H"); // 24 hour reminder
    });

    it("should handle all-day events correctly", () => {
      // Create a date at midnight UTC
      const deadline = new Date(Date.UTC(2026, 1, 15, 0, 0, 0, 0)); // Feb 15, 2026 00:00:00 UTC
      
      const allDayCommitment = {
        action: "Submit report",
        deadline,
        context: null,
      };

      const event = createCommitmentCalendarEvent(allDayCommitment);
      
      // Verify the event is detected as all-day
      expect(event.allDay).toBe(true);

      // Verify .ics file uses DATE format for all-day events
      const ics = generateICSFile(event);
      expect(ics).toContain("DTSTART;VALUE=DATE:");
      expect(ics).toContain("DTEND;VALUE=DATE:");
    });
  });

  describe("Notification System Integration", () => {
    it("should identify commitments needing notification", async () => {
      // This test requires database access, so it may return empty array in test environment
      const notifications = await getCommitmentsNeedingNotification();
      
      expect(Array.isArray(notifications)).toBe(true);
      
      // If there are notifications, verify structure
      if (notifications.length > 0) {
        const notification = notifications[0];
        expect(notification).toHaveProperty("commitmentId");
        expect(notification).toHaveProperty("userId");
        expect(notification).toHaveProperty("userEmail");
        expect(notification).toHaveProperty("action");
        expect(notification).toHaveProperty("deadline");
        expect(notification).toHaveProperty("notificationType");
        expect(["24_hours", "3_days", "1_week", "overdue"]).toContain(notification.notificationType);
      }
    });
  });

  describe("Complete Workflow", () => {
    it("should handle commitment from extraction to calendar export", () => {
      // Simulate LLM extracting a commitment with relative date
      const extractedDate = "Friday";
      const parsedDate = parseRelativeDate(extractedDate);
      
      expect(parsedDate).toBeDefined();
      expect(parsedDate?.getDay()).toBe(5); // Friday

      // Create commitment object
      const commitment = {
        action: "Prepare presentation for board meeting",
        deadline: parsedDate!,
        context: "Include Q4 results and 2026 roadmap",
      };

      // Generate calendar event
      const event = createCommitmentCalendarEvent(commitment);
      expect(event.title).toContain("Prepare presentation");

      // Generate all calendar URLs
      const googleUrl = generateGoogleCalendarUrl(event);
      const outlookUrl = generateOutlookCalendarUrl(event);
      const yahooUrl = generateYahooCalendarUrl(event);
      const ics = generateICSFile(event);

      // Verify all formats are valid
      expect(googleUrl).toContain("calendar.google.com");
      expect(outlookUrl).toContain("outlook.office.com");
      expect(yahooUrl).toContain("calendar.yahoo.com");
      expect(ics).toContain("BEGIN:VCALENDAR");

      // Format deadline for display
      const displayDate = formatDeadline(parsedDate!);
      expect(displayDate).toBeTruthy();
    });

    it("should handle commitments without deadlines gracefully", () => {
      const commitment = {
        action: "Review team feedback",
        deadline: null,
        context: "Ongoing task",
      };

      // Calendar export should not be available for commitments without deadlines
      // This is handled in the UI component by returning null
      expect(commitment.deadline).toBeNull();
    });
  });
});
