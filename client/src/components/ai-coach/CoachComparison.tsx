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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1">
              {COACH_PROFILES.map((coach) => (
                <button
                  key={coach.id}
                  onClick={() => toggleCoach(coach.id)}
                  disabled={selectedCoaches.length >= 3 && !selectedCoaches.includes(coach.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedCoaches.includes(coach.id)
                      ? "border-[#4A6741] bg-[#4A6741]/10 shadow-md"
                      : "border-gray-200 hover:border-[#4A6741]/50 hover:shadow-sm"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={coach.avatar}
                      alt={coach.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-[#0a1628]">{coach.name}</p>
                        {selectedCoaches.includes(coach.id) && (
                          <Check className="w-5 h-5 text-[#4A6741] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[#6B6B60] mt-0.5">{coach.title}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {coach.specialties.slice(0, 2).map((specialty, idx) => (
                          <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0 bg-white border-gray-200">
                            {specialty}
                          </Badge>
                        ))}
                        {coach.specialties.length > 2 && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-white border-gray-200">
                            +{coach.specialties.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {isRecommended(coach.id) && (
                    <Badge variant="secondary" className="text-xs mt-2 bg-amber-50 text-amber-700 border-amber-200">
                      <Star className="w-3 h-3 mr-1 fill-amber-500" />
                      Recommended
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Guidance when 1 coach selected */}
        {selectedCoaches.length === 1 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <p className="text-amber-800 font-medium">
              Select at least one more coach to start comparing
            </p>
          </div>
        )}

        {/* Comparison Table */}
        {compareCoaches.length >= 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#0a1628]">Comparing {compareCoaches.length} coaches</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCoaches([])}
                className="text-xs"
              >
                Clear all
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
