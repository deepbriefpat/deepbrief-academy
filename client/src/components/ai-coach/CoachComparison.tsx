/**
 * Coach Comparison Tool
 * 
 * Side-by-side comparison view for 2-3 coaches
 * - Shows specialties, coaching styles, and approach
 * - Displays past session count and topics (if user has history)
 * - Visual indicators for recommended coaches
 */
// @ts-nocheck
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Check, Star, MessageSquare, Award, Users } from "lucide-react";
import { COACH_PROFILES } from "@/data/coachProfiles";
import { trpc } from "@/lib/trpc";

interface CoachComparisonProps {
  open: boolean;
  onClose: () => void;
  onSelectCoach?: (coachId: string) => void;
}

export function CoachComparison({ open, onClose, onSelectCoach }: CoachComparisonProps) {
  const [selectedCoaches, setSelectedCoaches] = useState<string[]>([]);
  
  const { data: sessions } = trpc.aiCoach.getSessions.useQuery({ limit: 100 });
  const { data: recommendations, error: recommendationsError } = trpc.aiCoach.getRecommendedCoaches.useQuery(
    undefined,
    {
      // Gracefully handle if endpoint doesn't exist - recommendations are optional
      retry: false,
      onError: (err) => {
        console.warn('Failed to fetch coach recommendations:', err.message);
      }
    }
  );

  // Calculate session count per coach
  const sessionCountByCoach = sessions?.reduce((acc, session) => {
    const coachId = session.coachId || "sarah";
    acc[coachId] = (acc[coachId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const toggleCoach = (coachId: string) => {
    if (selectedCoaches.includes(coachId)) {
      setSelectedCoaches(selectedCoaches.filter(id => id !== coachId));
    } else if (selectedCoaches.length < 3) {
      setSelectedCoaches([...selectedCoaches, coachId]);
    }
  };

  const isRecommended = (coachId: string) => {
    // Safely check recommendations, default to false if endpoint failed
    if (!recommendations || !Array.isArray(recommendations)) {
      return false;
    }
    return recommendations.some(r => r.coachId === coachId);
  };

  const getCoachData = (coachId: string) => {
    return COACH_PROFILES.find(c => c.id === coachId);
  };

  const compareCoaches = selectedCoaches.map(id => getCoachData(id)).filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C2C2C] flex items-center gap-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            <Users className="w-6 h-6 text-[#4A6741]" />
            Compare Coaches
          </DialogTitle>
          <p className="text-sm text-[#6B6B60] mt-2">
            Select 2-3 coaches to compare their specialties, styles, and your history with them
          </p>
        </DialogHeader>

        {/* Coach Selection Grid */}
        {selectedCoaches.length < 3 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#2C2C2C]">
                Select coaches to compare ({selectedCoaches.length}/3)
              </h3>
              {selectedCoaches.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCoaches([])}
                  className="text-xs text-[#6B6B60] hover:text-[#2C2C2C]"
                >
                  Clear selection
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 max-h-[350px] overflow-y-auto p-1">
              {COACH_PROFILES.map((coach) => {
                const isSelected = selectedCoaches.includes(coach.id);
                const isDisabled = selectedCoaches.length >= 3 && !isSelected;
                
                return (
                  <button
                    key={coach.id}
                    onClick={() => toggleCoach(coach.id)}
                    disabled={isDisabled}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? "border-[#4A6741] bg-[#4A6741]/10 shadow-md"
                        : "border-[#E6E2D6] hover:border-[#4A6741]/50 hover:shadow-sm bg-white"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <div className={`relative flex-shrink-0 ${isSelected ? "ring-2 ring-[#4A6741] ring-offset-2" : ""} rounded-full`}>
                        <img
                          src={coach.avatar}
                          alt={coach.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white"
                        />
                        {isSelected && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#4A6741] rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="w-full min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-[#2C2C2C] truncate">{coach.name}</p>
                        <p className="text-[10px] sm:text-xs text-[#6B6B60] truncate">{coach.title}</p>
                        
                        {/* Key specialties - hide on smallest screens */}
                        <div className="hidden sm:flex flex-wrap justify-center gap-1 mt-2">
                          {coach.specialties.slice(0, 2).map((specialty, idx) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-[9px] px-1 py-0 bg-[#4A6741]/5 border-[#4A6741]/20 text-[#4A6741] font-medium"
                            >
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Session count if any */}
                        {sessionCountByCoach[coach.id] > 0 && (
                          <div className="flex items-center justify-center gap-1 mt-2 text-[10px] sm:text-xs text-[#D4A853]">
                            <MessageSquare className="w-3 h-3" />
                            <span className="font-medium">{sessionCountByCoach[coach.id]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isRecommended(coach.id) && (
                      <div className="mt-2 flex items-center justify-center gap-1 text-[10px] sm:text-xs text-[#D4A853] font-semibold">
                        <Star className="w-3 h-3 fill-[#D4A853]" />
                        <span className="hidden sm:inline">Recommended</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Guidance when 1 coach selected */}
        {selectedCoaches.length === 1 && (
          <div className="bg-[#D4A853]/10 border border-[#D4A853]/30 rounded-xl p-4 text-center mb-4">
            <p className="text-[#9a7a2e] font-semibold">
              👆 Select at least one more coach to start comparing
            </p>
          </div>
        )}

        {/* Comparison Table */}
        {compareCoaches.length >= 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-[#2C2C2C]">
                Comparing {compareCoaches.length} coaches
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCoaches([])}
                className="text-xs border-[#E6E2D6] hover:border-[#4A6741]"
              >
                Clear all
              </Button>
            </div>
            
            <div className={`grid gap-4 ${
              compareCoaches.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"
            }`}>
              {compareCoaches.map((coach) => (
                <Card key={coach!.id} className="relative bg-white border-2 border-[#4A6741]/20 rounded-xl overflow-hidden">
                  {/* Remove button */}
                  <button
                    onClick={() => toggleCoach(coach!.id)}
                    className="absolute top-3 right-3 p-1.5 hover:bg-[#F5F3EE] rounded-full transition-colors z-10"
                  >
                    <X className="w-4 h-4 text-[#6B6B60]" />
                  </button>

                  <div className="p-6 space-y-4">
                    {/* Coach Header */}
                    <div className="text-center pb-4 border-b border-[#E6E2D6]">
                      <div className="relative inline-block">
                        <img
                          src={coach!.avatar}
                          alt={coach!.name}
                          className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-[#4A6741]/20 shadow-lg"
                        />
                        {isRecommended(coach!.id) && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-[#D4A853] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-white" />
                            Recommended
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-[#2C2C2C]">{coach!.name}</h3>
                      <p className="text-sm text-[#6B6B60] font-medium">{coach!.title}</p>
                    </div>

                    {/* Specialties */}
                    <div>
                      <h4 className="text-xs font-bold text-[#4A6741] uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Specialties
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {coach!.specialties.map((specialty, idx) => (
                          <Badge 
                            key={idx} 
                            className="text-xs bg-[#4A6741]/10 text-[#4A6741] border-[#4A6741]/20 font-medium hover:bg-[#4A6741]/20"
                          >
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Coaching Style */}
                    <div>
                      <h4 className="text-xs font-bold text-[#4A6741] uppercase tracking-wide mb-2 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Coaching Style
                      </h4>
                      <p className="text-sm text-[#2C2C2C] leading-relaxed bg-[#F5F3EE] rounded-lg p-3 italic">
                        "{coach!.coachingStyle || coach!.style}"
                      </p>
                    </div>

                    {/* Your History */}
                    {sessionCountByCoach[coach!.id] > 0 && (
                      <div className="bg-[#D4A853]/10 rounded-lg p-3 border border-[#D4A853]/20">
                        <h4 className="text-xs font-bold text-[#9a7a2e] uppercase tracking-wide mb-1">
                          Your History
                        </h4>
                        <p className="text-sm text-[#2C2C2C] font-semibold">
                          {sessionCountByCoach[coach!.id]} session{sessionCountByCoach[coach!.id] !== 1 ? "s" : ""} completed
                        </p>
                      </div>
                    )}

                    {/* Select Button */}
                    {onSelectCoach && (
                      <Button
                        onClick={() => {
                          onSelectCoach(coach!.id);
                          onClose();
                        }}
                        className="w-full bg-[#4A6741] hover:bg-[#3d5636] text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Select {coach!.name.split(' ')[0]}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {selectedCoaches.length === 0 && (
          <div className="text-center py-8 bg-[#F5F3EE] rounded-xl border border-[#E6E2D6]">
            <Users className="w-12 h-12 text-[#6B6B60] mx-auto mb-3" />
            <p className="text-[#6B6B60] font-medium">Select 2-3 coaches above to compare them side-by-side</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
