/**
 * Commitment Reminders Component
 * 
 * Displays in-app notifications for:
 * - Overdue commitments (past deadline, not completed)
 * - Upcoming commitments (due within 3 days)
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, Mail, X, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function CommitmentReminders() {
  const [dismissed, setDismissed] = useState<number[]>([]);
  
  const { data: reminders, isLoading } = trpc.aiCoach.getUpcomingReminders.useQuery();
  const sendReminderMutation = trpc.aiCoach.sendCommitmentReminder.useMutation({
    onSuccess: () => {
      toast.success("Reminder email sent!");
    },
    onError: (error) => {
      toast.error("Failed to send reminder", {
        description: error.message,
      });
    },
  });

  const utils = trpc.useUtils();
  const updateStatusMutation = trpc.aiCoach.updateCommitmentStatus.useMutation({
    onSuccess: () => {
      utils.aiCoach.getUpcomingReminders.invalidate();
      utils.aiCoach.getCommitments.invalidate();
      toast.success("Commitment updated!");
    },
  });

  if (isLoading || !reminders) return null;

  const visibleOverdue = reminders.overdue.filter(c => !dismissed.includes(c.id));
  const visibleUpcoming = reminders.upcoming.filter(c => !dismissed.includes(c.id));

  if (visibleOverdue.length === 0 && visibleUpcoming.length === 0) return null;

  const handleDismiss = (commitmentId: number) => {
    setDismissed([...dismissed, commitmentId]);
  };

  const handleMarkComplete = (commitmentId: number) => {
    updateStatusMutation.mutate({
      commitmentId,
      status: "completed",
      progress: 100,
    });
  };

  const formatDaysOverdue = (deadline: Date | string | null) => {
    if (!deadline) return "";
    const days = Math.ceil((Date.now() - new Date(deadline).getTime()) / (1000 * 60 * 60 * 24));
    return days === 1 ? "1 day" : `${days} days`;
  };

  const formatDaysUntil = (deadline: Date | string | null) => {
    if (!deadline) return "";
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
  };

  return (
    <div className="space-y-3">
      {/* Overdue Commitments */}
      {visibleOverdue.map((commitment) => (
        <Card key={commitment.id} className="bg-red-50 border-red-200">
          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                      Overdue
                    </span>
                    <span className="text-xs text-red-600">
                      {formatDaysOverdue(commitment.deadline)} ago
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {commitment.action}
                  </p>
                  {commitment.context && (
                    <p className="text-xs text-gray-600 mb-2">{commitment.context}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-red-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${commitment.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">
                      {commitment.progress}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkComplete(commitment.id)}
                  disabled={updateStatusMutation.isPending}
                  className="text-xs"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => sendReminderMutation.mutate({ commitmentId: commitment.id })}
                  disabled={sendReminderMutation.isPending}
                  className="text-xs"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </Button>
                <button
                  onClick={() => handleDismiss(commitment.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Upcoming Commitments */}
      {visibleUpcoming.map((commitment) => (
        <Card key={commitment.id} className="bg-amber-50 border-amber-200">
          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                      Due {formatDaysUntil(commitment.deadline)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {commitment.action}
                  </p>
                  {commitment.context && (
                    <p className="text-xs text-gray-600 mb-2">{commitment.context}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-amber-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${commitment.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 font-medium">
                      {commitment.progress}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkComplete(commitment.id)}
                  disabled={updateStatusMutation.isPending}
                  className="text-xs"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Complete
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => sendReminderMutation.mutate({ commitmentId: commitment.id })}
                  disabled={sendReminderMutation.isPending}
                  className="text-xs"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </Button>
                <button
                  onClick={() => handleDismiss(commitment.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
