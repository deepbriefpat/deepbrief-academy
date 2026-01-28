import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

type ExperienceLevel = "first_time" | "mid_level" | "senior" | "executive";

interface OnboardingData {
  preferredName: string;
  role: string;
  experienceLevel: ExperienceLevel;
  goals: string[];
  pressures: string[];
  challenges: string[];
  decisionBottlenecks: string;
  teamDynamics: string;
}

export default function AICoachOnboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    preferredName: "",
    role: "",
    experienceLevel: "mid_level",
    goals: [],
    pressures: [],
    challenges: [],
    decisionBottlenecks: "",
    teamDynamics: ""
  });

  const utils = trpc.useUtils();
  
  const createProfile = trpc.aiCoach.createProfile.useMutation({
    onSuccess: () => {
      // Invalidate profile cache so Settings page shows updated data
      utils.aiCoach.getProfile.invalidate();
      setLocation("/ai-coach/dashboard");
    }
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const experienceLevels = [
    { value: "first_time" as const, label: "First-Time Manager", description: "New to leadership" },
    { value: "mid_level" as const, label: "Mid-Level Leader", description: "Managing teams or projects" },
    { value: "senior" as const, label: "Senior Leader", description: "Leading multiple teams" },
    { value: "executive" as const, label: "Executive", description: "C-suite or VP level" }
  ];

  const commonGoals = [
    "Build confidence in decision-making",
    "Improve team communication",
    "Delegate more effectively",
    "Give better feedback",
    "Manage conflict productively",
    "Think more strategically",
    "Balance workload better",
    "Develop my leadership presence"
  ];

  const commonPressures = [
    "Too many decisions, too little time",
    "Constant context switching",
    "Team performance issues",
    "Stakeholder expectations",
    "Work-life balance",
    "Imposter syndrome",
    "Lack of support from above",
    "Unclear priorities"
  ];

  const commonChallenges = [
    "Difficult conversations with team members",
    "Delegating without micromanaging",
    "Managing up effectively",
    "Building team cohesion",
    "Time management",
    "Strategic vs. operational balance",
    "Giving tough feedback",
    "Handling underperformance"
  ];

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Submit
      createProfile.mutate({
        preferredName: data.preferredName,
        role: data.role,
        experienceLevel: data.experienceLevel,
        goals: data.goals,
        pressures: data.pressures,
        challenges: data.challenges,
        decisionBottlenecks: data.decisionBottlenecks,
        teamDynamics: data.teamDynamics
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.preferredName.trim().length > 0 && data.role.trim().length > 0 && data.experienceLevel;
      case 2:
        return data.goals.length > 0;
      case 3:
        return data.pressures.length > 0;
      case 4:
        return data.challenges.length > 0;
      case 5:
        return data.teamDynamics.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-navy-deep py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 bg-navy-light rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-gold-light to-gold transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-navy-mid border border-gold/20 rounded-xl p-8 mb-6">
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Let's Get Started</h2>
              <p className="text-gray-400 mb-8">Tell us about your current role and experience level.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">What should we call you?</label>
                  <input
                    type="text"
                    value={data.preferredName}
                    onChange={(e) => setData({ ...data, preferredName: e.target.value })}
                    placeholder="e.g., Patrick, Pat, Mr. Voorma"
                    className="w-full px-4 py-3 bg-navy-light border border-gold/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  />
                  <p className="text-sm text-gray-400 mt-1">This is how your coach will address you</p>
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Your Role/Title</label>
                  <input
                    type="text"
                    value={data.role}
                    onChange={(e) => setData({ ...data, role: e.target.value })}
                    placeholder="e.g., Engineering Manager, VP of Sales, Team Lead"
                    className="w-full px-4 py-3 bg-navy-light border border-gold/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-3">Experience Level</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {experienceLevels.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => setData({ ...data, experienceLevel: level.value })}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          data.experienceLevel === level.value
                            ? "border-gold bg-gold/10"
                            : "border-gold/20 hover:border-gold/40"
                        }`}
                      >
                        <div className="font-semibold text-white mb-1">{level.label}</div>
                        <div className="text-sm text-gray-400">{level.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Your Leadership Goals</h2>
              <p className="text-gray-400 mb-8">Select all that apply. You can add more later.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {commonGoals.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => setData({ ...data, goals: toggleArrayItem(data.goals, goal) })}
                    className={`p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${
                      data.goals.includes(goal)
                        ? "border-gold bg-gold/10"
                        : "border-gold/20 hover:border-gold/40"
                    }`}
                  >
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 ${data.goals.includes(goal) ? "text-gold" : "text-gray-600"}`} />
                    <span className="text-white">{goal}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Current Pressures</h2>
              <p className="text-gray-400 mb-8">What's creating pressure in your leadership right now?</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {commonPressures.map((pressure) => (
                  <button
                    key={pressure}
                    onClick={() => setData({ ...data, pressures: toggleArrayItem(data.pressures, pressure) })}
                    className={`p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${
                      data.pressures.includes(pressure)
                        ? "border-gold bg-gold/10"
                        : "border-gold/20 hover:border-gold/40"
                    }`}
                  >
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 ${data.pressures.includes(pressure) ? "text-gold" : "text-gray-600"}`} />
                    <span className="text-white">{pressure}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Recurring Challenges</h2>
              <p className="text-gray-400 mb-8">Which leadership challenges come up most often for you?</p>
              
              <div className="grid grid-cols-1 gap-3">
                {commonChallenges.map((challenge) => (
                  <button
                    key={challenge}
                    onClick={() => setData({ ...data, challenges: toggleArrayItem(data.challenges, challenge) })}
                    className={`p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${
                      data.challenges.includes(challenge)
                        ? "border-gold bg-gold/10"
                        : "border-gold/20 hover:border-gold/40"
                    }`}
                  >
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 ${data.challenges.includes(challenge) ? "text-gold" : "text-gray-600"}`} />
                    <span className="text-white">{challenge}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-6">
                <label className="block text-white font-medium mb-2">Decision Bottlenecks (Optional)</label>
                <textarea
                  value={data.decisionBottlenecks}
                  onChange={(e) => setData({ ...data, decisionBottlenecks: e.target.value })}
                  placeholder="What slows down your decision-making?"
                  rows={3}
                  className="w-full px-4 py-3 bg-navy-light border border-gold/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Team Dynamics</h2>
              <p className="text-gray-400 mb-8">Tell us about your team situation so we can provide relevant coaching.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">Describe your team</label>
                  <textarea
                    value={data.teamDynamics}
                    onChange={(e) => setData({ ...data, teamDynamics: e.target.value })}
                    placeholder="Team size, structure, dynamics, challenges... (e.g., 'I manage a team of 8 engineers, mostly remote, with varying experience levels. We're growing fast and struggling with alignment.')"
                    rows={6}
                    className="w-full px-4 py-3 bg-navy-light border border-gold/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-6 py-3 bg-navy-light border border-gold/20 text-white rounded-lg hover:border-gold/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canProceed() || createProfile.isPending}
            className="px-6 py-3 bg-gradient-to-r from-gold-light to-gold text-navy-deep font-semibold rounded-lg hover:shadow-lg hover:shadow-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-white"
          >
            {step === totalSteps ? (
              createProfile.isPending ? "Creating Profile..." : "Complete Setup"
            ) : (
              <>
                Next
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
