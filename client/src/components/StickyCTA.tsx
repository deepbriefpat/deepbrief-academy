import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { X } from "lucide-react";

interface StickyCTAProps {
  primaryText: string;
  primaryHref: string;
  secondaryText?: string;
  secondaryHref?: string;
  showAfterScroll?: number; // pixels to scroll before showing
}

export function StickyCTA({
  primaryText,
  primaryHref,
  secondaryText,
  secondaryHref,
  showAfterScroll = 600,
}: StickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > showAfterScroll && !isDismissed);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [showAfterScroll, isDismissed]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="bg-navy-mid/95 backdrop-blur-sm border-t border-gold-dim shadow-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 flex-wrap">
              <Link href={primaryHref}>
                <Button size="lg" className="bg-gold hover:bg-gold-light text-navy-deep font-semibold text-sm sm:text-base px-4 sm:px-6">
                  {primaryText}
                </Button>
              </Link>
              {secondaryText && secondaryHref && (
                <Link href={secondaryHref}>
                  <Button size="lg" variant="outline" className="border-gold text-gold hover:bg-gold hover:text-navy-deep hidden sm:inline-flex">
                    {secondaryText}
                  </Button>
                </Link>
              )}
            </div>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-text-secondary hover:text-gold transition-colors p-2 flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
