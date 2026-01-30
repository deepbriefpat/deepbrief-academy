/**
 * Progress Milestones Component
 * 
 * Shows achievements, streaks, and milestones to encourage engagement
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Flame, 
  Award, 
  Target,
  CheckCircle2,
  Calendar,
  TrendingUp,
  Star,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  achieved: boolean;
  progress?: number; // 0-100
  achievedDate?: Date;
}

interface ProgressMilestonesProps {
  totalSessions: number;
  completedCommitments: number;
  totalCommitments: number;
  currentStreak: number; // weeks
  goalsCompleted: number;
}

export function ProgressMilestones({
  totalSessions,
  completedCommitments,
  totalCommitments,
  currentStreak,
  goalsCompleted
}: ProgressMilestonesProps) {
  const commitmentRate = totalCommitments > 0 
    ? Math.round((completedCommitments / totalCommitments) * 100) 
    : 0;

  // Define milestones
  const milestones: Milestone[] = [
    {
      id: "first-session",
      title: "First Session",
      description: "Completed your first coaching session",
      icon: <Star className="w-5 h-5" />,
      achieved: totalSessions >= 1,
      progress: Math.min(totalSessions, 1) * 100
    },
    {
      id: "five-sessions",
      title: "Finding Your Rhythm",
      description: "Completed 5 coaching sessions",
      icon: <Zap className="w-5 h-5" />,
      achieved: totalSessions >= 5,
      progress: Math.min(totalSessions / 5, 1) * 100
    },
    {
      id: "ten-sessions",
      title: "Committed Coach",
      description: "Completed 10 coaching sessions",
      icon: <Award className="w-5 h-5" />,
      achieved: totalSessions >= 10,
      progress: Math.min(totalSessions / 10, 1) * 100
    },
    {
      id: "first-commitment",
      title: "Action Taker",
      description: "Completed your first commitment",
      icon: <CheckCircle2 className="w-5 h-5" />,
      achieved: completedCommitments >= 1,
      progress: Math.min(completedCommitments, 1) * 100
    },
    {
      id: "ten-commitments",
      title: "Follow Through",
      description: "Completed 10 commitments",
      icon: <Target className="w-5 h-5" />,
      achieved: completedCommitments >= 10,
      progress: Math.min(completedCommitments / 10, 1) * 100
    },
    {
      id: "high-completion",
      title: "Reliable",
      description: "Maintained 80%+ commitment completion rate",
      icon: <TrendingUp className="w-5 h-5" />,
      achieved: commitmentRate >= 80 && totalCommitments >= 5,
      progress: totalCommitments >= 5 ? Math.min(commitmentRate / 80, 1) * 100 : 0
    },
    {
      id: "two-week-streak",
      title: "Building Momentum",
      description: "2 week coaching streak",
      icon: <Flame className="w-5 h-5" />,
      achieved: currentStreak >= 2,
      progress: Math.min(currentStreak / 2, 1) * 100
    },
    {
      id: "four-week-streak",
      title: "On Fire",
      description: "4 week coaching streak",
      icon: <Flame className="w-5 h-5" />,
      achieved: currentStreak >= 4,
      progress: Math.min(currentStreak / 4, 1) * 100
    },
    {
      id: "first-goal",
      title: "Goal Achiever",
      description: "Completed your first goal",
      icon: <Target className="w-5 h-5" />,
      achieved: goalsCompleted >= 1,
      progress: Math.min(goalsCompleted, 1) * 100
    }
  ];

  const achievedMilestones = milestones.filter(m => m.achieved);
  const upcomingMilestones = milestones.filter(m => !m.achieved && (m.progress || 0) > 0);
  const lockedMilestones = milestones.filter(m => !m.achieved && (m.progress || 0) === 0);

  return (
    <div className="space-y-6">
      {/* Current Streak Banner */}
      {currentStreak >= 2 && (
        <Card className="p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-white/20">
              <Flame className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{currentStreak} Week Streak! 🔥</h3>
              <p className="text-white/80 text-sm">
                You've been consistent for {currentStreak} weeks. Keep it going!
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Achieved Milestones */}
      {achievedMilestones.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Achieved ({achievedMilestones.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {achievedMilestones.map(milestone => (
              <Card 
                key={milestone.id} 
                className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-2 rounded-full bg-amber-100 text-amber-600 mb-2">
                    {milestone.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">{milestone.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{milestone.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Milestones */}
      {upcomingMilestones.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            In Progress
          </h3>
          <div className="space-y-3">
            {upcomingMilestones.slice(0, 3).map(milestone => (
              <Card key={milestone.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-gray-100 text-gray-400">
                    {milestone.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">{milestone.title}</h4>
                      <span className="text-xs text-gray-500">{Math.round(milestone.progress || 0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{milestone.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <Card className="p-4 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
            <p className="text-xs text-gray-500">Sessions</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{completedCommitments}</p>
            <p className="text-xs text-gray-500">Commitments</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{goalsCompleted}</p>
            <p className="text-xs text-gray-500">Goals Done</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
