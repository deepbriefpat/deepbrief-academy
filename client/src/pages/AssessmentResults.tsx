import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Waves, ArrowRight, Share2, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link, useLocation, useSearch } from "wouter";
import { MetaTags } from "@/components/MetaTags";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";
import { trackAssessmentCompleted, trackCallBookingClicked, trackSocialShare } from "@/lib/analytics";

function BonusInsights({ depthLevel, score }: { depthLevel: string; score: number }) {
  const [unlocked, setUnlocked] = useState(false);

  const bonusInsights = {
    surface: [
      "Your pressure signature suggests strong boundary management. Consider documenting your current practices to share with your team.",
      "At this depth, you're positioned to mentor others. Peer support groups benefit significantly from members operating at Surface level.",
      "Watch for early warning signs: decision fatigue, reduced recovery quality, or subtle judgment shifts. These appear before scores change.",
    ],
    thermocline: [
      "You're in the transition zone. This is when small interventions have the biggest impact. A 10% reduction in decision load can restore Surface-level clarity.",
      "Consider implementing a 'decision triage' system: urgent/important decisions only. Defer or delegate everything else for 2 weeks.",
      "Peer thinking partnerships are most effective at Thermocline. You're aware enough to engage but pressured enough to benefit significantly.",
    ],
    deep_water: [
      "At Deep Water, recovery protocols often fail because they're too complex. Focus on one thing: reduce your decision surface area by 50% immediately.",
      "Your judgment is compromised but not collapsed. This means you can still recognize good advice—but you need external thinking partners to generate it.",
      "Book a pressure audit feedback call within 48 hours. At this depth, waiting 'until things calm down' usually means going deeper.",
    ],
    crush_depth: [
      "Crush Depth requires immediate intervention. Your next 72 hours should focus solely on decompression: cancel non-critical commitments, delegate aggressively, and establish daily check-ins with a trusted advisor.",
      "At this level, you're likely experiencing physical symptoms (sleep disruption, appetite changes, persistent tension). These aren't separate issues—they're pressure indicators.",
      "Emergency protocol: Identify your 3 most critical decisions this week. Get external thinking support for all three. Everything else can wait or be delegated.",
    ],
  };

  const insights = bonusInsights[depthLevel as keyof typeof bonusInsights] || [];

  useEffect(() => {
    // Check if user has shared (stored in localStorage)
    const hasShared = localStorage.getItem(`shared_${depthLevel}_${score}`);
    if (hasShared) {
      setUnlocked(true);
    }
  }, [depthLevel, score]);

  const handleUnlock = () => {
    localStorage.setItem(`shared_${depthLevel}_${score}`, 'true');
    setUnlocked(true);
    toast.success("Bonus insights unlocked! Thank you for sharing.");
  };

  if (!unlocked) {
    return (
      <Card className="mb-8 border-2 border-primary/50 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <CardTitle>Unlock Bonus Insights</CardTitle>
          </div>
          <CardDescription>
            Share your results to unlock 3 additional personalized recommendations based on your depth level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            These insights are specifically calibrated for {depthLevel.replace('_', ' ')} and include actionable protocols you can implement immediately.
          </p>
          <Button onClick={handleUnlock} className="gap-2">
            <Share2 className="h-4 w-4" />
            I've Shared My Results - Unlock Insights
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 border-2 border-green-500/50 bg-green-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <CardTitle className="text-green-500">Bonus Insights Unlocked</CardTitle>
        </div>
        <CardDescription>
          Thank you for sharing! Here are your personalized recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {insights.map((insight, index) => (
            <li key={index} className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
              <span className="text-green-500 mt-1 font-bold">{index + 1}.</span>
              <span className="text-sm">{insight}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ShareButtons({ depthLevel, score }: { depthLevel: string; score: number }) {
  const [copied, setCopied] = useState(false);

  const depthTitles: Record<string, string> = {
    surface: "Surface",
    thermocline: "Thermocline",
    deep_water: "Deep Water",
    crush_depth: "Crush Depth",
  };

  const shareText = `I just took the Pressure Audit and discovered I'm at ${depthTitles[depthLevel]} (${score}/125). Understanding where pressure affects my judgment is the first step to thinking clearly at depth.\n\nTake the assessment: ${window.location.origin}/assessment`;

  const linkedInText = `I just completed the Pressure Audit and my depth profile shows ${depthTitles[depthLevel]} (${score}/125 points).\n\nThis assessment helped me understand where pressure is affecting my decision-making. For any founder or leader carrying weight, understanding your pressure signature is critical.\n\nTake the free assessment: ${window.location.origin}/assessment\n\n#leadership #founders #mentalhealth #pressure`;

  const twitterText = `I just took the Pressure Audit: ${depthTitles[depthLevel]} (${score}/125)\n\nUnderstanding where pressure affects judgment is the first step to thinking clearly at depth.\n\nTake it here: ${window.location.origin}/assessment`;

  const copyToClipboard = (text: string) => {
    // Track copy event
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track('social_share', { platform: 'copy', depth_level: depthLevel, score });
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnLinkedIn = () => {
    // Track share event
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track('social_share', { platform: 'linkedin', depth_level: depthLevel, score });
    }
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + "/assessment")}`;
    window.open(url, "_blank", "width=600,height=600");
  };

  const shareOnTwitter = () => {
    // Track share event
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track('social_share', { platform: 'twitter', depth_level: depthLevel, score });
    }
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button onClick={shareOnLinkedIn} variant="outline" className="gap-2">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          Share on LinkedIn
        </Button>
        <Button onClick={shareOnTwitter} variant="outline" className="gap-2">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Share on X
        </Button>
        <Button onClick={() => copyToClipboard(shareText)} variant="outline" className="gap-2">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Text"}
        </Button>
      </div>
      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm text-muted-foreground mb-2 font-semibold">Preview:</p>
        <p className="text-sm whitespace-pre-line">{shareText}</p>
      </div>
    </div>
  );
}

const depthLevels = {
  surface: {
    title: "Surface",
    range: "0-31 points",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    description: "Minimal pressure distortion. Your thinking remains clear and strategic.",
    insights: [
      "You maintain strong decision-making capacity",
      "Recovery mechanisms are working effectively",
      "Signal clarity remains high",
      "You're operating within sustainable limits",
    ],
    recommendations: [
      "Maintain your current practices and boundaries",
      "Consider documenting what's working for future reference",
      "Stay vigilant for early warning signs",
    ],
  },
  thermocline: {
    title: "Thermocline",
    range: "32-62 points",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    description: "Moderate pressure. Some signal degradation beginning to appear.",
    insights: [
      "Decision load is starting to accumulate",
      "Recovery may not be fully clearing pressure",
      "Some erosion in judgment clarity",
      "Warning signs are present but manageable",
    ],
    recommendations: [
      "Review and reduce decision backlog",
      "Strengthen recovery protocols",
      "Consider peer support for key decisions",
      "Take the Pressure Audit quarterly to monitor trends",
    ],
  },
  deep_water: {
    title: "Deep Water",
    range: "63-93 points",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    description: "Significant pressure. Judgment impairment is affecting performance.",
    insights: [
      "Decision quality is compromised",
      "Authority drain is extracting more than it returns",
      "Recovery isn't restoring clarity",
      "Operating beyond sustainable depth",
    ],
    recommendations: [
      "Immediate decompression required",
      "Offload non-critical decisions",
      "Establish peer thinking partnerships",
      "Book a 30-minute feedback call to create a recovery protocol",
    ],
  },
  crush_depth: {
    title: "Crush Depth",
    range: "94-125 points",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    description: "Critical pressure. Urgent intervention needed.",
    insights: [
      "Severe judgment distortion present",
      "Sustained pressure causing systemic issues",
      "Recovery mechanisms have failed",
      "Risk of breakdown without intervention",
    ],
    recommendations: [
      "Immediate surfacing required",
      "Schedule emergency decompression session",
      "Delegate all non-essential decisions",
      "Establish crisis support structure",
      "Contact patrick@thedeepbrief.co.uk for urgent support",
    ],
  },
};

export default function AssessmentResults() {
  const search = useSearch();
  const sessionId = new URLSearchParams(search).get("session");

  const { data: assessment, isLoading } = trpc.assessment.getBySession.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId }
  );

  // Track assessment completion - MUST be before conditional returns
  useEffect(() => {
    if (assessment) {
      trackAssessmentCompleted(assessment.depthLevel, assessment.score);
    }
  }, [assessment]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Waves className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing your pressure profile...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Assessment Not Found</CardTitle>
            <CardDescription>
              We couldn't find your assessment results. Please try taking the assessment again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/assessment">
              <Button>Take Assessment</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const depthInfo = depthLevels[assessment.depthLevel];
  
  // Handle invalid depth level
  if (!depthInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid Assessment Data</CardTitle>
            <CardDescription>
              The assessment data appears to be corrupted. Please try taking the assessment again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/assessment">
              <Button>Take Assessment</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const ogImageUrl = `${window.location.origin}/api/og-image?depthLevel=${assessment.depthLevel}&score=${assessment.score}`;
  const pageUrl = window.location.href;

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title={`My Pressure Audit Result: ${depthInfo.title} | The Deep Brief`}
        description={`I scored ${assessment.score}/125 at ${depthInfo.title}. ${depthInfo.description}`}
        ogImage={ogImageUrl}
        ogUrl={pageUrl}
      />
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Waves className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">The Deep Brief</span>
          </Link>
        </div>
      </nav>

      <div className="container max-w-4xl py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            Diagnostic Complete
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">This Is Where The Distortion Is Showing Up</h1>
        </div>

        {/* Depth Indicator */}
        <Card className={`mb-8 ${depthInfo.bgColor} border-2`}>
          <CardHeader>
            <div className="text-center">
              <CardTitle className={`text-3xl mb-2 ${depthInfo.color}`}>
                {depthInfo.title}
              </CardTitle>
              <CardDescription className="text-lg">
                Score: {assessment.score} / 125 ({depthInfo.range})
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-center text-lg">{depthInfo.description}</p>
          </CardContent>
        </Card>

        {/* Visual Depth Gauge */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Depth Gauge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 bg-gradient-to-b from-green-500/20 via-yellow-500/20 via-orange-500/20 to-red-500/20 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex flex-col justify-between p-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Surface (0-31)</span>
                  {assessment.depthLevel === "surface" && (
                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Thermocline (32-62)</span>
                  {assessment.depthLevel === "thermocline" && (
                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Deep Water (63-93)</span>
                  {assessment.depthLevel === "deep_water" && (
                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Crush Depth (94-125)</span>
                  {assessment.depthLevel === "crush_depth" && (
                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {depthInfo.insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {depthInfo.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Social Sharing */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              <CardTitle>Share Your Results</CardTitle>
            </div>
            <CardDescription>
              Let others know you're working on thinking clearly under pressure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ShareButtons depthLevel={assessment.depthLevel} score={assessment.score} />
          </CardContent>
        </Card>

        {/* Share to Unlock Bonus Insights */}
        <BonusInsights depthLevel={assessment.depthLevel} score={assessment.score} />

        {/* C.A.L.M. Protocol for Deep Water/Crush Depth */}
        {(assessment.depthLevel === "deep_water" || assessment.depthLevel === "crush_depth") && (
          <Card className="mb-8 border-turquoise/50 bg-navy-deep/60">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-turquoise/10 flex items-center justify-center">
                  <Waves className="h-5 w-5 text-turquoise" />
                </div>
                <div>
                  <CardTitle className="text-turquoise text-xl">Immediate Support: C.A.L.M. Protocol™</CardTitle>
                  <CardDescription className="text-text-secondary">
                    {assessment.depthLevel === "crush_depth" 
                      ? "A 3-minute emergency reset for critical pressure"
                      : "A 3-minute tactical reset when pressure hits"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-text-secondary">
                {assessment.depthLevel === "crush_depth"
                  ? "At Crush Depth, you need immediate tools. The C.A.L.M. Protocol provides a field-tested 3-minute system to regain control when clarity slips. Use it before critical decisions, difficult conversations, or when you feel overwhelm taking over."
                  : "At Deep Water, small tactical interventions matter. The C.A.L.M. Protocol is your 3-minute reset system—built from the same physics that keep divers alive at depth and leaders steady under fire."}
              </p>
              
              <div className="bg-navy-mid/50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-turquoise/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-turquoise text-xs font-bold">C</span>
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">Control</p>
                      <p className="text-xs text-text-muted">Slow breath, reset posture</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-turquoise/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-turquoise text-xs font-bold">A</span>
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">Acknowledge</p>
                      <p className="text-xs text-text-muted">Name what's happening</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-turquoise/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-turquoise text-xs font-bold">L</span>
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">Limit</p>
                      <p className="text-xs text-text-muted">Contain the problem</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-turquoise/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-turquoise text-xs font-bold">M</span>
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">Move</p>
                      <p className="text-xs text-text-muted">Take one clear action</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/calm-protocol">
                  <Button className="gap-2 bg-turquoise hover:bg-turquoise/90 text-navy-deep font-semibold w-full sm:w-auto">
                    View Full Protocol
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="https://deepbriefacademy.com/depth-reset/" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2 border-turquoise/50 text-turquoise hover:bg-turquoise/10 w-full sm:w-auto">
                    Download Depth Reset Guide
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </Button>
                </a>
              </div>

              <p className="text-text-muted text-xs italic">
                Three minutes. Zero fluff. Built for the moment when pressure hits and clarity matters most.
              </p>
            </CardContent>
          </Card>
        )}

        {/* AI Coach CTA - Show first for Crush Depth (immediate support needed) */}
        {assessment.depthLevel === "crush_depth" && (
          <Card className="mb-8 border-red-500/50 bg-gradient-to-br from-red-900/30 to-orange-900/30">
            <CardHeader>
              <CardTitle className="text-red-400 text-2xl font-serif">⚠️ You Need Support Now</CardTitle>
              <CardDescription className="text-text-primary">
                At Crush Depth, waiting 'until things calm down' usually means going deeper. Get immediate 24/7 coaching support.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-text-secondary font-semibold">
                The AI Executive Coach is available right now—no scheduling, no waiting. Start a conversation about what you're facing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/ai-coach">
                  <Button 
                    className="gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold"
                  >
                    Start Coaching Now (Free)
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/ai-coach/demo">
                  <Button variant="outline" className="gap-2 border-red-500/50 text-red-400 hover:bg-red-500/10">
                    See How It Works
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <p className="text-red-400 text-sm font-semibold">
                🎁 10 free coaching interactions. No credit card. Available 24/7.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Next Step: 30-Minute Clarity Call CTA */}
        <Card className="mb-8 border-gold bg-gradient-to-br from-navy-mid to-navy-deep">
          <CardHeader>
            <CardTitle className="text-gold text-2xl font-serif">Next Step: 30-Minute Clarity Call</CardTitle>
            <CardDescription className="text-text-primary">
              {assessment.depthLevel === "crush_depth" || assessment.depthLevel === "deep_water"
                ? "At your depth level, waiting 'until things calm down' usually means going deeper."
                : "Your results suggest pressure is starting to affect your clarity. Let's talk about what's next."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-text-secondary">
              {assessment.depthLevel === "crush_depth" 
                ? "Crush Depth requires immediate intervention. Book a 30-minute call within 48 hours to review your profile and create a recovery protocol. This isn't a sales call—it's a diagnostic conversation about where you are and what you need."
                : assessment.depthLevel === "deep_water"
                ? "Deep Water is when small interventions have the biggest impact. Book a 30-minute call to review your pressure profile and identify the highest-leverage adjustments. No pitch. Just clarity."
                : "Book a 30-minute call to review your results, discuss what's showing up in your leadership, and explore whether structured support would help. No obligation. Just a conversation."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/book-call">
                <Button 
                  className="gap-2 bg-gold hover:bg-gold-light text-navy-deep font-semibold"
                  onClick={() => trackCallBookingClicked("results_page_top")}
                >
                  Book Your Clarity Call
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/clarity-under-pressure">
                <Button variant="outline" className="gap-2 border-gold text-gold hover:bg-gold/10">
                  Learn About the Program
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            {(assessment.depthLevel === "crush_depth" || assessment.depthLevel === "deep_water") && (
              <p className="text-gold text-sm font-semibold">
                ⏱ Time-sensitive: Your depth level suggests booking within 48 hours for maximum impact
              </p>
            )}
          </CardContent>
        </Card>

        {/* AI Coach CTA */}
        <Card className="mb-8 border-green-500/50 bg-gradient-to-br from-green-900/20 to-emerald-900/20">
          <CardHeader>
            <CardTitle className="text-green-400 text-2xl font-serif">Try AI Executive Coach (Free)</CardTitle>
            <CardDescription className="text-text-primary">
              Get instant coaching support powered by AI. No commitment required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-text-secondary">
              Based on your pressure profile, our AI Executive Coach can help you:
            </p>
            <ul className="space-y-2 text-text-secondary">
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Navigate difficult conversations and team dynamics</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Make clearer decisions under pressure</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Develop leadership strategies tailored to your context</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Track commitments and behavioral patterns over time</span>
              </li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/ai-coach">
                <Button 
                  className="gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold"
                >
                  Try AI Coach Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/ai-coach/demo">
                <Button variant="outline" className="gap-2 border-green-500/50 text-green-400 hover:bg-green-500/10">
                  See How It Works
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="text-green-400 text-sm font-semibold">
              🎁 Try the demo: 10 free coaching interactions. No credit card required.
            </p>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="max-w-2xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow border-gold bg-gradient-to-br from-navy-deep to-navy-mid">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gold mb-2">Ready to Rebuild Clarity?</CardTitle>
              <CardDescription className="text-lg">
                Book a 30-minute feedback call to review your results and create a personalized decompression protocol
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Link href="/book-call">
                <Button 
                  size="lg" 
                  className="gap-2 bg-gold hover:bg-gold-light text-navy-deep font-semibold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => trackCallBookingClicked("results_page_bottom")}
                >
                  Book Your Clarity Call
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground text-center">
                No pitch. Just a conversation about where you are and what comes next.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Email Capture Form */}
        <Card className="mt-12 bg-navy-mid border-gold-dim">
          <CardHeader>
            <CardTitle className="text-center">Get Your Follow-Up Resources</CardTitle>
            <CardDescription className="text-center">
              Receive personalized insights and practical tools based on your pressure profile—delivered to your inbox.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailCaptureForm source="assessment_results" depthLevel={assessment.depthLevel} />
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            Want to dive deeper into the concepts behind this assessment?
          </p>
          <Link href="/resources">
            <Button variant="ghost">Browse Resources</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
