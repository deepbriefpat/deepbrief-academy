/**
 * Onboarding Flow Component
 * 
 * Multi-step onboarding for new users:
 * 1. Welcome & platform overview
 * 2. Coach selection
 * 3. Initial goal setting
 * 4. Quick tutorial
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  Users, 
  Target, 
  BookOpen, 
  ArrowRight, 
  ArrowLeft,
  Check
} from "lucide-react";
import { COACH_PROFILES, type CoachProfile } from "@/data/coachProfiles";
import { trpc } from "@/lib/trpc";

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: (data: {
    selectedCoach: string;
    initialGoals: Array<{ title: string; description: string }>;
  }) => void;
  onSkip: () => void;
}

const ONBOARDING_STORAGE_KEY = "onboarding_progress";

interface OnboardingProgress {
  step: number;
  selectedCoach: string;
  selectedGender: "all" | "female" | "male" | "nonbinary";
  goals: Array<{ title: string; description: string }>;
}

export function OnboardingFlow({ isOpen, onComplete, onSkip }: OnboardingFlowProps) {
  // Load saved progress from localStorage
  const loadProgress = (): OnboardingProgress | null => {
    try {
      const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const savedProgress = loadProgress();
  const [step, setStep] = useState(savedProgress?.step || 1);
  const [selectedCoach, setSelectedCoach] = useState<string>(savedProgress?.selectedCoach || "");
  const [selectedGender, setSelectedGender] = useState<"all" | "female" | "male" | "nonbinary">(savedProgress?.selectedGender || "all");
  const [goals, setGoals] = useState<Array<{ title: string; description: string }>>(savedProgress?.goals || [
    { title: "", description: "" }
  ]);

  const totalSteps = 4;

  const filteredCoaches = selectedGender === "all" 
    ? COACH_PROFILES 
    : COACH_PROFILES.filter(c => c.gender === selectedGender);

  const handleNext = () => {
    const timeSpent = Math.floor((Date.now() - stepStartTime) / 1000);
    trackStepMutation.mutate({ step, action: "complete", timeSpent });

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      const validGoals = goals.filter(g => g.title.trim() !== "");
      clearProgress();
      onComplete({
        selectedCoach,
        initialGoals: validGoals
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAddGoal = () => {
    if (goals.length < 3) {
      setGoals([...goals, { title: "", description: "" }]);
    }
  };

  const handleRemoveGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleGoalChange = (index: number, field: "title" | "description", value: string) => {
    const newGoals = [...goals];
    newGoals[index][field] = value;
    setGoals(newGoals);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return true; // Welcome step, always can proceed
      case 2:
        return selectedCoach !== ""; // Must select a coach
      case 3:
        return goals.some(g => g.title.trim() !== ""); // At least one goal with title
      case 4:
        return true; // Tutorial step, always can proceed
      default:
        return false;
    }
  };

  const trackStepMutation = trpc.onboarding.trackStep.useMutation();
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());

  // Track step views
  useEffect(() => {
    if (isOpen) {
      setStepStartTime(Date.now());
      trackStepMutation.mutate({ step, action: "view" });
    }
  }, [step, isOpen]);

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    if (isOpen) {
      const progress: OnboardingProgress = {
        step,
        selectedCoach,
        selectedGender,
        goals
      };
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progress));
    }
  }, [step, selectedCoach, selectedGender, goals, isOpen]);

  // Clear progress on completion or skip
  const clearProgress = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
  };

  // Keyboard navigation: Enter to proceed, Escape to skip
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && canProceed()) {
        e.preventDefault();
        handleNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        const timeSpent = Math.floor((Date.now() - stepStartTime) / 1000);
        trackStepMutation.mutate({ step, action: "skip", timeSpent });
        onSkip();
        clearProgress();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, step, selectedCoach, goals]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal={true}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        {/* Header with progress */}
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-2xl font-bold text-[#2C2C2C]">
              Welcome to AI Coach
            </DialogTitle>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    i + 1 <= step ? "bg-[#4A6741]" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </DialogHeader>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#4A6741]/10 mb-6">
                <Sparkles className="w-10 h-10 text-[#4A6741]" />
              </div>
              <h2 className="text-3xl font-bold text-[#2C2C2C] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Your Leadership Partner
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                AI Coach helps you navigate leadership challenges, make better decisions, and achieve your goals. 
                Let's get you started with a quick setup.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 border-[#E6E2D6]" style={{ backgroundColor: 'white', color: '#2C2C2C' }}>
                <Users className="w-8 h-8 text-[#4A6741] mb-3" />
                <h3 className="font-semibold text-[#2C2C2C] mb-2" style={{ color: '#2C2C2C' }}>24 Expert Coaches</h3>
                <p className="text-sm text-gray-600" style={{ color: '#4A4A4A' }}>
                  Choose from diverse coaching styles and specialties to match your needs
                </p>
              </Card>
              <Card className="p-6 border-[#E6E2D6]" style={{ backgroundColor: 'white', color: '#2C2C2C' }}>
                <Target className="w-8 h-8 text-[#4A6741] mb-3" />
                <h3 className="font-semibold text-[#2C2C2C] mb-2" style={{ color: '#2C2C2C' }}>Goal Tracking</h3>
                <p className="text-sm text-gray-600" style={{ color: '#4A4A4A' }}>
                  Set goals and track your progress with personalized insights
                </p>
              </Card>
              <Card className="p-6 border-[#E6E2D6]" style={{ backgroundColor: 'white', color: '#2C2C2C' }}>
                <BookOpen className="w-8 h-8 text-[#4A6741] mb-3" />
                <h3 className="font-semibold text-[#2C2C2C] mb-2" style={{ color: '#2C2C2C' }}>25 Templates</h3>
                <p className="text-sm text-gray-600" style={{ color: '#4A4A4A' }}>
                  Tactical frameworks for tough situations and high-stakes decisions
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Coach Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2">Choose Your Coach</h2>
              <p className="text-gray-600">
                Select a coach that resonates with you. You can switch anytime.
              </p>
            </div>

            {/* Gender Filter */}
            <div className="flex items-center justify-center gap-2 pb-4 border-b border-[#E6E2D6]">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={selectedGender === "all" ? "default" : "outline"}
                  onClick={() => setSelectedGender("all")}
                  className={selectedGender === "all" ? "bg-[#4A6741] text-white" : ""}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={selectedGender === "female" ? "default" : "outline"}
                  onClick={() => setSelectedGender("female")}
                  className={selectedGender === "female" ? "bg-[#4A6741] text-white" : ""}
                >
                  Female
                </Button>
                <Button
                  size="sm"
                  variant={selectedGender === "male" ? "default" : "outline"}
                  onClick={() => setSelectedGender("male")}
                  className={selectedGender === "male" ? "bg-[#4A6741] text-white" : ""}
                >
                  Male
                </Button>
                <Button
                  size="sm"
                  variant={selectedGender === "nonbinary" ? "default" : "outline"}
                  onClick={() => setSelectedGender("nonbinary")}
                  className={selectedGender === "nonbinary" ? "bg-[#4A6741] text-white" : ""}
                >
                  Non-binary
                </Button>
              </div>
            </div>

            {/* Coach Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
              {filteredCoaches.map((coach) => (
                <div
                  key={coach.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedCoach === coach.id
                      ? "border-2 border-[#4A6741] bg-[#F5F3EE]"
                      : "border border-[#E6E2D6] hover:border-[#4A6741]/50 bg-white"
                  }`}
                  onClick={() => setSelectedCoach(coach.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                      <img 
                        src={coach.avatar} 
                        alt={coach.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-semibold text-[#2C2C2C] truncate">
                          {coach.name}
                        </h3>
                        {selectedCoach === coach.id && (
                          <Check className="w-4 h-4 text-[#4A6741] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[#4A4A4A] mb-2">{coach.title}</p>
                      <div className="flex flex-wrap gap-1">
                        {coach.specialties.slice(0, 2).map((specialty) => (
                          <span
                            key={specialty}
                            className="px-2 py-0.5 text-xs rounded-full bg-[#E6E2D6] text-[#2C2C2C]"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Goal Setting */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2">Set Your Initial Goals</h2>
              <p className="text-gray-600">
                What would you like to work on? Add 1-3 goals to get started.
              </p>
            </div>

            <div className="space-y-4">
              {goals.map((goal, index) => (
                <Card key={index} className="p-4 border-[#E6E2D6]">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Goal {index + 1}
                        </label>
                        <Input
                          placeholder="e.g., Improve delegation skills"
                          value={goal.title}
                          onChange={(e) => handleGoalChange(index, "title", e.target.value)}
                          className="border-[#E6E2D6]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Why this matters (optional)
                        </label>
                        <Textarea
                          placeholder="e.g., I'm taking on more direct reports and need to free up time for strategic work"
                          value={goal.description}
                          onChange={(e) => handleGoalChange(index, "description", e.target.value)}
                          className="border-[#E6E2D6] min-h-[80px]"
                        />
                      </div>
                    </div>
                    {goals.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveGoal(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {goals.length < 3 && (
              <Button
                variant="outline"
                onClick={handleAddGoal}
                className="w-full border-dashed border-2 border-[#E6E2D6] hover:border-[#4A6741] hover:bg-[#F5F3EE]"
              >
                + Add Another Goal
              </Button>
            )}
          </div>
        )}

        {/* Step 4: Tutorial */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2">You're All Set!</h2>
              <p className="text-gray-600">
                Here's a quick overview of how to get the most out of AI Coach
              </p>
            </div>

            <div className="space-y-4">
              <Card className="p-6 border-[#E6E2D6]">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4A6741] text-white flex items-center justify-center font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2C2C2C] mb-2">Start a Coaching Session</h3>
                    <p className="text-sm text-gray-600">
                      Click "Start Coaching Session" to begin. Choose between a full session or quick 3-minute check-in.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-[#E6E2D6]">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4A6741] text-white flex items-center justify-center font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2C2C2C] mb-2">Use Templates</h3>
                    <p className="text-sm text-gray-600">
                      Browse 25 tactical templates for specific situations like difficult conversations, board meetings, or firing decisions.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-[#E6E2D6]">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4A6741] text-white flex items-center justify-center font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2C2C2C] mb-2">Switch Coaches Anytime</h3>
                    <p className="text-sm text-gray-600">
                      Try different coaches for different challenges. Your conversation history is preserved when you switch.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-[#E6E2D6]">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#4A6741] text-white flex items-center justify-center font-semibold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2C2C2C] mb-2">Track Your Progress</h3>
                    <p className="text-sm text-gray-600">
                      View your goals, commitments, patterns, and insights in the sidebar. See your growth over time.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-[#E6E2D6] mt-6">
          <div className="flex-shrink-0 order-2 sm:order-1">
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                className="border-[#E6E2D6] w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div className="hidden sm:block w-24" /> 
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 order-1 sm:order-2">
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-gray-600 hover:text-gray-900 flex-1 sm:flex-none"
            >
              Skip for now
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-500 hover:to-gold-700 text-white font-bold shadow-lg shadow-gold-500/30 border border-gold-300 min-w-[120px] flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {step === totalSteps ? "Get Started" : "Next"}
              {step < totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
