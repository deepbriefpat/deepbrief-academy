import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, TrendingDown, Clock, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function AdminOnboardingAnalytics() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const { data: analyticsData, isLoading } = trpc.onboarding.getAnalytics.useQuery();

  if (loading || isLoading) {
    return <div className="container py-12">Loading onboarding analytics...</div>;
  }

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  if (!analyticsData) {
    return <div className="container py-12">No analytics data available</div>;
  }

  const { stepStats } = analyticsData;

  // Calculate funnel metrics
  const stepLabels: Record<number, string> = {
    1: "Welcome & Platform Overview",
    2: "Coach Selection",
    3: "Goal Setting",
    4: "Tutorial & Next Steps",
  };

  const funnelData = Object.entries(stepStats).map(([step, stats]) => {
    const stepNum = parseInt(step);
    const totalStarted = stats.views;
    const completed = stats.completes;
    const skipped = stats.skips;
    const abandoned = stats.abandons;
    const completionRate = totalStarted > 0 ? (completed / totalStarted) * 100 : 0;
    const abandonmentRate = totalStarted > 0 ? (abandoned / totalStarted) * 100 : 0;

    return {
      step: stepNum,
      label: stepLabels[stepNum] || `Step ${stepNum}`,
      totalStarted,
      completed,
      skipped,
      abandoned,
      completionRate,
      abandonmentRate,
    };
  }).sort((a, b) => a.step - b.step);

  // Overall metrics
  const totalUsers = funnelData[0]?.totalStarted || 0;
  const completedOnboarding = funnelData[funnelData.length - 1]?.completed || 0;
  const overallCompletionRate = totalUsers > 0 ? (completedOnboarding / totalUsers) * 100 : 0;
  const avgTimePerStep = 45; // Placeholder - would need to calculate from timeSpent data

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Onboarding Funnel Analytics</h1>
          <p className="text-muted-foreground">Track user progression through onboarding steps</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Started onboarding
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedOnboarding}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Finished all steps
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{overallCompletionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Overall success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Time/Step</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgTimePerStep}s</div>
              <p className="text-xs text-muted-foreground mt-1">
                Per onboarding step
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Funnel Visualization */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Onboarding Funnel</CardTitle>
            <CardDescription>Step-by-step user progression and drop-off points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {funnelData.map((step, index) => {
                const widthPercentage = totalUsers > 0 ? (step.totalStarted / totalUsers) * 100 : 0;
                const prevStep = index > 0 ? funnelData[index - 1] : null;
                const dropOffRate = prevStep 
                  ? prevStep.totalStarted > 0 
                    ? ((prevStep.totalStarted - step.totalStarted) / prevStep.totalStarted) * 100 
                    : 0
                  : 0;

                return (
                  <div key={step.step} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Step {step.step}:</span>
                        <span className="text-muted-foreground">{step.label}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-muted-foreground">
                          {step.totalStarted} users
                        </span>
                        {dropOffRate > 0 && (
                          <span className="text-red-500">
                            -{dropOffRate.toFixed(1)}% drop-off
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Funnel bar */}
                    <div className="relative h-16 bg-muted rounded-lg overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#4A6741] to-[#6B8A5F] transition-all duration-500"
                        style={{ width: `${widthPercentage}%` }}
                      >
                        <div className="h-full flex items-center justify-between px-4 text-white text-sm font-medium">
                          <span>{step.completionRate.toFixed(1)}% completion</span>
                          <div className="flex gap-4 text-xs">
                            <span>✓ {step.completed}</span>
                            <span>⏭ {step.skipped}</span>
                            <span>✗ {step.abandoned}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Abandonment warning */}
                    {step.abandonmentRate > 20 && (
                      <div className="text-xs text-red-500 flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        High abandonment rate ({step.abandonmentRate.toFixed(1)}%) - consider improving this step
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Step Metrics</CardTitle>
            <CardDescription>Breakdown of user actions at each step</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Step</th>
                    <th className="text-right py-3 px-4 font-medium">Views</th>
                    <th className="text-right py-3 px-4 font-medium">Completed</th>
                    <th className="text-right py-3 px-4 font-medium">Skipped</th>
                    <th className="text-right py-3 px-4 font-medium">Abandoned</th>
                    <th className="text-right py-3 px-4 font-medium">Completion %</th>
                    <th className="text-right py-3 px-4 font-medium">Abandonment %</th>
                  </tr>
                </thead>
                <tbody>
                  {funnelData.map((step) => (
                    <tr key={step.step} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">Step {step.step}</div>
                          <div className="text-xs text-muted-foreground">{step.label}</div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">{step.totalStarted}</td>
                      <td className="text-right py-3 px-4 text-green-600">{step.completed}</td>
                      <td className="text-right py-3 px-4 text-yellow-600">{step.skipped}</td>
                      <td className="text-right py-3 px-4 text-red-600">{step.abandoned}</td>
                      <td className="text-right py-3 px-4">
                        <span className={step.completionRate > 70 ? "text-green-600" : step.completionRate > 40 ? "text-yellow-600" : "text-red-600"}>
                          {step.completionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-4">
                        <span className={step.abandonmentRate > 20 ? "text-red-600" : step.abandonmentRate > 10 ? "text-yellow-600" : "text-green-600"}>
                          {step.abandonmentRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
