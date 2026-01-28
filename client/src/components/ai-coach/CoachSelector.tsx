/**
 * Coach Selector Component
 * 
 * Displays all 24 available coaches with previously used ones at the top
 * Shows coach profiles, specialties, and allows selection
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Star, Users, GitCompare } from "lucide-react";
import { COACH_PROFILES, type CoachProfile } from "@/data/coachProfiles";
import { CoachComparison } from "./CoachComparison";

interface CoachSelectorProps {
  selectedCoach: string;
  onSelectCoach: (coachId: string) => void;
  disabled?: boolean;
  previouslyUsedCoaches?: string[];
}

export function CoachSelector({
  selectedCoach,
  onSelectCoach,
  disabled = false,
  previouslyUsedCoaches = []
}: CoachSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedGender, setSelectedGender] = useState<"all" | "female" | "male" | "nonbinary">("all");

  // Filter coaches by gender
  const filteredCoaches = selectedGender === "all" 
    ? COACH_PROFILES 
    : COACH_PROFILES.filter(c => c.gender === selectedGender);

  // Sort coaches: previously used first, then alphabetically
  const sortedCoaches = [...filteredCoaches].sort((a, b) => {
    const aUsed = previouslyUsedCoaches.includes(a.id);
    const bUsed = previouslyUsedCoaches.includes(b.id);
    
    if (aUsed && !bUsed) return -1;
    if (!aUsed && bUsed) return 1;
    return a.name.localeCompare(b.name);
  });

  const selectedCoachData = COACH_PROFILES.find(c => c.id === selectedCoach);

  const handleSelectCoach = (coachId: string) => {
    onSelectCoach(coachId);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 border border-[#E6E2D6] rounded-lg bg-white text-[#2C2C2C] hover:bg-[#F5F3EE] focus:outline-none focus:ring-2 focus:ring-[#4A6741] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {selectedCoachData?.avatar && (
          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
            <img 
              src={selectedCoachData.avatar} 
              alt={selectedCoachData.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <span>{selectedCoachData?.name}</span>
        {!disabled && <span className="ml-2 text-xs text-gray-500">▼</span>}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#2C2C2C] flex items-center gap-2">
              <Users className="w-6 h-6 text-[#4A6741]" />
              Choose Your Coach
            </DialogTitle>
            <p className="text-sm text-[#2C2C2C] mt-2">
              Select the coach that best fits your current needs. You can switch coaches anytime during your session.
            </p>
          </DialogHeader>

          {/* Gender Filter & Compare Button */}
          <div className="flex items-center justify-between gap-4 mt-4 pb-4 border-b border-[#E6E2D6] flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#0a1628] shrink-0">Filter by:</span>
            <div className="flex gap-2 flex-wrap">              <Button
                size="sm"
                variant={selectedGender === "all" ? "default" : "outline"}
                onClick={() => setSelectedGender("all")}
                className={selectedGender === "all" ? "bg-[#4A6741] text-white hover:bg-[#3d5636]" : "bg-white text-black font-semibold border-[#E6E2D6] hover:bg-[#F5F3EE]"}
              >
                All ({COACH_PROFILES.length})
              </Button>
              <Button
                size="sm"
                variant={selectedGender === "female" ? "default" : "outline"}
                onClick={() => setSelectedGender("female")}
                className={selectedGender === "female" ? "bg-[#4A6741] text-white hover:bg-[#3d5636]" : "bg-white text-black font-semibold border-[#E6E2D6] hover:bg-[#F5F3EE]"}
              >
                Female (8)
              </Button>
              <Button
                size="sm"
                variant={selectedGender === "male" ? "default" : "outline"}
                onClick={() => setSelectedGender("male")}
                className={selectedGender === "male" ? "bg-[#4A6741] text-white hover:bg-[#3d5636]" : "bg-white text-black font-semibold border-[#E6E2D6] hover:bg-[#F5F3EE]"}
              >
                Male (8)
              </Button>
              <Button
                size="sm"
                variant={selectedGender === "nonbinary" ? "default" : "outline"}
                onClick={() => setSelectedGender("nonbinary")}
                className={selectedGender === "nonbinary" ? "bg-[#4A6741] text-white hover:bg-[#3d5636]" : "bg-white text-black font-semibold border-[#E6E2D6] hover:bg-[#F5F3EE]"}
              >
                Non-binary (8)
              </Button>
            </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setShowComparison(true);
              }}
              className="flex items-center gap-2 shrink-0"
            >
              <GitCompare className="w-4 h-4" />
              Compare Coaches
            </Button>
          </div>

          <div className="space-y-4 mt-6">
            {sortedCoaches.map((coach) => {
              const isSelected = coach.id === selectedCoach;
              const isPreviouslyUsed = previouslyUsedCoaches.includes(coach.id);

              return (
                <Card
                  key={coach.id}
                  className={`p-6 cursor-pointer transition-all hover:shadow-md bg-white text-[#2C2C2C] ${
                    isSelected
                      ? "border-2 border-[#4A6741] bg-[#F5F3EE]"
                      : "border border-[#E6E2D6] hover:border-[#4A6741]/50"
                  }`}
                  onClick={() => handleSelectCoach(coach.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                      <img 
                        src={coach.avatar} 
                        alt={coach.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Coach Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-[#2C2C2C]">
                              {coach.name}
                            </h3>
                            {isPreviouslyUsed && (
                              <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-[#4A6741]/10 text-[#4A6741] border border-[#4A6741]/20">
                                <Star className="w-3 h-3 fill-current" />
                                Previously Used
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#2C2C2C]/70">{coach.title}</p>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#4A6741] text-white text-sm font-medium">
                            <Check className="w-4 h-4" />
                            Selected
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-[#2C2C2C]/80 mb-3">{coach.description}</p>

                      {/* Specialties */}
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-[#2C2C2C] mb-1">Specialties:</p>
                        <div className="flex flex-wrap gap-2">
                          {coach.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className="px-2 py-1 text-xs rounded-full bg-[#E6E2D6] text-[#2C2C2C]"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Coaching Style */}
                      <div>
                        <p className="text-xs font-semibold text-[#2C2C2C] mb-1">Coaching Style:</p>
                        <p className="text-xs text-[#2C2C2C]/70 italic">{coach.style}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-[#F5F3EE] rounded-lg border border-[#E6E2D6]">
            <p className="text-sm text-[#2C2C2C]/80">
              <strong>💡 Tip:</strong> Different coaches bring different perspectives. Try working with multiple coaches
              to get diverse insights on your leadership challenges.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <CoachComparison
        open={showComparison}
        onClose={() => setShowComparison(false)}
        onSelectCoach={(coachId) => {
          onSelectCoach(coachId);
          setShowComparison(false);
        }}
      />
    </>
  );
}
