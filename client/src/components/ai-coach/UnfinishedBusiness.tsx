/**
 * Unfinished Business Component
 * 
 * Displays open commitments with relentless accountability
 * Shows overdue items, allows status updates, and surfaces patterns
 */

// @ts-nocheck
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, CheckCircle2, Clock, XCircle, Plus } from "lucide-react";
import { AddCommitmentDialog } from "./AddCommitmentDialog";

export function UnfinishedBusiness() {
  const utils = trpc.useUtils();
  const { data: commitments, isLoading } = trpc.aiCoach.getCommitments.useQuery({});
  
  const updateStatus = trpc.aiCoach.updateCommitmentStatus.useMutation({
    onSuccess: () => {
      utils.aiCoach.getCommitments.invalidate();
    },
  });
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [closedNote, setClosedNote] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-400"></div>
      </div>
    );
  }
  
  if (!commitments || commitments.length === 0) {
    return (
      <Card className="p-8 text-center bg-navy-800/50 border-gold-400/20">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Open Commitments</h3>
        <p className="text-gray-400">
          You've closed all your loops. Ready to make new commitments in your next session?
        </p>
      </Card>
    );
  }
  
  // Separate commitments by status
  const openCommitments = commitments.filter(c => 
    c.status === 'open' || c.status === 'pending' || c.status === 'in_progress'
  );
  
  const overdueCommitments = openCommitments.filter(c => {
    if (!c.deadline) return false;
    return new Date(c.deadline) < new Date();
  });
  
  const upcomingCommitments = openCommitments.filter(c => {
    if (!c.deadline) return true; // No deadline = not overdue
    return new Date(c.deadline) >= new Date();
  });
  
  const handleStatusChange = async (
    commitmentId: number,
    newStatus: "completed" | "missed" | "abandoned"
  ) => {
    if (newStatus === "completed" || newStatus === "abandoned") {
      setEditingId(commitmentId);
    } else {
      await updateStatus.mutateAsync({
        commitmentId,
        status: newStatus,
      });
    }
  };
  
  const handleSaveWithNote = async (commitmentId: number, status: "completed" | "missed") => {
    await updateStatus.mutateAsync({
      commitmentId,
      status,
      closedNote: closedNote || undefined,
    });
    setEditingId(null);
    setClosedNote("");
  };
  
  const getDaysInfo = (deadline: Date | null, createdAt: Date) => {
    const now = new Date();
    
    if (deadline) {
      const daysUntil = Math.ceil((new Date(deadline).getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      if (daysUntil < 0) {
        return {
          text: `${Math.abs(daysUntil)} days overdue`,
          color: "text-red-500",
          icon: AlertCircle,
        };
      } else if (daysUntil === 0) {
        return {
          text: "Due today",
          color: "text-orange-500",
          icon: Clock,
        };
      } else if (daysUntil <= 3) {
        return {
          text: `Due in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
          color: "text-yellow-500",
          icon: Clock,
        };
      } else {
        return {
          text: `Due ${new Date(deadline).toLocaleDateString()}`,
          color: "text-gray-400",
          icon: Clock,
        };
      }
    }
    
    // No deadline - show how long it's been open
    const daysOpen = Math.floor((now.getTime() - new Date(createdAt).getTime()) / (24 * 60 * 60 * 1000));
    return {
      text: `Open for ${daysOpen} day${daysOpen !== 1 ? 's' : ''}`,
      color: "text-gray-400",
      icon: Clock,
    };
  };
  
  const renderCommitment = (commitment: any) => {
    const daysInfo = getDaysInfo(commitment.deadline, commitment.createdAt);
    const Icon = daysInfo.icon;
    const isEditing = editingId === commitment.id;
    
    return (
      <Card key={commitment.id} className="p-4 bg-navy-800/50 border-gold-400/20 hover:border-gold-400/40 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-white font-medium mb-2">{commitment.action}</p>
            <div className="flex items-center gap-2 text-sm mb-3">
              <Icon className={`w-4 h-4 ${daysInfo.color}`} />
              <span className={daysInfo.color}>{daysInfo.text}</span>
              {commitment.followUpCount > 0 && (
                <span className="text-gray-500">
                  • Followed up {commitment.followUpCount} time{commitment.followUpCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-medium">{commitment.progress || 0}%</span>
              </div>
              <Slider
                value={[commitment.progress || 0]}
                onValueChange={([value]) => {
                  updateStatus.mutate({
                    commitmentId: commitment.id,
                    progress: value,
                  });
                }}
                max={100}
                step={5}
                className="cursor-pointer"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2 min-w-[140px]">
            {!isEditing ? (
              <Select
                value={commitment.status || ""}
                onValueChange={(value) => handleStatusChange(commitment.id, value as any)}
              >
                <SelectTrigger className="bg-navy-900 border-gold-400/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">✅ Completed</SelectItem>
                  <SelectItem value="missed">❌ Missed</SelectItem>
                  <SelectItem value="abandoned">🗑️ Abandon</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2">
                <Textarea
                  placeholder="What happened? (optional)"
                  value={closedNote}
                  onChange={(e) => setClosedNote(e.target.value)}
                  className="bg-navy-900 border-gold-400/30 text-white text-sm"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSaveWithNote(commitment.id, editingId === commitment.id ? "completed" : "abandoned")}
                    className="flex-1 bg-gold-500 hover:bg-gold-600 text-navy-900"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setClosedNote("");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };
  
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Unfinished Business</h2>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gold text-navy-deep hover:bg-gold-bright"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Commitment
        </Button>
      </div>
      
      <div className="space-y-6">
      {/* Overdue Section - HIGHEST PRIORITY */}
      {overdueCommitments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-white">
              Overdue ({overdueCommitments.length})
            </h3>
          </div>
          <div className="space-y-3">
            {overdueCommitments.map(renderCommitment)}
          </div>
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">
              <strong>These deadlines passed.</strong> Either mark them complete, missed, or abandon them. 
              Leaving commitments open creates mental clutter and erodes self-trust.
            </p>
          </div>
        </div>
      )}
      
      {/* Upcoming/No Deadline Section */}
      {upcomingCommitments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gold-400" />
            <h3 className="text-lg font-semibold text-white">
              Open Commitments ({upcomingCommitments.length})
            </h3>
          </div>
          <div className="space-y-3">
            {upcomingCommitments.map(renderCommitment)}
          </div>
        </div>
      )}
      
      {/* Accountability Message */}
      <Card className="p-6 bg-gold-500/10 border-gold-400/30">
        <h4 className="text-gold-400 font-semibold mb-2">Accountability Check</h4>
        <p className="text-gray-300 text-sm">
          Every open commitment is a promise you made to yourself. The coach remembers all of them. 
          Which ones are you actually going to do? Which ones should you let go?
        </p>
      </Card>
      </div>
      
      <AddCommitmentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </>
  );
}
