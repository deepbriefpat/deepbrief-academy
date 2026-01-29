/**
 * Voice Input Demo Component
 * 
 * Shows mobile users how to use voice input with animated walkthrough
 * Increases voice feature adoption on mobile devices
 */

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceInputDemoProps {
  onClose: () => void;
  onComplete?: () => void;
}

const DEMO_STEPS = [
  {
    image: "/voice-demo-step1.png",
    title: "Tap to Speak",
    description: "Press the microphone button to start recording your message. It's faster than typing!"
  },
  {
    image: "/voice-demo-step2.png",
    title: "We're Listening",
    description: "Speak naturally. You'll see sound waves showing the coach is actively listening to you."
  },
  {
    image: "/voice-demo-step3.png",
    title: "Tap Again to Send",
    description: "Press the microphone button again to stop recording. Your words will be transcribed and ready to send."
  }
];

export function VoiceInputDemo({ onClose, onComplete }: VoiceInputDemoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenDemo, setHasSeenDemo] = useState(false);

  useEffect(() => {
    // Check if user has seen the demo before
    const seen = localStorage.getItem("voiceDemoSeen");
    if (seen) {
      setHasSeenDemo(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("voiceDemoSeen", "true");
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem("voiceDemoSeen", "true");
    onClose();
  };

  const step = DEMO_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl max-w-md w-full shadow-2xl border border-gold-400/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl -z-10"></div>
        
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 hover:bg-gold-500/10 rounded-lg transition-colors z-10"
          aria-label="Skip demo"
        >
          <X className="w-5 h-5 text-gray-400 hover:text-gray-300" />
        </button>

        {/* Content */}
        <div className="p-8 pt-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Try Voice Input
            </h2>
            <p className="text-gray-300 text-sm">
              Speak naturally - it's faster than typing
            </p>
          </div>

          {/* Step Image */}
          <div className="mb-8 flex justify-center">
            <div className="relative w-64 h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-gray-800">
              <img
                src={step.image}
                alt={step.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Step Info */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-white mb-3">
              {step.title}
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {DEMO_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStep
                    ? "bg-gold-400 w-8"
                    : "bg-gray-600 hover:bg-gray-500"
                )}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={currentStep === 0}
              className="border-gold-400/40 text-gold-400 hover:bg-gold-400/10 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            {currentStep < DEMO_STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-navy-900 font-bold flex-1"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-500 hover:to-gold-600 text-navy-900 font-bold flex-1"
              >
                Got it, let's try!
              </Button>
            )}
          </div>

          {/* Skip option */}
          <div className="text-center mt-4">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Skip tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
