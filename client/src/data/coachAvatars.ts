/**
 * Avatar mapping for coach names
 * Maps each coach name to their corresponding avatar image path
 */

export const COACH_AVATARS: Record<string, string> = {
  // Female coaches
  "Sarah Mitchell": "/avatars/sarah-mitchell.png",
  "Elena Rodriguez": "/avatars/elena-rodriguez.png",
  "Jennifer Chen": "/avatars/jennifer-chen.png",
  "Maya Patel": "/avatars/maya-patel.png",
  "Rebecca Thompson": "/avatars/rebecca-thompson.png",
  "Aisha Williams": "/avatars/aisha-williams.png",
  "Sophie Anderson": "/avatars/sophie-anderson.png",
  "Olivia Martinez": "/avatars/olivia-martinez.png",
  
  // Male coaches
  "Marcus Johnson": "/avatars/marcus-johnson.png",
  "David Chen": "/avatars/david-chen.png",
  "James Anderson": "/avatars/james-anderson.png",
  "Alex Rivera": "/avatars/alex-rivera.png",
  "Michael Thompson": "/avatars/michael-thompson.png",
  "Samuel Park": "/avatars/samuel-park.png",
  "Daniel Foster": "/avatars/daniel-foster.png",
  "Christopher Hayes": "/avatars/christopher-hayes.png",
  
  // Non-binary coaches
  "Jordan Taylor": "/avatars/jordan-taylor.png",
  "Alex Morgan": "/avatars/alex-morgan.png",
  "Casey Rivers": "/avatars/casey-rivers.png",
  "Riley Parker": "/avatars/riley-parker.png",
  "Quinn Anderson": "/avatars/quinn-anderson.png",
  "Sage Mitchell": "/avatars/sage-mitchell.png",
  "Avery Brooks": "/avatars/avery-brooks.png",
  "Cameron Wells": "/avatars/cameron-wells.png",
};

/**
 * Get avatar path for a coach name
 * Returns default avatar based on gender if specific avatar not found
 */
export function getCoachAvatar(name: string, gender: "female" | "male" | "nonbinary" = "female"): string {
  // Check if we have a specific avatar for this name
  if (COACH_AVATARS[name]) {
    return COACH_AVATARS[name];
  }
  
  // Return default avatar based on gender
  return `/avatars/coach-${gender}.png`;
}
