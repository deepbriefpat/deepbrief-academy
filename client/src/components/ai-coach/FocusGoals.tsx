import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { 
  Target, Plus, ChevronRight, CheckCircle2, Circle,
  Calendar, MoreHorizontal, Pencil, Trash2, Star, Clock,
  MessageSquare, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { cn } from "@/lib/utils";
import { CalendarExportButton } from "@/components/CalendarExportButton";

interface Goal {
  id: number;
  title: string;
  description?: string;
  category: string;
  progress: number;
  targetDate?: Date;
  milestones?: string[];
  isFocus?: boolean;
}

interface FocusGoalsProps {
  goals: Goal[];
  onCreateGoal: (goal: { title: string; description: string; targetDate?: Date }) => void;
  onUpdateGoal: (goalId: number, updates: Partial<Goal>) => void;
  onDeleteGoal: (goalId: number) => void;
  onUpdateProgress: (goalId: number, progress: number) => void;
  onStartSession?: (goalContext: string) => void;
}

export function FocusGoals({ 
  goals, 
  onCreateGoal, 
  onUpdateGoal, 
  onDeleteGoal, 
  onUpdateProgress,
  onStartSession 
}: FocusGoalsProps) {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("");
  const [progressNote, setProgressNote] = useState("");
  const [showProgressFor, setShowProgressFor] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { value: "leadership", label: "Leadership", emoji: "👑" },
    { value: "communication", label: "Communication", emoji: "💬" },
    { value: "decision_making", label: "Decision Making", emoji: "🎯" },
    { value: "team_building", label: "Team Building", emoji: "🤝" },
    { value: "personal_growth", label: "Personal Growth", emoji: "🌱" },
  ];

  // Filter goals by category if selected
  const filteredGoals = selectedCategory 
    ? goals.filter(g => g.category === selectedCategory)
    : goals;

  // Find the focus goal (marked as focus, or the first one)
  const focusGoal = filteredGoals.find(g => g.isFocus) || filteredGoals[0];
  const otherGoals = filteredGoals.filter(g => g.id !== focusGoal?.id);

  const handleCreateGoal = () => {
    if (!newGoalTitle.trim()) return;
    onCreateGoal({
      title: newGoalTitle.trim(),
      description: newGoalDescription.trim(),
      targetDate: newGoalDate ? new Date(newGoalDate) : undefined,
    });
    setNewGoalTitle("");
    setNewGoalDescription("");
    setNewGoalDate("");
    setShowAddGoal(false);
  };

  const handleSetFocus = (goalId: number) => {
    // Unfocus all, then focus this one
    goals.forEach(g => {
      if (g.isFocus) onUpdateGoal(g.id, { isFocus: false });
    });
    onUpdateGoal(goalId, { isFocus: true });
  };

  const handleQuickProgress = (goalId: number, milestone: "started" | "halfway" | "almost" | "done") => {
    const progressMap = { started: 25, halfway: 50, almost: 75, done: 100 };
    onUpdateProgress(goalId, progressMap[milestone]);
    setShowProgressFor(null);
  };

  const getTimeRemaining = (date: Date) => {
    const now = new Date();
    const target = new Date(date);
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "Overdue";
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    if (days <= 7) return `${days} days left`;
    if (days <= 30) return `${Math.ceil(days / 7)} weeks left`;
    return `${Math.ceil(days / 30)} months left`;
  };

  // Empty state
  if (goals.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-16 px-8">
          <div className="w-20 h-20 rounded-full bg-[#F2F0E9] flex items-center justify-center mx-auto mb-6">
            <Target className="w-10 h-10 text-[#4A6741]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#2C2C2C] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            What are you working toward?
          </h2>
          <p className="text-[#6B6B60] mb-8 max-w-md mx-auto">
            Set one clear goal. The coach will help you think through obstacles 
            and keep you accountable.
          </p>
          <Button
            onClick={() => setShowAddGoal(true)}
            className="bg-[#4A6741] hover:bg-[#3d5636] text-white px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Set Your First Goal
          </Button>
        </div>

        {/* Add Goal Dialog */}
        <AddGoalDialog
          open={showAddGoal}
          onClose={() => setShowAddGoal(false)}
          title={newGoalTitle}
          setTitle={setNewGoalTitle}
          description={newGoalDescription}
          setDescription={setNewGoalDescription}
          date={newGoalDate}
          setDate={setNewGoalDate}
          onSubmit={handleCreateGoal}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Category Filter */}
      {goals.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              !selectedCategory
                ? "bg-[#4A6741] text-white"
                : "bg-[#F2F0E9] text-[#6B6B60] hover:bg-[#E6E2D6]"
            )}
          >
            All Goals ({goals.length})
          </button>
          {categories.map((cat) => {
            const count = goals.filter(g => g.category === cat.value).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  selectedCategory === cat.value
                    ? "bg-[#4A6741] text-white"
                    : "bg-[#F2F0E9] text-[#6B6B60] hover:bg-[#E6E2D6]"
                )}
              >
                {cat.emoji} {cat.label} ({count})
              </button>
            );
          })}
        </div>
      )}
      {/* Focus Goal - Prominent Display */}
      {focusGoal && (
        <div className="bg-white rounded-2xl border-2 border-[#4A6741]/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#4A6741]/5 to-transparent px-6 py-4 border-b border-[#E6E2D6]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                <span className="text-sm font-medium text-[#4A6741]">Current Focus</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 hover:bg-[#F2F0E9] rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4 text-[#6B6B60]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingGoal(focusGoal)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit goal
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDeleteGoal(focusGoal.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete goal
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-[#2C2C2C] mb-2">
              {focusGoal.title}
            </h3>
            {focusGoal.description && (
              <p className="text-[#6B6B60] text-sm mb-4">{focusGoal.description}</p>
            )}

            {/* Progress Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#6B6B60]">Progress</span>
                <span className="text-sm font-medium text-[#4A6741]">{focusGoal.progress || 0}%</span>
              </div>
              
              {/* Clickable Progress Bar */}
              <div 
                className="relative h-3 bg-[#F2F0E9] rounded-full cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const progress = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                  onUpdateProgress(focusGoal.id, Math.min(100, Math.max(0, progress)));
                }}
              >
                <div 
                  className="absolute inset-y-0 left-0 bg-[#4A6741] rounded-full transition-all"
                  style={{ width: `${focusGoal.progress || 0}%` }}
                />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-y-0 left-1/4 w-px bg-[#4A6741]/20" />
                  <div className="absolute inset-y-0 left-1/2 w-px bg-[#4A6741]/20" />
                  <div className="absolute inset-y-0 left-3/4 w-px bg-[#4A6741]/20" />
                </div>
              </div>
              <p className="text-xs text-[#6B6B60] mt-1">Click anywhere on the bar to update</p>
            </div>

            {/* Quick Progress Buttons */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { label: "Just started", value: 25, icon: "🌱" },
                { label: "Halfway there", value: 50, icon: "⚡" },
                { label: "Almost done", value: 75, icon: "🔥" },
                { label: "Complete!", value: 100, icon: "✅" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onUpdateProgress(focusGoal.id, option.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm transition-all",
                    focusGoal.progress === option.value
                      ? "bg-[#4A6741] text-white"
                      : "bg-[#F2F0E9] text-[#6B6B60] hover:bg-[#E6E2D6]"
                  )}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>

            {/* Target Date & Calendar */}
            <div className="space-y-2 mb-4">
              {focusGoal.targetDate && (
                <div className="flex items-center gap-2 text-sm text-[#6B6B60]">
                  <Clock className="w-4 h-4" />
                  <span>{getTimeRemaining(new Date(focusGoal.targetDate))}</span>
                  <span className="text-[#E6E2D6]">•</span>
                  <span>Target: {new Date(focusGoal.targetDate).toLocaleDateString()}</span>
                </div>
              )}
              <CalendarExportButton
                title={focusGoal.title}
                description={focusGoal.description || ""}
                startDate={focusGoal.targetDate ? new Date(focusGoal.targetDate) : undefined}
                location="AI Executive Coach"
                onRequestSetDate={() => setEditingGoal(focusGoal)}
              />
            </div>

            {/* Milestones as Checklist */}
            {focusGoal.milestones && focusGoal.milestones.length > 0 && (
              <div className="border-t border-[#E6E2D6] pt-4 mt-4">
                <p className="text-sm font-medium text-[#2C2C2C] mb-3">Milestones</p>
                <div className="space-y-2">
                  {focusGoal.milestones.map((milestone, idx) => {
                    const isCompleted = (focusGoal.progress || 0) > (idx + 1) * (100 / focusGoal.milestones!.length);
                    return (
                      <div 
                        key={idx}
                        className={cn(
                          "flex items-start gap-3 p-2 rounded-lg transition-colors",
                          isCompleted ? "bg-[#4A6741]/5" : "hover:bg-[#F2F0E9]"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-[#4A6741] flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#E6E2D6] flex-shrink-0" />
                        )}
                        <span className={cn(
                          "text-sm",
                          isCompleted ? "text-[#4A6741]" : "text-[#6B6B60]"
                        )}>
                          {milestone}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Talk to Coach About This */}
            {onStartSession && (
              <button
                onClick={() => onStartSession(`I want to discuss my goal: "${focusGoal.title}"`)}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-[#F2F0E9] hover:bg-[#E6E2D6] rounded-xl text-[#4A6741] font-medium transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Discuss this with coach
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Other Goals - Minimal List */}
      {otherGoals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-[#6B6B60]">Other Goals</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddGoal(true)}
              className="text-[#4A6741] hover:text-[#4A6741] hover:bg-[#F2F0E9]"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {otherGoals.map((goal) => (
              <div 
                key={goal.id}
                className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-[#E6E2D6] hover:border-[#4A6741]/30 transition-all"
              >
                {/* Progress Circle */}
                <div className="relative w-10 h-10 flex-shrink-0">
                  <svg className="w-10 h-10 -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      fill="none"
                      stroke="#F2F0E9"
                      strokeWidth="3"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      fill="none"
                      stroke="#4A6741"
                      strokeWidth="3"
                      strokeDasharray={`${(goal.progress || 0) * 1.005} 100`}
                      className="transition-all"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-[#4A6741]">
                    {goal.progress || 0}%
                  </span>
                </div>

                {/* Goal Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-[#2C2C2C] truncate">{goal.title}</h4>
                  {goal.targetDate && (
                    <p className="text-xs text-[#6B6B60]">
                      {getTimeRemaining(new Date(goal.targetDate))}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleSetFocus(goal.id)}
                    className="p-2 hover:bg-[#F2F0E9] rounded-lg transition-colors"
                    title="Set as focus"
                  >
                    <Star className="w-4 h-4 text-[#6B6B60]" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-[#F2F0E9] rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-[#6B6B60]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleSetFocus(goal.id)}>
                        <Star className="w-4 h-4 mr-2" />
                        Set as focus
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingGoal(goal)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteGoal(goal.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add More Goals Button (if only focus goal exists) */}
      {otherGoals.length === 0 && goals.length > 0 && (
        <button
          onClick={() => setShowAddGoal(true)}
          className="w-full p-4 border-2 border-dashed border-[#E6E2D6] rounded-xl text-[#6B6B60] hover:border-[#4A6741]/30 hover:text-[#4A6741] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add another goal
        </button>
      )}

      {/* Add Goal Dialog */}
      <AddGoalDialog
        open={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        title={newGoalTitle}
        setTitle={setNewGoalTitle}
        description={newGoalDescription}
        setDescription={setNewGoalDescription}
        date={newGoalDate}
        setDate={setNewGoalDate}
        onSubmit={handleCreateGoal}
      />

      {/* Edit Goal Dialog */}
      {editingGoal && (
        <EditGoalDialog
          open={!!editingGoal}
          onClose={() => setEditingGoal(null)}
          goal={editingGoal}
          onSave={(updates) => {
            onUpdateGoal(editingGoal.id, updates);
            setEditingGoal(null);
          }}
        />
      )}
    </div>
  );
}

// Simplified Add Goal Dialog
function AddGoalDialog({ 
  open, 
  onClose, 
  title, 
  setTitle, 
  description, 
  setDescription,
  date,
  setDate,
  onSubmit 
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#2C2C2C]">
            What do you want to achieve?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Have the difficult conversation with my co-founder"
              className="border-[#E6E2D6] text-base"
              autoFocus
            />
          </div>

          <div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why does this matter? What does success look like? (optional)"
              className="border-[#E6E2D6] min-h-[80px] text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-[#6B6B60] mb-1 block">Target date (optional)</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-[#E6E2D6]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#E6E2D6]"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!title.trim()}
              className="flex-1 bg-[#4A6741] hover:bg-[#3d5636] text-white"
            >
              Create Goal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Edit Goal Dialog
function EditGoalDialog({ 
  open, 
  onClose, 
  goal,
  onSave
}: {
  open: boolean;
  onClose: () => void;
  goal: Goal;
  onSave: (updates: Partial<Goal>) => void;
}) {
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description || "");
  const [date, setDate] = useState(goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : "");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#2C2C2C]">
            Edit Goal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-[#E6E2D6] text-base"
            />
          </div>

          <div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why does this matter?"
              className="border-[#E6E2D6] min-h-[80px] text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-[#6B6B60] mb-1 block">Target date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-[#E6E2D6]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#E6E2D6]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => onSave({
                title,
                description,
                targetDate: date ? new Date(date) : undefined,
              })}
              disabled={!title.trim()}
              className="flex-1 bg-[#4A6741] hover:bg-[#3d5636] text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
