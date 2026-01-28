/**
 * Calendar Export Utility
 * 
 * Generates calendar event URLs and .ics files for commitments
 * Supports Google Calendar, Outlook, Apple Calendar, and Yahoo Calendar
 */

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  allDay?: boolean;
}

/**
 * Format date for calendar URLs (YYYYMMDDTHHmmssZ)
 */
function formatDateForCalendar(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Format date for .ics files (YYYYMMDD for all-day events)
 */
function formatDateForICS(date: Date, allDay: boolean = false): string {
  if (allDay) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }
  return formatDateForCalendar(date);
}

/**
 * Generate Google Calendar URL
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const baseUrl = 'https://calendar.google.com/calendar/render';
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description || '',
  });
  
  if (event.location) {
    params.append('location', event.location);
  }
  
  // Set dates
  const startDate = formatDateForCalendar(event.startDate);
  const endDate = event.endDate 
    ? formatDateForCalendar(event.endDate)
    : formatDateForCalendar(new Date(event.startDate.getTime() + 60 * 60 * 1000)); // +1 hour default
  
  params.append('dates', `${startDate}/${endDate}`);
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate Outlook Calendar URL (Office 365)
 */
export function generateOutlookCalendarUrl(event: CalendarEvent): string {
  const baseUrl = 'https://outlook.office.com/calendar/0/deeplink/compose';
  
  const params = new URLSearchParams({
    subject: event.title,
    body: event.description || '',
    startdt: event.startDate.toISOString(),
    enddt: event.endDate?.toISOString() || new Date(event.startDate.getTime() + 60 * 60 * 1000).toISOString(),
  });
  
  if (event.location) {
    params.append('location', event.location);
  }
  
  if (event.allDay) {
    params.append('allday', 'true');
  }
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate Yahoo Calendar URL
 */
export function generateYahooCalendarUrl(event: CalendarEvent): string {
  const baseUrl = 'https://calendar.yahoo.com/';
  
  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    desc: event.description || '',
    st: formatDateForCalendar(event.startDate),
    et: event.endDate 
      ? formatDateForCalendar(event.endDate)
      : formatDateForCalendar(new Date(event.startDate.getTime() + 60 * 60 * 1000)),
  });
  
  if (event.location) {
    params.append('in_loc', event.location);
  }
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate .ics file content for Apple Calendar and other iCal-compatible apps
 */
export function generateICSFile(event: CalendarEvent): string {
  const now = new Date();
  const timestamp = formatDateForCalendar(now);
  
  const startDate = formatDateForICS(event.startDate, event.allDay);
  const endDate = event.endDate 
    ? formatDateForICS(event.endDate, event.allDay)
    : formatDateForICS(new Date(event.startDate.getTime() + 60 * 60 * 1000), event.allDay);
  
  // Generate unique ID
  const uid = `${timestamp}-${Math.random().toString(36).substring(7)}@thinkingpatternshub.com`;
  
  // Escape special characters in text fields
  const escapeText = (text: string) => {
    return text.replace(/\\/g, '\\\\')
               .replace(/;/g, '\\;')
               .replace(/,/g, '\\,')
               .replace(/\n/g, '\\n');
  };
  
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Thinking Patterns Hub//Commitment Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${timestamp}`,
  ];
  
  if (event.allDay) {
    ics.push(`DTSTART;VALUE=DATE:${startDate}`);
    ics.push(`DTEND;VALUE=DATE:${endDate}`);
  } else {
    ics.push(`DTSTART:${startDate}`);
    ics.push(`DTEND:${endDate}`);
  }
  
  ics.push(`SUMMARY:${escapeText(event.title)}`);
  
  if (event.description) {
    ics.push(`DESCRIPTION:${escapeText(event.description)}`);
  }
  
  if (event.location) {
    ics.push(`LOCATION:${escapeText(event.location)}`);
  }
  
  // Add reminder 24 hours before
  ics.push('BEGIN:VALARM');
  ics.push('TRIGGER:-PT24H');
  ics.push('ACTION:DISPLAY');
  ics.push(`DESCRIPTION:Reminder: ${escapeText(event.title)}`);
  ics.push('END:VALARM');
  
  ics.push('STATUS:CONFIRMED');
  ics.push('SEQUENCE:0');
  ics.push('END:VEVENT');
  ics.push('END:VCALENDAR');
  
  return ics.join('\r\n');
}

/**
 * Download .ics file
 */
export function downloadICSFile(event: CalendarEvent, filename: string = 'commitment.ics'): void {
  const icsContent = generateICSFile(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Generate calendar URLs for all providers
 */
export function generateAllCalendarUrls(event: CalendarEvent): {
  google: string;
  outlook: string;
  yahoo: string;
  ics: string;
} {
  return {
    google: generateGoogleCalendarUrl(event),
    outlook: generateOutlookCalendarUrl(event),
    yahoo: generateYahooCalendarUrl(event),
    ics: `data:text/calendar;charset=utf-8,${encodeURIComponent(generateICSFile(event))}`,
  };
}

/**
 * Create calendar event from commitment
 */
export function createCommitmentCalendarEvent(
  commitment: {
    action: string;
    deadline: Date;
    context?: string | null;
  }
): CalendarEvent {
  // Set event to all-day if no specific time is set (check both local and UTC)
  const isAllDay = (commitment.deadline.getHours() === 0 && 
                    commitment.deadline.getMinutes() === 0 &&
                    commitment.deadline.getSeconds() === 0) ||
                   (commitment.deadline.getUTCHours() === 0 && 
                    commitment.deadline.getUTCMinutes() === 0 &&
                    commitment.deadline.getUTCSeconds() === 0);
  
  return {
    title: `Commitment: ${commitment.action}`,
    description: commitment.context || `Complete this commitment from your coaching session.`,
    startDate: commitment.deadline,
    endDate: commitment.deadline,
    allDay: isAllDay,
  };
}
