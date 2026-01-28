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
import { X, Check, Star } from "lucide-react";
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
          <DialogTitle className="text-2xl font-semibold text-[#2C2C2C]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Compare Coaches
          </DialogTitle>
          <p className="text-sm text-[#0a1628] mt-2">
            Select 2-3 coaches to compare their specialties, styles, and your history with them
          </p>
        </DialogHeader>

        {/* Coach Selection Grid */}
        {selectedCoaches.length < 3 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#0a1628] mb-3">
              Select coaches to compare ({selectedCoaches.length}/3)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {COACH_PROFILES.map((coach) => (
                <button
                  key={coach.id}
                  onClick={() => toggleCoach(coach.id)}
                  disabled={selectedCoaches.length >= 3 && !selectedCoaches.includes(coach.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedCoaches.includes(coach.id)
                      ? "border-[#4A6741] bg-[#4A6741]/5"
                      : "border-gray-200 hover:border-[#4A6741]/50"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <img
                      src={coach.avatar}
                      alt={coach.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0a1628] truncate">{coach.name}</p>
                    </div>
                    {selectedCoaches.includes(coach.id) && (
                      <Check className="w-4 h-4 text-[#4A6741] flex-shrink-0" />
                    )}
                  </div>
                  {isRecommended(coach.id) && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {compareCoaches.length >= 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareCoaches.map((coach) => (
                <Card key={coach!.id} className="relative bg-white border-2 border-[#4A6741]/20 text-[#2C2C2C]">
                  <button
                    onClick={() => toggleCoach(coach!.id)}
                    className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>

                  <div className="p-6 space-y-4">
                    {/* Coach Header */}
                    <div className="text-center">
                      <img
                        src={coach!.avatar}
                        alt={coach!.name}
                        className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-[#E6E2D6]"
                      />
                      <h3 className="text-lg font-bold text-[#0a1628]">{coach!.name}</h3>
                      <p className="text-sm text-[#2C2C2C] font-medium mt-1">{coach!.title}</p>
                      {isRecommended(coach!.id) && (
                        <Badge variant="secondary" className="mt-2">
                          <Star className="w-3 h-3 mr-1" />
                          Recommended for you
                        </Badge>
                      )}
                    </div>

                    {/* Specialties */}
                    <div>
                      <h4 className="text-xs font-bold text-[#0a1628] uppercase tracking-wide mb-2">
                        Specialties
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {coach!.specialties.map((specialty, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-white border-[#4A6741]/30 text-[#0a1628] font-medium whitespace-nowrap">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Coaching Style */}
                    <div>
                      <h4 className="text-xs font-bold text-[#0a1628] uppercase tracking-wide mb-2">
                        Coaching Style
                      </h4>
                      <p className="text-sm text-[#0a1628] leading-relaxed font-medium">
                        {coach!.coachingStyle}
                      </p>
                    </div>

                    {/* Your History */}
                    {sessionCountByCoach[coach!.id] > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-[#0a1628] uppercase tracking-wide mb-2">
                          Your History
                        </h4>
                        <p className="text-sm text-[#0a1628] font-medium">
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
                        className="w-full bg-[#4A6741] hover:bg-[#4A6741]/90 text-white text-sm px-3 py-2"
                      >
                        Select
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {compareCoaches.length < 2 && selectedCoaches.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            Select at least one more coach to start comparing
          </div>
        )}

        {selectedCoaches.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Select 2-3 coaches above to compare them side-by-side
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
