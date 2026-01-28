import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, TrendingUp, FileText, Calendar, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

type Theme = "pressure_management" | "diving_metaphors" | "leadership_isolation" | "vulnerability";

const themeLabels: Record<Theme, string> = {
  pressure_management: "Pressure Management",
  diving_metaphors: "Diving Metaphors",
  leadership_isolation: "Leadership Isolation",
  vulnerability: "Vulnerability",
};

const themeColors: Record<Theme, string> = {
  pressure_management: "bg-blue-500/10 text-blue-500",
  diving_metaphors: "bg-cyan-500/10 text-cyan-500",
  leadership_isolation: "bg-purple-500/10 text-purple-500",
  vulnerability: "bg-orange-500/10 text-orange-500",
};

export default function AdminAnalytics() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const { data: analytics, isLoading } = trpc.admin.getAnalytics.useQuery();

  if (loading || isLoading) {
    return <div className="container py-12">Loading analytics...</div>;
  }

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  if (!analytics) {
    return <div className="container py-12">No analytics data available</div>;
  }

  const { totalViews, totalArticles, avgViewsPerArticle, topArticles, recentlyViewed, themeBreakdown } = analytics;

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
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track article engagement and content performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all articles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalArticles}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Published resources
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Views per Article</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgViewsPerArticle.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Average engagement
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Most Popular Articles */}
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Articles</CardTitle>
              <CardDescription>Top 5 articles by view count</CardDescription>
            </CardHeader>
            <CardContent>
              {topArticles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No articles with views yet</p>
              ) : (
                <div className="space-y-4">
                  {topArticles.map((article: any, index: number) => (
                    <div key={article.id} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{article.title}</h4>
                          <Badge className={`${themeColors[article.theme as Theme]} text-xs`}>
                            {themeLabels[article.theme as Theme]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.viewCount} views
                          </span>
                          {article.lastViewedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(article.lastViewedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recently Viewed */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Viewed</CardTitle>
              <CardDescription>Latest 5 articles accessed by users</CardDescription>
            </CardHeader>
            <CardContent>
              {recentlyViewed.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent views yet</p>
              ) : (
                <div className="space-y-4">
                  {recentlyViewed.map((article: any) => (
                    <div key={article.id} className="flex items-start gap-4">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{article.title}</h4>
                          <Badge className={`${themeColors[article.theme as Theme]} text-xs`}>
                            {themeLabels[article.theme as Theme]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.viewCount} views
                          </span>
                          {article.lastViewedAt && (
                            <span>
                              {new Date(article.lastViewedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Theme Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Content by Theme</CardTitle>
            <CardDescription>Article distribution and engagement across themes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {themeBreakdown.map((theme: { theme: Theme; count: number; totalViews: number }) => (
                <div key={theme.theme} className="space-y-2">
                  <Badge className={`${themeColors[theme.theme]} w-full justify-center py-2`}>
                    {themeLabels[theme.theme]}
                  </Badge>
                  <div className="text-center space-y-1">
                    <div className="text-2xl font-bold">{theme.count}</div>
                    <div className="text-xs text-muted-foreground">
                      {theme.totalViews} total views
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {theme.count > 0 ? (theme.totalViews / theme.count).toFixed(1) : 0} avg views
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
