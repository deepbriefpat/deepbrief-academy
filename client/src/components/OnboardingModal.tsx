import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

// V22: First-time user onboarding modal
export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [preferredName, setPreferredName] = useState("");
  const [role, setRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<"first_time" | "mid_level" | "senior" | "executive">("executive");
  const [preferredCoachGender, setPreferredCoachGender] = useState<"female" | "male" | "nonbinary" | "no_preference">("no_preference");
  const [communicationStyle, setCommunicationStyle] = useState<"direct" | "supportive" | "balanced">("balanced");

  const utils = trpc.useUtils();
  const updateMutation = trpc.aiCoach.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile set up successfully!");
      utils.aiCoach.getProfile.invalidate();
      onComplete();
    },
    onError: (error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!preferredName.trim()) {
      toast.error("Please enter your preferred name");
      return;
    }

    updateMutation.mutate({
      preferredName,
      role,
      experienceLevel,
      coachingPreferences: {
        preferredCoachGender,
        communicationStyle,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#2C2C2C]">Welcome to AI Coach</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Let's personalize your coaching experience. This will only take a minute.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Preferred Name */}
          <div className="space-y-2">
            <Label htmlFor="preferredName" className="text-sm font-medium">
              What should I call you? <span className="text-red-500">*</span>
            </Label>
            <Input
              id="preferredName"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              placeholder="e.g., Patrick"
              className="text-[#2C2C2C]"
              required
            />
            <p className="text-xs text-muted-foreground">
              This is how your AI coach will address you in conversations
            </p>
          </div>

          {/* Current Role */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Current Role
            </Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Territory Director, CEO, Founder"
            />
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <Label htmlFor="experienceLevel" className="text-sm font-medium">
              Experience Level
            </Label>
            <Select value={experienceLevel} onValueChange={(value: any) => setExperienceLevel(value)}>
              <SelectTrigger id="experienceLevel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first_time">First-Time Manager</SelectItem>
                <SelectItem value="mid_level">Mid-Level (2-5 years)</SelectItem>
                <SelectItem value="senior">Senior (5-10 years)</SelectItem>
                <SelectItem value="executive">Executive (C-Suite, VP+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Coach Gender Preference */}
          <div className="space-y-2">
            <Label htmlFor="coachGender" className="text-sm font-medium">
              Preferred Coach Gender
            </Label>
            <Select value={preferredCoachGender} onValueChange={(value: any) => setPreferredCoachGender(value)}>
              <SelectTrigger id="coachGender">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_preference">No Preference</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="nonbinary">Non-Binary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Communication Style */}
          <div className="space-y-2">
            <Label htmlFor="commStyle" className="text-sm font-medium">
              Communication Style
            </Label>
            <Select value={communicationStyle} onValueChange={(value: any) => setCommunicationStyle(value)}>
              <SelectTrigger id="commStyle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct (Challenge me, be blunt)</SelectItem>
                <SelectItem value="balanced">Balanced (Mix of both)</SelectItem>
                <SelectItem value="supportive">Supportive (Encourage, be gentle)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How would you like your coach to communicate with you?
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-[#4A6741] hover:bg-[#3a5331] text-white"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save & Start Coaching"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
