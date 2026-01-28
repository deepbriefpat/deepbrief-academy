import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  CreditCard, 
  Calendar, 
  Check, 
  Clock, 
  ExternalLink,
  Loader2,
  Sparkles,
  Shield,
  Zap
} from "lucide-react";

export default function ManageSubscription() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const { data: subscription, isLoading } = trpc.aiCoach.getSubscription.useQuery();
  const createPortalSessionMutation = trpc.aiCoach.createPortalSession.useMutation({
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      alert(`Failed to open billing portal: ${error.message}`);
      setIsLoadingPortal(false);
    },
  });

  const handleManageBilling = () => {
    setIsLoadingPortal(true);
    createPortalSessionMutation.mutate();
  };

  const handleUpgrade = () => {
    setLocation("/pricing");
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = (expiresAt: Date | string | null) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F8F6F0] to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4A6741]" />
      </div>
    );
  }

  // Check if user has a Stripe subscription
  const hasStripeSubscription = !!subscription?.stripeSubscriptionId;
  const isActive = subscription?.status === "active";
  
  // For now, treat users without Stripe subscription as having unlimited guest pass
  // In the future, this should check the guest_pass_sessions table
  const isGuestPass = !hasStripeSubscription;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8F6F0] to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CreditCard className="w-8 h-8 text-[#4A6741]" />
            <h1 className="text-4xl font-bold text-[#2C2C2C]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Manage Subscription
            </h1>
          </div>
          <p className="text-[#6B6B60] text-lg">
            View your subscription details and manage your billing
          </p>
        </div>

        {/* Current Subscription Status */}
        <Card className="p-8 mb-6 bg-white border-[#E6E2D6]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-[#2C2C2C] mb-2">
                Current Plan
              </h2>
              <div className="flex items-center gap-2">
                {isGuestPass ? (
                  <>
                    <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-lg font-medium text-[#D4AF37]">
                      Guest Pass
                    </span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 text-[#4A6741]" />
                    <span className="text-lg font-medium text-[#4A6741]">
                      Premium Subscription
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              isGuestPass || isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}>
              {isGuestPass || isActive ? "Active" : "Inactive"}
            </div>
          </div>

          {/* Subscription Details */}
          <div className="space-y-4">
            {isGuestPass && (
              <div className="flex items-center justify-between py-3 border-b border-[#E6E2D6]">
                <div className="flex items-center gap-2 text-[#6B6B60]">
                  <Calendar className="w-5 h-5" />
                  <span>Duration</span>
                </div>
                <span className="font-medium text-[#4A6741]">
                  Unlimited Access
                </span>
              </div>
            )}

            {!isGuestPass && subscription?.stripeSubscriptionId && (
              <div className="flex items-center justify-between py-3 border-b border-[#E6E2D6]">
                <div className="flex items-center gap-2 text-[#6B6B60]">
                  <CreditCard className="w-5 h-5" />
                  <span>Billing</span>
                </div>
                <span className="font-medium text-[#2C2C2C]">
                  Managed via Stripe
                </span>
              </div>
            )}
          </div>


        </Card>

        {/* Premium Features (for guest pass users) */}
        {isGuestPass && (
          <Card className="p-8 mb-6 bg-gradient-to-br from-[#4A6741]/5 to-[#D4AF37]/5 border-[#4A6741]/20">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-[#2C2C2C] mb-2">
                Upgrade to Premium
              </h2>
              <p className="text-[#6B6B60]">
                Get unlimited access to all coaching features
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <Check className="w-5 h-5 text-[#4A6741] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-[#2C2C2C]">Unlimited coaching sessions</p>
                  <p className="text-sm text-[#6B6B60]">No time limits or restrictions</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <Check className="w-5 h-5 text-[#4A6741] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-[#2C2C2C]">All 24 coach personas</p>
                  <p className="text-sm text-[#6B6B60]">Switch coaches anytime</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <Check className="w-5 h-5 text-[#4A6741] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-[#2C2C2C]">25 tactical templates</p>
                  <p className="text-sm text-[#6B6B60]">Proven frameworks for tough situations</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
                <Check className="w-5 h-5 text-[#4A6741] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-[#2C2C2C]">Priority support</p>
                  <p className="text-sm text-[#6B6B60]">Get help when you need it</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleUpgrade}
              className="w-full bg-[#4A6741] text-white hover:bg-[#4A6741]/90 py-6 text-lg font-semibold"
            >
              <Zap className="w-5 h-5 mr-2" />
              Upgrade to Premium
            </Button>
          </Card>
        )}

        {/* Manage Billing (for Stripe subscribers) */}
        {!isGuestPass && subscription?.stripeSubscriptionId && (
          <Card className="p-8 bg-white border-[#E6E2D6]">
            <h2 className="text-2xl font-semibold text-[#2C2C2C] mb-4">
              Billing Management
            </h2>
            <p className="text-[#6B6B60] mb-6">
              Manage your payment method, view invoices, and update your subscription through our secure billing portal.
            </p>
            <Button
              onClick={handleManageBilling}
              disabled={isLoadingPortal}
              className="w-full bg-[#4A6741] text-white hover:bg-[#4A6741]/90 py-6 text-lg font-semibold"
            >
              {isLoadingPortal ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Opening Billing Portal...
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Manage Billing
                </>
              )}
            </Button>
          </Card>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            onClick={() => setLocation("/ai-coach/dashboard")}
            className="border-[#E6E2D6] text-[#6B6B60] hover:bg-[#F2F0E9]"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
