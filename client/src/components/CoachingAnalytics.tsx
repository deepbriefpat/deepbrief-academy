import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, MessageCircle, Target, Calendar, CheckCircle, Clock } from "lucide-react";

interface Session {
  id: number;
  createdAt: number;
  topic: string;
}

interface Goal {
  id: number;
  title: string;
  progress: number | null;
  status: string;
}

interface Commitment {
  id: number;
  action: string;
  status: string;
  deadline: number | null;
  progress: number | null;
}

interface CoachingAnalyticsProps {
  sessions: Session[];
  goals: Goal[];
  commitments?: Commitment[];
}

export default function CoachingAnalytics({ sessions = [], goals = [], commitments = [] }: CoachingAnalyticsProps) {
  // Ensure sessions, goals, and commitments are always arrays
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeCommitments = Array.isArray(commitments) ? commitments : [];
  
  // Calculate session frequency by week
  const sessionsByWeek = useMemo(() => {
    const weeks: Record<string, number> = {};
    const now = Date.now();
    const fourWeeksAgo = now - (28 * 24 * 60 * 60 * 1000);
    
    safeSessions.forEach(session => {
      if (session.createdAt >= fourWeeksAgo) {
        const weekStart = new Date(session.createdAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        weeks[weekKey] = (weeks[weekKey] || 0) + 1;
      }
    });
    
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [safeSessions]);

  // Calculate topic frequency
  const topicFrequency = useMemo(() => {
    const topics: Record<string, number> = {};
    safeSessions.forEach(session => {
      if (session.topic) {
        topics[session.topic] = (topics[session.topic] || 0) + 1;
      }
    });
    return Object.entries(topics)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));
  }, [safeSessions]);

  // Calculate goal completion rate
  const goalStats = useMemo(() => {
    if (safeGoals.length === 0) return { completed: 0, inProgress: 0, rate: 0 };
    const completed = safeGoals.filter(g => g.status === 'completed').length;
    const inProgress = safeGoals.filter(g => g.status === 'in_progress').length;
    const rate = Math.round((completed / safeGoals.length) * 100);
    return { completed, inProgress, rate };
  }, [safeGoals]);

  // Calculate commitment stats
  const commitmentStats = useMemo(() => {
    if (safeCommitments.length === 0) return { total: 0, open: 0, completed: 0, overdue: 0, rate: 0 };
    const completed = safeCommitments.filter(c => c.status === 'completed').length;
    const open = safeCommitments.filter(c => c.status === 'pending').length;
    const now = Date.now();
    const overdue = safeCommitments.filter(c => 
      c.status === 'pending' && c.deadline && c.deadline < now
    ).length;
    const rate = Math.round((completed / safeCommitments.length) * 100);
    return { total: safeCommitments.length, open, completed, overdue, rate };
  }, [safeCommitments]);

  // Calculate average sessions per week
  const avgSessionsPerWeek = useMemo(() => {
    if (sessionsByWeek.length === 0) return 0;
    const total = sessionsByWeek.reduce((sum, week) => sum + week.count, 0);
    return (total / sessionsByWeek.length).toFixed(1);
  }, [sessionsByWeek]);

  // Get max count for chart scaling
  const maxSessionCount = Math.max(...sessionsByWeek.map(w => w.count), 1);
  const maxTopicCount = Math.max(...topicFrequency.map(t => t.count), 1);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#2C2C2C] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Your Coaching Progress
        </h2>
        <p className="text-[#6B6B60]">Track your leadership development journey</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-6 bg-white border-[#E6E2D6]">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-1.5 sm:p-2 bg-[#4A6741]/10 rounded-lg flex-shrink-0">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6741]" />
            </div>
            <span className="text-xs sm:text-sm text-[#6B6B60] truncate">Total Sessions</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#2C2C2C]">{sessions.length}</p>
        </Card>

        <Card className="p-4 sm:p-6 bg-white border-[#E6E2D6]">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-1.5 sm:p-2 bg-[#D97757]/10 rounded-lg flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[#D97757]" />
            </div>
            <span className="text-xs sm:text-sm text-[#6B6B60] truncate">Avg/Week</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#2C2C2C]">{avgSessionsPerWeek}</p>
        </Card>

        <Card className="p-4 sm:p-6 bg-white border-[#E6E2D6]">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-1.5 sm:p-2 bg-[#4A6741]/10 rounded-lg flex-shrink-0">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6741]" />
            </div>
            <span className="text-xs sm:text-sm text-[#6B6B60] truncate">Goals</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#2C2C2C]">{goals.length}</p>
        </Card>

        <Card className="p-4 sm:p-6 bg-white border-[#E6E2D6]">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-1.5 sm:p-2 bg-[#D97757]/10 rounded-lg flex-shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#D97757]" />
            </div>
            <span className="text-xs sm:text-sm text-[#6B6B60] truncate">Goal Done</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#2C2C2C]">{goalStats.rate}%</p>
        </Card>

        <Card className="p-4 sm:p-6 bg-white border-[#E6E2D6]">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-1.5 sm:p-2 bg-[#4A6741]/10 rounded-lg flex-shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6741]" />
            </div>
            <span className="text-xs sm:text-sm text-[#6B6B60] truncate">Commits</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#2C2C2C]">{commitmentStats.total}</p>
          <p className="text-xs text-[#6B6B60] mt-1">{commitmentStats.open} open</p>
        </Card>

        <Card className="p-4 sm:p-6 bg-white border-[#E6E2D6]">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-1.5 sm:p-2 bg-[#D97757]/10 rounded-lg flex-shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#D97757]" />
            </div>
            <span className="text-xs sm:text-sm text-[#6B6B60] truncate">Done Rate</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#2C2C2C]">{commitmentStats.rate}%</p>
          {commitmentStats.overdue > 0 && (
            <p className="text-xs text-red-600 mt-1">{commitmentStats.overdue} overdue</p>
          )}
        </Card>
      </div>

      {/* Session Frequency Chart */}
      <Card className="p-6 bg-white border-[#E6E2D6]">
        <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4">Session Frequency (Last 4 Weeks)</h3>
        {sessionsByWeek.length > 0 ? (
          <div className="space-y-3">
            {sessionsByWeek.map(({ date, count }) => (
              <div key={date} className="flex items-center gap-4">
                <span className="text-sm text-[#6B6B60] w-24">
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 bg-[#F2F0E9] rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-[#4A6741] h-full rounded-full flex items-center justify-end pr-3"
                    style={{ width: `${(count / maxSessionCount) * 100}%` }}
                  >
                    <span className="text-white text-sm font-medium">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#6B6B60] text-center py-8">No sessions in the last 4 weeks</p>
        )}
      </Card>

      {/* Top Topics */}
      <Card className="p-6 bg-white border-[#E6E2D6]">
        <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4">Most Discussed Topics</h3>
        {topicFrequency.length > 0 ? (
          <div className="space-y-3">
            {topicFrequency.map(({ topic, count }) => (
              <div key={topic} className="flex items-center gap-4">
                <span className="text-sm text-[#2C2C2C] flex-1">{topic}</span>
                <div className="w-32 bg-[#F2F0E9] rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-[#D97757] h-full rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(count / maxTopicCount) * 100}%` }}
                  >
                    <span className="text-white text-xs font-medium">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#6B6B60] text-center py-8">No topics tracked yet</p>
        )}
      </Card>

      {/* Goal Progress */}
      <Card className="p-6 bg-white border-[#E6E2D6]">
        <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4">Goal Progress Overview</h3>
        {goals.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#4A6741]">{goalStats.completed}</p>
                <p className="text-sm text-[#6B6B60]">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#D97757]">{goalStats.inProgress}</p>
                <p className="text-sm text-[#6B6B60]">In Progress</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#2C2C2C]">{goals.length - goalStats.completed - goalStats.inProgress}</p>
                <p className="text-sm text-[#6B6B60]">Not Started</p>
              </div>
            </div>
            <div className="pt-4 border-t border-[#E6E2D6]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#6B6B60]">Overall Completion</span>
                <span className="text-sm font-semibold text-[#2C2C2C]">{goalStats.rate}%</span>
              </div>
              <div className="w-full bg-[#F2F0E9] rounded-full h-4 overflow-hidden">
                <div
                  className="bg-[#4A6741] h-full rounded-full transition-all duration-500"
                  style={{ width: `${goalStats.rate}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[#6B6B60] text-center py-8">No goals set yet. Create your first goal to track progress!</p>
        )}
      </Card>

      {/* Commitment Progress */}
      <Card className="p-6 bg-white border-[#E6E2D6]">
        <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4">Commitment Progress Overview</h3>
        {commitmentStats.total > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#4A6741]">{commitmentStats.completed}</p>
                <p className="text-sm text-[#6B6B60]">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#D97757]">{commitmentStats.open}</p>
                <p className="text-sm text-[#6B6B60]">Open</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{commitmentStats.overdue}</p>
                <p className="text-sm text-[#6B6B60]">Overdue</p>
              </div>
            </div>
            <div className="pt-4 border-t border-[#E6E2D6]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#6B6B60]">Completion Rate</span>
                <span className="text-sm font-semibold text-[#2C2C2C]">{commitmentStats.rate}%</span>
              </div>
              <div className="w-full bg-[#F2F0E9] rounded-full h-4 overflow-hidden">
                <div
                  className="bg-[#4A6741] h-full rounded-full transition-all duration-500"
                  style={{ width: `${commitmentStats.rate}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[#6B6B60] text-center py-8">No commitments yet. Make commitments during coaching sessions to track them here!</p>
        )}
      </Card>
    </div>
  );
}
