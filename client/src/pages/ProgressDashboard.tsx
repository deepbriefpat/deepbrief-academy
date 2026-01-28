import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Target, CheckCircle, Calendar, BarChart3, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ProgressDashboard() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month");
  
  const { data: profile } = trpc.aiCoach.getProfile.useQuery();
  const { data: sessions } = trpc.aiCoach.getSessions.useQuery({ limit: 50 });
  const { data: goals } = trpc.aiCoach.getGoals.useQuery();
  const { data: commitments } = trpc.aiCoach.getCommitments.useQuery({});
  const { data: patterns } = trpc.aiCoach.analyzePatterns.useQuery();

  // Calculate statistics
  const totalSessions = sessions?.length || 0;
  const activeGoals = goals?.filter(g => g.status === "active").length || 0;
  const completedGoals = goals?.filter(g => g.status === "completed").length || 0;
  const goalCompletionRate = goals && goals.length > 0 
    ? Math.round((completedGoals / goals.length) * 100) 
    : 0;
  
  const completedCommitments = commitments?.filter(c => c.status === "completed").length || 0;
  const totalCommitments = commitments?.length || 0;
  const commitmentCompletionRate = totalCommitments > 0
    ? Math.round((completedCommitments / totalCommitments) * 100)
    : 0;

  // Session frequency data (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const sessionsByDate = sessions?.reduce((acc: Record<string, number>, session) => {
    const date = new Date(session.createdAt).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {}) || {};

  const sessionFrequencyData = last30Days.map(date => ({
    date,
    count: sessionsByDate[date] || 0,
  }));

  const maxSessions = Math.max(...sessionFrequencyData.map(d => d.count), 1);

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your Progress
          </h1>
          <p className="text-gray-400">
            Track your coaching journey, goals, and behavioral patterns
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {(["week", "month", "quarter", "year"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeRange === range
                  ? "bg-[#C4A962] text-[#0a1628]"
                  : "bg-[#1a2740] text-gray-300 hover:bg-[#2a3750]"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#1a2740] border-[#2a3750] p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Total Sessions</span>
              <Calendar className="w-5 h-5 text-[#C4A962]" />
            </div>
            <div className="text-3xl font-bold">{totalSessions}</div>
            <div className="text-sm text-gray-400 mt-1">
              {sessions && sessions.length > 1 && (
                <>Last session {new Date(sessions[0].createdAt).toLocaleDateString()}</>
              )}
            </div>
          </Card>

          <Card className="bg-[#1a2740] border-[#2a3750] p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Active Goals</span>
              <Target className="w-5 h-5 text-[#C4A962]" />
            </div>
            <div className="text-3xl font-bold">{activeGoals}</div>
            <div className="text-sm text-gray-400 mt-1">
              {completedGoals} completed
            </div>
          </Card>

          <Card className="bg-[#1a2740] border-[#2a3750] p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Goal Completion</span>
              <CheckCircle className="w-5 h-5 text-[#C4A962]" />
            </div>
            <div className="text-3xl font-bold">{goalCompletionRate}%</div>
            <Progress value={goalCompletionRate} className="mt-2" />
          </Card>

          <Card className="bg-[#1a2740] border-[#2a3750] p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Commitments</span>
              <TrendingUp className="w-5 h-5 text-[#C4A962]" />
            </div>
            <div className="text-3xl font-bold">{commitmentCompletionRate}%</div>
            <div className="text-sm text-gray-400 mt-1">
              {completedCommitments}/{totalCommitments} completed
            </div>
          </Card>
        </div>

        {/* Session Frequency Chart */}
        <Card className="bg-[#1a2740] border-[#2a3750] p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-[#C4A962]" />
            <h2 className="text-xl font-semibold">Session Frequency (Last 30 Days)</h2>
          </div>
          <div className="flex items-end gap-1 h-48">
            {sessionFrequencyData.map((data, idx) => {
              const height = (data.count / maxSessions) * 100;
              const isWeekend = new Date(data.date).getDay() % 6 === 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end group">
                  <div
                    className={`w-full rounded-t transition-all ${
                      data.count > 0 ? "bg-[#C4A962] hover:bg-[#d4b972]" : "bg-[#2a3750]"
                    }`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${data.date}: ${data.count} session${data.count !== 1 ? 's' : ''}`}
                  />
                  {(idx % 5 === 0 || isWeekend) && (
                    <div className="text-[10px] text-gray-500 mt-1 rotate-45 origin-left">
                      {new Date(data.date).getDate()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center text-sm text-gray-400 mt-4">
            Average: {(totalSessions / 30).toFixed(1)} sessions per day
          </div>
        </Card>

        {/* Goals Progress */}
        <Card className="bg-[#1a2740] border-[#2a3750] p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-[#C4A962]" />
            <h2 className="text-xl font-semibold">Goals Progress</h2>
          </div>
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.slice(0, 5).map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{goal.title}</span>
                    <span className="text-sm text-gray-400">{goal.progress || 0}%</span>
                  </div>
                  <Progress value={goal.progress || 0} className="h-2" />
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="capitalize">{goal.category}</span>
                    <span>•</span>
                    <span className="capitalize">{goal.status}</span>
                    {goal.targetDate && (
                      <>
                        <span>•</span>
                        <span>Due {new Date(goal.targetDate).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              No goals set yet. Start by creating your first goal!
            </div>
          )}
        </Card>

        {/* Behavioral Patterns */}
        <Card className="bg-[#1a2740] border-[#2a3750] p-6">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="w-5 h-5 text-[#C4A962]" />
            <h2 className="text-xl font-semibold">Behavioral Patterns</h2>
          </div>
          {patterns && patterns.length > 0 ? (
            <div className="space-y-4">
              {patterns.map((pattern, idx) => (
                <div key={idx} className="border-l-4 border-[#C4A962] pl-4 py-2">
                  <div className="font-medium mb-1">{pattern.patternType}</div>
                  <div className="text-sm text-gray-300 mb-2">{pattern.description}</div>
                  <div className="text-xs text-gray-400">
                    Frequency: {pattern.frequency} times
                  </div>
                  {pattern.examples && pattern.examples.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      Example: "{pattern.examples[0]}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              Not enough data yet. Patterns will appear after 3+ coaching sessions.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
