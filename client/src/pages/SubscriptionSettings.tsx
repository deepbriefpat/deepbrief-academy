import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

export default function SubscriptionSettings() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: subscription, isLoading: subLoading } = trpc.aiCoach.getSubscription.useQuery(
    undefined,
    { enabled: !!user }
  );

  const createPortalMutation = trpc.aiCoach.createPortalSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  if (authLoading || subLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const handleManageSubscription = () => {
    createPortalMutation.mutate();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Active</Badge>;
      case "trialing":
        return <Badge className="bg-blue-500"><Calendar className="w-3 h-3 mr-1" />Trial</Badge>;
      case "past_due":
        return <Badge className="bg-orange-500"><AlertCircle className="w-3 h-3 mr-1" />Past Due</Badge>;
      case "canceled":
        return <Badge className="bg-gray-500">Canceled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Subscription Settings</h1>
        <p className="text-muted-foreground">
          Manage your AI Coach subscription and billing details
        </p>
      </div>

      {!subscription ? (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              You don't have an active subscription. Subscribe to unlock all AI Coach features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/ai-coach/subscribe")} className="bg-gold hover:bg-gold/90">
              Subscribe Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>AI Coach Monthly Subscription</CardDescription>
                </div>
                {getStatusBadge(subscription.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Price</span>
                </div>
                <span className="text-lg font-bold">£19.95/month</span>
              </div>

              {subscription.currentPeriodEnd && (
                <div className="flex items-center justify-between py-3 border-b">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">
                      {subscription.cancelAtPeriodEnd ? "Access ends" : "Next billing date"}
                    </span>
                  </div>
                  <span>{formatDate(subscription.currentPeriodEnd)}</span>
                </div>
              )}

              {subscription.cancelAtPeriodEnd && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-900">Subscription Ending</p>
                      <p className="text-sm text-orange-700 mt-1">
                        Your subscription will end on {formatDate(subscription.currentPeriodEnd!)}. 
                        You can reactivate it anytime before then.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <Button
                  onClick={handleManageSubscription}
                  disabled={createPortalMutation.isPending}
                  className="w-full bg-gold hover:bg-gold/90"
                >
                  {createPortalMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Update payment method, view invoices, or cancel subscription
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Included */}
          <Card>
            <CardHeader>
              <CardTitle>Features Included</CardTitle>
              <CardDescription>Everything you get with your subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Unlimited coaching sessions with all AI coaches",
                  "Pattern insights and breakthrough analysis",
                  "Goal tracking and commitment management",
                  "Session history and progress tracking",
                  "Quick Mode for rapid insights",
                  "Priority support",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
