/**
 * Smart Date Parser for Commitment Deadlines
 * 
 * Parses relative date strings like "Wednesday", "end of week", "in 3 days"
 * into actual Date objects.
 */

/**
 * Parse a relative date string into a Date object
 * Returns undefined if the date cannot be parsed
 */
export function parseRelativeDate(dateString: string): Date | undefined {
  if (!dateString || typeof dateString !== 'string') {
    return undefined;
  }

  const normalized = dateString.toLowerCase().trim();
  const now = new Date();
  
  // Try ISO date format first (YYYY-MM-DD or full ISO string)
  const isoDate = new Date(dateString);
  if (!isNaN(isoDate.getTime()) && dateString.includes('-')) {
    return isoDate;
  }

  // Today
  if (normalized === 'today') {
    return now;
  }

  // Tomorrow
  if (normalized === 'tomorrow') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  // Yesterday (for completeness)
  if (normalized === 'yesterday') {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }

  // Day names: Monday, Tuesday, Wednesday, etc.
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayIndex = dayNames.indexOf(normalized);
  if (dayIndex !== -1) {
    return getNextWeekday(now, dayIndex);
  }

  // "this week" - end of current week (Sunday)
  if (normalized === 'this week' || normalized === 'end of week' || normalized === 'end of this week') {
    return getEndOfWeek(now);
  }

  // "next week" - end of next week (Sunday)
  if (normalized === 'next week' || normalized === 'end of next week') {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return getEndOfWeek(nextWeek);
  }

  // "in X days/weeks/months"
  const inPattern = /^in (\d+) (day|days|week|weeks|month|months)$/;
  const inMatch = normalized.match(inPattern);
  if (inMatch) {
    const amount = parseInt(inMatch[1]);
    const unit = inMatch[2];
    const result = new Date(now);
    
    if (unit.startsWith('day')) {
      result.setDate(result.getDate() + amount);
    } else if (unit.startsWith('week')) {
      result.setDate(result.getDate() + (amount * 7));
    } else if (unit.startsWith('month')) {
      result.setMonth(result.getMonth() + amount);
    }
    
    return result;
  }

  // "X days/weeks/months from now"
  const fromNowPattern = /^(\d+) (day|days|week|weeks|month|months) from now$/;
  const fromNowMatch = normalized.match(fromNowPattern);
  if (fromNowMatch) {
    const amount = parseInt(fromNowMatch[1]);
    const unit = fromNowMatch[2];
    const result = new Date(now);
    
    if (unit.startsWith('day')) {
      result.setDate(result.getDate() + amount);
    } else if (unit.startsWith('week')) {
      result.setDate(result.getDate() + (amount * 7));
    } else if (unit.startsWith('month')) {
      result.setMonth(result.getMonth() + amount);
    }
    
    return result;
  }

  // "by [day name]" - e.g., "by Friday"
  const byDayPattern = /^by (monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/;
  const byDayMatch = normalized.match(byDayPattern);
  if (byDayMatch) {
    const dayName = byDayMatch[1];
    const dayIdx = dayNames.indexOf(dayName);
    return getNextWeekday(now, dayIdx);
  }

  // "by [time period]" - e.g., "by end of week"
  if (normalized === 'by end of week' || normalized === 'by this weekend') {
    return getEndOfWeek(now);
  }

  // Month + day: "January 30", "Jan 30", "30 January"
  const monthDayPattern = /^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+(\d{1,2})(st|nd|rd|th)?$/;
  const monthDayMatch = normalized.match(monthDayPattern);
  if (monthDayMatch) {
    const monthStr = monthDayMatch[1];
    const day = parseInt(monthDayMatch[2]);
    const month = parseMonth(monthStr);
    
    if (month !== undefined) {
      const result = new Date(now.getFullYear(), month, day);
      // If the date is in the past, assume next year
      if (result < now) {
        result.setFullYear(result.getFullYear() + 1);
      }
      return result;
    }
  }

  // Day + month: "30 January", "30th Jan"
  const dayMonthPattern = /^(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?$/;
  const dayMonthMatch = normalized.match(dayMonthPattern);
  if (dayMonthMatch) {
    const day = parseInt(dayMonthMatch[1]);
    const monthStr = dayMonthMatch[3];
    const month = parseMonth(monthStr);
    
    if (month !== undefined) {
      const result = new Date(now.getFullYear(), month, day);
      // If the date is in the past, assume next year
      if (result < now) {
        result.setFullYear(result.getFullYear() + 1);
      }
      return result;
    }
  }

  // Numeric date formats: "1/30", "01/30", "1-30"
  const numericPattern = /^(\d{1,2})[\/\-](\d{1,2})$/;
  const numericMatch = normalized.match(numericPattern);
  if (numericMatch) {
    const month = parseInt(numericMatch[1]) - 1; // 0-indexed
    const day = parseInt(numericMatch[2]);
    
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      const result = new Date(now.getFullYear(), month, day);
      // If the date is in the past, assume next year
      if (result < now) {
        result.setFullYear(result.getFullYear() + 1);
      }
      return result;
    }
  }

  // If nothing matched, return undefined
  return undefined;
}

/**
 * Get the next occurrence of a specific weekday
 * @param from Starting date
 * @param targetDay Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
 */
function getNextWeekday(from: Date, targetDay: number): Date {
  const result = new Date(from);
  const currentDay = result.getDay();
  
  // Calculate days until target day
  let daysUntil = targetDay - currentDay;
  
  // If target day is today or in the past this week, go to next week
  if (daysUntil <= 0) {
    daysUntil += 7;
  }
  
  result.setDate(result.getDate() + daysUntil);
  return result;
}

/**
 * Get the end of the current week (Sunday)
 */
function getEndOfWeek(date: Date): Date {
  const result = new Date(date);
  const currentDay = result.getDay();
  const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
  result.setDate(result.getDate() + daysUntilSunday);
  return result;
}

/**
 * Parse month name to month index (0-11)
 */
function parseMonth(monthStr: string): number | undefined {
  const months = [
    ['january', 'jan'],
    ['february', 'feb'],
    ['march', 'mar'],
    ['april', 'apr'],
    ['may'],
    ['june', 'jun'],
    ['july', 'jul'],
    ['august', 'aug'],
    ['september', 'sep', 'sept'],
    ['october', 'oct'],
    ['november', 'nov'],
    ['december', 'dec']
  ];

  const normalized = monthStr.toLowerCase().replace('.', '');
  
  for (let i = 0; i < months.length; i++) {
    if (months[i].includes(normalized)) {
      return i;
    }
  }
  
  return undefined;
}

/**
 * Format a date for display in notifications
 */
export function formatDeadline(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'today';
  } else if (diffDays === 1) {
    return 'tomorrow';
  } else if (diffDays < 7) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[date.getDay()];
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
