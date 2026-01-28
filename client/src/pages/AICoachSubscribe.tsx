/**
 * AI Coach Subscribe Page
 * 
 * Clear pricing page with value proposition and Stripe checkout
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { 
  Check, Shield, MessageCircle, Target, TrendingUp, 
  Clock, Zap, ArrowRight, Loader2, Star
} from "lucide-react";

export default function AICoachSubscribe() {
  const { user, isLoading: authLoading } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const createCheckoutMutation = trpc.aiCoach.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      alert(`Error starting checkout: ${error.message}`);
      setIsCheckingOut(false);
    },
  });

  const handleSubscribe = () => {
    if (!user) {
      // Redirect to login first
      window.location.href = getLoginUrl();
      return;
    }
    
    setIsCheckingOut(true);
    createCheckoutMutation.mutate();
  };

  const features = [
    { icon: MessageCircle, title: "Unlimited Coaching", desc: "24/7 access to your AI executive coach" },
    { icon: Target, title: "Commitment Tracking", desc: "Track what you commit to and follow through" },
    { icon: TrendingUp, title: "Pattern Insights", desc: "See the patterns in your thinking over time" },
    { icon: Clock, title: "Session History", desc: "Review and learn from past conversations" },
    { icon: Zap, title: "Quick Coaching Mode", desc: "3-minute tactical responses for urgent moments" },
    { icon: Shield, title: "Complete Privacy", desc: "Your conversations are private and encrypted" },
  ];

  const testimonials = [
    {
      quote: "Finally, an AI coach that doesn't just validate my decisions. It asks the hard questions I've been avoiding.",
      author: "Sarah M.",
      role: "CEO, Tech Startup"
    },
    {
      quote: "At 2am before my board meeting, this was the thinking partner I needed. Clear, direct, no bullshit.",
      author: "James T.",
      role: "VP Engineering"
    },
    {
      quote: "The commitment tracking alone is worth it. I actually follow through now because I know I'll be asked about it.",
      author: "Maria K.",
      role: "Founder"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F6F0] to-white">
      {/* Header */}
      <header className="border-b border-[#E6E2D6] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-[#4A6741] flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#2C2C2C]">AI Executive Coach</span>
            </div>
          </Link>
          
          <Link href="/ai-coach/demo">
            <Button variant="outline" className="border-[#4A6741] text-[#4A6741]">
              Try Demo First
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 bg-[#4A6741]/10 border border-[#4A6741]/30 rounded-full px-4 py-2 mb-6">
          <Zap className="w-4 h-4 text-[#4A6741]" />
          <span className="text-[#4A6741] text-sm font-medium">3-day free trial • Cancel anytime</span>
        </div>
        
        {/* Pressure-moment trigger */}
        <div className="mb-8 p-6 bg-[#D97757]/10 border-2 border-[#D97757]/30 rounded-xl max-w-2xl mx-auto">
          <p className="text-lg font-semibold text-[#2C2C2C] mb-2">What decision are you avoiding right now?</p>
          <p className="text-[#6B6B60]">
            The one that keeps you up at night. The conversation you're putting off. 
            The choice where both options feel wrong.
          </p>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Stop second-guessing.<br />Start thinking clearly.
        </h1>
        
        {/* One-sentence value prop */}
        <p className="text-2xl font-semibold text-[#4A6741] mb-4">
          Private diagnostic, pattern tracking over time, and decision clarity when pressure spikes.
        </p>
        
        <p className="text-lg text-[#6B6B60] mb-8 max-w-2xl mx-auto">
          An AI executive coach that challenges your assumptions, tracks your commitments, 
          and helps you lead under pressure — available whenever you need it.
        </p>
      </section>

      {/* Pricing Card */}
      <section className="container mx-auto px-4 pb-16 max-w-xl">
        <div className="bg-white border-2 border-[#4A6741] rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <p className="text-[#6B6B60] mb-2">Full Access</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold text-[#2C2C2C]">£19.95</span>
              <span className="text-[#6B6B60]">/month</span>
            </div>
            <p className="text-sm text-[#4A6741] mt-2 font-medium">
              3-day free trial included
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#4A6741]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-[#4A6741]" />
                </div>
                <div>
                  <p className="font-medium text-[#2C2C2C]">{feature.title}</p>
                  <p className="text-sm text-[#6B6B60]">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleSubscribe}
            disabled={isCheckingOut || createCheckoutMutation.isPending}
            className="w-full bg-[#4A6741] hover:bg-[#3d5636] text-white py-6 text-lg font-semibold"
          >
            {isCheckingOut || createCheckoutMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Starting checkout...
              </>
            ) : user ? (
              <>
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Sign Up & Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-[#6B6B60] mt-4">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#F8F6F0] py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-bold text-[#2C2C2C] text-center mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>
            What Leaders Are Saying
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-[#E6E2D6]">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                  ))}
                </div>
                <p className="text-[#2C2C2C] mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-medium text-[#2C2C2C]">{testimonial.author}</p>
                  <p className="text-sm text-[#6B6B60]">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <h2 className="text-2xl font-bold text-[#2C2C2C] text-center mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>
          Common Questions
        </h2>
        
        <div className="space-y-6">
          <div className="border-b border-[#E6E2D6] pb-6">
            <h3 className="font-semibold text-[#2C2C2C] mb-2">What happens during the 3-day trial?</h3>
            <p className="text-[#6B6B60]">
              You get full access to everything — unlimited coaching conversations, commitment tracking, 
              pattern insights, and all features. Your card won't be charged until day 4.
            </p>
          </div>
          
          <div className="border-b border-[#E6E2D6] pb-6">
            <h3 className="font-semibold text-[#2C2C2C] mb-2">How is this different from ChatGPT?</h3>
            <p className="text-[#6B6B60]">
              This isn't a general-purpose chatbot. It's built specifically for executive coaching, 
              with methodology developed by someone who's led under real pressure. It tracks your 
              commitments, remembers your patterns, and challenges you — it doesn't just answer questions.
            </p>
          </div>
          
          <div className="border-b border-[#E6E2D6] pb-6">
            <h3 className="font-semibold text-[#2C2C2C] mb-2">Can I cancel anytime?</h3>
            <p className="text-[#6B6B60]">
              Yes. Cancel with one click from your dashboard. No questions, no hoops to jump through.
            </p>
          </div>
          
          <div className="border-b border-[#E6E2D6] pb-6">
            <h3 className="font-semibold text-[#2C2C2C] mb-2">What if my payment fails?</h3>
            <p className="text-[#6B6B60]">
              We'll email you immediately if your card is declined or expires. You'll have 7 days to update 
              your payment method before access is paused. Your data is never deleted.
            </p>
          </div>
          
          <div className="pb-6">
            <h3 className="font-semibold text-[#2C2C2C] mb-2">Is my data private?</h3>
            <p className="text-[#6B6B60]">
              Completely. Your coaching conversations are encrypted and never used to train AI models. 
              You can export or delete everything at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#4A6741] py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to think more clearly under pressure?
          </h2>
          <p className="text-white/80 mb-8">
            Join leaders who've stopped second-guessing and started taking action.
          </p>
          <Button 
            onClick={handleSubscribe}
            disabled={isCheckingOut || createCheckoutMutation.isPending}
            className="bg-white text-[#4A6741] hover:bg-gray-100 py-6 px-8 text-lg font-semibold"
          >
            {isCheckingOut || createCheckoutMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Starting checkout...
              </>
            ) : (
              <>
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}
