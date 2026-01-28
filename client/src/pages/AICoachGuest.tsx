import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Send, Sparkles, ArrowRight, Download, Trash2, Mic, LayoutDashboard, Target, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { StreamingMessage } from "@/components/StreamingMessage";
import { MessageInput } from "@/components/MessageInput";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { CoachSetup } from "@/components/CoachSetup";
import { CoachPreferences } from "@/data/coachNames";
import { getCoachAvatar } from "@/data/coachAvatars";
import { FavoriteCoaches } from "@/components/FavoriteCoaches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import CoachingWelcome from "./CoachingWelcome";
import { WelcomeModal } from "@/components/WelcomeModal";
import { GuestCommitments } from "@/components/ai-coach/GuestCommitments";

const STORAGE_KEY_PREFIX = "aiCoachGuestHistory_";
const WELCOME_SHOWN_KEY = "aiCoachWelcomeShown_";
const COACH_PREFS_KEY = "aiCoachPreferences";

export default function AICoachGuest() {
  const [location] = useLocation();
  const [fingerprint, setFingerprint] = useState<string>("");
  const [guestPassCode, setGuestPassCode] = useState<string>("");
  const [codeInput, setCodeInput] = useState<string>("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<string>("sarah");
  
  const [showCoachSetup, setShowCoachSetup] = useState(false);
  const [coachPrefs, setCoachPrefs] = useState<CoachPreferences | null>(null);
  
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [streamingMessageIndex, setStreamingMessageIndex] = useState<number | null>(null);
  const [showCommitments, setShowCommitments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check for code in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get("code");
    if (codeFromUrl) {
      setCodeInput(codeFromUrl);
      validateAndSetCode(codeFromUrl);
    }
  }, [location]);

  // Initialize fingerprint
  useEffect(() => {
    const initFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);
    };
    initFingerprint();
  }, []);

  // Load coach preferences and conversation history
  useEffect(() => {
    if (!guestPassCode) return;
    
    try {
      const savedPrefs = localStorage.getItem(COACH_PREFS_KEY);
      const prefs = savedPrefs ? JSON.parse(savedPrefs) : null;
      setCoachPrefs(prefs);
      
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${guestPassCode}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages(parsed.length > 0 ? parsed : [getWelcomeMessage(prefs)]);
      } else {
        setMessages([getWelcomeMessage(prefs)]);
      }
    } catch (e) {
      setMessages([getWelcomeMessage(null)]);
    }
  }, [guestPassCode]);

  const getWelcomeMessage = (prefs: CoachPreferences | null) => {
    const coachName = prefs?.name || "your AI Executive Coach";
    return {
      role: "assistant" as const,
      content: `Hi! I'm ${coachName}. I'm here to help you navigate leadership challenges, improve decision-making, and develop your management skills.\n\nYou have **unlimited coaching access** with this guest pass. Ask me about:\n- Handling difficult conversations\n- Delegation strategies\n- Team conflict resolution\n- Decision-making frameworks\n- Leadership development\n\nWhat's on your mind today?`
    };
  };

  const validateAndSetCode = async (code: string) => {
    setIsValidating(true);
    setValidationError("");
    
    try {
      // Call REST endpoint for guest pass validation
      const response = await fetch('/api/guest-pass/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const result = await response.json();
      if (result.valid) {
        setGuestPassCode(code);
        setIsCodeValid(true);
        
        // Check if welcome has been shown for this guest pass
        const welcomeShown = localStorage.getItem(`${WELCOME_SHOWN_KEY}${code}`);
        if (!welcomeShown) {
          setShowWelcome(true);
          // Show welcome modal after a brief delay
          setTimeout(() => setShowWelcomeModal(true), 1000);
        }
      } else {
        setValidationError(result.reason || "Invalid code");
        setIsCodeValid(false);
      }
    } catch (error) {
      setValidationError("Failed to validate code");
      setIsCodeValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeInput.trim()) {
      validateAndSetCode(codeInput.trim());
    }
  };

  const chatMutation = trpc.aiCoach.guestChat.useMutation({
    onSuccess: (response) => {
      const newMessages = [...messages, { role: "assistant" as const, content: String(response.message) }];
      setMessages(newMessages);
      setStreamingMessageIndex(newMessages.length - 1);
      
      // Save to localStorage
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${guestPassCode}`, JSON.stringify(newMessages));
      } catch (e) {
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCoachSetupComplete = (preferences: CoachPreferences) => {
    setCoachPrefs(preferences);
    setShowCoachSetup(false);
    
    // Update welcome message
    const welcomeMessage = getWelcomeMessage(preferences);
    setMessages([welcomeMessage]);
    
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${guestPassCode}`, JSON.stringify([welcomeMessage]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage = { role: "user" as const, content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    chatMutation.mutate({
      message: input.trim(),
      guestPassCode,
      fingerprint,
      coachGender: coachPrefs?.gender,
      coachName: coachPrefs?.name,
    });
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your conversation history? This cannot be undone.")) {
      const welcomeMessage = getWelcomeMessage(coachPrefs);
      setMessages([welcomeMessage]);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${guestPassCode}`, JSON.stringify([welcomeMessage]));
    }
  };

  const handleExport = () => {
    const text = messages
      .map((m) => `${m.role === "user" ? "You" : coachPrefs?.name || "Coach"}: ${m.content}`)
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coaching-session-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1];
          try {
            const result = await fetch("/api/trpc/aiCoach.transcribeAudio", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                json: { audioData: base64, mimeType: "audio/webm" }
              })
            });
            const data = await result.json();
            if (data.result?.data?.text) {
              setInput(data.result.data.text);
            }
          } catch (error) {
          }
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      alert("Microphone access denied or unavailable");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Handle welcome page completion
  const handleWelcomeComplete = (coach: string) => {
    setSelectedCoach(coach);
    setShowWelcome(false);
    localStorage.setItem(`${WELCOME_SHOWN_KEY}${guestPassCode}`, "true");
  };

  // Show welcome page for first-time users
  if (isCodeValid && showWelcome) {
    return (
      <CoachingWelcome
        accessType="guest"
        guestPassCode={guestPassCode}
        onComplete={handleWelcomeComplete}
      />
    );
  }

  // Code entry screen
  if (!isCodeValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3EE] to-[#E6E2D6] flex items-center justify-center p-4">
        <Card className="bg-white border-[#E6E2D6] shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Sparkles className="w-12 h-12 text-gold mx-auto mb-4" />
            <h1 className="text-2xl font-serif text-[#2C2C2C] mb-2">Guest Access</h1>
            <p className="text-gray-600">
              Enter your guest pass code to access unlimited AI coaching
            </p>
          </div>

          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <Input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Enter guest pass code"
                className="bg-white border-[#E6E2D6] text-[#2C2C2C] text-center text-lg focus:ring-[#4A6741] focus:border-[#4A6741]"
                disabled={isValidating}
              />
              {validationError && (
                <p className="text-red-400 text-sm mt-2 text-center">{validationError}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isValidating || !codeInput.trim()}
              className="w-full bg-[#4A6741] text-white hover:bg-[#3d5636]"
            >
              {isValidating ? "Validating..." : "Access Coaching"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gold-dim/30 text-center">
            <p className="text-gray-600 text-sm mb-2">Don't have a code?</p>
            <Link href="/ai-coach">
                <Button variant="outline" className="border-[#E6E2D6] text-[#4A6741] hover:bg-[#F5F3EE]">
                Try Free Demo
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Coaching interface (same as demo but unlimited)
  return (
    <>
      <WelcomeModal 
        open={showWelcomeModal} 
        onClose={() => setShowWelcomeModal(false)}
        isGuestPass={true}
      />
      <CoachSetup open={showCoachSetup} onComplete={handleCoachSetupComplete} />
      
      <div className="min-h-screen bg-gradient-to-br from-[#F5F3EE] to-[#E6E2D6] flex flex-col">
        {/* Header */}
        <div className="border-b border-[#E6E2D6] bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {coachPrefs && (
                  <img 
                    src={getCoachAvatar(coachPrefs.name, coachPrefs.gender)} 
                    alt={coachPrefs.name}
                    className="w-12 h-12 rounded-full border-2 border-[#4A6741]"
                  />
                )}
                {!coachPrefs && <Sparkles className="w-6 h-6 text-[#4A6741]" />}
                <div>
                  <h1 className="text-xl font-serif text-[#2C2C2C]">
                    {coachPrefs?.name || "AI Executive Coach"} - Guest Access
                  </h1>
                  <p className="text-sm text-gray-600">Unlimited coaching sessions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {coachPrefs && (
                  <FavoriteCoaches
                    currentCoach={coachPrefs}
                    onSelectCoach={() => setShowCoachSetup(true)}
                  />
                )}
                <Link href={`/ai-coach/dashboard?guest=${guestPassCode}`}>
                  <button
                    className="p-2 hover:bg-[#F5F3EE] rounded-lg transition-colors"
                    title="Full Dashboard"
                  >
                    <LayoutDashboard className="w-5 h-5 text-[#4A6741]" />
                  </button>
                </Link>
                <button
                  onClick={handleExport}
                  className="p-2 hover:bg-[#F5F3EE] rounded-lg transition-colors"
                  title="Export conversation"
                >
                  <Download className="w-5 h-5 text-[#4A6741]" />
                </button>
                <button
                  onClick={() => setShowCommitments(!showCommitments)}
                  className={`p-2 rounded-lg transition-colors ${
                    showCommitments 
                      ? "bg-[#4A6741] text-white" 
                      : "hover:bg-[#F5F3EE]"
                  }`}
                  title="My commitments"
                >
                  <Target className={`w-5 h-5 ${showCommitments ? "text-white" : "text-[#4A6741]"}`} />
                </button>
                <button
                  onClick={handleClearHistory}
                  className="p-2 hover:bg-[#F5F3EE] rounded-lg transition-colors"
                  title="Clear history"
                >
                  <Trash2 className="w-5 h-5 text-[#4A6741]" />
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Optional Commitments Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              <div className="space-y-6">
                {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && coachPrefs && (
                    <img
                      src={getCoachAvatar(coachPrefs.name, coachPrefs.gender)}
                      alt={coachPrefs.name}
                      className="w-10 h-10 rounded-full border-2 border-[#4A6741] flex-shrink-0"
                    />
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                      message.role === "user"
                        ? "bg-[#4A6741] text-white ml-auto"
                        : "bg-white text-[#2C2C2C] border border-[#E6E2D6] shadow-sm"
                    }`}
                  >
                    {message.role === "assistant" && index === streamingMessageIndex ? (
                      <StreamingMessage content={message.content} enableStreaming={true} />
                    ) : (
                      <div className="prose max-w-none">
                        {message.content.split("\n").map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-4">
                  {coachPrefs && (
                    <img
                      src={getCoachAvatar(coachPrefs.name, coachPrefs.gender)}
                      alt={coachPrefs.name}
                      className="w-10 h-10 rounded-full border-2 border-[#4A6741]"
                    />
                  )}
                  <div className="bg-white border border-[#E6E2D6] rounded-2xl px-6 py-4 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 bg-[#4A6741] rounded-full animate-pulse" />
                      <span>{coachPrefs?.name || "Coach"} is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
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
              <div className="fixed lg:relative inset-y-0 right-0 w-full sm:w-80 lg:w-80 border-l border-[#E6E2D6] bg-[#FAF9F6] overflow-y-auto p-4 flex-shrink-0 z-50 lg:z-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#2C2C2C]">My Commitments</h3>
                  <button
                    onClick={() => setShowCommitments(false)}
                    className="p-1 hover:bg-[#E6E2D6] rounded transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-[#6B6B60]" />
                  </button>
                </div>
                <GuestCommitments guestPassCode={guestPassCode} />
                <p className="text-xs text-[#6B6B60] mt-4 p-3 bg-[#F2F0E9] rounded-lg">
                  💡 Commitments you make during coaching are saved with your guest pass and persist between sessions.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-[#E6E2D6] bg-white/80 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <MessageInput
              value={input}
              onChange={setInput}
              onSend={() => {
                if (input.trim()) {
                  handleSubmit(new Event('submit') as any);
                }
              }}
              disabled={chatMutation.isPending}
              placeholder="Ask me about leadership challenges, delegation, feedback..."
            />
          </div>
        </div>
      </div>
    </>
  );
}
