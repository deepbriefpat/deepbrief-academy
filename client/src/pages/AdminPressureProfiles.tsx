import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function AdminPressureProfiles() {
  const { data: stats, isLoading } = trpc.admin.getPressureProfileStats.useQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-text-secondary">No data available</p>
        </div>
      </DashboardLayout>
    );
  }

  const tierColors = {
    "Surface Level": "#14b8a6", // teal
    "Thermocline": "#f59e0b", // amber
    "Deep Water": "#3b82f6", // blue
    "Crush Depth": "#ef4444", // red
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-serif">Leadership Pressure Profile Analytics</h1>
          <p className="text-text-secondary mt-2">Track completion rates, tier distribution, and pressure patterns</p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-navy-mid border-gold-dim/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-text-secondary">Total Completions</CardDescription>
              <CardTitle className="text-3xl font-bold text-gold">{stats.totalCompletions}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-navy-mid border-gold-dim/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-text-secondary">Avg Score</CardDescription>
              <CardTitle className="text-3xl font-bold text-gold">{stats.avgScore.toFixed(1)}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-navy-mid border-gold-dim/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-text-secondary">This Week</CardDescription>
              <CardTitle className="text-3xl font-bold text-gold">{stats.completionsThisWeek}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-navy-mid border-gold-dim/30">
            <CardHeader className="pb-2">
              <CardDescription className="text-text-secondary">This Month</CardDescription>
              <CardTitle className="text-3xl font-bold text-gold">{stats.completionsThisMonth}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Tier Distribution */}
        <Card className="bg-navy-mid border-gold-dim/30">
          <CardHeader>
            <CardTitle className="font-serif">Tier Distribution</CardTitle>
            <CardDescription className="text-text-secondary">
              How leaders are distributed across pressure tiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.tierDistribution.map((tier) => {
                const percentage = stats.totalCompletions > 0 
                  ? (tier.count / stats.totalCompletions) * 100 
                  : 0;
                
                return (
                  <div key={tier.tier} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{tier.tier}</span>
                      <span className="text-text-secondary">
                        {tier.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-navy-deep rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: tierColors[tier.tier as keyof typeof tierColors],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Question Score Heatmap */}
        <Card className="bg-navy-mid border-gold-dim/30">
          <CardHeader>
            <CardTitle className="font-serif">Question Score Analysis</CardTitle>
            <CardDescription className="text-text-secondary">
              Average scores by question - identify common pressure patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.questionAverages.map((q) => {
                const percentage = (q.avgScore / 4) * 100; // Assuming max score is 4
                let barColor = "#14b8a6"; // teal (good)
                if (q.avgScore >= 3) barColor = "#ef4444"; // red (critical)
                else if (q.avgScore >= 2) barColor = "#3b82f6"; // blue (concerning)
                else if (q.avgScore >= 1.5) barColor = "#f59e0b"; // amber (moderate)

                return (
                  <div key={q.questionNumber} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Question {q.questionNumber}</span>
                      <span className="text-text-secondary">{q.avgScore.toFixed(2)} avg</span>
                    </div>
                    <div className="h-2 bg-navy-deep rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Completions */}
        <Card className="bg-navy-mid border-gold-dim/30">
          <CardHeader>
            <CardTitle className="font-serif">Recent Completions</CardTitle>
            <CardDescription className="text-text-secondary">
              Latest 10 pressure profile submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentCompletions.map((completion) => (
                <div
                  key={completion.id}
                  className="flex items-center justify-between p-3 bg-navy-deep rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{completion.name}</p>
                    <p className="text-sm text-text-secondary">{completion.email}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-semibold text-sm"
                      style={{ color: tierColors[completion.tier as keyof typeof tierColors] }}
                    >
                      {completion.tier}
                    </p>
                    <p className="text-xs text-text-secondary">
                      Score: {completion.totalScore}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(completion.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
