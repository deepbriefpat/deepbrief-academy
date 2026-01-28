import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle2, Sparkles, Target, TrendingUp } from 'lucide-react';

export default function AICoachWelcome() {
  const [, setLocation] = useLocation();

  // Auto-redirect to onboarding after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation('/ai-coach/onboarding');
    }, 5000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  const handleContinue = () => {
    setLocation('/ai-coach/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A6741] via-[#5A7751] to-[#4A6741] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Welcome to Your AI Executive Coach
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Your 3-day free trial has started! Let's set up your personalized coaching experience.
          </p>

          {/* What's Next */}
          <div className="bg-[#F5F1E8] rounded-xl p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#4A6741]" />
              What Happens Next
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#4A6741] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quick Onboarding</h3>
                  <p className="text-sm text-gray-600">Share your role, goals, and current challenges (2 minutes)</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#4A6741] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Start Coaching</h3>
                  <p className="text-sm text-gray-600">Get personalized insights and tactical support immediately</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#4A6741] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Explore Features</h3>
                  <p className="text-sm text-gray-600">Try templates, role-play scenarios, and accountability tools</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trial Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-900">
              <strong>Your trial:</strong> Full access for 3 days. After your trial, you'll be charged £19.95/month. Cancel anytime before the trial ends to avoid charges.
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleContinue}
            className="w-full px-8 py-4 bg-gradient-to-r from-[#4A6741] to-[#5A7751] text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Continue to Onboarding
          </button>

          <p className="text-sm text-gray-500 mt-4">
            Redirecting automatically in 5 seconds...
          </p>
        </div>

        {/* Benefits Preview */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center text-white">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-90" />
            <p className="text-sm font-medium">Personalized Coaching</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center text-white">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-90" />
            <p className="text-sm font-medium">Track Your Growth</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center text-white">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-90" />
            <p className="text-sm font-medium">24/7 Support</p>
          </div>
        </div>
      </div>
    </div>
  );
}
