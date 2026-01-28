import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Users, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, BookOpen } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { MetaTags } from "@/components/MetaTags";

const networkProfiles = {
  isolated: {
    title: "Isolated Thinker",
    description: "You're navigating pressure largely alone. This is the highest-risk profile for decision-making under stress.",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    icon: AlertTriangle,
  },
  emerging: {
    title: "Emerging Network",
    description: "You have some thinking partners, but the structure and diversity need development.",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    icon: TrendingUp,
  },
  functional: {
    title: "Functional Network",
    description: "You have a solid foundation of thinking partnerships with room to optimize.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    icon: CheckCircle2,
  },
  thriving: {
    title: "Thriving Network",
    description: "You've built a diverse, engaged support system that sharpens your thinking under pressure.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    icon: CheckCircle2,
  },
};

const recommendations = {
  isolated: [
    {
      title: "Join a Peer Group",
      description: "The fastest path to building thinking partnerships is structured peer support. Consider joining a leadership peer group like MyBigSky.",
      action: "Explore Community",
      link: "/community",
    },
    {
      title: "Schedule Regular Check-ins",
      description: "Identify 2-3 trusted colleagues or mentors and schedule monthly conversations focused on strategic challenges.",
      action: "Book a Call",
      link: "/book-call",
    },
    {
      title: "Seek Diverse Perspectives",
      description: "Intentionally connect with leaders outside your industry who face similar pressure but approach problems differently.",
      action: "Read Stories",
      link: "/stories",
    },
  ],
  emerging: [
    {
      title: "Add Structure to Existing Relationships",
      description: "Transform ad-hoc conversations into committed, scheduled engagements with clear frameworks.",
      action: "Learn More",
      link: "/clarity-under-pressure",
    },
    {
      title: "Expand Perspective Diversity",
      description: "Actively seek thinking partners from different industries, backgrounds, and experience levels.",
      action: "Join Community",
      link: "/community",
    },
    {
      title: "Increase Engagement Frequency",
      description: "Move from quarterly to monthly (or monthly to bi-weekly) check-ins to build momentum and trust.",
      action: "Book a Call",
      link: "/book-call",
    },
  ],
  functional: [
    {
      title: "Optimize for Reciprocity",
      description: "Ensure your thinking partnerships are mutually valuable. Ask: 'How can I support your thinking?'",
      action: "Read Resources",
      link: "/resources",
    },
    {
      title: "Deepen Trust & Vulnerability",
      description: "Challenge yourself to share the decisions you're most uncertain about, not just the ones you've already solved.",
      action: "Explore Program",
      link: "/clarity-under-pressure",
    },
    {
      title: "Formalize Your Network",
      description: "Consider joining a structured peer group to add accountability and expand your circle.",
      action: "View Community",
      link: "/community",
    },
  ],
  thriving: [
    {
      title: "Maintain Momentum",
      description: "Continue your regular cadence and protect these relationships as strategic assets.",
      action: "Read Stories",
      link: "/stories",
    },
    {
      title: "Pay It Forward",
      description: "Help other leaders build their thinking networks. Mentor, introduce, and create connections.",
      action: "Join Community",
      link: "/community",
    },
    {
      title: "Continuously Evolve",
      description: "As your challenges change, ensure your network evolves. Add new perspectives as you grow.",
      action: "Book a Call",
      link: "/book-call",
    },
  ],
};

export default function NetworkAssessmentResults() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const sessionId = new URLSearchParams(search).get("session");

  const { data: assessment, isLoading } = trpc.supportNetwork.getBySession.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-text-secondary">Analyzing your network...</p>
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
            <Button onClick={() => setLocation("/who-are-you-thinking-with")} className="w-full">
              Retake Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profile = networkProfiles[assessment.networkQuality];
  const recs = recommendations[assessment.networkQuality];
  const Icon = profile.icon;
  const maxScore = 600; // 8 questions × 75 max points
  const percentage = Math.round((assessment.networkScore / maxScore) * 100);

  return (
    <div className="min-h-screen bg-background py-12">
      <MetaTags
        title={`Your Network Profile: ${profile.title} | The Deep Brief`}
        description="Discover your thinking network quality and get personalized recommendations for building stronger support partnerships."
      />

      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${profile.bgColor} mb-6`}>
            <Icon className={`w-10 h-10 ${profile.color}`} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            {profile.title}
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            {profile.description}
          </p>
        </div>

        {/* Score Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Network Score</CardTitle>
            <CardDescription>
              Based on 8 dimensions of thinking partnership quality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-text-muted">Network Quality</span>
                  <span className="text-2xl font-bold">{percentage}%</span>
                </div>
                <div className="w-full h-4 bg-navy-mid rounded-full overflow-hidden">
                  <div
                    className={`h-full ${profile.color.replace('text-', 'bg-')} transition-all duration-1000`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className={`text-5xl font-bold ${profile.color}`}>
                  {assessment.networkScore}
                </div>
                <div className="text-sm text-text-muted">out of {maxScore}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold mb-6">Your Next Steps</h2>
          <div className="grid gap-6">
            {recs.map((rec, idx) => (
              <Card key={idx} className="hover:border-gold/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-xl">{rec.title}</CardTitle>
                  <CardDescription>{rec.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setLocation(rec.link)}
                    variant="outline"
                    className="gap-2"
                  >
                    {rec.action}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Why This Matters */}
        <Card className="mb-8 border-gold/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gold" />
              Why This Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p>
              Your thinking network is not a nice-to-have. It's the infrastructure that determines how clearly you think when pressure rises.
            </p>
            <p>
              Leaders who work alone make slower decisions, miss blind spots, and burn out faster. Leaders with diverse, engaged thinking partners stay sharper, adapt quicker, and sustain performance longer.
            </p>
            <p>
              The quality of your network directly impacts the quality of your judgment. Build it intentionally.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-serif font-bold mb-4">
            Ready to Build Your Thinking Network?
          </h3>
          <p className="text-text-secondary mb-6">
            Join structured peer groups where founders and senior leaders sharpen each other's thinking.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => setLocation("/community")}
              size="lg"
              className="bg-gold hover:bg-gold-light text-navy-deep"
            >
              <Users className="w-5 h-5 mr-2" />
              Explore Community
            </Button>
            <Button
              onClick={() => setLocation("/book-call")}
              size="lg"
              variant="outline"
            >
              Book a Call
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
