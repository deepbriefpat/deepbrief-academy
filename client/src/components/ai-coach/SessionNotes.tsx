// @ts-nocheck
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface SessionNotesProps {
  sessionId: number;
  initialNotes?: string;
}

export function SessionNotes({ sessionId, initialNotes = "" }: SessionNotesProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const updateNotesMutation = trpc.coaching.updateSessionNotes.useMutation();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateNotesMutation.mutateAsync({
        sessionId,
        notes,
      });
      toast.success("Notes saved");
    } catch (error) {
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-4 bg-white/80 backdrop-blur-sm border-[#E6E2D6]">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-[#2d3436] hover:text-[#4A6741] transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Session Notes
        </button>
        {isExpanded && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8"
          >
            <Save className="w-3 h-3 mr-1" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        )}
      </div>
      {isExpanded && (
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this session..."
          className="min-h-[100px] text-sm resize-none"
        />
      )}
    </Card>
  );
}
