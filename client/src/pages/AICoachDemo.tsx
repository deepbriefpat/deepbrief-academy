// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Sparkles, ArrowRight, Download, Trash2, ThumbsUp, ThumbsDown, Target, ChevronRight, ChevronLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { StreamingMessage } from "@/components/StreamingMessage";
import { MessageInput } from "@/components/MessageInput";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { CoachSetup } from "@/components/CoachSetup";
import { CoachPreferences } from "@/data/coachNames";
import { getCoachAvatar } from "@/data/coachAvatars";
import { useStreamingText } from "@/hooks/useStreamingText";
import { FavoriteCoaches } from "@/components/FavoriteCoaches";
import { RatingModal } from "@/components/RatingModal";
import { tacticalTemplates } from "@/data/tacticalTemplates";
import { trackDemoStarted, trackDemoCompleted } from "@/lib/analytics";
import { GuestCommitments } from "@/components/ai-coach/GuestCommitments";

const STORAGE_KEY = "aiCoachDemoHistory";
const INTERACTION_COUNT_KEY = "aiCoachDemoCount";
const COACH_PREFS_KEY = "aiCoachPreferences";

export default function AICoachDemo() {
  const [fingerprint, setFingerprint] = useState<string>("");
  const [showCoachSetup, setShowCoachSetup] = useState(false);
  const [coachPrefs, setCoachPrefs] = useState<CoachPreferences | null>(null);
  
  // Load from localStorage on mount
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>(() => {
    const getInitialMessage = (prefs: CoachPreferences | null) => {
      const coachName = prefs?.name || "your AI Executive Coach";
      return {
        role: "assistant" as const,
        content: `I'm ${coachName}. You have **10 free coaching interactions** to see if this works for you.\n\nWhat's on your mind? Don't give me the polished version—I want the thing you're actually wrestling with.`
      };
    };
    
    if (typeof window === "undefined") return [getInitialMessage(null)];
    
    try {
      const savedPrefs = localStorage.getItem(COACH_PREFS_KEY);
      const prefs = savedPrefs ? JSON.parse(savedPrefs) : null;
      
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : [getInitialMessage(prefs)];
      }
    } catch (e) {
    }
    
    return [getInitialMessage(null)];
  });
  
  const [input, setInput] = useState("");
  const [interactionCount, setInteractionCount] = useState(() => {
    if (typeof window === "undefined") return 0;
    try {
      const saved = localStorage.getItem(INTERACTION_COUNT_KEY);
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  });
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showCommitments, setShowCommitments] = useState(false);
  const [streamingMessageIndex, setStreamingMessageIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Record<number, "up" | "down">>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.aiCoach.demoChat.useMutation({
    onSuccess: (response) => {
      if (response.limitReached) {
        setShowSubscribe(true);
        setInteractionCount(10);
        trackDemoCompleted('guest');
        return;
      }
      
      const newMessages = [...messages, { role: "assistant", content: response.message }];
      setMessages(newMessages);
      
      // Enable streaming for this new message
      setStreamingMessageIndex(newMessages.length - 1);
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
      } catch (e) {
      }
      
      const newCount = response.interactionCount || interactionCount + 1;
      setInteractionCount(newCount);
      
      // Save count to localStorage
      try {
        localStorage.setItem(INTERACTION_COUNT_KEY, newCount.toString());
      } catch (e) {
      }
      
      // Only show rating modal after exactly 10 interactions (not before)
      if (newCount === 10) {
        setShowRating(true);
      }
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize browser fingerprint
    const initFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);
    };
    initFingerprint();

    // Check for existing coach preferences
    try {
      const savedPrefs = localStorage.getItem(COACH_PREFS_KEY);
      if (savedPrefs) {
        setCoachPrefs(JSON.parse(savedPrefs));
      } else {
        // Show setup modal for new users
        setShowCoachSetup(true);
      }
    } catch (e) {
      setShowCoachSetup(true);
    }
  }, []);

  const handleCoachSetupComplete = (preferences: CoachPreferences) => {
    setCoachPrefs(preferences);
    localStorage.setItem(COACH_PREFS_KEY, JSON.stringify(preferences));
    setShowCoachSetup(false);
    
    // Update initial message with coach name
    const welcomeMessage = {
      role: "assistant" as const,
      content: `I'm ${preferences.name}. You have **10 free coaching interactions** to see if this works for you.\n\nWhat's on your mind? Don't give me the polished version—I want the thing you're actually wrestling with.`
    };
    
    setMessages([welcomeMessage]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMessage]));
  };

  const exportToPDF = () => {
    // Create text content from messages
    const coachName = coachPrefs?.name || "AI Coach";
    const content = messages.map(msg => {
      const role = msg.role === "user" ? "You" : coachName;
      return `${role}:\n${msg.content}\n`;
    }).join("\n");
    
    // Create blob and download
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coaching-session-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your conversation history? This cannot be undone.")) {
      const welcomeMessage = {
        role: "assistant" as const,
        content: `I'm ${coachPrefs?.name || "your AI Executive Coach"}. You have **10 free coaching interactions** to see if this works for you.\n\nWhat's on your mind? Don't give me the polished version—I want the thing you're actually wrestling with.`
      };
      
      setMessages([welcomeMessage]);
      setInteractionCount(0);
      setShowSubscribe(false);
      setFeedback({});
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMessage]));
      localStorage.setItem(INTERACTION_COUNT_KEY, "0");
    }
  };

  const handleFeedback = (messageIndex: number, type: "up" | "down") => {
    setFeedback(prev => ({
      ...prev,
      [messageIndex]: type
    }));
    
    // Could send feedback to server here for analytics
  };

  const handleSendMessage = () => {
    if (!input.trim() || chatMutation.isPending || !fingerprint) return;

    if (interactionCount >= 10) {
      setShowSubscribe(true);
      return;
    }

    // Track demo started on first interaction
    if (interactionCount === 0) {
      trackDemoStarted('guest');
    }

    const userMessage = input.trim();
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setInput("");
    
    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
    } catch (e) {
    }
    
    chatMutation.mutate({ 
      message: userMessage, 
      fingerprint,
      coachGender: coachPrefs?.gender,
      coachName: coachPrefs?.name,
    });
  };

  const handleRatingSubmit = async (rating: number, feedbackText: string) => {
    // Store rating in localStorage for analytics
    try {
      const ratings = JSON.parse(localStorage.getItem("aiCoachRatings") || "[]");
      ratings.push({
        coachName: coachPrefs?.name || "Unknown",
        coachGender: coachPrefs?.gender || "unknown",
        rating,
        feedback: feedbackText,
        timestamp: new Date().toISOString(),
        fingerprint
      });
      localStorage.setItem("aiCoachRatings", JSON.stringify(ratings));
    } catch (e) {
    }
    
    // After rating is submitted, show subscribe prompt only if 10 interactions reached
    if (interactionCount >= 10) {
      setShowSubscribe(true);
    }
  };
  
  return (
    <>
      <CoachSetup open={showCoachSetup} onComplete={handleCoachSetupComplete} />
      <RatingModal 
        open={showRating}
        onClose={() => {
          setShowRating(false);
          // Only show subscribe prompt if user has actually reached 10 interactions
          if (interactionCount >= 10) {
            setShowSubscribe(true);
          }
        }}
        coachName={coachPrefs?.name || "your coach"}
        onSubmit={handleRatingSubmit}
      />
      
      <div className="min-h-screen bg-cream flex flex-col">
        {/* Header */}
        <div className="border-b border-beige bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {coachPrefs && (
                  <img 
                    src={getCoachAvatar(coachPrefs.name, coachPrefs.gender)} 
                    alt={coachPrefs.name}
                    className="w-12 h-12 rounded-full border-2 border-gold"
                  />
                )}
                {!coachPrefs && <Sparkles className="w-6 h-6 text-gold" />}
                <div>
                  <h1 className="text-xl font-serif text-gold">
                    {coachPrefs?.name || "AI Executive Coach"} - Free Demo
                  </h1>
                  <p className="text-sm text-gray-400">
                    {interactionCount < 10 
                      ? `${10 - interactionCount} free interaction${10 - interactionCount !== 1 ? "s" : ""} remaining`
                      : "Demo complete"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <FavoriteCoaches 
                  currentCoach={coachPrefs}
                  onSelectCoach={(coach) => {
                    setCoachPrefs(coach);
                    localStorage.setItem(COACH_PREFS_KEY, JSON.stringify(coach));
                    // Reset conversation with new coach
                    const welcomeMessage = {
                      role: "assistant" as const,
                      content: `I'm ${coach.name}. You have **10 free coaching interactions** to see if this works for you.\n\nWhat's on your mind? Don't give me the polished version—I want the thing you're actually wrestling with.`
                    };
                    setMessages([welcomeMessage]);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify([welcomeMessage]));
                  }}
                />
                <button
                  onClick={exportToPDF}
                  className="px-4 py-2 text-sm bg-white hover:bg-beige text-navy-deep border border-beige rounded-lg transition-all flex items-center gap-2"
                  title="Export conversation"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={() => setShowCommitments(!showCommitments)}
                  className={`px-4 py-2 text-sm border rounded-lg transition-all flex items-center gap-2 ${
                    showCommitments 
                      ? "bg-[#4A6741] text-white border-[#4A6741]" 
                      : "bg-white hover:bg-beige text-navy-deep border-beige"
                  }`}
                  title="My commitments"
                >
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Commitments</span>
                </button>
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 text-sm bg-navy-light hover:bg-navy-mid text-red-400 border border-red-400/30 rounded-lg transition-all flex items-center gap-2"
                  title="Clear history"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
                <Link href="/ai-coach">
                  <button className="px-4 py-2 text-sm bg-white hover:bg-beige text-navy-deep border border-beige rounded-lg transition-all">
                    Back
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Optional Commitments Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Messages */}
          <div className={`flex-1 overflow-y-auto transition-all ${showCommitments ? 'mr-0' : ''}`}>
            <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
              {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {/* Coach avatar for assistant messages */}
                {message.role === "assistant" && coachPrefs && (
                  <img 
                    src={getCoachAvatar(coachPrefs.name, coachPrefs.gender)} 
                    alt={coachPrefs.name}
                    className="w-10 h-10 rounded-full border-2 border-gold flex-shrink-0 mt-1"
                  />
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-gold text-navy-deep"
                      : "bg-white border border-beige text-navy-deep"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <StreamingMessage 
                      content={message.content}
                      enableStreaming={index === streamingMessageIndex}
                      onStreamingComplete={() => setStreamingMessageIndex(null)}
                    />
                  ) : (
                    <Streamdown>{message.content}</Streamdown>
                  )}
                  
                  {/* Feedback buttons for assistant messages */}
                  {message.role === "assistant" && index > 0 && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gold-dim/30">
                      <span className="text-xs text-gray-400">Was this helpful?</span>
                      <button
                        onClick={() => handleFeedback(index, "up")}
                        className={`p-1 rounded transition-colors ${
                          feedback[index] === "up"
                            ? "text-green-400"
                            : "text-gray-500 hover:text-green-400"
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFeedback(index, "down")}
                        className={`p-1 rounded transition-colors ${
                          feedback[index] === "down"
                            ? "text-red-400"
                            : "text-gray-500 hover:text-red-400"
                        }`}
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex gap-4 justify-start">
                <div className="max-w-[80%] rounded-lg p-4 bg-white border border-beige text-navy-deep">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse">💭</div>
                    <span className="text-gray-400 animate-pulse">
                      {coachPrefs?.name || "AI Coach"} is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

          {/* Commitments Panel - Responsive: Full screen on mobile, sidebar on desktop */}
          {showCommitments && (
            <>
              {/* Mobile backdrop */}
              <div 
                className="lg:hidden fixed inset-0 bg-black/20 z-40"
                onClick={() => setShowCommitments(false)}
              />
              <div className="fixed lg:relative inset-y-0 right-0 w-full sm:w-80 lg:w-80 border-l border-beige bg-cream overflow-y-auto p-4 flex-shrink-0 z-50 lg:z-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#2C2C2C]">My Commitments</h3>
                  <button
                    onClick={() => setShowCommitments(false)}
                    className="p-1 hover:bg-[#E6E2D6] rounded transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-[#6B6B60]" />
                  </button>
                </div>
                <GuestCommitments storageKey="aiCoachDemoCommitments" />
                <p className="text-xs text-[#6B6B60] mt-4 p-3 bg-[#F2F0E9] rounded-lg">
                  💡 Made a promise during your session? Track it here. These save locally in your browser.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Subscribe Prompt */}
        {showSubscribe && (
          <div className="border-t border-beige bg-white/90 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-6 max-w-3xl">
              <div className="bg-gradient-to-r from-gold/10 to-gold-light/10 border border-gold rounded-lg p-6">
                <div className="text-center mb-6">
                  <Sparkles className="w-12 h-12 text-gold mx-auto mb-4" />
                  <h3 className="text-2xl font-serif text-gold mb-2">
                    Ready to Level Up?
                  </h3>
                  <p className="text-gray-300 mb-2">
                    You've completed your 10 free interactions. Here's what you'll unlock:
                  </p>
                </div>
                
                {/* Premium Features Preview */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-beige rounded-lg p-3">
                    <p className="text-gold font-medium text-sm">📊 Pattern Insights</p>
                    <p className="text-gray-400 text-xs">See what's holding you back</p>
                  </div>
                  <div className="bg-beige rounded-lg p-3">
                    <p className="text-gold font-medium text-sm">✅ Commitment Tracking</p>
                    <p className="text-gray-400 text-xs">Actually follow through</p>
                  </div>
                  <div className="bg-beige rounded-lg p-3">
                    <p className="text-gold font-medium text-sm">📝 Session History</p>
                    <p className="text-gray-400 text-xs">Review past conversations</p>
                  </div>
                  <div className="bg-beige rounded-lg p-3">
                    <p className="text-gold font-medium text-sm">⚡ Quick Mode</p>
                    <p className="text-gray-400 text-xs">3-min tactical coaching</p>
                  </div>
                </div>

                <p className="text-xl font-semibold text-navy-deep mb-4 text-center">
                  £19.95/month • 3-day free trial • Cancel anytime
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link href="/ai-coach/subscribe">
                    <button className="px-8 py-3 bg-gold hover:bg-gold-light text-navy-deep font-semibold rounded-lg transition-all flex items-center gap-2">
                      Start Free Trial
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                  <button
                    onClick={clearHistory}
                    className="px-6 py-3 bg-white hover:bg-beige text-navy-deep border border-beige rounded-lg transition-all"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Starters (shown when chat has only welcome message) */}
        {messages.length === 1 && !showSubscribe && (
          <div className="border-t border-beige bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 max-w-3xl">
              <p className="text-sm text-gray-400 mb-3 font-medium">Quick Start:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tacticalTemplates.slice(0, 6).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setInput(template.prompt)}
                    className="text-left p-3 bg-navy-light hover:bg-navy-mid border border-gold-dim rounded-lg transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xl">{template.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gold group-hover:text-gold-light transition-colors">
                          {template.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {template.situation}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-beige bg-white/80 backdrop-blur-sm sticky bottom-0 safe-area-bottom">
          <div className="container mx-auto px-4 py-4">
            <div className="max-w-3xl mx-auto">
              {interactionCount >= 10 ? (
                <div className="text-center py-2">
                  <p className="text-gray-400 mb-2">Demo complete - Subscribe to continue</p>
                </div>
              ) : (
                <>
                  <MessageInput
                    value={input}
                    onChange={setInput}
                    onSend={handleSendMessage}
                    disabled={chatMutation.isPending || interactionCount >= 10}
                    placeholder="Ask me about leadership challenges, delegation, feedback..."
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    {10 - interactionCount} free interaction{10 - interactionCount !== 1 ? "s" : ""} remaining
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
