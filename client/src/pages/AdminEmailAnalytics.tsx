import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Users, TrendingUp, CheckCircle2 } from "lucide-react";

export default function AdminEmailAnalytics() {
  const { data: analytics, isLoading } = trpc.admin.emailAnalytics.useQuery();

  useEffect(() => {
    document.title = "Email Analytics | Admin | The Deep Brief";
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      </DashboardLayout>
    );
  }

  if (!analytics) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-text-secondary">No analytics data available</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif text-gold mb-2">Email Analytics</h1>
          <p className="text-text-secondary">Monitor email subscription and engagement metrics</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-navy-mid border-gold-dim/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{analytics.totalSubscribers}</div>
              <p className="text-xs text-text-secondary mt-1">
                {analytics.activeSubscribers} active
              </p>
            </CardContent>
          </Card>

          <Card className="bg-navy-mid border-gold-dim/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">Emails Sent</CardTitle>
              <Mail className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{analytics.totalEmailsSent}</div>
              <p className="text-xs text-text-secondary mt-1">
                All time
              </p>
            </CardContent>
          </Card>

          <Card className="bg-navy-mid border-gold-dim/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">{analytics.subscribersThisWeek}</div>
              <p className="text-xs text-text-secondary mt-1">
                New subscribers
              </p>
            </CardContent>
          </Card>

          <Card className="bg-navy-mid border-gold-dim/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">Success Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">
                {analytics.totalEmailsSent > 0
                  ? Math.round((analytics.successfulEmails / analytics.totalEmailsSent) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {analytics.successfulEmails} successful
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Sources */}
        <Card className="bg-navy-mid border-gold-dim/30">
          <CardHeader>
            <CardTitle className="text-gold">Subscription Sources</CardTitle>
            <CardDescription>Where subscribers are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.subscriptionsBySource.map((source) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gold"></div>
                    <span className="text-text-primary capitalize">
                      {source.source.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-text-secondary text-sm">
                      {Math.round((source.count / analytics.totalSubscribers) * 100)}%
                    </span>
                    <span className="text-text-primary font-semibold min-w-[3rem] text-right">
                      {source.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Email Sequence Performance */}
        <Card className="bg-navy-mid border-gold-dim/30">
          <CardHeader>
            <CardTitle className="text-gold">Email Sequence Performance</CardTitle>
            <CardDescription>Delivery status by email sequence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.emailsBySequence.map((seq) => (
                <div key={seq.sequenceName} className="border-l-4 border-gold-dim/50 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-text-primary">{seq.sequenceName}</h3>
                    <span className="text-text-secondary text-sm">{seq.totalSent} sent</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-500">
                      ✓ {seq.successful} successful
                    </span>
                    {seq.failed > 0 && (
                      <span className="text-red-500">
                        ✗ {seq.failed} failed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Subscribers */}
        <Card className="bg-navy-mid border-gold-dim/30">
          <CardHeader>
            <CardTitle className="text-gold">Recent Subscribers</CardTitle>
            <CardDescription>Latest email subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentSubscribers.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between py-2 border-b border-gold-dim/20 last:border-0">
                  <div>
                    <p className="text-text-primary font-medium">{sub.email}</p>
                    <p className="text-text-secondary text-sm capitalize">
                      {sub.source.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-secondary text-sm">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                    <p className={`text-xs ${sub.subscribed ? "text-green-500" : "text-red-500"}`}>
                      {sub.subscribed ? "Active" : "Unsubscribed"}
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
