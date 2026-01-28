/**
 * Coach Recommendations Component
 * 
 * Shows top 3 recommended coaches based on user's goals and conversation history
 */

import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp } from "lucide-react";

interface CoachRecommendationsProps {
  onSelectCoach: (coachId: string) => void;
}

export function CoachRecommendations({ onSelectCoach }: CoachRecommendationsProps) {
  const { data: recommendations, isLoading } = trpc.aiCoach.getCoachRecommendations.useQuery();

  if (isLoading) {
    return (
      <Card className="p-6 border-[#E6E2D6] bg-white">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4A6741]"></div>
        </div>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 border-[#4A6741] bg-gradient-to-br from-[#4A6741]/5 to-[#4A6741]/10">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#4A6741]" />
        <h3 className="text-lg font-semibold text-[#2C2C2C]">Recommended for You</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Based on your goals and conversation topics, these coaches are the best match for your needs.
      </p>
      
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <Card
            key={rec.coach.id}
            className="p-4 border-[#E6E2D6] hover:border-[#4A6741] transition-all hover:shadow-md cursor-pointer"
            onClick={() => onSelectCoach(rec.coach.id)}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                <img 
                  src={rec.coach.avatar} 
                  alt={rec.coach.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Coach Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-[#2C2C2C]">{rec.coach.name}</h4>
                  {index === 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-[#4A6741] text-white">
                      <TrendingUp className="w-3 h-3" />
                      Top Match
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">{rec.coach.title}</p>
                
                {/* Match Reasons */}
                <div className="space-y-1">
                  {rec.reasons.slice(0, 2).map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#4A6741] mt-0.5">•</span>
                      <span className="text-xs text-gray-700">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Select Button */}
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 bg-[#4A6741] text-white hover:bg-[#3a5331] border-[#4A6741]"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCoach(rec.coach.id);
                }}
              >
                Select
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
