import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

interface CommitmentProgressModalProps {
  commitment: {
    id: number;
    name: string;
    description: string | null;
    deadline: string | null;
    status: string;
    progress: number;
    priority: string;
    notes: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function CommitmentProgressModal({
  commitment,
  open,
  onOpenChange,
  onUpdate,
}: CommitmentProgressModalProps) {
  const [progress, setProgress] = useState(commitment.progress);
  const [status, setStatus] = useState(commitment.status);
  const [notes, setNotes] = useState(commitment.notes || "");

  const updateMutation = trpc.aiCoach.updateCommitmentProgress.useMutation();
  const historyQuery = trpc.aiCoach.getCommitmentProgressHistory.useQuery(
    { commitmentId: commitment.id },
    { enabled: open }
  );

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        commitmentId: commitment.id,
        progress,
        status: status as "pending" | "in_progress" | "completed" | "missed",
        progressNote: notes || undefined,
      });
      toast.success("Progress updated successfully");
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "completed":
        return "text-green-600";
      case "in_progress":
        return "text-blue-600";
      case "missed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Track Progress: {commitment.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          {commitment.description && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-sm">{commitment.description}</p>
            </div>
          )}

          {/* Deadline */}
          {commitment.deadline && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Deadline:</span>
              <span className="font-medium">
                {new Date(commitment.deadline).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}

          {/* Progress Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Progress</label>
              <span className="text-2xl font-bold text-primary">{progress}%</span>
            </div>
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Not Started</span>
              <span>In Progress</span>
              <span>Complete</span>
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Progress Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about your progress, challenges, or next steps..."
              className="min-h-[100px]"
            />
          </div>

          {/* Progress History */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress History
            </h3>
            {historyQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : historyQuery.data && historyQuery.data.length > 0 ? (
              <div className="space-y-3 max-h-[200px] overflow-y-auto">
                {historyQuery.data.map((entry: any) => (
                  <div
                    key={entry.id}
                    className="flex gap-3 p-3 bg-muted/50 rounded-lg text-sm"
                  >
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{entry.progress}% complete</span>
                        <span className={`text-xs font-medium ${getStatusColor(entry.status)}`}>
                          {entry.status}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-muted-foreground">{entry.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No progress updates yet. Save your first update to start tracking!
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Progress
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
