import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Users, BookOpen, Compass, Waves } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";

import { Footer } from "@/components/Footer";
import { Testimonials } from "@/components/Testimonials";
import { StickyCTA } from "@/components/StickyCTA";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ScrollIndicator } from "@/components/ScrollIndicator";
import { EmailCaptureModal } from "@/components/EmailCaptureModal";
import { trpc } from "@/lib/trpc";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/_core/hooks/useAuth";

function TestimonialsSection() {
  const { data: testimonials = [], isLoading } = trpc.testimonials.featured.useQuery();

  if (isLoading) {
    return (
      <section className="py-20 bg-accent/5">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Impact, Real Leaders</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from founders and executives who've moved from overwhelm to clarity
            </p>
          </div>
          {/* Skeleton loading state */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-navy-mid/50 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gold-dim rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gold-dim rounded w-full mb-2"></div>
                <div className="h-4 bg-gold-dim rounded w-5/6 mb-4"></div>
                <div className="h-3 bg-gold-dim rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-accent/5">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Real Impact, Real Leaders</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from founders and executives who've moved from overwhelm to clarity
          </p>
        </div>
        <Testimonials testimonials={testimonials} variant="compact" />
      </div>
    </section>
  );
}

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasPausedSession, setHasPausedSession] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Check for paused session on mount
  useEffect(() => {
    if (user) {
      const pausedSessionId = localStorage.getItem('pausedSessionId');
      setHasPausedSession(!!pausedSessionId);
    }
  }, [user]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "The Deep Brief",
    "description": "Executive coaching for leaders under pressure. Build clarity, reduce overwhelm, and make better decisions through peer support and proven frameworks.",
    "url": "https://thedeepbrief.co.uk",
    "priceRange": "$$$",
    "areaServed": "Worldwide",
    "serviceType": "Executive Coaching"
  };

  useEffect(() => {
    
    // Fade in on mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Check mobile on mount and resize
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <SEO 
        title="Leadership Clarity Under Pressure"
        description="Executive coaching for leaders under pressure. Build clarity, reduce overwhelm, and make better decisions through peer support and proven frameworks. Free pressure assessment."
        keywords="executive coaching, leadership coaching, executive coach, leadership under pressure, decision making, peer support, executive leadership, C-suite coaching, founder coaching"
        canonicalUrl="https://thedeepbrief.co.uk"
        structuredData={structuredData}
      />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden min-h-[85vh] flex items-center">
        {/* Background image with parallax effect */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/trimix130.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
            transform: 'translateY(0)',
            transition: 'transform 0.5s ease-out'
          }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep via-navy-deep/95 to-navy-deep z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-transparent to-navy-deep/80 z-[1]" />
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-[clamp(2.8rem,6vw,4.5rem)] font-serif leading-[1.2] tracking-[-0.02em] mb-6">
              Leadership Clarity Under Pressure
            </h1>
            <p className="text-[1.4rem] text-text-secondary mb-8 leading-relaxed max-w-3xl mx-auto">
              Discover where pressure is distorting your judgment. Build the peer support you need to think clearly at depth.
            </p>
          </div>
          <div className="max-w-4xl mx-auto text-center mt-12">
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/ai-coach/dashboard">
                  <Button size="lg" className="gap-2 bg-gold hover:bg-gold-light text-navy-deep font-semibold text-lg px-8 py-6 rounded-[10px] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.25)]">
                    {hasPausedSession ? 'Resume Paused Session' : 'Continue Coaching'}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/assessment">
                  <Button size="lg" variant="outline" className="gap-2 border-2 border-gold text-gold hover:bg-gold/10 font-semibold text-lg px-8 py-6 rounded-[10px] transition-all">
                    Retake Assessment
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/assessment">
                  <Button size="lg" className="gap-2 bg-gold hover:bg-gold-light text-navy-deep font-semibold text-lg px-8 py-6 rounded-[10px] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.25)]">
                    Take the Pressure Audit
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-4">
                  8-10 minutes • Free diagnostic • Immediate results
                </p>
              </>
            )}
          </div>
        </div>
        <ScrollIndicator />
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* About Patrick Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="md:col-span-1">
                <img 
                  src="/Patrickheadshot.png" 
                  alt="Patrick Voorma" 
                  className="rounded-lg shadow-xl w-full h-auto"
                />
              </div>
              <div className="md:col-span-2">
                <h2 className="text-[clamp(2rem,4vw,2.8rem)] font-serif text-gold mb-6">About Patrick</h2>
                <p className="text-lg text-text-secondary leading-relaxed">
                  I built and sold South Africa's biggest dive centre. I served as a military officer. I've discovered ten shipwrecks. And for the last decade, I've led corporate teams across Europe and Africa, working in more than 52 countries.
                </p>
                <p className="text-lg text-text-secondary leading-relaxed mt-4">
                  I know pressure — underwater where mistakes cost lives, and in the boardroom where they cost livelihoods. That's why I value conversations like this — because none of us master pressure alone. When we share openly, we sharpen faster, perform stronger, and grow further than we ever could on our own.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four Ways to See Pressure */}
      <section className="py-20 bg-navy-mid">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif text-gold mb-4">Five Ways to See Pressure</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Choose your entry point based on where you are right now
            </p>
          </div>
          {/* AI Coach - Hero Card (Full Width) */}
          <Card className="bg-navy-deep border-gold border-2 flex flex-col mb-6 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-gold mb-2">24/7 AI Executive Coach</CardTitle>
                  <CardDescription className="text-text-secondary text-base">
                    Get coaching now. £19.95/month. 10 free interactions to start.
                  </CardDescription>
                </div>
                <span className="text-4xl">🎯</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-text-secondary mb-6 text-lg">
                Direct, no-bullshit coaching available 24/7. Uses the C.A.L.M. Protocol to help you see straight when pressure is bending your judgment. Track commitments, spot patterns, get tactical.
              </p>
              <Link href="/ai-coach">
                <Button className="w-full md:w-auto bg-gold hover:bg-[#e6b84d] text-navy-deep transition-all duration-300 hover:shadow-lg hover:scale-[1.02] text-lg px-8 py-6">
                  Try Free Demo
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Other Options - 2x2 Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-navy-deep border-gold-dim flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-xl text-text-primary">The Pressure Audit</CardTitle>
                <CardDescription className="text-text-secondary">
                  8-10 minutes. Full diagnostic.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-text-secondary mb-6 flex-1">
                  A 25-question assessment across 5 pressure dimensions. You'll get a detailed profile showing exactly where pressure is bending your judgment, plus your depth level and personalized insights.
                </p>
                <Link href="/assessment">
                  <Button className="w-full bg-gold hover:bg-[#e6b84d] text-navy-deep transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                    Take Assessment
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="bg-navy-deep border-gold-dim flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-xl text-text-primary">Read the Resources</CardTitle>
                <CardDescription className="text-text-secondary">
                  Browse at your own pace.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-text-secondary mb-6 flex-1">
                  LinkedIn articles and insights organized by theme: pressure management, diving metaphors, and leadership isolation. See if the language resonates before committing to anything.
                </p>
                <Link href="/resources">
                  <Button variant="outline" className="w-full border-gold text-gold hover:bg-gold/20 hover:border-[#e6b84d] transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                    Explore Resources
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="bg-navy-deep border-gold-dim flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-xl text-text-primary">Clarity Program</CardTitle>
                <CardDescription className="text-text-secondary">
                  One-to-one partnership.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-text-secondary mb-6 flex-1">
                  A structured 3-month program to rebuild clarity under pressure. Work directly with Patrick to identify where pressure is bending your judgment and develop the peer support you need to think clearly at depth.
                </p>
                <Link href="/clarity-under-pressure">
                  <Button className="w-full bg-gold hover:bg-[#e6b84d] text-navy-deep transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                    Learn More
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="bg-navy-deep border-gold-dim flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-xl text-text-primary">Book a Call</CardTitle>
                <CardDescription className="text-text-secondary">
                  30 minutes. Direct conversation.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-text-secondary mb-6 flex-1">
                  If you already know pressure is affecting your clarity and want to talk about what's next, skip the assessment and book a call. No pitch. Just a conversation about where you are.
                </p>
                <Link href="/book-call">
                  <Button variant="outline" className="w-full border-gold text-gold hover:bg-gold/20 hover:border-[#e6b84d] transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                    Book a Call
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="text-2xl md:text-3xl font-serif italic text-foreground/90 mb-6">
              "Clarity isn't found in isolation. It's forged in conversation with people who understand the weight."
            </blockquote>
            <p className="text-muted-foreground">— Patrick Voorma</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-navy-mid to-navy-deep">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif text-gold mb-4">
              Ready to Surface?
            </h2>
            <p className="text-lg mb-8 text-text-secondary">
              Take the Pressure Audit to understand where pressure is affecting your judgment
            </p>
            <div className="flex justify-center">
              <Link href="/assessment">
                <Button size="lg" className="bg-gold hover:bg-gold-light text-navy-deep font-semibold px-8 py-6 text-lg">
                  Take the Pressure Audit
                </Button>
              </Link>
            </div>
          </div>
        </div>
       </section>
      <StickyCTA 
        primaryText="Take the Pressure Audit"
        primaryHref="/assessment"
        secondaryText="Book a Call"
        secondaryHref="/book-call"
        showAfterScroll={800}
      />
      <ScrollToTop />
      <EmailCaptureModal />
      <Footer />
    </div>
  );
}
