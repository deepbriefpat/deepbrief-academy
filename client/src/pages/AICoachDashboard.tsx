// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { SessionSummaryModal } from "@/components/SessionSummaryModal";
import { Link, useLocation } from "wouter";
import { 
  MessageCircle, Target, CheckCircle, TrendingUp, 
  BookOpen, Calendar, Send, Loader2, Menu, X,
  Home, BarChart3, Settings, LogOut, Plus, Edit2, Trash2, Sliders,
  ThumbsUp, ThumbsDown, User, CreditCard, HelpCircle, Download
} from "lucide-react";
import { BookCallButton } from "@/components/BookCallButton";
import { StreamingMessage } from "@/components/StreamingMessage";
import { Streamdown } from "streamdown";
import { GoalForm } from "@/components/GoalForm";
import { SessionHistory } from "@/components/SessionHistory";
import CoachingWelcome from "./CoachingWelcome";
import CoachingAnalytics from "@/components/CoachingAnalytics";
import { MessageInput } from "@/components/MessageInput";
import { UnfinishedBusiness } from "@/components/ai-coach/UnfinishedBusiness";
// import { PatternInsights } from "@/components/ai-coach/PatternInsights"; // Removed incomplete feature
import { MyCommitments } from "@/components/ai-coach/MyCommitments";
import { CoachSelector } from "@/components/ai-coach/CoachSelector";
import { OnboardingFlow } from "@/components/ai-coach/OnboardingFlow";
import { SessionNotes } from "@/components/ai-coach/SessionNotes";
import { CommitmentReminders } from "@/components/ai-coach/CommitmentReminders";
import { FocusGoals } from "@/components/ai-coach/FocusGoals";
import { Commitments } from "@/components/ai-coach/Commitments";
import { PressureStateIndicator } from "@/components/PressureStateIndicator";
import { FloatingActionButton } from "@/components/ai-coach/FloatingActionButton";
import { tacticalTemplates } from "@/data/tacticalTemplates";
import { toast } from "sonner";
import { trackSubscriptionStarted, trackSessionMilestone } from "@/lib/analytics";
import { SessionResumeBanner } from "@/components/ai-coach/SessionResumeBanner";
import { QuickStartGuide } from "@/components/QuickStartGuide";

const WELCOME_SHOWN_KEY = "aiCoachDashboardWelcomeShown";
const GUEST_PASS_KEY = "aiCoachGuestPassCode";

export default function AICoachDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"chat" | "goals" | "commitments" | "patterns" | "insights" | "analytics">("chat");
  const [expandLatestSession, setExpandLatestSession] = useState(false);
  const [message, setMessage] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string; id?: number }>>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [editingProgress, setEditingProgress] = useState<{ goalId: number; progress: number } | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<string>("sarah");
  const [messageFeedback, setMessageFeedback] = useState<Record<number, "helpful" | "not_helpful">>({});
  const [coachingMode, setCoachingMode] = useState<"full" | "quick">("full");
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pausedSessionId, setPausedSessionId] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<any>(null);
  const [showSummaryBanner, setShowSummaryBanner] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [guestPassCode, setGuestPassCode] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Check for guest pass code in URL or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get("guest");
    const storedCode = localStorage.getItem(GUEST_PASS_KEY);
    
    // Check for tab parameter to switch tabs
    const tabParam = params.get("tab");
    if (tabParam === "history") {
      setActiveTab("insights"); // Session History is in the insights tab
    } else if (tabParam === "commitments") {
      setActiveTab("commitments");
    } else if (tabParam === "analytics") {
      setActiveTab("analytics");
    } else if (tabParam === "goals") {
      setActiveTab("goals");
    } else if (tabParam === "patterns") {
      setActiveTab("patterns");
    }
    
    // Check for expand parameter to auto-expand latest session
    const expandParam = params.get("expand");
    if (expandParam === "latest") {
      setExpandLatestSession(true);
    }
    
    if (codeFromUrl) {
      setGuestPassCode(codeFromUrl);
      localStorage.setItem(GUEST_PASS_KEY, codeFromUrl);
      setIsGuestMode(true);
    } else if (storedCode) {
      setGuestPassCode(storedCode);
      setIsGuestMode(true);
    }
  }, []);

  // Validate guest pass
  const { data: guestPassValidation } = trpc.aiCoach.validateGuestPass.useQuery(
    { code: guestPassCode || "" },
    { enabled: !!guestPassCode }
  );

  const submitFeedbackMutation = trpc.aiCoach.submitFeedback.useMutation();

  // Track screen size for responsive template count
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if welcome should be shown
  useEffect(() => {
    const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!welcomeShown && user) {
      setShowWelcome(true);
      localStorage.setItem(WELCOME_SHOWN_KEY, "true");
    }
  }, [user]);

  // Check for paused session on mount
  useEffect(() => {
    const paused = localStorage.getItem('pausedSessionId');
    if (paused && !currentSessionId) {
      setPausedSessionId(paused);
      setShowResumeModal(true);
    }
  }, [currentSessionId]);

  // Check for template prompt from templates page
  useEffect(() => {
    const templatePrompt = localStorage.getItem('coaching_template_prompt');
    const autoStart = localStorage.getItem('coaching_auto_start');
    
    if (templatePrompt) {
      setMessage(templatePrompt);
      localStorage.removeItem('coaching_template_prompt');
      
      // If auto-start flag is set, start session immediately
      if (autoStart === 'true') {
        localStorage.removeItem('coaching_auto_start');
        // Start session after a brief delay to ensure state is ready
        setTimeout(() => {
          handleStartSession();
        }, 300);
      } else {
        // Focus the input after setting the message
        setTimeout(() => messageInputRef.current?.focus(), 100);
      }
    }
  }, []);

  // Fetch user profile
  const { data: profile } = trpc.aiCoach.getProfile.useQuery();
  
  // Show onboarding modal for first-time users who haven't completed onboarding
  useEffect(() => {
    if (profile && !profile.hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [profile]);

  const completeOnboardingMutation = trpc.aiCoach.completeOnboarding.useMutation();

  const { data: goals, isLoading: goalsLoading, error: goalsError } = trpc.aiCoach.getGoals.useQuery();
  const { data: commitments, isLoading: commitmentsLoading, error: commitmentsError } = trpc.aiCoach.getCommitments.useQuery({ status: "pending" });
  const { data: allCommitments } = trpc.aiCoach.getCommitments.useQuery({}); // For analytics
  const { data: sessions, isLoading: sessionsLoading, error: sessionsError } = trpc.aiCoach.getSessions.useQuery({ limit: 5 }, { enabled: !isGuestMode });
  const { data: subscription, isLoading: subscriptionLoading, error: subscriptionError } = trpc.aiCoach.getSubscription.useQuery(undefined, { enabled: !isGuestMode });

  const startSessionMutation = trpc.aiCoach.startSession.useMutation();
  const sendMessageMutation = trpc.aiCoach.sendMessage.useMutation();
  const guestChatMutation = trpc.aiCoach.guestPassChat.useMutation(); // For guest pass users
  const getSessionMutation = trpc.aiCoach.getSession.useMutation();
  const generateSummaryMutation = trpc.aiCoach.generateSessionSummary.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();
  const createGoalMutation = trpc.aiCoach.createGoal.useMutation();
  const updateGoalMutation = trpc.aiCoach.updateGoal.useMutation();
  const updateGoalProgressMutation = trpc.aiCoach.updateGoalProgress.useMutation();
  const deleteGoalMutation = trpc.aiCoach.deleteGoal.useMutation();
  const createPortalSessionMutation = trpc.aiCoach.createPortalSession.useMutation();
  const endSessionMutation = trpc.aiCoach.endSession.useMutation();
  const utils = trpc.useUtils();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Extract topic from recent messages for session resume summary
  const extractTopicFromMessages = (messages: any[]): string => {
    // Get the last few user messages to understand what was being discussed
    const userMessages = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .slice(-3);
    
    if (userMessages.length === 0) return "your previous conversation";
    
    // Simple topic extraction: take key phrases from the last user message
    const lastMessage = userMessages[userMessages.length - 1];
    
    // Extract first meaningful phrase (up to 50 chars)
    const topic = lastMessage
      .split(/[.!?]/)[0] // Get first sentence
      .trim()
      .slice(0, 60);
    
    return topic || "your previous conversation";
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    // Skip profile check for guest mode - guests don't need a profile
    // Also skip for admins who might not have a profile yet
    if (!isGuestMode && !profile && user?.role !== "admin") {
      setLocation("/ai-coach/onboarding");
    }
  }, [profile, isGuestMode, setLocation, user, authLoading]);

  useEffect(() => {
    // Wait for auth to finish loading before making redirect decisions
    if (authLoading) return;
    
    // Allow access if:
    // 1. Valid guest pass, OR
    // 2. Active/trialing subscription, OR
    // 3. Admin user (bypass subscription check)
    const hasValidGuestPass = isGuestMode && guestPassValidation?.valid;
    const hasValidSubscription = subscription && (subscription.status === "active" || subscription.status === "trialing");
    const isAdmin = user?.role === "admin";
    
    if (!hasValidGuestPass && !hasValidSubscription && !isAdmin) {
      // If we're still loading guest pass validation, wait
      if (isGuestMode && guestPassCode && guestPassValidation === undefined) {
        return; // Still loading
      }
      setLocation("/ai-coach");
    } else if ((hasValidSubscription || isAdmin) && !isGuestMode) {
      // Track subscription started (only fires once per user)
      const hasTrackedSubscription = localStorage.getItem('aiCoachSubscriptionTracked');
      if (!hasTrackedSubscription && hasValidSubscription) {
        trackSubscriptionStarted('dashboard');
        localStorage.setItem('aiCoachSubscriptionTracked', 'true');
      }
    }
  }, [subscription, isGuestMode, guestPassCode, guestPassValidation, setLocation, user, authLoading]);

  const handleStartSession = async () => {
    // For guests, just initialize the chat without creating a DB session
    if (isGuestMode) {
      setCurrentSessionId(-1); // Use -1 to indicate "active" guest session
      setChatMessages([
        {
          role: "assistant",
          content: `Hey. What's on your mind? Don't give me the polished version—I want the thing you're actually wrestling with.`,
        },
      ]);
      return;
    }
    
    // For subscribers, create a real session
    try {
      const session = await startSessionMutation.mutateAsync({
        sessionType: "general", // Always use general type
      });
      setCurrentSessionId(session.insertId as number);
      
      // Track session milestones (1, 5, 10, 25, 50, 100)
      if (sessions) {
        const sessionCount = sessions.length + 1;
        if ([1, 5, 10, 25, 50, 100].includes(sessionCount)) {
          trackSessionMilestone(sessionCount);
        }
      }
      
      setChatMessages([
        {
          role: "assistant",
          content: `${(user as any)?.preferredName || user?.name || "Hey"}. What's on your mind? Don't give me the polished version—I want the thing you're actually wrestling with.`,
        },
      ]);
    } catch (error) {
      // Error handled silently
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // For subscribers, need a session; for guests, don't
    if (!isGuestMode && !currentSessionId) return;

    const userMessage = message.trim();
    setMessage("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      let aiResponse: string;
      
      if (isGuestMode && guestPassCode) {
        // Use guest pass chat
        const response = await guestChatMutation.mutateAsync({
          guestPassCode,
          message: userMessage,
          fingerprint: "dashboard-" + Date.now(), // Simple fingerprint for tracking
        });
        aiResponse = response.message;
      } else {
        // Use regular subscriber chat
        const response = await sendMessageMutation.mutateAsync({
          sessionId: currentSessionId!,
          message: userMessage,
          sessionType: coachingMode, // "full" or "quick"
        });
        aiResponse = response.message;
      }
      
      // Add message with unique ID for streaming
      const messageId = Date.now();
      setChatMessages((prev) => [...prev, { role: "assistant", content: aiResponse, id: messageId }]);
      setStreamingMessageId(messageId);
      
      // Refresh commitments - the backend extracts them from conversation
      if (isGuestMode && guestPassCode) {
        utils.aiCoach.getGuestCommitments.invalidate();
      } else {
        utils.aiCoach.getCommitments.invalidate();
      }
    } catch (error) {
      // Error handled with user message
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I apologize, but I encountered an error. Please try again." },
      ]);
    }
  };

  const handleLogout = async () => {
    // Clear guest pass from localStorage to allow signing in with a different pass
    localStorage.removeItem(GUEST_PASS_KEY);
    
    // Clear guest mode state
    setGuestPassCode(null);
    setIsGuestMode(false);
    
    // Perform logout
    await logoutMutation.mutateAsync();
    setLocation("/");
  };

  const handleManageSubscription = async () => {
    // If user doesn't have a Stripe subscription, redirect to manage subscription page
    if (!subscription?.stripeCustomerId) {
      setLocation("/manage-subscription");
      return;
    }
    
    try {
      const result = await createPortalSessionMutation.mutateAsync();
      window.location.href = result.url;
    } catch (error) {
      console.error("Portal session error:", error);
      // Fallback to manage subscription page
      setLocation("/manage-subscription");
    }
  };

  const exportSession = (format: "markdown" | "pdf") => {
    if (chatMessages.length === 0) return;
    
    const coachName = selectedCoach || "AI Coach";
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Build markdown content
    let content = `# Coaching Session - ${date}\n\n`;
    content += `**Coach:** ${coachName}\n`;
    content += `**Mode:** ${coachingMode === "full" ? "Full Session" : "Quick Coaching"}\n\n`;
    content += `---\n\n`;
    
    chatMessages.forEach((msg, idx) => {
      const role = msg.role === "user" ? "You" : coachName;
      content += `### ${role}\n\n${msg.content}\n\n`;
    });
    
    // Create blob and download
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coaching-session-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Session exported as Markdown");
  };

  // Loading state - for subscribers need profile & subscription, for guests need valid pass
  // Admins can bypass subscription AND profile requirements
  const isAdmin = user?.role === "admin";
  const isLoading = authLoading || (isGuestMode 
    ? (guestPassCode && guestPassValidation === undefined) // Still validating guest pass
    : ((!profile && !isAdmin) || (!subscription && !isAdmin))); // Admins can proceed without profile or subscription
    
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
        <Loader2 className="h-8 w-8 animate-spin text-[#4A6741]" />
      </div>
    );
  }

  // Handle welcome page completion
  const handleWelcomeComplete = (coach: string) => {
    setSelectedCoach(coach);
    setShowWelcome(false);
    localStorage.setItem(WELCOME_SHOWN_KEY, "true");
  };

  // Show welcome page for first-time users (not for guests)
  if (showWelcome && !isGuestMode) {
    return (
      <CoachingWelcome
        accessType={isGuestMode ? "guest" : "subscription"}
        onComplete={handleWelcomeComplete}
      />
    );
  }

  return (
    <>
      {/* Resume Session Modal */}
      {showResumeModal && pausedSessionId && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowResumeModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowResumeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Welcome Back!
            </h2>
            <p className="text-[#6B6B60] mb-6">
              You have a paused coaching session. Would you like to resume where you left off or start fresh?
            </p>
            <div className="space-y-3">
              <button
                onClick={async () => {
                  setCurrentSessionId(parseInt(pausedSessionId));
                  const session = await getSessionMutation.mutateAsync({ sessionId: parseInt(pausedSessionId) });
                  if (session) {
                    setChatMessages(session.messages as any[]);
                    // Generate AI-powered session summary
                    try {
                      const summaryResult = await generateSummaryMutation.mutateAsync({ sessionId: parseInt(pausedSessionId) });
                      if (summaryResult?.summary) {
                        setSessionSummary(summaryResult.summary);
                        setShowSummaryBanner(true);
                      }
                    } catch (err) {
                      console.error("Failed to generate summary:", err);
                      // Don't block session resume if summary fails
                    }
                  }
                  setShowResumeModal(false);
                  toast.success("Session resumed!");
                }}
                className="w-full px-6 py-4 bg-[#4A6741] text-white font-semibold rounded-lg hover:bg-[#4A6741]/90 transition-all flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Resume Last Session
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('pausedSessionId');
                  localStorage.removeItem('pausedSessionTimestamp');
                  setPausedSessionId(null);
                  setShowResumeModal(false);
                  toast.info("Starting a new session");
                }}
                className="w-full px-6 py-4 bg-[#E6E2D6] text-[#2C2C2C] font-semibold rounded-lg hover:bg-[#D6D2C6] transition-all flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Start New Session
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Dashboard */}
    <div className="min-h-screen bg-[#FDFCF8] flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E6E2D6] transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-[#E6E2D6]">
            <h1 className="text-2xl font-bold text-[#4A6741]" style={{ fontFamily: "'Playfair Display', serif" }}>
              AI Coach
            </h1>
            <p className="text-sm text-[#6B6B60] mt-1">Your Leadership Partner</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => setActiveTab("chat")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === "chat"
                  ? "bg-[#4A6741] text-white"
                  : "text-[#2C2C2C] hover:bg-[#F2F0E9]"
              }`}
            >
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Coaching Chat</span>
            </button>

            <button
              onClick={() => setActiveTab("goals")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === "goals"
                  ? "bg-[#4A6741] text-white"
                  : "text-[#2C2C2C] hover:bg-[#F2F0E9]"
              }`}
            >
              <Target className="h-5 w-5" />
              <span className="font-medium">Goals</span>
              {goals && goals.length > 0 && (
                <span className="ml-auto bg-[#D97757] text-white text-xs px-2 py-1 rounded-full">
                  {goals.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("commitments")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === "commitments"
                  ? "bg-[#4A6741] text-white"
                  : "text-[#2C2C2C] hover:bg-[#F2F0E9]"
              }`}
            >
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Commitments</span>
              {commitments && commitments.length > 0 && (
                <span className="ml-auto bg-[#D97757] text-white text-xs px-2 py-1 rounded-full">
                  {commitments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("patterns")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === "patterns"
                  ? "bg-[#4A6741] text-white"
                  : "text-[#2C2C2C] hover:bg-[#F2F0E9]"
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">Patterns</span>
            </button>

            <button
              onClick={() => setActiveTab("insights")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === "insights"
                  ? "bg-[#4A6741] text-white"
                  : "text-[#2C2C2C] hover:bg-[#F2F0E9]"
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">Session History</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === "analytics"
                  ? "bg-[#4A6741] text-white"
                  : "text-[#2C2C2C] hover:bg-[#F2F0E9]"
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Analytics</span>
            </button>

            <Link href="/ai-coach/templates" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#2C2C2C] hover:bg-[#F2F0E9] transition-all">
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">Templates</span>
            </Link>

            <Link href="/how-to-use-this" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#2C2C2C] hover:bg-[#F2F0E9] transition-all">
              <HelpCircle className="h-5 w-5" />
              <span className="font-medium">How to Use This</span>
            </Link>

            {/* Only show subscription management for non-guests */}
            {!isGuestMode && (
              <Link href="/manage-subscription" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#2C2C2C] hover:bg-[#F2F0E9] transition-all">
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Manage Subscription</span>
              </Link>
            )}
            <Link href="/ai-coach/progress" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#2C2C2C] hover:bg-[#F2F0E9] transition-all">
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Progress Dashboard</span>
            </Link>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-[#E6E2D6]">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#4A6741] flex items-center justify-center text-white font-semibold">
                {isGuestMode ? "G" : ((user as any)?.preferredName || user?.name)?.charAt(0) || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#2C2C2C] truncate">
                  {isGuestMode ? "Guest User" : ((user as any)?.preferredName || user?.name)}
                </p>
                <p className="text-xs text-[#6B6B60] truncate">
                  {isGuestMode ? "Full Access Pass" : (user?.role === "admin" ? "Admin" : profile?.role)}
                </p>
              </div>
            </div>
            
            {/* Guest Pass Status */}
            {isGuestMode && guestPassValidation?.valid && (
              <div className="mb-3 px-3 py-2 bg-[#4A6741]/10 rounded-lg border border-[#4A6741]/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#4A6741]">
                    Guest Pass
                  </span>
                  <span className="text-xs font-semibold text-green-600">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[#6B6B60] mt-1">
                  Full access to all features
                </p>
              </div>
            )}
            
            {/* Admin Status */}
            {!isGuestMode && user?.role === "admin" && !subscription && (
              <div className="mb-3 px-3 py-2 bg-[#4A6741]/10 rounded-lg border border-[#4A6741]/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#4A6741]">
                    Admin Access
                  </span>
                  <span className="text-xs font-semibold text-green-600">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[#6B6B60] mt-1">
                  Full admin privileges
                </p>
              </div>
            )}
            
            {/* Subscription Status - only for non-guests */}
            {!isGuestMode && subscription && (
              <div className="mb-3 px-3 py-2 bg-[#F2F0E9] rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#6B6B60]">
                    {subscription.status === "trialing" ? "Free Trial" : "Subscription"}
                  </span>
                  <span className={`text-xs font-semibold ${
                    subscription.status === "active" ? "text-green-600" :
                    subscription.status === "trialing" ? "text-blue-600" :
                    subscription.status === "canceled" ? "text-red-600" :
                    "text-amber-600"
                  }`}>
                    {subscription.status === "trialing" ? "Active" :
                     subscription.status === "active" ? "Active" :
                     subscription.status === "canceled" ? "Canceled" :
                     subscription.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                {subscription.status === "trialing" && subscription.currentPeriodEnd && (
                  <p className="text-xs text-[#6B6B60] mt-1">
                    Trial ends {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
                {(subscription.status === "active" || subscription.status === "trialing") && (
                  <button
                    onClick={handleManageSubscription}
                    className="w-full mt-2 text-xs text-[#4A6741] hover:text-[#2C2C2C] font-medium underline"
                  >
                    Manage Subscription
                  </button>
                )}
              </div>
            )}
            
            <Link href="/settings" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#6B6B60] hover:text-[#2C2C2C] hover:bg-[#F2F0E9] rounded-lg transition-all mb-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#6B6B60] hover:text-[#2C2C2C] hover:bg-[#F2F0E9] rounded-lg transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed z-50 p-2.5 bg-[#4A6741] text-white rounded-full shadow-lg"
        style={{ top: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))', left: '0.75rem' }}
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden lg:ml-0 ml-0">
        {activeTab === "chat" && (
          <div className="h-screen flex flex-col max-w-4xl mx-auto pt-14 lg:pt-0">
            {/* Chat Header - Mobile Responsive - Minimized on mobile */}
            <div className="p-2 lg:p-6 border-b border-[#E6E2D6] bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col gap-2 lg:gap-4">
                {/* Top row - Title and home button */}
                <div className="flex items-center gap-2 lg:gap-4">
                  <button
                    onClick={() => setActiveTab("goals")}
                    className="p-1.5 lg:p-2 hover:bg-[#F2F0E9] rounded-lg transition-colors"
                    title="Back to Dashboard"
                  >
                    <Home className="h-4 w-4 lg:h-5 lg:w-5 text-[#6B6B60]" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base lg:text-2xl font-semibold text-[#2C2C2C] truncate" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Coaching Session
                    </h2>
                    <p className="hidden lg:block text-sm text-[#6B6B60] mt-1">
                      {currentSessionId ? "Active session" : "Start a new conversation"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 lg:gap-2">
                    <div className="hidden lg:block">
                      <BookCallButton />
                    </div>
                    {chatMessages.length > 0 && (
                      <button
                        onClick={() => exportSession("markdown")}
                        className="p-1.5 lg:p-2 hover:bg-[#F2F0E9] rounded-lg transition-colors"
                        title="Export session"
                      >
                        <Download className="h-4 w-4 lg:h-5 lg:w-5 text-[#6B6B60]" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Bottom row - Controls (hidden on mobile during active session) */}
                <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:gap-4 ${currentSessionId ? 'hidden lg:flex' : 'flex'}`}>
                  {/* Mode Toggle */}
                  <div className="flex items-center gap-1 bg-[#F2F0E9] rounded-lg p-0.5 lg:p-1 w-full sm:w-auto">
                    <button
                      onClick={() => setCoachingMode("full")}
                      disabled={!!currentSessionId}
                      className={`flex-1 sm:flex-none px-2 lg:px-3 py-1 lg:py-1.5 rounded-md text-xs lg:text-sm font-medium transition-all ${
                        coachingMode === "full"
                          ? "bg-white text-[#2C2C2C] shadow-sm"
                          : "text-[#6B6B60] hover:text-[#2C2C2C]"
                      } disabled:opacity-50`}
                    >
                      Full Session
                    </button>
                    <button
                      onClick={() => setCoachingMode("quick")}
                      disabled={!!currentSessionId}
                      className={`flex-1 sm:flex-none px-2 lg:px-3 py-1 lg:py-1.5 rounded-md text-xs lg:text-sm font-medium transition-all ${
                        coachingMode === "quick"
                          ? "bg-white text-[#2C2C2C] shadow-sm"
                          : "text-[#6B6B60] hover:text-[#2C2C2C]"
                      } disabled:opacity-50`}
                    >
                      Quick (~3min)
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-xs lg:text-sm text-[#6B6B60]">Coach:</label>
                    <div className="flex-1 sm:flex-none">
                      <CoachSelector
                        selectedCoach={selectedCoach}
                        onSelectCoach={(newCoach) => {
                          setSelectedCoach(newCoach);
                          if (currentSessionId) {
                            toast.success(`Switched to ${newCoach}. Your conversation continues with your new coach.`);
                          }
                        }}
                        disabled={false}
                        previouslyUsedCoaches={(sessions ?? []).map(s => s.coachId).filter((id, index, self) => id && self.indexOf(id) === index)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pressure State Indicator - Hidden on mobile to prioritize chat */}
            <div className="hidden lg:block flex-shrink-0 p-4 lg:p-6">
              <PressureStateIndicator />
            </div>



            {/* Messages - Maximized on mobile */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6 space-y-3 lg:space-y-6 min-h-0">
              {/* Quick Start Guide */}
              {chatMessages.length === 0 && !currentSessionId && (
                <QuickStartGuide page="chat" />
              )}
              {chatMessages.length === 0 && !currentSessionId ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
                  <div className="bg-[#F2F0E9] rounded-full p-6 mb-6">
                    <MessageCircle className="h-12 w-12 text-[#4A6741]" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-semibold text-[#2C2C2C] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Ready to start coaching?
                  </h3>
                  <p className="text-[#6B6B60] mb-8 max-w-md">
                    I'll help you navigate leadership challenges, make better decisions, and achieve your goals.
                  </p>
                  <button
                    onClick={handleStartSession}
                    disabled={startSessionMutation.isPending}
                    className="bg-[#4A6741] text-white hover:bg-[#4A6741]/90 rounded-full px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#4A6741]/20 disabled:opacity-50"
                  >
                    {startSessionMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Starting...
                      </span>
                    ) : (
                      "Start Coaching Session"
                    )}
                  </button>
                </div>
              ) : (
                <>
                  {/* Session Resume Summary Banner */}
                  {showSummaryBanner && sessionSummary ? (
                    <SessionResumeBanner
                      summary={sessionSummary}
                      onDismiss={() => setShowSummaryBanner(false)}
                    />
                  ) : null}
                  {chatMessages && chatMessages.length > 0 ? chatMessages.map((msg: any, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "user" && (
                        <div className="flex-shrink-0 order-2">
                          {profile?.profilePictureUrl ? (
                            <img
                              src={profile.profilePictureUrl}
                              alt="You"
                              className="h-10 w-10 rounded-full object-cover border-2 border-[#4A6741]"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-[#4A6741] flex items-center justify-center border-2 border-[#4A6741]">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                      )}
                      <div
                        className={`max-w-[90%] sm:max-w-[85%] p-4 sm:p-5 lg:p-6 rounded-2xl ${msg.role === "user" ? "order-1" : ""} ${
                          msg.role === "user"
                            ? "bg-[#4A6741] text-white rounded-tr-none"
                            : "bg-[#E8E4D9] text-[#2C2C2C] rounded-tl-none"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          msg.id === streamingMessageId ? (
                            <StreamingMessage 
                              content={msg.content} 
                              enableStreaming={true}
                              onStreamingComplete={() => setStreamingMessageId(null)}
                            />
                          ) : (
                            <Streamdown>{msg.content}</Streamdown>
                          )
                        ) : (
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        )}
                        {msg.role === "assistant" && idx > 0 && (
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E6E2D6]">
                            <span className="text-xs text-muted-foreground">Was this helpful?</span>
                            <button
                              onClick={() => {
                                setMessageFeedback({ ...messageFeedback, [idx]: "helpful" });
                                submitFeedbackMutation.mutate({
                                  sessionId: currentSessionId || undefined,
                                  messageIndex: idx,
                                  feedbackType: "helpful",
                                });
                                toast.success("Thanks for your feedback!");
                              }}
                              className={`p-1 rounded transition-colors ${
                                messageFeedback[idx] === "helpful"
                                  ? "text-green-600"
                                  : "text-gray-400 hover:text-green-600"
                              }`}
                              disabled={!!messageFeedback[idx]}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setMessageFeedback({ ...messageFeedback, [idx]: "not_helpful" });
                                submitFeedbackMutation.mutate({
                                  sessionId: currentSessionId || undefined,
                                  messageIndex: idx,
                                  feedbackType: "not_helpful",
                                });
                                toast.success("Thanks for your feedback!");
                              }}
                              className={`p-1 rounded transition-colors ${
                                messageFeedback[idx] === "not_helpful"
                                  ? "text-red-600"
                                  : "text-gray-400 hover:text-red-600"
                              }`}
                              disabled={!!messageFeedback[idx]}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )) : null}
                  {sendMessageMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-[#E8E4D9] text-[#2C2C2C] rounded-2xl rounded-tl-none p-6">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Conversation Starters (shown when chat is empty) */}
            {currentSessionId && chatMessages.length <= 1 && (
              <div className="flex-shrink-0 p-3 lg:p-4 border-t border-[#E6E2D6] bg-gradient-to-b from-white/80 to-white/50 max-h-[30vh] sm:max-h-[40vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-[#6B6B60] font-medium">Quick Start:</p>
                  <button
                    onClick={() => setLocation('/ai-coach/templates')}
                    className="text-xs text-[#4A6741] hover:text-[#3a5331] font-medium transition-colors whitespace-nowrap"
                  >
                    View All →
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                  {tacticalTemplates.slice(0, isMobile ? 3 : 6).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setMessage(template.prompt);
                        setTimeout(() => messageInputRef.current?.focus(), 100);
                      }}
                      title={template.prompt}
                      className="text-left p-2 sm:p-3 bg-white hover:bg-[#F2F0E9] border border-[#E6E2D6] rounded-lg transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-xl flex-shrink-0">{template.icon}</span>
                        <p className="text-xs sm:text-sm font-medium text-[#2C2C2C] group-hover:text-[#4A6741] transition-colors truncate">
                          {template.title}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}



            {/* Input Area - Compact on mobile */}
            {currentSessionId && (
              <div className="flex-shrink-0 border-t border-[#E6E2D6] bg-white/50 backdrop-blur-sm safe-area-bottom">
                <div className="p-2 lg:p-4">
                  <MessageInput
                    value={message}
                    onChange={setMessage}
                    onSend={handleSendMessage}
                    disabled={sendMessageMutation.isPending}
                  />
                </div>
                {/* Session Control Buttons */}
                <div className="px-2 lg:px-4 pb-2 sm:pb-4 flex flex-row justify-center gap-2 safe-area-bottom">
                  {/* Pause Session Button */}
                  <button
                    onClick={() => {
                      if (!currentSessionId) return;
                      // Store paused session in localStorage
                      localStorage.setItem('pausedSessionId', currentSessionId.toString());
                      localStorage.setItem('pausedSessionTimestamp', Date.now().toString());
                      toast.success("Session paused. You can resume later.");
                      setCurrentSessionId(null);
                      setChatMessages([]);
                    }}
                    className="flex-1 px-3 sm:px-6 py-2.5 sm:py-3 bg-[#E6E2D6] text-[#2C2C2C] font-medium rounded-lg hover:bg-[#D6D2C6] transition-all flex items-center justify-center gap-1.5 sm:gap-2 border border-[#D6D2C6] text-xs sm:text-sm"
                  >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Pause</span>
                  </button>

                  {/* End Session Button */}
                  <button
                    onClick={async () => {
                      if (!currentSessionId) return;
                      try {
                        const result = await endSessionMutation.mutateAsync({ 
                          sessionId: currentSessionId,
                          sendEmail: true 
                        });
                        
                        // Show summary modal with the result
                        if (result.summary) {
                          setSessionSummary(result.summary);
                          setShowSummaryModal(true);
                        } else {
                          toast.success("Session complete! Summary saved.");
                        }
                        
                        setCurrentSessionId(null);
                        setChatMessages([]);
                        setSessionNotes("");
                        localStorage.removeItem('pausedSessionId');
                        localStorage.removeItem('pausedSessionTimestamp');
                      } catch (error) {
                        toast.error("Failed to end session");
                      }
                    }}
                    disabled={endSessionMutation.isPending}
                    className="flex-1 px-3 sm:px-6 py-2.5 sm:py-3 bg-[#4A6741] text-white font-medium rounded-lg hover:bg-[#4A6741]/90 transition-all flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm disabled:opacity-50"
                  >
                    {endSessionMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin flex-shrink-0" />
                        <span>Ending...</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="hidden sm:inline">End Session</span>
                        <span className="sm:hidden">End</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Session Notes - moved below Pause/End buttons */}
                <div className="px-2 lg:px-4 pb-2 sm:pb-4">
                  <SessionNotes 
                    sessionId={currentSessionId}
                    initialNotes={sessionNotes}
                  />
                </div>
              </div>
            )}

            {/* Floating Action Button for Mobile Quick Actions */}
            <FloatingActionButton
              isSessionActive={!!currentSessionId}
              onPauseSession={() => {
                if (!currentSessionId) return;
                localStorage.setItem('pausedSessionId', currentSessionId.toString());
                localStorage.setItem('pausedSessionTimestamp', Date.now().toString());
                toast.success("Session paused. You can resume later.");
                setCurrentSessionId(null);
                setChatMessages([]);
              }}
              onViewGoals={() => setActiveTab("goals")}
              onViewCommitments={() => setActiveTab("commitments")}
              onEndSession={async () => {
                if (!currentSessionId) return;
                try {
                  const result = await endSessionMutation.mutateAsync({ 
                    sessionId: currentSessionId,
                    sendEmail: true 
                  });
                  
                  // Show summary modal
                  if (result.summary) {
                    setSessionSummary(result.summary);
                    setShowSummaryModal(true);
                  } else {
                    toast.success("Session complete! Summary saved.");
                  }
                  
                  setCurrentSessionId(null);
                  setChatMessages([]);
                  setSessionNotes("");
                  localStorage.removeItem('pausedSessionId');
                  localStorage.removeItem('pausedSessionTimestamp');
                } catch (error) {
                  toast.error("Failed to end session");
                }
              }}
            />
          </div>
        )}

        {activeTab === "goals" && (
          <div className="p-6">
            {/* Goals Section */}
            <div className="max-w-2xl mx-auto">
              <QuickStartGuide page="goals" />
              <h2 className="text-2xl font-semibold text-[#2C2C2C] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Goals
              </h2>
              <p className="text-[#6B6B60] text-sm mb-6">
                Longer-term objectives you're working toward
              </p>
              <FocusGoals
                goals={goals || []}
                onCreateGoal={async (goalData) => {
                  await createGoalMutation.mutateAsync({
                    ...goalData,
                    category: "leadership",
                    milestones: [],
                  });
                  utils.aiCoach.getGoals.invalidate();
                }}
                onUpdateGoal={async (goalId, updates) => {
                  await updateGoalMutation.mutateAsync({
                    goalId,
                    title: updates.title || "",
                    description: updates.description || "",
                    category: "leadership",
                    targetDate: updates.targetDate,
                    milestones: [],
                  });
                  utils.aiCoach.getGoals.invalidate();
                }}
                onDeleteGoal={async (goalId) => {
                  if (confirm('Delete this goal?')) {
                    await deleteGoalMutation.mutateAsync({ goalId });
                    utils.aiCoach.getGoals.invalidate();
                  }
                }}
                onUpdateProgress={async (goalId, progress) => {
                  await updateGoalProgressMutation.mutateAsync({ goalId, progress });
                  utils.aiCoach.getGoals.invalidate();
                }}
                onStartSession={(context) => {
                  setMessage(context);
                  setActiveTab("chat");
                }}
              />
            </div>
          </div>
        )}

        {activeTab === "commitments" && (
          <div className="p-6 max-w-2xl mx-auto">
            <QuickStartGuide page="commitments" />
            <h2 className="text-3xl font-semibold text-[#2C2C2C] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Your Commitments
            </h2>
            <p className="text-[#6B6B60] mb-6">
              Every commitment is a promise you made to yourself. The coach remembers all of them.
            </p>
            <Commitments 
              onDiscussWithCoach={(context) => {
                setMessage(context);
                setActiveTab("chat");
              }}
            />
          </div>
        )}

        {activeTab === "patterns" && (
          <div className="p-6 max-w-4xl mx-auto">
            <QuickStartGuide page="patterns" />
            <h2 className="text-3xl font-semibold text-[#2C2C2C] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Behavioral Patterns
            </h2>
            <p className="text-[#6B6B60] mb-8">
              What the AI has noticed about your behavior across sessions
            </p>
            
            {/* Empty state with explanation */}
            <div className="bg-gradient-to-br from-[#F2F0E9] to-[#E8E4D9] rounded-2xl p-8 border border-[#E6E2D6]">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-[#4A6741]/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-[#4A6741]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#2C2C2C] mb-2">
                    Pattern Detection In Progress
                  </h3>
                  <p className="text-[#6B6B60] leading-relaxed">
                    The AI coach analyzes your conversations to identify recurring themes, decision-making styles, and behavioral tendencies. This helps surface blind spots and growth opportunities you might not see on your own.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/60 rounded-xl p-5 border border-[#E6E2D6]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[#4A6741]/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg">⏱️</span>
                    </div>
                    <h4 className="font-semibold text-[#2C2C2C]">Timeline</h4>
                  </div>
                  <p className="text-sm text-[#6B6B60] leading-relaxed">
                    Meaningful patterns typically emerge after <strong>3-5 coaching sessions</strong>. The more you engage, the more accurate the insights become.
                  </p>
                </div>

                <div className="bg-white/60 rounded-xl p-5 border border-[#E6E2D6]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-[#4A6741]/10 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🔍</span>
                    </div>
                    <h4 className="font-semibold text-[#2C2C2C]">What Gets Tracked</h4>
                  </div>
                  <ul className="text-sm text-[#6B6B60] space-y-1.5">
                    <li>• Avoidance patterns (topics you deflect)</li>
                    <li>• Confidence shifts across contexts</li>
                    <li>• Recurring challenges and themes</li>
                    <li>• Communication and decision styles</li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#4A6741]/5 rounded-xl p-5 border border-[#4A6741]/20">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-[#4A6741]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#2C2C2C] leading-relaxed">
                      <strong>Privacy note:</strong> Pattern analysis happens in real-time during your sessions. Your conversation data is never used to train external models or shared with third parties.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setActiveTab("chat")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#4A6741] text-white font-semibold rounded-lg hover:bg-[#4A6741]/90 transition-all"
                >
                  <MessageCircle className="h-5 w-5" />
                  Start a Coaching Session
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "insights" && (
          <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold text-[#2C2C2C] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Session History
            </h2>
            {sessionsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-medium">Failed to load session history</p>
                <p className="text-red-600 text-sm mt-1">{sessionsError.message || "An error occurred while loading your sessions"}</p>
              </div>
            )}
            {sessionsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#4A7C7E]" />
                <span className="ml-3 text-gray-600">Loading session history...</span>
              </div>
            )}
            {!sessionsLoading && !sessionsError && (
            <SessionHistory 
              sessions={(sessions ?? []).map((session: any) => {
                // Parse summary if it's JSON
                let summaryText = `Session on ${new Date(session.createdAt).toLocaleDateString()}`;
                if (session.summary) {
                  try {
                    const parsed = JSON.parse(session.summary);
                    if (parsed.keyThemes && parsed.keyThemes.length > 0) {
                      summaryText = parsed.keyThemes[0]; // Use first key theme as summary
                    }
                  } catch {
                    // If not JSON, use as-is
                    summaryText = session.summary;
                  }
                }
                return {
                  id: session.id,
                  startedAt: session.createdAt,
                  endedAt: session.endedAt,
                  messageCount: session.messages?.length || 0,
                  summary: summaryText,
                  messages: session.messages || [],
                };
              })}
              expandLatest={expandLatestSession}
              onResumeSession={async (sessionId) => {
                // Load the session messages and switch to chat tab
                try {
                  const session = await getSessionMutation.mutateAsync({ sessionId });
                  
                  // Handle case where session is undefined or null
                  if (!session) {
                    console.error('Failed to load session: session object is undefined');
                    toast.error('Failed to load session data');
                    return;
                  }
                  
                  // Safely extract messages with proper fallback
                  const messages = Array.isArray(session.messages) ? session.messages : [];
                  const hasMessages = messages.length > 0;
                  
                  // CRITICAL: Switch to chat tab IMMEDIATELY before loading summary
                  // This ensures navigation happens even if summary generation fails
                  setCurrentSessionId(sessionId);
                  setActiveTab("chat");
                  
                  // Update URL to reflect the chat tab (remove history/expand params)
                  const newUrl = new URL(window.location.href);
                  newUrl.searchParams.delete('tab');
                  newUrl.searchParams.delete('expand');
                  window.history.replaceState({}, '', newUrl.toString());
                  
                  if (hasMessages) {
                    setChatMessages(messages.map((msg: any) => ({
                      role: msg.role,
                      content: msg.content
                    })));
                    
                    toast.success("Session resumed. Continue your conversation.");
                    
                    // Load summary in background (non-blocking)
                    // Don't await this - let it load asynchronously
                    generateSummaryMutation.mutateAsync({ sessionId })
                      .then((summaryResult) => {
                        if (summaryResult?.summary) {
                          // Ensure summary is a string for the banner
                          const summaryText = typeof summaryResult.summary === 'string' 
                            ? summaryResult.summary 
                            : (summaryResult.summary.keyThemes?.[0] || 'Continue your previous conversation.');
                          setSessionSummary(summaryText);
                          setShowSummaryBanner(true);
                        }
                      })
                      .catch((err) => {
                        console.error("Failed to generate summary via API, using local extraction:", err);
                        // Create a simple local summary from the messages
                        const userMessages = messages
                          .filter((m: any) => m.role === 'user')
                          .map((m: any) => m.content);
                        if (userMessages.length > 0) {
                          const lastTopic = userMessages[userMessages.length - 1].slice(0, 100);
                          const summaryText = `Last time you were discussing: "${lastTopic}${lastTopic.length >= 100 ? '...' : ''}"`;
                          setSessionSummary(summaryText);
                          setShowSummaryBanner(true);
                        }
                      });
                  } else {
                    // Empty session - show welcome message
                    setChatMessages([]);
                    toast.info("Session resumed. Start the conversation by typing a message below.");
                  }
                  // Scroll to bottom after messages load
                  setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                } catch (error) {
                  console.error("Failed to resume session:", error);
                  toast.error("Failed to load session messages");
                }
              }}
            />
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
            {(sessionsError || goalsError) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-6">
                <p className="text-red-800 font-medium">Failed to load analytics data</p>
                <p className="text-red-600 text-sm mt-1">
                  {sessionsError?.message || goalsError?.message || "An error occurred while loading your analytics"}
                </p>
              </div>
            )}
            {(sessionsLoading || goalsLoading) && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#4A7C7E]" />
                <span className="ml-3 text-gray-600">Loading analytics...</span>
              </div>
            )}
            {!sessionsLoading && !goalsLoading && !sessionsError && !goalsError && (
              <CoachingAnalytics
                sessions={(sessions ?? []).map((session: any) => ({
                  id: session.id,
                  createdAt: session.createdAt,
                  topic: session.summary || "General Coaching",
                }))}
                goals={goals || []}
                commitments={(allCommitments || []).map((c: any) => ({
                  id: c.id,
                  action: c.action,
                  status: c.status,
                  deadline: c.deadline,
                  progress: c.progress,
                }))}
              />
            )}
          </div>
        )}
      </main>
    </div>

    {/* Onboarding Flow */}
    <OnboardingFlow
      isOpen={showOnboarding}
      onComplete={async (data) => {
        try {
          await completeOnboardingMutation.mutateAsync(data);
          setSelectedCoach(data.selectedCoach);
          setShowOnboarding(false);
          utils.aiCoach.getProfile.invalidate();
          utils.aiCoach.getGoals.invalidate();
          toast.success("Welcome! Your profile has been set up.");
        } catch (error) {
          console.error("Failed to complete onboarding:", error);
          toast.error("Failed to complete onboarding. Please try again.");
        }
      }}
      onSkip={() => {
        setShowOnboarding(false);
        toast.info("You can complete your profile setup anytime from Settings.");
      }}
    />

    {/* Session Summary Modal - FIXED: Added open prop */}
    <SessionSummaryModal
      open={showSummaryModal && sessionSummary && typeof sessionSummary === 'object' && !!sessionSummary.keyThemes}
      onClose={() => {
        setShowSummaryModal(false);
        setSessionSummary(null);
      }}
      summary={sessionSummary || {
        userName: user?.name || 'User',
        sessionDate: new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        keyThemes: [],
        patrickObservation: '',
        nextSessionPrompt: '',
        commitments: []
      }}
    />
    </>
  );
}
