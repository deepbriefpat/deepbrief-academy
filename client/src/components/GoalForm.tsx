import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GoalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (goal: {
    title: string;
    description: string;
    category: string;
    targetDate?: Date;
    milestones: string[];
  }) => void;
  initialData?: {
    title: string;
    description?: string;
    category: string;
    targetDate?: Date;
    milestones?: string[];
  };
  isLoading?: boolean;
}

export function GoalForm({ open, onClose, onSubmit, initialData, isLoading }: GoalFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("leadership");
  const [targetDate, setTargetDate] = useState("");
  const [milestones, setMilestones] = useState<string[]>([]);
  const [newMilestone, setNewMilestone] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setCategory(initialData.category);
      setTargetDate(initialData.targetDate ? initialData.targetDate.toISOString().split('T')[0] : "");
      setMilestones(initialData.milestones || []);
    } else {
      // Reset form when opening for new goal
      setTitle("");
      setDescription("");
      setCategory("leadership");
      setTargetDate("");
      setMilestones([]);
    }
  }, [initialData, open]);

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
      setMilestones([...milestones, newMilestone.trim()]);
      setNewMilestone("");
    }
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      milestones,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-[#2C2C2C]">
            {initialData ? "Edit Goal" : "Create New Goal"}
          </DialogTitle>
          <DialogDescription className="text-[#6B6B60]">
            Set a SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2C2C2C]">
              Goal Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Improve team delegation skills"
              className="border-[#E6E2D6]"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2C2C2C]">
              Category *
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-[#E6E2D6]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leadership">Leadership</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="decision_making">Decision Making</SelectItem>
                <SelectItem value="team_building">Team Building</SelectItem>
                <SelectItem value="personal_growth">Personal Growth</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2C2C2C]">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your goal in detail..."
              className="border-[#E6E2D6] min-h-[100px]"
            />
          </div>

          {/* Target Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2C2C2C]">
              Target Date
            </label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="border-[#E6E2D6]"
            />
          </div>

          {/* Milestones */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#2C2C2C]">
              Milestones
            </label>
            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-2 bg-[#F2F0E9] rounded-lg p-3">
                  <span className="flex-1 text-sm text-[#2C2C2C]">{milestone}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(index)}
                    className="text-[#D97757] hover:text-[#D97757]/80 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMilestone())}
                  placeholder="Add a milestone..."
                  className="border-[#E6E2D6]"
                />
                <Button
                  type="button"
                  onClick={handleAddMilestone}
                  className="bg-[#4A6741] hover:bg-[#4A6741]/90 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#E6E2D6] text-[#6B6B60] hover:bg-[#F2F0E9]"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#4A6741] hover:bg-[#4A6741]/90 text-white"
              disabled={isLoading || !title.trim()}
            >
              {isLoading ? "Saving..." : initialData ? "Update Goal" : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
