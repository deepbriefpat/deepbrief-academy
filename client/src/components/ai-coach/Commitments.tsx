/**
 * Commitments Component
 * 
 * Clean, focused view of commitments extracted from coaching sessions.
 * Commitments are promises to yourself - not tasks. The UX reflects that.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { 
  CheckCircle2, Circle, Clock, AlertTriangle, 
  MessageSquare, MoreHorizontal, Trash2, Calendar,
  ChevronDown, ChevronUp, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarExportButton } from "@/components/CalendarExportButton";

interface Commitment {
  id: number;
  action: string;
  status: string;
  deadline?: Date | null;
  createdAt: Date;
  sessionId?: number | null;
  progress?: number | null;
  followUpCount?: number | null;
}

interface CommitmentsProps {
  onDiscussWithCoach?: (context: string) => void;
}

export function Commitments({ onDiscussWithCoach }: CommitmentsProps) {
  const utils = trpc.useUtils();
  const { data: commitments, isLoading } = trpc.aiCoach.getCommitments.useQuery({});
  const [showCompleted, setShowCompleted] = useState(false);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [completionNote, setCompletionNote] = useState("");
  
  const updateStatus = trpc.aiCoach.updateCommitmentStatus.useMutation({
    onSuccess: () => {
      utils.aiCoach.getCommitments.invalidate();
    },
  });

  const handleDelete = async (id: number) => {
    if (confirm("Remove this commitment?")) {
      await updateStatus.mutateAsync({ 
        commitmentId: id, 
        status: "missed" 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A6741]"></div>
      </div>
    );
  }

  // Separate by status
  const openCommitments = (commitments || []).filter(c => 
    c.status === 'open' || c.status === 'pending' || c.status === 'in_progress'
  );
  const completedCommitments = (commitments || []).filter(c => 
    c.status === 'completed'
  );
  // Note: 'abandoned' and 'missed' are filtered out - they don't show

  // Further separate open by urgency
  const now = new Date();
  const overdue = openCommitments.filter(c => 
    c.deadline && new Date(c.deadline) < now
  );
  const dueToday = openCommitments.filter(c => {
    if (!c.deadline) return false;
    const deadline = new Date(c.deadline);
    return deadline.toDateString() === now.toDateString();
  });
  const upcoming = openCommitments.filter(c => {
    if (!c.deadline) return true;
    const deadline = new Date(c.deadline);
    return deadline > now && deadline.toDateString() !== now.toDateString();
  });

  const getTimeLabel = (deadline: Date | null, createdAt: Date) => {
    if (!deadline) {
      const daysAgo = Math.floor((now.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysAgo === 0) return "Made today";
      if (daysAgo === 1) return "Made yesterday";
      return `Made ${daysAgo} days ago`;
    }
    
    const daysUntil = Math.ceil((new Date(deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) return `${Math.abs(daysUntil)}d overdue`;
    if (daysUntil === 0) return "Due today";
    if (daysUntil === 1) return "Due tomorrow";
    if (daysUntil <= 7) return `Due in ${daysUntil} days`;
    return `Due ${new Date(deadline).toLocaleDateString()}`;
  };

  const handleComplete = async (id: number) => {
    await updateStatus.mutateAsync({
      commitmentId: id,
      status: "completed",
      progress: 100,
      closedNote: completionNote || undefined,
    });
    setCompletingId(null);
    setCompletionNote("");
  };

  // Empty state
  if (openCommitments.length === 0 && completedCommitments.length === 0) {
    return (
      <div className="text-center py-16 px-8">
        <div className="w-20 h-20 rounded-full bg-[#F2F0E9] flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-[#4A6741]" />
        </div>
        <h2 className="text-2xl font-semibold text-[#2C2C2C] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          No commitments yet
        </h2>
        <p className="text-[#6B6B60] mb-6 max-w-md mx-auto">
          Commitments are captured automatically during coaching sessions. 
          Start a session and make some promises to yourself.
        </p>
        {onDiscussWithCoach && (
          <Button
            onClick={() => onDiscussWithCoach("I want to set some commitments for myself")}
            className="bg-[#4A6741] hover:bg-[#3d5636] text-white"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Start a Session
          </Button>
        )}
      </div>
    );
  }

  const renderCommitment = (commitment: any, isOverdue = false) => {
    const timeLabel = getTimeLabel(commitment.deadline || null, commitment.createdAt);
    
    return (
      <div 
        key={commitment.id}
        className={cn(
          "group flex items-start gap-4 p-4 rounded-xl border transition-all",
          isOverdue 
            ? "bg-red-50 border-red-200 hover:border-red-300" 
            : "bg-white border-[#E6E2D6] hover:border-[#4A6741]/30"
        )}
      >
        {/* Checkbox */}
        <button
          onClick={() => setCompletingId(commitment.id)}
          className={cn(
            "mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
            isOverdue
              ? "border-red-300 hover:border-red-500 hover:bg-red-100"
              : "border-[#E6E2D6] hover:border-[#4A6741] hover:bg-[#4A6741]/10"
          )}
        >
          <CheckCircle2 className={cn(
            "w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity",
            isOverdue ? "text-red-500" : "text-[#4A6741]"
          )} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium mb-1",
            isOverdue ? "text-red-900" : "text-[#2C2C2C]"
          )}>
            {commitment.action}
          </p>
          <div className="flex items-center gap-3 text-sm mb-2">
            <span className={cn(
              "flex items-center gap-1",
              isOverdue ? "text-red-600" : "text-[#6B6B60]"
            )}>
              {isOverdue ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              {timeLabel}
            </span>
            {commitment.followUpCount && commitment.followUpCount > 0 && (
              <span className="text-[#6B6B60]">
                • Discussed {commitment.followUpCount}x
              </span>
            )}
          </div>
          {commitment.deadline && (
            <CalendarExportButton
              commitment={{
                action: commitment.action,
                deadline: new Date(commitment.deadline),
                context: null
              }}
              size="sm"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onDiscussWithCoach && (
            <button
              onClick={() => onDiscussWithCoach(`Let's discuss my commitment: "${commitment.action}"`)}
              className="p-2 hover:bg-[#F2F0E9] rounded-lg transition-colors"
              title="Discuss with coach"
            >
              <MessageSquare className="w-4 h-4 text-[#6B6B60]" />
            </button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-[#F2F0E9] rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4 text-[#6B6B60]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setCompletingId(commitment.id)}>
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                Mark complete
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDelete(commitment.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overdue Section */}
      {overdue.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-red-900">
              Overdue ({overdue.length})
            </h3>
          </div>
          <div className="space-y-2">
            {overdue.map(c => renderCommitment(c, true))}
          </div>
          <p className="text-sm text-red-600 mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
            These slipped past their deadline. Complete them, or let them go — 
            carrying open loops creates mental drag.
          </p>
        </div>
      )}

      {/* Due Today */}
      {dueToday.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-[#2C2C2C]">
              Due Today ({dueToday.length})
            </h3>
          </div>
          <div className="space-y-2">
            {dueToday.map(c => renderCommitment(c))}
          </div>
        </div>
      )}

      {/* Open Commitments */}
      {upcoming.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Circle className="w-5 h-5 text-[#4A6741]" />
            <h3 className="font-semibold text-[#2C2C2C]">
              Open ({upcoming.length})
            </h3>
          </div>
          <div className="space-y-2">
            {upcoming.map(c => renderCommitment(c))}
          </div>
        </div>
      )}

      {/* Completed Section - Collapsible */}
      {completedCommitments.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-[#6B6B60] hover:text-[#2C2C2C] transition-colors"
          >
            {showCompleted ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {completedCommitments.length} completed
            </span>
          </button>
          
          {showCompleted && (
            <div className="mt-3 space-y-2">
              {completedCommitments.slice(0, 10).map(commitment => (
                <div 
                  key={commitment.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-[#F2F0E9]/50 border border-[#E6E2D6]"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[#6B6B60] line-through">
                      {commitment.action}
                    </p>
                  </div>
                </div>
              ))}
              {completedCommitments.length > 10 && (
                <p className="text-sm text-[#6B6B60] text-center py-2">
                  + {completedCommitments.length - 10} more completed
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Completion Dialog */}
      <Dialog open={completingId !== null} onOpenChange={() => setCompletingId(null)}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#2C2C2C] flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              Nice work!
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-[#6B6B60] mb-4">
              Want to note what happened? (This helps the coach understand your patterns.)
            </p>
            <Textarea
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="Optional: What did you learn? What made it happen?"
              className="border-[#E6E2D6] min-h-[80px]"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setCompletingId(null);
                setCompletionNote("");
              }}
              className="flex-1 border-[#E6E2D6]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => completingId && handleComplete(completingId)}
              disabled={updateStatus.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {updateStatus.isPending ? "Saving..." : "Mark Complete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Empty Open State (but has completed) */}
      {openCommitments.length === 0 && completedCommitments.length > 0 && (
        <div className="text-center py-8 px-6 bg-green-50 rounded-xl border border-green-100">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-green-900 mb-1">All caught up</h3>
          <p className="text-green-700 text-sm">
            No open commitments. Ready to take on something new?
          </p>
        </div>
      )}
    </div>
  );
}
