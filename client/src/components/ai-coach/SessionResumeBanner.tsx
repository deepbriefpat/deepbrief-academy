import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SessionResumeBannerProps {
  summary: string;
  onDismiss: () => void;
}

export function SessionResumeBanner({ summary, onDismiss }: SessionResumeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible) return null;

  return (
    <Card className="mb-4 bg-gradient-to-r from-[#8B7355]/10 to-[#6B8E23]/10 border-[#8B7355]/30 text-[#0a1628]">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Sparkles className="h-5 w-5 text-[#8B7355]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#0a1628] mb-1 flex items-center gap-2">
              Session Context
            </h3>
            <p className="text-sm text-[#0a1628]/80 leading-relaxed">
              {summary}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-shrink-0 h-8 w-8 p-0 hover:bg-[#8B7355]/10"
          >
            <X className="h-4 w-4 text-[#0a1628]/60" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
