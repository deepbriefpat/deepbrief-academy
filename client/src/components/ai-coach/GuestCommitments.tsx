/**
 * Guest Commitments Component
 * 
 * Lightweight commitments view for demo and guest pass users.
 * Uses guest pass code or localStorage for persistence.
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { 
  CheckCircle2, Circle, Clock, AlertTriangle, 
  Plus, MoreHorizontal, Trash2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface LocalCommitment {
  id: string;
  action: string;
  status: "pending" | "completed";
  createdAt: string;
}

interface GuestCommitmentsProps {
  guestPassCode?: string; // If provided, uses API; otherwise uses localStorage
  storageKey?: string; // For localStorage fallback
}

const DEMO_STORAGE_KEY = "aiCoachDemoCommitments";

export function GuestCommitments({ guestPassCode, storageKey = DEMO_STORAGE_KEY }: GuestCommitmentsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCommitment, setNewCommitment] = useState("");
  
  // For localStorage-based (demo mode)
  const [localCommitments, setLocalCommitments] = useState<LocalCommitment[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage when local commitments change
  useEffect(() => {
    if (!guestPassCode) {
      localStorage.setItem(storageKey, JSON.stringify(localCommitments));
    }
  }, [localCommitments, guestPassCode, storageKey]);

  // API queries for guest pass mode
  const utils = trpc.useUtils();
  const { data: apiCommitments } = trpc.aiCoach.getCommitments.useQuery(
    {},
    { enabled: !!guestPassCode }
  );
  
  const createMutation = trpc.aiCoach.createCommitment.useMutation({
    onSuccess: () => {
      utils.aiCoach.getCommitments.invalidate();
    },
  });
  
  const updateMutation = trpc.aiCoach.updateCommitmentStatus.useMutation({
    onSuccess: () => {
      utils.aiCoach.getCommitments.invalidate();
    },
  });

  // Determine which commitments to show
  const commitments = guestPassCode 
    ? (apiCommitments || []).map(c => ({
        id: String(c.id),
        action: c.action,
        status: c.status as "pending" | "completed",
        createdAt: c.createdAt.toISOString(),
      }))
    : localCommitments;

  const openCommitments = commitments.filter(c => c.status !== "completed");
  const completedCommitments = commitments.filter(c => c.status === "completed");

  const handleAdd = async () => {
    if (!newCommitment.trim()) return;
    
    if (guestPassCode) {
      await createMutation.mutateAsync({
        action: newCommitment.trim(),
      });
    } else {
      setLocalCommitments(prev => [...prev, {
        id: Date.now().toString(),
        action: newCommitment.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
      }]);
    }
    
    setNewCommitment("");
    setShowAddForm(false);
  };

  const handleComplete = async (id: string) => {
    if (guestPassCode) {
      await updateMutation.mutateAsync({
        commitmentId: parseInt(id),
        status: "completed",
        progress: 100,
      });
    } else {
      setLocalCommitments(prev => 
        prev.map(c => c.id === id ? { ...c, status: "completed" } : c)
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (guestPassCode) {
      await updateMutation.mutateAsync({
        commitmentId: parseInt(id),
        status: "missed",
      });
    } else {
      setLocalCommitments(prev => prev.filter(c => c.id !== id));
    }
  };

  // Empty state
  if (commitments.length === 0 && !showAddForm) {
    return (
      <div className="bg-white/50 rounded-xl border border-[#E6E2D6] p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-[#2C2C2C]">Commitments</h3>
        </div>
        <p className="text-sm text-[#6B6B60] mb-3">
          Made a promise to yourself? Track it here.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full border-dashed border-[#4A6741]/30 text-[#4A6741] hover:bg-[#4A6741]/5"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add commitment
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white/50 rounded-xl border border-[#E6E2D6] p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-[#2C2C2C]">
          Commitments {openCommitments.length > 0 && (
            <span className="text-sm font-normal text-[#6B6B60]">
              ({openCommitments.length} open)
            </span>
          )}
        </h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowAddForm(true)}
          className="h-8 w-8 p-0 text-[#4A6741]"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-3 p-3 bg-[#F2F0E9] rounded-lg">
          <Input
            value={newCommitment}
            onChange={(e) => setNewCommitment(e.target.value)}
            placeholder="What are you committing to?"
            className="mb-2 border-[#E6E2D6] bg-white"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") setShowAddForm(false);
            }}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!newCommitment.trim()}
              className="bg-[#4A6741] hover:bg-[#3d5636] text-white"
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAddForm(false);
                setNewCommitment("");
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Open Commitments */}
      <div className="space-y-2">
        {openCommitments.map((commitment) => (
          <div 
            key={commitment.id}
            className="group flex items-start gap-3 p-2 rounded-lg hover:bg-[#F2F0E9] transition-colors"
          >
            <button
              onClick={() => handleComplete(commitment.id)}
              className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 border-[#E6E2D6] hover:border-[#4A6741] hover:bg-[#4A6741]/10 flex items-center justify-center transition-all"
            >
              <CheckCircle2 className="w-3 h-3 text-[#4A6741] opacity-0 group-hover:opacity-50" />
            </button>
            <span className="flex-1 text-sm text-[#2C2C2C]">{commitment.action}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 opacity-0 group-hover:opacity-100 hover:bg-[#E6E2D6] rounded transition-all">
                  <MoreHorizontal className="w-4 h-4 text-[#6B6B60]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleComplete(commitment.id)}>
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                  Complete
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
        ))}
      </div>

      {/* Completed */}
      {completedCommitments.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#E6E2D6]">
          <p className="text-xs text-[#6B6B60] mb-2">
            ✓ {completedCommitments.length} completed
          </p>
          <div className="space-y-1">
            {completedCommitments.slice(0, 3).map((commitment) => (
              <div key={commitment.id} className="flex items-center gap-2 text-sm text-[#6B6B60]">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="line-through truncate">{commitment.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
