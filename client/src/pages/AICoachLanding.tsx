import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { MessageSquare, Target, Calendar, BookOpen, TrendingUp, BarChart3, Shield, Check } from "lucide-react";
import { Link } from "wouter";

export default function AICoachLanding() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AI Executive Coach",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "19.95",
      "priceCurrency": "GBP",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "19.95",
        "priceCurrency": "GBP",
        "unitText": "MONTH"
      }
    },
    "description": "AI-powered executive coaching that challenges you. Real accountability when you need it most. Available 24/7 for £19.95/month."
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AI Executive Coach | The Deep Brief"
        description="You don't need another leadership book. You need someone to call you on your bullshit at 11pm when you're drafting that email you'll regret. AI coach that actually challenges you."
        structuredData={structuredData}
      />

      {/* Hero Section */}
      <section className="container py-20 md:py-32 text-center">
        <p className="text-sm text-muted-foreground mb-2">£19.95/month • 3-day free trial</p>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto">
          You don't need another leadership book.<br />
          You need someone to call you on your bullshit at 11pm when you're drafting that email you'll regret.
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          An AI coach that actually challenges you. Not affirmation. Not theory. Real accountability when you need it most.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/ai-coach/demo">
            <Button size="lg" className="text-lg px-8">
              Try 10 Free Interactions
            </Button>
          </Link>
          <Link href="/ai-coach/subscribe">
            <Button size="lg" variant="outline" className="text-lg">
              Start Free Trial →
            </Button>
          </Link>
        </div>
        
        <div className="text-center mt-4">
          <Link href="/ai-coach/resume" className="text-sm text-muted-foreground hover:text-gold transition-colors">
            Already subscribed? <span className="text-gold font-medium">Sign In →</span>
          </Link>
        </div>
      </section>

      {/* Why I Built This Section */}
      <section className="bg-muted/50 py-16 md:py-20">
        <div className="container max-w-4xl">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6">Why I Built This</h2>
          
          <div className="space-y-6 text-lg">
            <p>
              I've made hard calls in situations where getting it wrong meant people died. As an Army Captain during civil unrest. As a technical diver at 150 metres — deeper than Big Ben is tall — where a bad decision doesn't give you a second chance.
            </p>
            
            <p>
              I've led teams across 52 countries and discovered 10 shipwrecks. Built businesses, sold them, started again. The pattern I kept seeing: leaders don't fail from lack of knowledge. They fail from lack of challenge. No one around them willing to say "that's a terrible idea" before it's too late.
            </p>
            
            <p>
              Executive coaches cost £500/hour and are never there at 11pm. This is.
            </p>
            
            <p className="text-sm text-muted-foreground mt-8">
              — Patrick Voorma, Former Army Captain, PADI Territory Director (52 countries), Founder of The Deep Brief
            </p>
          </div>
        </div>
      </section>

      {/* Real Moments Section */}
      <section className="container py-16 md:py-24 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">For the Moments That Actually Matter</h2>
        
        <div className="space-y-12">
          <div className="pb-12 border-b border-border">
            <h3 className="text-2xl font-semibold mb-3">The Email You Shouldn't Send</h3>
            <p className="text-lg text-muted-foreground">
              It's 11:47pm. You're furious. You've drafted a response to that passive-aggressive message from your co-founder. Before you hit send, talk it through. Get challenged. Find out if you're about to burn a bridge you'll need tomorrow.
            </p>
          </div>
          
          <div className="pb-12 border-b border-border">
            <h3 className="text-2xl font-semibold mb-3">The Conversation You've Been Avoiding</h3>
            <p className="text-lg text-muted-foreground">
              You know who. The underperformer you keep making excuses for. The board member who talks over you. The client who treats your team like dirt. Role-play it. Prepare. Stop rehearsing it in the shower and start getting ready to have it.
            </p>
          </div>
          
          <div className="pb-12 border-b border-border">
            <h3 className="text-2xl font-semibold mb-3">The Decision That's Keeping You Up</h3>
            <p className="text-lg text-muted-foreground">
              Hire or fire? Pivot or persist? Take the funding or stay independent? At 3am, everything looks binary. Get challenged on your assumptions. Find the options you're not seeing because fear has narrowed your vision.
            </p>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold mb-3">The Meeting You're About to Walk Into</h3>
            <p className="text-lg text-muted-foreground">
              Board presentation in 20 minutes. Investor pitch tomorrow. Difficult 1:1 after lunch. Get your head straight. Anticipate the questions. Walk in prepared instead of hoping it goes well.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">What Leaders Are Saying</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card p-6 border border-border rounded-lg">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 fill-[#D4AF37]" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "Finally, an AI coach that doesn't just validate my decisions. It asks the hard questions I've been avoiding."
              </p>
              <p className="font-medium">Sarah M.</p>
              <p className="text-sm text-muted-foreground">CEO, Tech Startup</p>
            </div>
            
            <div className="bg-card p-6 border border-border rounded-lg">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 fill-[#D4AF37]" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "At 2am before my board meeting, this was the thinking partner I needed. Clear, direct, no bullshit."
              </p>
              <p className="font-medium">James T.</p>
              <p className="text-sm text-muted-foreground">VP Engineering</p>
            </div>
            
            <div className="bg-card p-6 border border-border rounded-lg">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 fill-[#D4AF37]" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "The commitment tracking alone is worth it. I actually follow through now because I know I'll be asked about it."
              </p>
              <p className="font-medium">Maria K.</p>
              <p className="text-sm text-muted-foreground">Founder</p>
            </div>
          </div>
        </div>
      </section>

      {/* What You Actually Get Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">What You Actually Get</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card p-6 border border-border">
              <h3 className="text-xl font-semibold mb-2">Challenge, Not Cheerleading</h3>
              <p className="text-muted-foreground">
                Questions that make you think, not affirmations that make you feel good. If you want someone to tell you you're doing great, get a golden retriever.
              </p>
            </div>
            
            <div className="bg-card p-6 border border-border">
              <h3 className="text-xl font-semibold mb-2">Available When You Need It</h3>
              <p className="text-muted-foreground">
                11pm on Sunday. 6am before the board meeting. The crisis doesn't wait for your Thursday coaching session. Neither does this.
              </p>
            </div>
            
            <div className="bg-card p-6 border border-border">
              <h3 className="text-xl font-semibold mb-2">Conversation Rehearsal</h3>
              <p className="text-muted-foreground">
                Role-play the difficult conversations before you have them. Test your arguments. Find the gaps. Walk in prepared.
              </p>
            </div>
            
            <div className="bg-card p-6 border border-border">
              <h3 className="text-xl font-semibold mb-2">Frameworks That Work</h3>
              <p className="text-muted-foreground">
                Templates for feedback, delegation, difficult conversations. Not theory — tactical tools you can use in the next hour.
              </p>
            </div>
            
            <div className="bg-card p-6 border border-border">
              <h3 className="text-xl font-semibold mb-2">Progress You Can See</h3>
              <p className="text-muted-foreground">
                Track your commitments. Get nudged when you drift. See patterns in what's holding you back.
              </p>
            </div>
            
            <div className="bg-card p-6 border border-border">
              <h3 className="text-xl font-semibold mb-2">Completely Private</h3>
              <p className="text-muted-foreground">
                Your coaching conversations aren't training data. They're yours. Export them. Delete them. Your call.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container py-16 md:py-24 max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <div className="text-6xl font-bold text-muted-foreground/30 mb-4">1</div>
            <h3 className="text-xl font-semibold mb-3">Tell Us What You're Facing</h3>
            <p className="text-muted-foreground">
              Quick baseline: your role, your pressures, your leadership challenges. Takes 5 minutes.
            </p>
          </div>
          
          <div>
            <div className="text-6xl font-bold text-muted-foreground/30 mb-4">2</div>
            <h3 className="text-xl font-semibold mb-3">Start a Conversation</h3>
            <p className="text-muted-foreground">
              Whenever you need it. Get challenged, role-play, make commitments.
            </p>
          </div>
          
          <div>
            <div className="text-6xl font-bold text-muted-foreground/30 mb-4">3</div>
            <h3 className="text-xl font-semibold mb-3">Stay Accountable</h3>
            <p className="text-muted-foreground">
              Smart nudges. Progress tracking. Follow-through that actually happens.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-muted/50 py-20 md:py-32">
        <div className="container max-w-5xl">
          <div className="bg-background border border-border rounded-2xl p-12 md:p-16 text-center shadow-lg">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">£19.95/month</h2>
            <p className="text-xl text-muted-foreground mb-8">
              3-day free trial. Card required. Cancel anytime.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-10 text-left">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#D4AF37] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Unlimited coaching conversations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#D4AF37] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Goal tracking & accountability nudges</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#D4AF37] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Templates and playbooks</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#D4AF37] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Growth insights</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#D4AF37] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Complete privacy</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-[#D4AF37] mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium">Available 24/7</p>
                </div>
              </div>
            </div>
            
            <Link href="/ai-coach/subscribe">
              <Button size="lg" className="text-lg px-12">
                Start 3-Day Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container py-20 md:py-32 text-center">
        <p className="text-2xl md:text-3xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          The best leaders don't have all the answers.<br />
          They have someone who asks better questions.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/ai-coach/demo">
            <Button size="lg" className="text-lg px-8">
              Try Free Demo
            </Button>
          </Link>
          <Link href="/ai-coach/subscribe">
            <Button size="lg" variant="outline" className="text-lg">
              Subscribe Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container max-w-4xl text-center">
          <Shield className="w-16 h-16 mx-auto mb-6 text-[#D4AF37]" strokeWidth={1.5} />
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Your Privacy Matters</h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Private by design. Encrypted in transit. You control export and deletion. We're here to help you grow, not surveil you.
          </p>
        </div>
      </section>
    </div>
  );
}
