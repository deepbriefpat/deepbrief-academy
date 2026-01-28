/**
 * Quick Start Guide Component
 * 
 * Provides contextual help and onboarding guidance for new users
 */

import { useState, useEffect } from "react";
import { X, Lightbulb, MessageCircle, Target, CheckCircle, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickStartGuideProps {
  page: "dashboard" | "goals" | "commitments" | "patterns" | "chat";
  onDismiss?: () => void;
}

const guideContent = {
  dashboard: {
    title: "Welcome to Your AI Executive Coach",
    icon: MessageCircle,
    steps: [
      {
        icon: MessageCircle,
        title: "Start a Coaching Session",
        description: "Click 'Coaching Chat' to begin. The AI coach asks sharp questions and challenges assumptions to help you think clearly under pressure."
      },
      {
        icon: Target,
        title: "Set Your Goals",
        description: "Define longer-term objectives you're working toward. Track progress and get coaching aligned with your priorities."
      },
      {
        icon: CheckCircle,
        title: "Track Commitments",
        description: "Every commitment is a promise to yourself. The coach remembers them all and holds you accountable."
      },
      {
        icon: TrendingUp,
        title: "Recognize Patterns",
        description: "Over time, the coach identifies thinking patterns that emerge under pressure—both helpful and limiting."
      }
    ],
    privacy: "Your data is completely confidential and encrypted. You can remove it at any time."
  },
  goals: {
    title: "How Goals Work",
    icon: Target,
    steps: [
      {
        icon: Target,
        title: "Set Clear Targets",
        description: "Goals are longer-term objectives with specific target dates. They provide direction for your coaching sessions."
      },
      {
        icon: Calendar,
        title: "Export to Calendar",
        description: "Click 'Add to Calendar' to sync goal deadlines with Google Calendar, Outlook, Apple Calendar, or Yahoo."
      },
      {
        icon: MessageCircle,
        title: "Discuss with Coach",
        description: "Click 'Discuss this with coach' to get guidance on strategy, obstacles, or next steps for any goal."
      },
      {
        icon: TrendingUp,
        title: "Track Progress",
        description: "Update progress as you work. The coach uses this context to provide more relevant guidance."
      }
    ],
    privacy: null
  },
  commitments: {
    title: "Understanding Commitments",
    icon: CheckCircle,
    steps: [
      {
        icon: CheckCircle,
        title: "Commitments Are Promises",
        description: "These aren't tasks—they're promises you made to yourself during coaching. The coach remembers every one."
      },
      {
        icon: Calendar,
        title: "Set Deadlines",
        description: "Add deadlines to commitments and export them to your calendar for reminders."
      },
      {
        icon: MessageCircle,
        title: "Accountability Check-Ins",
        description: "The coach asks about open commitments at the start of sessions. Be ready to report what happened."
      },
      {
        icon: TrendingUp,
        title: "Close the Loop",
        description: "Mark commitments complete when done. Closing loops builds momentum and trust with yourself."
      }
    ],
    privacy: null
  },
  patterns: {
    title: "Thinking Patterns Under Pressure",
    icon: TrendingUp,
    steps: [
      {
        icon: TrendingUp,
        title: "Pattern Recognition",
        description: "The coach identifies recurring thinking patterns that emerge when you're under pressure—both helpful and limiting."
      },
      {
        icon: Lightbulb,
        title: "Real-World Training",
        description: "This isn't a generic AI. It's trained on specific, real-world executive coaching experience to recognize patterns that matter."
      },
      {
        icon: MessageCircle,
        title: "Direct Coaching",
        description: "When patterns appear, the coach challenges assumptions and asks sharp questions to help you think more clearly."
      },
      {
        icon: CheckCircle,
        title: "Build Awareness",
        description: "Over time, you'll recognize your own patterns faster and adjust your thinking in real-time."
      }
    ],
    privacy: null
  },
  chat: {
    title: "How Coaching Sessions Work",
    icon: MessageCircle,
    steps: [
      {
        icon: MessageCircle,
        title: "No Fluff Conversations",
        description: "The coach asks sharp questions, challenges assumptions, and helps you think clearly under pressure. Expect direct coaching, not generic advice."
      },
      {
        icon: CheckCircle,
        title: "Commitment Tracking",
        description: "When you make a commitment during a session, the coach remembers it. You'll be asked about it next time."
      },
      {
        icon: TrendingUp,
        title: "Pattern Recognition",
        description: "The coach identifies thinking patterns that emerge across sessions—both helpful and limiting."
      },
      {
        icon: Lightbulb,
        title: "Choose Your Coach",
        description: "Select a coach personality that matches your needs: direct challenger, supportive guide, strategic thinker, or others."
      }
    ],
    privacy: "All conversations are confidential and encrypted. Your data is never shared."
  }
};

export function QuickStartGuide({ page, onDismiss }: QuickStartGuideProps) {
  const [dismissed, setDismissed] = useState(false);
  const content = guideContent[page];
  const Icon = content.icon;

  // Check if user has dismissed this guide before
  useEffect(() => {
    const key = `quickstart_dismissed_${page}`;
    const wasDismissed = localStorage.getItem(key);
    if (wasDismissed) {
      setDismissed(true);
    }
  }, [page]);

  const handleDismiss = () => {
    const key = `quickstart_dismissed_${page}`;
    localStorage.setItem(key, "true");
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed) {
    return null;
  }

  return (
    <Card className="mb-8 p-6 bg-gradient-to-br from-gold-500/10 to-gold-600/5 border-gold-400/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl -z-10"></div>
      
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-2 hover:bg-gold-500/10 rounded-lg transition-colors"
        aria-label="Dismiss guide"
      >
        <X className="w-4 h-4 text-gray-400 hover:text-gray-300" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-gold-400" />
        </div>
        <h3 className="text-xl font-bold text-white">{content.title}</h3>
      </div>

      {/* Steps */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {content.steps.map((step, index) => {
          const StepIcon = step.icon;
          return (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold-500/15 flex items-center justify-center mt-0.5">
                <StepIcon className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                <p className="text-sm text-gray-300 leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Privacy note */}
      {content.privacy && (
        <div className="pt-4 border-t border-gold-400/20">
          <p className="text-sm text-gray-300 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
            <span><strong>Privacy:</strong> {content.privacy}</span>
          </p>
        </div>
      )}

      {/* Action button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleDismiss}
          variant="outline"
          className="border-gold-400/40 text-gold-400 hover:bg-gold-400/10 hover:border-gold-400/60"
        >
          Got it, let's go
        </Button>
      </div>
    </Card>
  );
}
