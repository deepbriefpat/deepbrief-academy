/**
 * My Commitments Widget
 * 
 * Dashboard widget showing upcoming commitments with deadlines
 * Provides quick-complete actions and deadline tracking
 */

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, ChevronRight } from "lucide-react";
import { Link } from "wouter";

export function MyCommitments() {
  const utils = trpc.useUtils();
  const { data: commitments, isLoading } = trpc.aiCoach.getCommitments.useQuery({
    status: "pending",
  });
  
  const updateStatus = trpc.aiCoach.updateCommitmentStatus.useMutation({
    onSuccess: () => {
      utils.aiCoach.getCommitments.invalidate();
    },
  });
  
  if (isLoading) {
    return (
      <Card className="p-6 bg-navy-800/50 border-gold-400/20">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-400"></div>
        </div>
      </Card>
    );
  }
  
  if (!commitments || commitments.length === 0) {
    return (
      <Card className="p-6 bg-navy-800/50 border-gold-400/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">My Commitments</h3>
        </div>
        <div className="text-center py-8">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            No open commitments. Start a coaching session to set new goals!
          </p>
        </div>
      </Card>
    );
  }
  
  // Separate by urgency
  const now = new Date();
  const overdue = commitments.filter(c => 
    c.deadline && new Date(c.deadline) < now
  );
  const upcoming = commitments.filter(c => 
    !c.deadline || new Date(c.deadline) >= now
  ).slice(0, 5); // Show max 5 upcoming
  
  const getDaysInfo = (deadline: Date | null) => {
    if (!deadline) return null;
    
    const daysUntil = Math.ceil((new Date(deadline).getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    
    if (daysUntil < 0) {
      return {
        text: `${Math.abs(daysUntil)}d overdue`,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        icon: AlertCircle,
      };
    } else if (daysUntil === 0) {
      return {
        text: "Due today",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        icon: Clock,
      };
    } else if (daysUntil <= 3) {
      return {
        text: `${daysUntil}d left`,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        icon: Clock,
      };
    } else {
      return {
        text: `${daysUntil}d left`,
        color: "text-gray-400",
        bgColor: "bg-gray-500/10",
        icon: Clock,
      };
    }
  };
  
  const displayCommitments = [...overdue, ...upcoming].slice(0, 5);
  
  return (
    <Card className="p-6 bg-navy-800/50 border-gold-400/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">My Commitments</h3>
        <Link href="/ai-coach/dashboard">
          <Button variant="ghost" size="sm" className="text-gold-400 hover:text-gold-300">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>
      
      {overdue.length > 0 && (
        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-400 text-sm font-medium">
              {overdue.length} overdue commitment{overdue.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {displayCommitments.map((commitment) => {
          const daysInfo = getDaysInfo(commitment.deadline);
          const Icon = daysInfo?.icon || Clock;
          const currentProgress = commitment.progress || 0;
          
          return (
            <div
              key={commitment.id}
              className="p-4 bg-navy-900/50 border border-gold-400/10 rounded-lg hover:border-gold-400/30 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-white text-sm font-medium flex-1">
                    {commitment.action}
                  </p>
                  {currentProgress === 100 && (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  )}
                </div>
                
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400">Progress</span>
                    <span className="text-xs font-medium text-gray-300">{currentProgress}%</span>
                  </div>
                  <div className="h-2 bg-navy-900 rounded-full overflow-hidden border border-gold-400/20">
                    <div 
                      className="h-full bg-gradient-to-r from-gold-400 to-gold-500 transition-all duration-300"
                      style={{ width: `${currentProgress}%` }}
                    />
                  </div>
                </div>
                
                {/* Deadline Info */}
                {daysInfo && (
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${daysInfo.bgColor} ${daysInfo.color}`}>
                      <Icon className="w-3 h-3" />
                      {daysInfo.text}
                    </span>
                  </div>
                )}
                
                {/* Progress Update Buttons */}
                {currentProgress < 100 && (
                  <div className="flex gap-2 flex-wrap">
                    {[25, 50, 75, 100].filter(p => p > currentProgress).map((progress) => (
                      <Button
                        key={progress}
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus.mutateAsync({ 
                          commitmentId: commitment.id, 
                          progress, 
                          status: progress === 100 ? "completed" : "in_progress" 
                        })}
                        disabled={updateStatus.isPending}
                        className="text-xs px-3 py-1 h-auto bg-gold-400/10 border-gold-400/30 text-gold-400 hover:bg-gold-400/20 hover:text-gold-300"
                      >
                        {progress === 100 ? 'Complete' : `${progress}%`}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {commitments.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gold-400/10">
          <Link href="/ai-coach/dashboard">
            <Button variant="outline" className="w-full text-gold-400 border-gold-400/30 hover:bg-gold-400/10">
              View {commitments.length - 5} More Commitment{commitments.length - 5 > 1 ? 's' : ''}
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
