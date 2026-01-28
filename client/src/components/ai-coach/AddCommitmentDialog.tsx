import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AddCommitmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddCommitmentDialog({
  open,
  onOpenChange,
}: AddCommitmentDialogProps) {
  const [action, setAction] = useState("");
  const [notes, setNotes] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);

  const utils = trpc.useUtils();

  const createCommitment = trpc.aiCoach.createCommitment.useMutation({
    onSuccess: () => {
      toast.success("Commitment added successfully!");
      utils.aiCoach.getCommitments.invalidate();
      handleClose();
    },
    onError: (error) => {
      toast.error(`Failed to add commitment: ${error.message}`);
    },
  });

  const handleClose = () => {
    setAction("");
    setNotes("");
    setDeadline(undefined);
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim()) {
      toast.error("Please enter a commitment");
      return;
    }

    createCommitment.mutate({
      action: action.trim(),
      notes: notes.trim() || undefined,
      deadline: deadline,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Commitment</DialogTitle>
          <DialogDescription>
            Manually log a commitment to track and hold yourself accountable.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="action">What will you do? *</Label>
              <Input
                id="action"
                placeholder="e.g., Have a 1-on-1 with Sarah about delegation"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any context or details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Deadline (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createCommitment.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createCommitment.isPending}>
              {createCommitment.isPending ? "Adding..." : "Add Commitment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
