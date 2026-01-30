/**
 * Dashboard Tour Component
 * 
 * Interactive walkthrough for first-time users after onboarding.
 * Highlights key features and guides users through their first session.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Target, 
  CheckSquare, 
  History, 
  TrendingUp,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Calendar,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userName?: string;
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tip?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Your Coaching Dashboard",
    description: "This is your personal space for executive coaching. Let me show you around so you can get the most out of every session.",
    icon: <Sparkles className="w-8 h-8 text-[#D4A853]" />,
    tip: "You can access this tour anytime from Settings."
  },
  {
    id: "coaching-chat",
    title: "Coaching Chat",
    description: "This is where the magic happens. Start a session to have a direct conversation with your AI coach. Be honest, be specific – that's how you get the best insights.",
    icon: <MessageSquare className="w-8 h-8 text-[#4A6741]" />,
    tip: "Try starting with: \"I need to think through a difficult decision about...\""
  },
  {
    id: "session-types",
    title: "Quick vs Full Sessions",
    description: "Choose 'Quick' (5-10 min) for fast clarity before a meeting. Choose 'Full' (20-45 min) for deeper exploration of patterns and strategies.",
    icon: <Lightbulb className="w-8 h-8 text-amber-500" />,
    tip: "Quick sessions are perfect for pre-meeting prep."
  },
  {
    id: "coaches",
    title: "Choose Your Coach",
    description: "24 coaches with different specialties and styles. Pick one that fits your current challenge, or compare them to find the best match.",
    icon: <Users className="w-8 h-8 text-purple-600" />,
    tip: "You can switch coaches anytime during a session."
  },
  {
    id: "goals",
    title: "Goals",
    description: "Set longer-term objectives you're working toward. Your coach references these during sessions to keep you accountable.",
    icon: <Target className="w-8 h-8 text-blue-600" />,
    tip: "Start with 1-2 goals. Quality over quantity."
  },
  {
    id: "commitments",
    title: "Commitments",
    description: "After each session, capture specific actions you're committing to. These aren't vague intentions – they're concrete next steps with deadlines.",
    icon: <CheckSquare className="w-8 h-8 text-purple-600" />,
    tip: "The best commitments are specific and time-bound."
  },
  {
    id: "calendar",
    title: "Calendar Integration",
    description: "Add your commitments and goal deadlines directly to Google Calendar, Outlook, or Apple Calendar. No more forgetting.",
    icon: <Calendar className="w-8 h-8 text-red-500" />,
  },
  {
    id: "patterns",
    title: "Patterns & Insights",
    description: "Over time, your coach identifies recurring themes in your challenges. This is where real growth happens – seeing what you couldn't see before.",
    icon: <TrendingUp className="w-8 h-8 text-indigo-600" />,
    tip: "Patterns become more accurate after 3-5 sessions."
  },
  {
    id: "history",
    title: "Session History",
    description: "Every conversation is saved. Review past sessions, see your progress, and pick up where you left off.",
    icon: <History className="w-8 h-8 text-gray-600" />,
  },
  {
    id: "ready",
    title: "You're Ready",
    description: "That's the essentials. The best way to learn is to dive in. Start your first session and see what emerges.",
    icon: <Sparkles className="w-8 h-8 text-[#D4A853]" />,
    tip: "Pressure doesn't build character – it reveals it. Let's see what's there."
  }
];

const TOUR_STORAGE_KEY = "dashboard_tour_completed";

export function DashboardTour({ isOpen, onClose, onComplete, userName }: DashboardTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white p-0 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-[#4A6741] to-[#5a7d4f] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6">
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Step indicator */}
          <div className="text-xs text-gray-500 mb-4">
            Step {currentStep + 1} of {TOUR_STEPS.length}
          </div>

          {/* Content */}
          <div className={cn(
            "transition-opacity duration-150",
            isAnimating ? "opacity-0" : "opacity-100"
          )}>
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-gray-50">
                {step.icon}
              </div>
            </div>

            {/* Title */}
            <DialogHeader className="text-center mb-4">
              <DialogTitle className="text-xl font-bold text-gray-900">
                {currentStep === 0 && userName 
                  ? `Welcome, ${userName}!` 
                  : step.title}
              </DialogTitle>
            </DialogHeader>

            {/* Description */}
            <p className="text-gray-600 text-center leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Tip */}
            {step.tip && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">Pro tip:</span> {step.tip}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={isFirstStep}
              className={cn(
                "gap-2",
                isFirstStep && "invisible"
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    index === currentStep 
                      ? "bg-[#4A6741] w-4" 
                      : "bg-gray-300 hover:bg-gray-400"
                  )}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="gap-2 bg-[#4A6741] hover:bg-[#3d5636] text-white"
            >
              {isLastStep ? "Start Coaching" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage dashboard tour state
 */
export function useDashboardTour() {
  const [showTour, setShowTour] = useState(false);

  const startTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setShowTour(true);
  };

  const hasCompletedTour = () => {
    return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
  };

  const shouldShowTour = (hasCompletedOnboarding: boolean, sessionCount: number) => {
    return hasCompletedOnboarding && !hasCompletedTour() && sessionCount === 0;
  };

  return {
    showTour,
    setShowTour,
    startTour,
    hasCompletedTour,
    shouldShowTour
  };
}

export { TOUR_STORAGE_KEY };
