import { useState, useEffect } from "react";
import { Search, Calendar, MessageCircle, ChevronDown, ChevronUp, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Session {
  id: number;
  startedAt: Date;
  endedAt?: Date;
  messageCount?: number;
  summary?: string;
  messages?: Array<{ role: string; content: string }>;
}

interface SessionHistoryProps {
  sessions: Session[];
  onResumeSession?: (sessionId: number) => void;
  expandLatest?: boolean;
}

export function SessionHistory({ sessions = [], onResumeSession, expandLatest }: SessionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  
  // Ensure sessions is always an array
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  
  // Auto-expand latest session if requested
  useEffect(() => {
    if (expandLatest && safeSessions.length > 0) {
      setExpandedSession(safeSessions[0].id);
      // Scroll to the expanded session after a short delay
      setTimeout(() => {
        const element = document.getElementById(`session-${safeSessions[0].id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [expandLatest, safeSessions]);

  // Filter sessions
  const filteredSessions = safeSessions.filter((session) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSummary = session.summary?.toLowerCase().includes(query);
      const matchesMessages = session.messages?.some(
        (msg) => msg.content.toLowerCase().includes(query)
      );
      if (!matchesSummary && !matchesMessages) return false;
    }

    // Date filter
    if (dateFilter !== "all") {
      const sessionDate = new Date(session.startedAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      switch (dateFilter) {
        case "today":
          if (daysDiff > 0) return false;
          break;
        case "week":
          if (daysDiff > 7) return false;
          break;
        case "month":
          if (daysDiff > 30) return false;
          break;
      }
    }

    return true;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = (start: Date, end?: Date) => {
    if (!end) return "In progress";
    const duration = Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60000);
    return `${duration} min`;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6B6B60]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-10 border-[#E6E2D6]"
          />
        </div>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[180px] border-[#E6E2D6]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Past Week</SelectItem>
            <SelectItem value="month">Past Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-[#6B6B60]">
        {filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""} found
      </div>

      {/* Session List */}
      {filteredSessions.length > 0 ? (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              id={`session-${session.id}`}
              className="bg-white rounded-xl border border-[#E6E2D6] overflow-hidden transition-all hover:shadow-md"
            >
              <button
                onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                className="w-full p-5 flex items-start justify-between hover:bg-[#F2F0E9]/50 transition-colors"
              >
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageCircle className="h-5 w-5 text-[#4A6741]" />
                    <h3 className="font-semibold text-[#2C2C2C]">
                      {session.summary || "Coaching Session"}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[#6B6B60]">
                    <span>{formatDate(session.startedAt)}</span>
                    <span>•</span>
                    <span>{getDuration(session.startedAt, session.endedAt)}</span>
                    {session.messageCount && (
                      <>
                        <span>•</span>
                        <span>{session.messageCount} messages</span>
                      </>
                    )}
                  </div>
                </div>
                {expandedSession === session.id ? (
                  <ChevronUp className="h-5 w-5 text-[#6B6B60] flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#6B6B60] flex-shrink-0" />
                )}
              </button>

              {/* Expanded Content */}
              {expandedSession === session.id && (
                <div className="border-t border-[#E6E2D6] p-5 bg-[#F2F0E9]/30">
                  {/* Resume Session Button */}
                  {onResumeSession && !session.endedAt && (
                    <div className="mb-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onResumeSession(session.id);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-[#4A6741] hover:bg-[#3a5331] text-white rounded-lg font-medium transition-colors"
                      >
                        <Play className="h-4 w-4" />
                        Resume This Session
                      </button>
                    </div>
                  )}
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {(session.messages || []).length > 0 ? (session.messages || []).map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg ${
                          msg.role === "user"
                            ? "bg-[#4A6741] text-white ml-8"
                            : "bg-white text-[#2C2C2C] mr-8"
                        }`}
                      >
                        <div className="text-xs opacity-70 mb-1">
                          {msg.role === "user" ? "You" : "Coach"}
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    )) : (
                      <div className="text-center text-[#718096] py-8">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No messages in this session</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-[#E6E2D6]">
          <MessageCircle className="h-16 w-16 text-[#E6E2D6] mx-auto mb-4" />
          <p className="text-[#6B6B60]">
            {searchQuery || dateFilter !== "all"
              ? "No sessions match your filters"
              : "No coaching sessions yet"}
          </p>
        </div>
      )}
    </div>
  );
}
