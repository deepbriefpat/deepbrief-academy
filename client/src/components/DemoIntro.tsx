/**
 * Demo Introduction Component
 * 
 * Shows an introduction page before starting the free demo
 * - Explains what the AI coaching is and isn't
 * - Collects the user's preferred name
 * - Sets expectations for the 10 free interactions
 */

import { useState } from "react";
import { MessageCircle, Brain, Clock, Shield, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DemoIntroProps {
  onComplete: (name: string) => void;
  onSkip?: () => void;
}

export function DemoIntro({ onComplete, onSkip }: DemoIntroProps) {
  const [name, setName] = useState("");
  const [step, setStep] = useState<"intro" | "name">("intro");

  const handleContinue = () => {
    if (step === "intro") {
      setStep("name");
    } else if (name.trim()) {
      onComplete(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1A1A] text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {step === "intro" && (
          <div className="animate-fade-in">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#D4A853] to-[#B8943A] rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-[#0B1A1A]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-serif mb-4">
                AI Executive Coaching
              </h1>
              <p className="text-lg text-gray-400">
                10 free coaching interactions to see if this works for you
              </p>
            </div>

            {/* What This Is */}
            <div className="bg-[#0F2424] rounded-xl p-6 mb-6 border border-[#D4A853]/20">
              <h2 className="text-lg font-semibold text-[#D4A853] mb-4">What This Is</h2>
              <div className="space-y-3">
                {[
                  "A thinking partner for leadership challenges",
                  "Direct coaching that gets to the point",
                  "A safe space to work through difficult decisions",
                  "Available 24/7 when you need to think out loud"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#4A6741] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* What This Isn't */}
            <div className="bg-[#0F2424] rounded-xl p-6 mb-6 border border-gray-700/50">
              <h2 className="text-lg font-semibold text-gray-400 mb-4">What This Isn't</h2>
              <div className="space-y-3 text-gray-500">
                <p>• Not a replacement for human connection or professional therapy</p>
                <p>• Not a magic solution — you still have to do the work</p>
                <p>• Not advice from someone who knows your specific situation fully</p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-[#0F2424]/50 rounded-lg">
                <MessageCircle className="w-6 h-6 text-[#D4A853] mx-auto mb-2" />
                <p className="text-sm text-gray-400">Real coaching conversations</p>
              </div>
              <div className="text-center p-4 bg-[#0F2424]/50 rounded-lg">
                <Clock className="w-6 h-6 text-[#D4A853] mx-auto mb-2" />
                <p className="text-sm text-gray-400">10 free interactions</p>
              </div>
              <div className="text-center p-4 bg-[#0F2424]/50 rounded-lg">
                <Shield className="w-6 h-6 text-[#D4A853] mx-auto mb-2" />
                <p className="text-sm text-gray-400">Confidential & private</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleContinue}
                className="bg-[#D4A853] hover:bg-[#c49743] text-[#0B1A1A] font-semibold px-8 py-3 rounded-lg flex items-center gap-2"
              >
                Get Started
                <ChevronRight className="w-5 h-5" />
              </Button>
              {onSkip && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="text-gray-400 hover:text-white"
                >
                  Skip intro
                </Button>
              )}
            </div>
          </div>
        )}

        {step === "name" && (
          <div className="animate-fade-in text-center">
            <h2 className="text-2xl md:text-3xl font-serif mb-4">
              Before we begin
            </h2>
            <p className="text-gray-400 mb-8">
              What should I call you?
            </p>

            <div className="max-w-sm mx-auto space-y-6">
              <Input
                type="text"
                placeholder="Your first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim()) {
                    handleContinue();
                  }
                }}
                className="bg-[#0F2424] border-[#D4A853]/30 text-white text-center text-lg py-4 placeholder:text-gray-500 focus:border-[#D4A853]"
                autoFocus
              />

              <Button
                onClick={handleContinue}
                disabled={!name.trim()}
                className="w-full bg-[#D4A853] hover:bg-[#c49743] text-[#0B1A1A] font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Coaching Session
              </Button>

              <button
                onClick={() => setStep("intro")}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
