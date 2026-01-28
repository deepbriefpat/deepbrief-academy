/**
 * Calendar Export Button Component
 * 
 * Allows users to add commitments to their preferred calendar app
 */

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  generateYahooCalendarUrl,
  downloadICSFile,
  createCommitmentCalendarEvent,
} from "../../../shared/calendarExport";

interface CalendarExportButtonProps {
  commitment?: {
    action: string;
    deadline: Date | null;
    context?: string | null;
  };
  // Generic props for goals or other events
  title?: string;
  description?: string;
  startDate?: Date;
  location?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function CalendarExportButton({ 
  commitment,
  title,
  description,
  startDate,
  location,
  variant = "outline",
  size = "sm" 
}: CalendarExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Determine which data source to use
  const eventTitle = commitment?.action || title || "Event";
  const eventDescription = commitment?.context || description || "";
  const eventDate = commitment?.deadline || startDate;
  const eventLocation = location || "";

  // Don't show button if no date
  if (!eventDate) {
    return null;
  }

  const calendarEvent = createCommitmentCalendarEvent({
    action: eventTitle,
    deadline: new Date(eventDate),
    context: eventDescription,
  });

  const handleGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(calendarEvent);
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const handleOutlookCalendar = () => {
    const url = generateOutlookCalendarUrl(calendarEvent);
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const handleYahooCalendar = () => {
    const url = generateYahooCalendarUrl(calendarEvent);
    window.open(url, '_blank');
    setIsOpen(false);
  };

  const handleAppleCalendar = () => {
    const filename = `${eventTitle.substring(0, 30).replace(/[^a-z0-9]/gi, '_')}.ics`;
    downloadICSFile(calendarEvent, filename);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className="gap-2 bg-gold-500/30 hover:bg-gold-500/40 border-gold-400/60 text-gold-300 font-semibold hover:border-gold-400/80 hover:text-gold-200 transition-all shadow-sm hover:shadow-md"
        >
          <Calendar className="h-4 w-4" />
          <span>Add to Calendar</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleGoogleCalendar} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </div>
            <span>Google Calendar</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleOutlookCalendar} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M24 7.387v9.226a4.39 4.39 0 01-4.387 4.387h-.046l-9.24-4.618v-8.77L19.567 3h.046A4.39 4.39 0 0124 7.387zM0 12l5.838 2.919V9.081zm13.5-4.5v9l-9-4.5z"/>
              </svg>
            </div>
            <span>Outlook Calendar</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleAppleCalendar} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </div>
            <span>Apple Calendar</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleYahooCalendar} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M8.41 17.238h2.516L7.145 6.762H4.427zm6.382-6.762l3.781 6.762h-2.72L12.073 10.476zm-.925-3.714h2.72L12.807 0h-2.72zM0 6.762h2.72l3.781 6.762H3.781zm24 0h-2.72l-3.781 6.762h2.72z"/>
              </svg>
            </div>
            <span>Yahoo Calendar</span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleAppleCalendar} className="cursor-pointer">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Other (.ics file)</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
