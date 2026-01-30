import { useState } from "react";
import { X, Sparkles } from "lucide-react";
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
    <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Sparkles className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-amber-900 mb-1 flex items-center gap-2">
            Session Context
          </h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            {summary}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="flex-shrink-0 h-8 w-8 p-0 hover:bg-amber-100"
        >
          <X className="h-4 w-4 text-amber-600" />
        </Button>
      </div>
    </div>
  );
}
