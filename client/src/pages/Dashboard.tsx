import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { TrendingDown, TrendingUp, Waves, ArrowRight, Calendar, Target } from "lucide-react";
import { Link } from "wouter";

const depthLevelInfo = {
  surface: { title: "Surface", color: "text-green-500", bgColor: "bg-green-500/10", score: 0 },
  thermocline: { title: "Thermocline", color: "text-yellow-500", bgColor: "bg-yellow-500/10", score: 1 },
  deep_water: { title: "Deep Water", color: "text-orange-500", bgColor: "bg-orange-500/10", score: 2 },
  crush_depth: { title: "Crush Depth", color: "text-red-500", bgColor: "bg-red-500/10", score: 3 },
};

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: assessments, isLoading: assessmentsLoading } = trpc.dashboard.myAssessments.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  if (loading || assessmentsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Waves className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
                <div className="container py-24">
          <div className="max-w-md mx-auto text-center">
            <Target className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-8">
              Sign in to access your Results Dashboard and track your pressure management journey over time.
            </p>
            <a href={getLoginUrl()}>
              <Button size="lg" className="gap-2">
                Sign In to Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const sortedAssessments = assessments || [];
  const latestAssessment = sortedAssessments[0];
  const previousAssessment = sortedAssessments[1];

  // Calculate trend
  let trend: "improving" | "declining" | "stable" = "stable";
  if (latestAssessment && previousAssessment) {
    const latestScore = depthLevelInfo[latestAssessment.depthLevel as keyof typeof depthLevelInfo].score;
    const previousScore = depthLevelInfo[previousAssessment.depthLevel as keyof typeof depthLevelInfo].score;
    
    if (latestScore < previousScore) trend = "improving";
    else if (latestScore > previousScore) trend = "declining";
  }

  return (
    <div className="min-h-screen bg-background">
            <div className="container py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Your Results Dashboard</h1>
            <p className="text-muted-foreground">
              Track your pressure management journey and see how your clarity evolves over time.
            </p>
          </div>

          {sortedAssessments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Assessments Yet</h2>
                <p className="text-muted-foreground mb-6">
                  Take your first Pressure Audit to start tracking your thinking clarity under pressure.
                </p>
                <Link href="/assessment">
                  <Button size="lg" className="gap-2">
                    Take Your First Assessment
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Current Depth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${depthLevelInfo[latestAssessment.depthLevel as keyof typeof depthLevelInfo].bgColor}`}>
                        <Waves className={`h-6 w-6 ${depthLevelInfo[latestAssessment.depthLevel as keyof typeof depthLevelInfo].color}`} />
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${depthLevelInfo[latestAssessment.depthLevel as keyof typeof depthLevelInfo].color}`}>
                          {depthLevelInfo[latestAssessment.depthLevel as keyof typeof depthLevelInfo].title}
                        </p>
                        <p className="text-sm text-muted-foreground">{latestAssessment.score}/125 points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Assessments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{sortedAssessments.length}</p>
                        <p className="text-sm text-muted-foreground">
                          Since {format(new Date(sortedAssessments[sortedAssessments.length - 1]!.createdAt), "MMM yyyy")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${
                        trend === "improving" ? "bg-green-500/10" : 
                        trend === "declining" ? "bg-red-500/10" : 
                        "bg-gray-500/10"
                      }`}>
                        {trend === "improving" ? (
                          <TrendingUp className="h-6 w-6 text-green-500" />
                        ) : trend === "declining" ? (
                          <TrendingDown className="h-6 w-6 text-red-500" />
                        ) : (
                          <TrendingUp className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-2xl font-bold capitalize">{trend}</p>
                        <p className="text-sm text-muted-foreground">
                          {sortedAssessments.length > 1 ? "vs. previous" : "Take another to compare"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Urgent Support CTA for Deep Water and Crush Depth */}
              {(latestAssessment.depthLevel === "deep_water" || latestAssessment.depthLevel === "crush_depth") && (
                <Card className="mb-8 border-2 border-orange-500/50 bg-orange-500/5">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <CardTitle className="text-orange-500">
                        {latestAssessment.depthLevel === "crush_depth" ? "Immediate Support Recommended" : "Consider Booking Support"}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      {latestAssessment.depthLevel === "crush_depth" 
                        ? "Your latest assessment shows you're at Crush Depth. This requires immediate intervention. Book a 30-minute feedback call to create an emergency decompression protocol."
                        : "Your latest assessment shows you're at Deep Water. Consider booking a feedback call to review your results and develop a recovery protocol before pressure increases."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link href="/book-call" className="flex-1">
                        <Button 
                          size="lg" 
                          className="w-full gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          <Calendar className="h-5 w-5" />
                          Book Urgent Call
                        </Button>
                      </Link>
                      <Link href={`/results?session=${latestAssessment.sessionId}`}>
                        <Button variant="outline" size="lg" className="w-full gap-2">
                          Review Latest Results
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Assessment History */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Assessment History</CardTitle>
                  <CardDescription>Your pressure audit results over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sortedAssessments.map((assessment, index) => {
                      const info = depthLevelInfo[assessment.depthLevel as keyof typeof depthLevelInfo];
                      return (
                        <div key={assessment.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${info.bgColor}`}>
                              <Waves className={`h-5 w-5 ${info.color}`} />
                            </div>
                            <div>
                              <p className="font-semibold">{info.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(assessment.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${info.color}`}>{assessment.score}/125</p>
                            {index === 0 && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Latest</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle className="text-2xl">Ready for Your Next Assessment?</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    Track your progress by retaking the Pressure Audit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/assessment">
                    <Button variant="secondary" size="lg" className="gap-2">
                      Take Assessment Again
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
