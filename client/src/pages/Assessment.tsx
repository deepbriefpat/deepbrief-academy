import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { MetaTags } from "@/components/MetaTags";
import { Footer } from "@/components/Footer";

const ASSESSMENT_SECTIONS = [
  {
    title: "Decision Load",
    description: "How congested is your decision environment?",
    questions: [
      "I carry unresolved decisions that accumulate daily.",
      "I postpone decisions I know I need to make.",
      "I revisit the same options without progress.",
      "I have lost the margin required to think deeply.",
      "I feel relief when decisions are made for me by events.",
    ],
  },
  {
    title: "Authority Erosion",
    description: "How much do you trust your own judgment?",
    questions: [
      "I second-guess decisions after making them.",
      "I seek validation before acting on my judgment.",
      "I defer to others even when I have relevant expertise.",
      "I feel my judgment has degraded under pressure.",
      "I avoid decisions where I used to act decisively.",
    ],
  },
  {
    title: "Recovery Deficit",
    description: "How effective is your recovery process?",
    questions: [
      "I wake up still carrying yesterday's pressure.",
      "My rest periods don't restore my thinking capacity.",
      "I can't remember the last time I felt genuinely clear.",
      "My recovery practices have stopped working.",
      "I'm running on reserves I know are depleting.",
    ],
  },
  {
    title: "Signal Degradation",
    description: "How clearly are you reading your environment?",
    questions: [
      "I miss cues I would normally catch.",
      "I misread situations I should understand.",
      "I react to noise as if it were signal.",
      "My pattern recognition feels compromised.",
      "I'm making errors I wouldn't normally make.",
    ],
  },
  {
    title: "Isolation Depth",
    description: "How connected is your thinking?",
    questions: [
      "I'm solving problems alone that need collaboration.",
      "I've stopped seeking input from my usual thinking partners.",
      "I feel isolated in my decision-making.",
      "I'm not sharing the full weight of what I'm carrying.",
      "I've withdrawn from the support structures I built.",
    ],
  },
];

function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function calculateDepthLevel(score: number): "surface" | "thermocline" | "deep_water" | "crush_depth" {
  if (score <= 31) return "surface";
  if (score <= 62) return "thermocline";
  if (score <= 93) return "deep_water";
  return "crush_depth";
}

export default function Assessment() {
  const [, setLocation] = useLocation();
  const [currentSection, setCurrentSection] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  const submitMutation = trpc.assessment.submit.useMutation();

  // Check URL params for fresh start
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('fresh') === 'true') {
      localStorage.removeItem('assessmentProgress');
      // Remove the param from URL without refresh
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    
    // Load saved progress from localStorage on mount
    const savedProgress = localStorage.getItem('assessmentProgress');
    if (savedProgress) {
      try {
        const { name: savedName, email: savedEmail, responses: savedResponses, currentSection: savedSection, hasStarted: savedHasStarted } = JSON.parse(savedProgress);
        if (savedName) setName(savedName);
        if (savedEmail) setEmail(savedEmail);
        if (savedResponses && Object.keys(savedResponses).length > 0) {
          setResponses(savedResponses);
          setHasSavedProgress(true);
        }
        if (savedSection !== undefined) setCurrentSection(savedSection);
        if (savedHasStarted) setHasStarted(savedHasStarted);
      } catch (e) {
        // Invalid saved data, ignore
      }
    }
  }, []);

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    if (name || email || Object.keys(responses).length > 0 || hasStarted) {
      localStorage.setItem('assessmentProgress', JSON.stringify({
        name,
        email,
        responses,
        currentSection,
        hasStarted
      }));
    }
  }, [name, email, responses, currentSection, hasStarted]);

  // Clear saved progress
  const clearSavedProgress = () => {
    localStorage.removeItem('assessmentProgress');
    setName("");
    setEmail("");
    setResponses({});
    setCurrentSection(0);
    setHasStarted(false);
    setHasSavedProgress(false);
  };

  const currentSectionData = ASSESSMENT_SECTIONS[currentSection];
  const totalSections = ASSESSMENT_SECTIONS.length;
  const isLastSection = currentSection === totalSections - 1;

  // Check if all questions in current section are answered
  const currentSectionAnswered = currentSectionData.questions.every((_, index) => {
    const key = `${currentSection}_${index}`;
    return responses[key] !== undefined && responses[key] !== "";
  });

  const handleStart = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter your name and email");
      return;
    }

    setHasStarted(true);
    toast.success("Assessment started!");
  };

  const handleResponseChange = (questionIndex: number, value: string) => {
    const key = `${currentSection}_${questionIndex}`;
    setResponses(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (!currentSectionAnswered) {
      toast.error("Please answer all questions before continuing");
      return;
    }

    if (isLastSection) {
      handleSubmit();
    } else {
      setCurrentSection(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentSection(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    try {
      // Convert responses to numbers and calculate score
      const numericResponses: Record<string, number> = {};
      let totalScore = 0;
      
      Object.entries(responses).forEach(([key, value]) => {
        const numValue = parseInt(value, 10);
        numericResponses[key] = numValue;
        totalScore += numValue;
      });

      const depthLevel = calculateDepthLevel(totalScore);

      await submitMutation.mutateAsync({
        sessionId,
        responses: numericResponses,
        depthLevel,
        score: totalScore,
      });

      // Clear saved progress after successful submission
      clearSavedProgress();
      
      toast.success("Assessment completed!");
      setLocation(`/assessment/results?session=${sessionId}`);
    } catch (error) {
      toast.error("Failed to submit assessment. Please try again.");
    }
  };

  // Check if there's saved progress to resume
  const hasSavedProgress = Object.keys(responses).length > 0;

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-background">
        <MetaTags
          title="The Pressure Audit | The Deep Brief"
          description="A 5-section diagnostic that locates the distortion in your judgement, authority, and recovery."
        />
        
        <div className="container max-w-2xl py-12">
          <div className="text-center mb-12">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              INTERNAL DIAGNOSTIC
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">The Pressure Audit</h1>
            <p className="text-lg text-muted-foreground">
              A 5-section diagnostic that locates the distortion in your judgement, authority, and recovery.
            </p>
          </div>

          {/* Resume Progress Banner */}
          {hasSavedProgress && (
            <Card className="mb-6 border-gold bg-gold/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gold">You have saved progress</p>
                    <p className="text-sm text-muted-foreground">Pick up where you left off or start fresh</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSavedProgress}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Start Fresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Before You Begin</CardTitle>
              <CardDescription>
                This assessment takes 8-10 minutes. Your results will be displayed immediately upon completion.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  We'll send your detailed pressure profile to this address.
                </p>
              </div>
              <Button
                onClick={handleStart}
                className="w-full"
                size="lg"
              >
                {hasSavedProgress ? "Continue Assessment" : "Start Assessment"}
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-8 mt-12 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">5</div>
              <div className="text-sm text-muted-foreground">Pressure Dimensions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">25</div>
              <div className="text-sm text-muted-foreground">Diagnostic Questions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">8-10</div>
              <div className="text-sm text-muted-foreground">Minutes to Complete</div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="The Pressure Audit | The Deep Brief"
        description="A 5-section diagnostic that locates the distortion in your judgement, authority, and recovery."
      />
      
      <div className="container max-w-3xl py-12">
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            INTERNAL DIAGNOSTIC
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">The Pressure Audit</h1>
          <p className="text-muted-foreground">
            Locating the distortion in judgement, authority, and recovery.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Section {currentSection + 1} of {totalSections}</span>
            <span>{Math.round(((currentSection + 1) / totalSections) * 100)}% Complete</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">
                PROTOCOL
              </span>
              <span className="text-sm text-muted-foreground">
                Section {currentSection + 1} of {totalSections}
              </span>
            </div>
            <CardTitle className="text-2xl">{currentSectionData.title}</CardTitle>
            <CardDescription className="text-base">{currentSectionData.description}</CardDescription>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Score 1-5. Brutal honesty is the only requirement.</strong>
                <br />
                1 = Rarely, 5 = Constant.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {currentSectionData.questions.map((question, index) => {
              const key = `${currentSection}_${index}`;
              const selectedValue = responses[key] || "";
              
              return (
                <div key={index} className="space-y-4">
                  <p className="font-medium text-base">{question}</p>
                  <div className="flex gap-3 justify-center">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const isSelected = selectedValue === value.toString();
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleResponseChange(index, value.toString())}
                          className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-lg"
                              : "border-muted hover:border-primary/50"
                          }`}
                        >
                          <div
                            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-semibold transition-all ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/30 text-muted-foreground"
                            }`}
                          >
                            {value}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {value === 1 ? "Rarely" : value === 5 ? "Constant" : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handleBack}
            disabled={currentSection === 0}
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={!currentSectionAnswered || submitMutation.isPending}
            size="lg"
          >
            {submitMutation.isPending ? (
              "Submitting..."
            ) : isLastSection ? (
              "Complete Assessment"
            ) : (
              <>
                Next Section
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
