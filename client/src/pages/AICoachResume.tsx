/**
 * Resume Session Landing Page
 * 
 * Bookmarkable page for returning users to quickly continue coaching
 * Works for authenticated users, guest pass users, and demo users
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MessageCircle, Calendar, CheckCircle, ArrowRight, 
  Bookmark, Clock, TrendingUp 
} from "lucide-react";
import { QuickStartGuide } from "@/components/QuickStartGuide";

export default function AICoachResume() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [guestPassCode, setGuestPassCode] = useState<string | null>(null);
  
  // Check for guest pass code in localStorage (multiple possible keys)
  useEffect(() => {
    // Check for guest pass code stored during validation
    const savedCode = localStorage.getItem("guestPassCode");
    if (savedCode) {
      setGuestPassCode(savedCode);
      return;
    }
    
    // Check for guest pass code in URL
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get("code");
    if (codeFromUrl) {
      setGuestPassCode(codeFromUrl);
      return;
    }
    
    // Check for any guest pass history keys in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("aiCoachGuestHistory_")) {
        const code = key.replace("aiCoachGuestHistory_", "");
        setGuestPassCode(code);
        return;
      }
    }
  }, []);
  
  // Fetch user data if authenticated
  const { data: profile } = trpc.aiCoach.getProfile.useQuery(undefined, {
    enabled: !!user,
  });
  
  const { data: sessions } = trpc.aiCoach.getSessions.useQuery(
    { limit: 3 },
    { enabled: !!user }
  );
  
  const { data: commitments } = trpc.aiCoach.getCommitments.useQuery(
    {},
    { enabled: !!user }
  );
  
  const { data: subscription, isLoading: subscriptionLoading } = trpc.aiCoach.getSubscription.useQuery(
    undefined,
    { enabled: !!user }
  );
  
  // Check if data is still loading
  const isLoading = user && (subscriptionLoading || !subscription);
  
  // Determine user type and redirect path
  const getUserType = () => {
    if (user && (subscription?.status === "active" || subscription?.status === "trialing")) {
      return "subscriber";
    } else if (user && subscription?.status !== "active" && subscription?.status !== "trialing") {
      return "needs_subscription";
    } else if (guestPassCode) {
      return "guest";
    } else {
      return "demo";
    }
  };
  
  const userType = getUserType();
  
  const handleContinue = () => {
    if (userType === "subscriber") {
      setLocation("/ai-coach/dashboard");
    } else if (userType === "needs_subscription") {
      setLocation("/ai-coach/subscribe");
    } else if (userType === "guest") {
      setLocation(`/ai-coach/guest?code=${guestPassCode}`);
    } else {
      setLocation("/ai-coach/demo");
    }
  };
  
  const getLastSessionInfo = () => {
    if (!sessions || sessions.length === 0) return null;
    
    const lastSession = sessions[0];
    const daysAgo = Math.floor(
      (new Date().getTime() - new Date(lastSession.createdAt).getTime()) / 
      (24 * 60 * 60 * 1000)
    );
    
    // Safely parse messages with error handling
    let messageCount = 0;
    try {
      if (lastSession.messages) {
        const parsed = JSON.parse(lastSession.messages as string);
        messageCount = Array.isArray(parsed) ? parsed.length : 0;
      }
    } catch (error) {
      messageCount = 0;
    }
    
    return {
      date: new Date(lastSession.createdAt).toLocaleDateString(),
      daysAgo,
      messageCount,
    };
  };
  
  const lastSession = getLastSessionInfo();
  const openCommitments = commitments?.filter(c => 
    c.status === 'open' || c.status === 'pending' || c.status === 'in_progress'
  ) || [];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-600/3 rounded-full blur-3xl"></div>
      </div>
      
      {/* Header */}
      <header className="border-b border-gold-400/20 bg-navy-900/50 backdrop-blur-sm relative z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-navy-900" />
              </div>
              <span className="text-xl font-bold text-white">AI Executive Coach</span>
            </div>
          </Link>
          
          {!authLoading && !user && (
            guestPassCode ? (
              <Link href={`/ai-coach/guest?code=${guestPassCode}`}>
                <Button size="lg" className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-8 shadow-lg shadow-gold-500/30 hover:shadow-xl hover:shadow-gold-500/40 transition-all">
                  Continue with Guest Pass
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-8 text-lg shadow-lg shadow-gold-500/30 hover:shadow-xl hover:shadow-gold-500/40 transition-all">
                  Sign In
                </Button>
              </a>
            )
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="animate-pulse space-y-8">
            <div className="text-center space-y-4">
              <div className="h-12 bg-navy-800/50 rounded-lg w-3/4 mx-auto"></div>
              <div className="h-6 bg-navy-800/50 rounded-lg w-1/2 mx-auto"></div>
              <div className="h-14 bg-navy-800/50 rounded-lg w-64 mx-auto"></div>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-navy-800/50 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
        {/* Welcome Back Section */}
        <div className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-400/30 rounded-full px-5 py-2.5 mb-8 shadow-lg shadow-gold-500/10 backdrop-blur-sm">
            <Bookmark className="w-4 h-4 text-gold-400" />
            <span className="text-gold-400 text-sm font-medium">Bookmark this page to return anytime</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight" style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 4px 20px rgba(212, 175, 55, 0.15)' }}>
            Welcome Back
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            {userType === "subscriber" 
              ? "Ready to continue your coaching journey?"
              : userType === "needs_subscription"
              ? "Complete your subscription to unlock full access"
              : userType === "guest"
              ? "Your guest coaching session is ready to continue"
              : "Try 10 free coaching interactions"}
          </p>
          
          <div className="flex flex-col gap-5 items-center">
            <Button
              onClick={handleContinue}
              size="lg"
              className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-500 hover:via-gold-600 hover:to-gold-700 text-navy-900 font-bold px-14 py-8 text-xl shadow-2xl shadow-gold-500/60 border-2 border-gold-300 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:shadow-gold-500/70 rounded-xl"
            >
              {userType === "needs_subscription" ? "Start Free Trial" : "Continue Coaching Session"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            {userType === "subscriber" && lastSession && (
              <Link href="/ai-coach/dashboard?tab=history&expand=latest">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gold-400/40 text-gold-400 hover:bg-gold-400/15 hover:text-gold-300 hover:border-gold-400/60 px-10 py-6 text-lg shadow-lg shadow-gold-500/10 hover:shadow-xl hover:shadow-gold-500/20 transition-all duration-300 rounded-xl backdrop-blur-sm"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Resume Previous Session
                </Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Quick Start Guide */}
        <div className="mb-16 relative z-10">
          <QuickStartGuide page="dashboard" />
        </div>
        
        {/* Session Summary - Only for authenticated users */}
        {userType === "subscriber" && (
          <div className="grid md:grid-cols-3 gap-8 mb-16 relative z-10">
            {/* Last Session */}
            {lastSession && (
              <Link href="/ai-coach/dashboard?tab=history">
                <Card className="p-8 bg-gradient-to-br from-navy-800/60 to-navy-800/40 border-gold-400/30 cursor-pointer hover:bg-navy-800/80 hover:border-gold-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gold-500/20 backdrop-blur-sm group">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center group-hover:bg-gold-500/30 transition-colors">
                      <Clock className="w-5 h-5 text-gold-400" />
                    </div>
                    <h3 className="font-bold text-white text-lg">Last Session</h3>
                  </div>
                  <p className="text-gray-200 text-base font-medium mb-2">
                    {lastSession.daysAgo === 0 
                      ? "Today" 
                      : lastSession.daysAgo === 1 
                      ? "Yesterday" 
                      : `${lastSession.daysAgo} days ago`}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {lastSession.messageCount} messages exchanged
                  </p>
                </Card>
              </Link>
            )}
            
            {/* Open Commitments */}
            <Link href="/ai-coach/dashboard?tab=commitments">
              <Card className="p-8 bg-gradient-to-br from-navy-800/60 to-navy-800/40 border-gold-400/30 cursor-pointer hover:bg-navy-800/80 hover:border-gold-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gold-500/20 backdrop-blur-sm group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center group-hover:bg-gold-500/30 transition-colors">
                    <CheckCircle className="w-5 h-5 text-gold-400" />
                  </div>
                  <h3 className="font-bold text-white text-lg">Commitments</h3>
                </div>
                <p className="text-4xl font-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(212, 175, 55, 0.2)' }}>
                  {openCommitments.length}
                </p>
                <p className="text-gray-400 text-sm">
                  {openCommitments.length === 0 
                    ? "All loops closed" 
                    : "open commitments"}
                </p>
              </Card>
            </Link>
            
            {/* Total Sessions */}
            <Link href="/ai-coach/dashboard?tab=analytics">
              <Card className="p-8 bg-gradient-to-br from-navy-800/60 to-navy-800/40 border-gold-400/30 cursor-pointer hover:bg-navy-800/80 hover:border-gold-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gold-500/20 backdrop-blur-sm group">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center group-hover:bg-gold-500/30 transition-colors">
                    <TrendingUp className="w-5 h-5 text-gold-400" />
                  </div>
                  <h3 className="font-bold text-white text-lg">Progress</h3>
                </div>
                <p className="text-4xl font-bold text-white mb-3" style={{ textShadow: '0 2px 10px rgba(212, 175, 55, 0.2)' }}>
                  {sessions?.length || 0}
                </p>
                <p className="text-gray-400 text-sm">
                  coaching sessions
                </p>
              </Card>
            </Link>
          </div>
        )}
        
        {/* What to Expect */}
        <Card className="p-10 bg-gradient-to-br from-navy-800/60 to-navy-800/40 border-gold-400/30 mb-10 shadow-2xl shadow-gold-500/10 backdrop-blur-sm relative z-10">
          <h2 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 10px rgba(212, 175, 55, 0.15)' }}>
            What to Expect
          </h2>
          
          <div className="space-y-6">
            {userType === "subscriber" && openCommitments.length > 0 && (
              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/30 transition-colors">
                  <CheckCircle className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2 text-lg">Accountability Check-In</h3>
                  <p className="text-gray-300 text-base leading-relaxed">
                    The coach will immediately ask about your {openCommitments.length} open commitment{openCommitments.length > 1 ? 's' : ''}. 
                    Be ready to report what happened.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-5 group">
              <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/30 transition-colors">
                <MessageCircle className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-2 text-lg">Direct Coaching</h3>
                <p className="text-gray-300 text-base leading-relaxed">
                  No fluff. The coach asks sharp questions, challenges assumptions, and helps you think clearly under pressure.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-5 group">
              <div className="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/30 transition-colors">
                <TrendingUp className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-2 text-lg">Pattern Recognition</h3>
                <p className="text-gray-300 text-base leading-relaxed">
                  The AI tracks your behavioral patterns across sessions and surfaces insights you might be avoiding.
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          <Card className="p-8 bg-gradient-to-br from-navy-800/60 to-navy-800/40 border-gold-400/30 hover:border-gold-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-gold-500/15 backdrop-blur-sm group">
            <h3 className="font-bold text-white mb-3 text-lg">New to AI Coaching?</h3>
            <p className="text-gray-300 text-base mb-5 leading-relaxed">
              Learn how to get the most out of your coaching sessions
            </p>
            <Link href="/ai-coach/welcome">
              <Button variant="outline" className="border-2 border-gold-400/40 text-gold-400 hover:bg-gold-400/15 hover:border-gold-400/60 w-full py-6 text-base font-semibold transition-all duration-300 group-hover:scale-105">
                View Best Practices
              </Button>
            </Link>
          </Card>
          
          <Card className="p-8 bg-gradient-to-br from-navy-800/60 to-navy-800/40 border-gold-400/30 hover:border-gold-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-gold-500/15 backdrop-blur-sm group">
            <h3 className="font-bold text-white mb-3 text-lg">Want Deeper Work?</h3>
            <p className="text-gray-300 text-base mb-5 leading-relaxed">
              Book a 1-on-1 call with Patrick for intensive coaching
            </p>
            <a href="https://thedeepbrief.co.uk/book-call" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-2 border-gold-400/40 text-gold-400 hover:bg-gold-400/15 hover:border-gold-400/60 w-full py-6 text-base font-semibold transition-all duration-300 group-hover:scale-105">
                <Calendar className="w-4 h-4 mr-2" />
                Book a Call
              </Button>
            </a>
          </Card>
        </div>
        
        {/* Bookmark Instructions */}
        <div className="mt-12 p-8 bg-gradient-to-r from-gold-500/10 to-gold-600/10 border-2 border-gold-400/30 rounded-xl shadow-xl shadow-gold-500/10 backdrop-blur-sm relative z-10">
          <h3 className="font-bold text-gold-400 mb-3 flex items-center gap-3 text-lg">
            <Bookmark className="w-5 h-5" />
            Bookmark This Page
          </h3>
          <p className="text-gray-300 text-base leading-relaxed">
            Save this URL to quickly return to your coaching sessions: 
            <code className="ml-2 px-2 py-1 bg-navy-900/50 rounded text-gold-400 text-xs">
              {window.location.origin}/ai-coach/resume
            </code>
          </p>
        </div>
        </>
        )}
      </main>
    </div>
  );
}
