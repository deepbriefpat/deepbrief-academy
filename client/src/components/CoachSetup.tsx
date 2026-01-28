import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { COACH_NAMES, CoachGender, CoachPreferences } from "@/data/coachNames";
import { User, Sparkles } from "lucide-react";

interface CoachSetupProps {
  open: boolean;
  onComplete: (preferences: CoachPreferences) => void;
}

export function CoachSetup({ open, onComplete }: CoachSetupProps) {
  const [gender, setGender] = useState<CoachGender>("female");
  const [nameOption, setNameOption] = useState<"predefined" | "custom">("predefined");
  const [selectedName, setSelectedName] = useState<string>(COACH_NAMES.female[0]);
  const [customName, setCustomName] = useState("");

  const handleGenderChange = (newGender: CoachGender) => {
    setGender(newGender);
    setSelectedName(COACH_NAMES[newGender][0]);
  };

  const handleSubmit = () => {
    const finalName = nameOption === "custom" && customName.trim() 
      ? customName.trim() 
      : selectedName;

    onComplete({
      gender,
      name: finalName,
      isCustomName: nameOption === "custom" && customName.trim() !== "",
    });
  };

  const isValid = nameOption === "predefined" || (nameOption === "custom" && customName.trim() !== "");

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-navy-mid border-gold-dim">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-gold flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Personalize Your Coach
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Customize your coaching experience by selecting your coach's gender and name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Gender Selection */}
          <div className="space-y-3">
            <Label className="text-gold font-semibold">Coach Gender Preference</Label>
            <RadioGroup value={gender} onValueChange={(value) => handleGenderChange(value as CoachGender)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-gold-dim hover:bg-navy-light transition-colors">
                <RadioGroupItem value="female" id="female" />
                <img src="/avatars/coach-female.png" alt="Female coach" className="w-10 h-10 rounded-full" />
                <Label htmlFor="female" className="flex-1 cursor-pointer text-white">
                  Female Coach
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-gold-dim hover:bg-navy-light transition-colors">
                <RadioGroupItem value="male" id="male" />
                <img src="/avatars/coach-male.png" alt="Male coach" className="w-10 h-10 rounded-full" />
                <Label htmlFor="male" className="flex-1 cursor-pointer text-white">
                  Male Coach
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-gold-dim hover:bg-navy-light transition-colors">
                <RadioGroupItem value="nonbinary" id="nonbinary" />
                <img src="/avatars/coach-nonbinary.png" alt="Non-binary coach" className="w-10 h-10 rounded-full" />
                <Label htmlFor="nonbinary" className="flex-1 cursor-pointer text-white">
                  Non-Binary Coach
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Name Selection */}
          <div className="space-y-3">
            <Label className="text-gold font-semibold">Coach Name</Label>
            
            <RadioGroup value={nameOption} onValueChange={(value) => setNameOption(value as "predefined" | "custom")}>
              {/* Predefined Names */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="predefined" id="predefined" />
                  <Label htmlFor="predefined" className="cursor-pointer text-white">
                    Choose from list
                  </Label>
                </div>
                
                {nameOption === "predefined" && (
                  <div className="ml-6 space-y-2">
                    {COACH_NAMES[gender].map((name) => (
                      <div
                        key={name}
                        onClick={() => setSelectedName(name)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedName === name
                            ? "border-gold bg-gold/10 text-gold"
                            : "border-gold-dim hover:bg-navy-light text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Name */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="cursor-pointer text-white">
                    Enter custom name
                  </Label>
                </div>
                
                {nameOption === "custom" && (
                  <div className="ml-6">
                    <Input
                      type="text"
                      placeholder="Enter your coach's name..."
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="bg-navy-deep border-gold-dim text-white placeholder-gray-500 focus:ring-gold"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="bg-gold hover:bg-gold-light text-navy-deep font-semibold px-6"
          >
            Start Coaching Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
