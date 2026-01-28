import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { CheckCircle, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { WelcomeModal } from "@/components/WelcomeModal";

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const { data: subscription, refetch } = trpc.aiCoach.getSubscription.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    // Verify subscription status
    const verifySubscription = async () => {
      if (!user) {
        setLocation("/ai-coach");
        return;
      }

      // Wait a moment for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Refetch subscription to get latest status
      const result = await refetch();

      if (result.data && (result.data.status === "active" || result.data.status === "trialing")) {
        setVerifying(false);
        // Show welcome modal after verification
        setTimeout(() => setShowWelcome(true), 500);
      } else {
        // Subscription not found or not active - might need more time for webhook
        setTimeout(async () => {
          const retryResult = await refetch();
          if (retryResult.data && (retryResult.data.status === "active" || retryResult.data.status === "trialing")) {
            setVerifying(false);
            setTimeout(() => setShowWelcome(true), 500);
          } else {
            setError("We're still processing your payment. Please refresh this page in a moment.");
            setVerifying(false);
          }
        }, 3000);
      }
    };

    verifySubscription();
  }, [user, setLocation, refetch]);

  if (!user) {
    return null;
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white border-sage-dark/20 shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="h-16 w-16 text-sage-dark animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-serif text-sage-darkest mb-3">Verifying Your Subscription</h2>
            <p className="text-sage-dark">
              Please wait while we confirm your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white border-sage-dark/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-sage-darkest text-2xl font-serif text-center">Payment Processing</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-sage-dark">{error}</p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => window.location.reload()}
                className="bg-sage-dark hover:bg-sage-darkest text-white"
              >
                Refresh Page
              </Button>
              <Link href="/ai-coach/dashboard">
                <Button variant="outline" className="w-full border-sage-dark text-sage-dark hover:bg-sage/10">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <WelcomeModal 
        open={showWelcome} 
        onClose={() => setShowWelcome(false)}
        isGuestPass={false}
      />
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-white border-sage-dark/20 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 bg-green-500/10 rounded-full p-4 w-fit">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-serif text-sage-darkest mb-3">
            Welcome to The Deep Brief, {user.name?.split(' ')[0] || 'there'}!
          </CardTitle>
          <CardDescription className="text-sage-dark text-lg">
            Your subscription is now active. You have full access to AI-powered executive coaching.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Subscription Details Card */}
          <div className="bg-sage/10 border border-sage-dark/20 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="h-6 w-6 text-sage-darkest flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-sage-darkest mb-1">Your Subscription</h3>
                <p className="text-sage-dark text-sm">
                  {user.email}
                </p>
              </div>
            </div>
            
            {subscription?.status === "trialing" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-green-800 font-semibold mb-2">🎁 3-Day Free Trial Active</p>
                <p className="text-green-700 text-sm">
                  Your trial ends on {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "soon"}. 
                  You won't be charged until then. Cancel anytime from your dashboard.
                </p>
              </div>
            )}

            {subscription?.status === "active" && !subscription?.cancelAtPeriodEnd && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-blue-800 font-semibold mb-2">✓ Subscription Active</p>
                <p className="text-blue-700 text-sm">
                  Next billing date: {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}
                </p>
              </div>
            )}
          </div>

          {/* What's Included */}
          <div>
            <h3 className="text-xl font-semibold text-sage-darkest mb-4">What You Get:</h3>
            <ul className="space-y-3 text-sage-dark">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong className="text-sage-darkest">Unlimited coaching conversations</strong> with AI coach powered by Claude Sonnet 4</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong className="text-sage-darkest">C.A.L.M. Protocol integration</strong> for tactical pressure management</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong className="text-sage-darkest">Commitment tracking & accountability</strong> to see patterns in what holds you back</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong className="text-sage-darkest">15 tactical scenario templates</strong> for common high-stakes situations</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span><strong className="text-sage-darkest">Quick Coaching mode</strong> for urgent pre-meeting pressure moments (~3 min responses)</span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/ai-coach/dashboard" className="flex-1">
              <Button className="w-full gap-2 bg-sage-dark hover:bg-sage-darkest text-white font-semibold text-lg py-6">
                Start Coaching Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/profile" className="flex-1">
              <Button variant="outline" className="w-full gap-2 border-sage-dark text-sage-dark hover:bg-sage/10 text-lg py-6">
                View Your Profile
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Manage Subscription Link */}
          <div className="text-center pt-4 border-t border-sage-dark/20">
            <p className="text-sm text-sage-dark mb-2">
              Need to update your payment method or cancel?
            </p>
            <Link href="/ai-coach/dashboard">
              <span className="text-sage-dark hover:text-sage-darkest text-sm underline cursor-pointer font-medium">
                Manage your subscription from the dashboard
              </span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
