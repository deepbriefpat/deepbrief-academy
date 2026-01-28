/**
 * Predefined coach names organized by gender preference
 */

export const COACH_NAMES = {
  female: [
    "Sarah Mitchell",
    "Elena Rodriguez",
    "Jennifer Chen",
    "Maya Patel",
    "Rebecca Thompson",
    "Aisha Williams",
    "Sophie Anderson",
    "Olivia Martinez",
  ],
  male: [
    "Marcus Johnson",
    "David Chen",
    "James Anderson",
    "Alex Rivera",
    "Michael Thompson",
    "Samuel Park",
    "Daniel Foster",
    "Christopher Hayes",
  ],
  nonbinary: [
    "Jordan Taylor",
    "Alex Morgan",
    "Casey Rivers",
    "Riley Parker",
    "Quinn Anderson",
    "Sage Mitchell",
    "Avery Brooks",
    "Cameron Wells",
  ],
} as const;

export type CoachGender = keyof typeof COACH_NAMES;

export interface CoachPreferences {
  gender: CoachGender;
  name: string;
  isCustomName: boolean;
}
