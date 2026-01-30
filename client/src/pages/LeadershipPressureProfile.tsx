import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { SEO } from "@/components/SEO";

interface Question {
  id: string;
  label: string;
  text: string;
  options: Array<{ text: string; score: number }>;
}

const questions: Question[] = [
  {
    id: "decision_fatigue",
    label: "Decision Quality",
    text: "When facing important decisions at work, how often do you find yourself delaying or avoiding them?",
    options: [
      { text: "Almost always — I struggle to make decisions", score: 1 },
      { text: "Often — I frequently put off important choices", score: 2 },
      { text: "Sometimes — depends on the stakes", score: 3 },
      { text: "Rarely — I make decisions fairly promptly", score: 4 },
      { text: "Almost never — I decide and move forward", score: 5 },
    ],
  },
  {
    id: "sleep_quality",
    label: "Sleep Quality",
    text: "How would you describe your sleep over the past month?",
    options: [
      { text: "Very poor — I rarely feel rested", score: 1 },
      { text: "Poor — frequently disrupted or insufficient", score: 2 },
      { text: "Average — some good nights, some bad", score: 3 },
      { text: "Good — usually sleep well", score: 4 },
      { text: "Excellent — consistently restorative", score: 5 },
    ],
  },
  {
    id: "recovery",
    label: "Recovery Time",
    text: "After a stressful event or difficult day, how long does it typically take you to feel like yourself again?",
    options: [
      { text: "Days or longer — I carry it with me", score: 1 },
      { text: "About a day — it lingers overnight", score: 2 },
      { text: "Several hours — most of the evening", score: 3 },
      { text: "An hour or two — I decompress fairly quickly", score: 4 },
      { text: "Minutes — I reset and move on", score: 5 },
    ],
  },
  {
    id: "physical_tension",
    label: "Physical Tension",
    text: "How often do you notice physical signs of stress (tight shoulders, jaw clenching, headaches, shallow breathing)?",
    options: [
      { text: "Constantly — it's become my baseline", score: 1 },
      { text: "Daily — I notice it most days", score: 2 },
      { text: "Several times a week", score: 3 },
      { text: "Occasionally — maybe once a week", score: 4 },
      { text: "Rarely — only in extreme situations", score: 5 },
    ],
  },
  {
    id: "control",
    label: "Sense of Control",
    text: "How often do you feel like you're driving your day versus reacting to it?",
    options: [
      { text: "Almost never — I'm constantly firefighting", score: 1 },
      { text: "Rarely — most days feel reactive", score: 2 },
      { text: "About half the time", score: 3 },
      { text: "Usually — I set the agenda most days", score: 4 },
      { text: "Almost always — I'm in control of my time", score: 5 },
    ],
  },
  {
    id: "support",
    label: "Support Network",
    text: "When you're under significant pressure, how often do you talk to someone about it?",
    options: [
      { text: "Never — I handle everything alone", score: 1 },
      { text: "Rarely — only when I'm really struggling", score: 2 },
      { text: "Sometimes — if the right person is available", score: 3 },
      { text: "Often — I have people I can talk to", score: 4 },
      { text: "Always — I have a strong support system", score: 5 },
    ],
  },
  {
    id: "clarity",
    label: "Mental Clarity",
    text: "How would you describe your ability to think clearly when stakes are high?",
    options: [
      { text: "Very poor — I freeze or panic", score: 1 },
      { text: "Poor — my thinking gets foggy under pressure", score: 2 },
      { text: "Average — I manage but it's harder", score: 3 },
      { text: "Good — I stay fairly sharp", score: 4 },
      { text: "Excellent — I think clearest under pressure", score: 5 },
    ],
  },
  {
    id: "sustainability",
    label: "Workload Sustainability",
    text: "Is your current pace of work something you could maintain for the next 12 months?",
    options: [
      { text: "Absolutely not — I'm already burning out", score: 1 },
      { text: "Unlikely — something has to give soon", score: 2 },
      { text: "Maybe — with some adjustments", score: 3 },
      { text: "Probably — it's demanding but manageable", score: 4 },
      { text: "Yes — my pace is sustainable", score: 5 },
    ],
  },
  {
    id: "emotional_regulation",
    label: "Emotional Regulation",
    text: "How often do you find yourself reacting more strongly than the situation warrants (frustration, irritability, withdrawal)?",
    options: [
      { text: "Very often — I'm on edge constantly", score: 1 },
      { text: "Often — my reactions surprise me", score: 2 },
      { text: "Sometimes — in certain situations", score: 3 },
      { text: "Rarely — I stay fairly even", score: 4 },
      { text: "Almost never — I regulate well", score: 5 },
    ],
  },
  {
    id: "outlook",
    label: "Future Outlook",
    text: "When you think about the next 6 months, how do you feel?",
    options: [
      { text: "Dread — I don't know how I'll cope", score: 1 },
      { text: "Anxious — worried about what's ahead", score: 2 },
      { text: "Uncertain — mixed feelings", score: 3 },
      { text: "Cautiously optimistic — challenges but manageable", score: 4 },
      { text: "Confident — looking forward to what's next", score: 5 },
    ],
  },
];

interface Tier {
  name: string;
  class: string;
  minScore: number;
  title: string;
  description: string;
  calm: Array<{ letter: string; text: string }>;
}

const tiers: Record<string, Tier> = {
  surface: {
    name: "Surface Level",
    class: "tier-surface",
    minScore: 40,
    title: "You're Operating at Surface Level",
    description:
      "You're managing pressure well. Your systems and habits are working. The focus now is optimisation — finding the small gains that compound over time. Don't get complacent, but recognise what's working.",
    calm: [
      { letter: "C", text: "Control — Audit your calendar monthly. Protect what's working." },
      { letter: "A", text: "Acknowledge — Recognise your current capacity is a result of good habits." },
      { letter: "L", text: "Limit — Say no to one thing this week that doesn't serve your priorities." },
      { letter: "M", text: "Move — Add one physical challenge to maintain your edge." },
    ],
  },
  thermocline: {
    name: "Thermocline",
    class: "tier-thermocline",
    minScore: 25,
    title: "You've Entered the Thermocline",
    description:
      "You're in the transition zone. Pressure is building and you're starting to feel the temperature change. The good news: you've caught it early. Small adjustments now prevent bigger problems later.",
    calm: [
      { letter: "C", text: "Control — Identify your top 3 energy drains this week and address one." },
      { letter: "A", text: "Acknowledge — Name the pressure out loud. Tell someone you trust." },
      { letter: "L", text: "Limit — Create one non-negotiable boundary this week." },
      { letter: "M", text: "Move — 20 minutes of movement daily, non-negotiable." },
    ],
  },
  deep: {
    name: "Deep Water",
    class: "tier-deep",
    minScore: 13,
    title: "You're in Deep Water",
    description:
      "You're operating beyond safe limits. The pressure at this depth affects everything — your decisions, your relationships, your health. This isn't sustainable, and you likely know it. It's time to surface.",
    calm: [
      { letter: "C", text: "Control — Cancel or delegate 3 commitments this week. Non-negotiable." },
      { letter: "A", text: "Acknowledge — Book a conversation with someone who can help. Today." },
      { letter: "L", text: "Limit — Set a hard stop time each day. Leave work at work." },
      { letter: "M", text: "Move — Daily walks, minimum. Get outside. Breathe." },
    ],
  },
  crush: {
    name: "Crush Depth",
    class: "tier-crush",
    minScore: 0,
    title: "You're Approaching Crush Depth",
    description:
      "This is critical. At this depth, the pressure can cause catastrophic failure. Your body and mind are telling you something important. You need support, and you need it now. This isn't weakness — it's wisdom.",
    calm: [
      { letter: "C", text: "Control — Stop. Pause everything non-essential. Emergency decompression." },
      { letter: "A", text: "Acknowledge — Reach out to a professional today. GP, coach, therapist." },
      { letter: "L", text: "Limit — Protect sleep above all else. 8 hours minimum." },
      { letter: "M", text: "Move — Gentle movement only. Walking. Stretching. Nothing intense." },
    ],
  },
};

function getTier(score: number): Tier {
  if (score >= tiers.surface.minScore) return tiers.surface;
  if (score >= tiers.thermocline.minScore) return tiers.thermocline;
  if (score >= tiers.deep.minScore) return tiers.deep;
  return tiers.crush;
}

function DiveProfile({ answers }: { answers: Record<string, number> }) {
  // Convert scores to depths (inverted: low score = deep, high score = shallow)
  const depths = questions.map((q) => {
    const score = answers[q.id] || 3;
    // Convert 1-5 score to depth: 1 = 45m (deep), 5 = 5m (shallow)
    return Math.round(50 - score * 9);
  });

  const maxDepth = Math.max(...depths);
  const avgDepth = Math.round(depths.reduce((a, b) => a + b, 0) / depths.length);

  // Calculate deco stops needed based on max depth
  let decoStops = 0;
  if (maxDepth > 40) decoStops = 4;
  else if (maxDepth > 30) decoStops = 3;
  else if (maxDepth > 20) decoStops = 2;
  else if (maxDepth > 10) decoStops = 1;

  const svgWidth = 500;
  const svgHeight = 180;
  const padding = 10;
  const pointSpacing = (svgWidth - padding * 2) / (depths.length - 1);

  // Calculate points
  const points = depths.map((depth, i) => {
    const x = padding + i * pointSpacing;
    const y = (depth / 50) * (svgHeight - padding * 2) + padding;
    return { x, y, depth, label: questions[i].label, score: answers[questions[i].id] || 3 };
  });

  // Create smooth curve path
  const pathD = points.reduce((path, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prevPoint = points[i - 1];
    const cpX = (prevPoint.x + point.x) / 2;
    return `${path} Q ${cpX} ${prevPoint.y}, ${cpX} ${(prevPoint.y + point.y) / 2} Q ${cpX} ${point.y}, ${point.x} ${point.y}`;
  }, "");

  // Create area path (filled under curve)
  const areaPath = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${padding} ${svgHeight} Z`;

  return (
    <div className="mb-12">
      <div
        className="relative rounded-xl border border-gold/20 p-6 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(26, 58, 74, 0.8) 0%, rgba(13, 32, 48, 0.9) 40%, rgba(6, 16, 24, 1) 100%)",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/10">
          <div className="text-[11px] font-semibold tracking-[2px] text-gold uppercase">Dive Profile</div>
          <div className="flex gap-6 text-xs font-mono">
            <div className="text-right">
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Max Depth</div>
              <div className={`text-base font-semibold ${maxDepth > 35 ? "text-red-500" : maxDepth > 25 ? "text-amber-500" : "text-white"}`}>
                {maxDepth}m
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Avg Depth</div>
              <div className="text-base font-semibold text-white">{avgDepth}m</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Deco Stops</div>
              <div className={`text-base font-semibold ${decoStops >= 3 ? "text-red-500" : decoStops >= 2 ? "text-amber-500" : "text-white"}`}>
                {decoStops}
              </div>
            </div>
          </div>
        </div>

        {/* Graph */}
        <div className="relative h-[200px] my-5">
          {/* Depth zones */}
          <div className="absolute left-0 top-0 bottom-0 w-[60px] flex flex-col justify-between py-2 border-r border-white/10">
            <div className="text-[10px] text-gold uppercase tracking-wider">Surface</div>
            <div className="text-[10px] text-blue-400 uppercase tracking-wider">Thermo</div>
            <div className="text-[10px] text-amber-500 uppercase tracking-wider">Deep</div>
            <div className="text-[10px] text-red-500 uppercase tracking-wider">Crush</div>
          </div>

          {/* SVG Canvas */}
          <div className="absolute left-[70px] right-0 top-0 bottom-0">
            <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="depthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
                  <stop offset="25%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((percent) => (
                <line
                  key={percent}
                  x1={padding}
                  y1={(svgHeight * percent) / 100}
                  x2={svgWidth - padding}
                  y2={(svgHeight * percent) / 100}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}

              {/* Area under curve */}
              <path d={areaPath} fill="url(#depthGradient)" opacity="0.3" />

              {/* Profile line */}
              <path d={pathD} fill="none" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 8px rgba(20, 184, 166, 0.5))" }} />

              {/* Points */}
              {points.map((point, i) => {
                let fillColor = "#14b8a6"; // teal (good)
                if (point.score <= 2) fillColor = "#ef4444"; // red (critical)
                else if (point.score === 3) fillColor = "#f59e0b"; // amber (concerning)
                else if (point.score === 4) fillColor = "#3b82f6"; // blue (moderate)

                return (
                  <circle
                    key={i}
                    cx={point.x}
                    cy={point.y}
                    r={point.score <= 2 ? "6" : "5"}
                    fill={fillColor}
                    stroke={fillColor}
                    strokeWidth="2"
                    style={point.score <= 2 ? { animation: "pulse 2s ease-in-out infinite" } : undefined}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between pl-[70px] mt-2">
          {questions.map((q, i) => (
            <div key={i} className="text-[9px] text-white/40 uppercase tracking-wide w-[60px] text-center">
              Q{i + 1}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <div className="w-2 h-2 rounded-full bg-gold"></div>
            <span>Good</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span>Concerning</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeadershipPressureProfile() {
  const [, setLocation] = useLocation();
  const [screen, setScreen] = useState<"start" | "questions" | "email" | "results">("start");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const submitResponse = trpc.pressureAudit.submit.useMutation();
  const captureEmail = trpc.emailCapture.subscribe.useMutation();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Leadership Pressure Profile",
    "description": "Free diagnostic assessment measuring 10 key indicators of leadership pressure. Get immediate results and personalized recommendations.",
    "url": "https://thedeepbrief.co.uk/leadership-pressure-profile",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "GBP"
    }
  };

  const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
  const tier = getTier(totalScore);

  const handleStartAudit = () => {
    setScreen("questions");
  };

  const handleSelectOption = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));

    // Auto-advance after brief delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setScreen("email");
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmitEmail = async () => {
    if (!name.trim() || !email.trim()) {
      alert("Please enter your name and email.");
      return;
    }

    if (!email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      // Submit response
      await submitResponse.mutateAsync({
        sessionId,
        name: name.trim(),
        email: email.trim(),
        responses: answers,
        totalScore,
        tier: tier.name,
      });

      // Capture email
      await captureEmail.mutateAsync({
        email: email.trim(),
      });

      setScreen("results");
    } catch (error) {
      // Still show results even if submission fails
      setScreen("results");
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <SEO 
        title="Leadership Pressure Profile - Free Assessment"
        description="Take the free Leadership Pressure Profile. Measure 10 key indicators of leadership pressure and get immediate, personalized recommendations. 8-10 minutes, immediate results."
        keywords="leadership assessment, pressure test, executive burnout, leadership stress, decision fatigue, executive assessment, leadership diagnostic"
        canonicalUrl="https://thedeepbrief.co.uk/leadership-pressure-profile"
        structuredData={structuredData}
      />
      {/* Animated background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-navy-deep via-navy-mid to-navy-light">
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: "radial-gradient(ellipse at 20% 80%, rgba(20, 184, 166, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)",
            animationDuration: "8s",
          }}
        ></div>
      </div>

      {/* Depth indicator (desktop only) */}
      {screen === "questions" && (
        <div className="hidden lg:block fixed left-6 top-1/2 -translate-y-1/2 z-50">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i < currentQuestion ? "bg-gold/50" : i === currentQuestion ? "bg-gold shadow-[0_0_12px_rgba(212,175,55,0.8)]" : "bg-white/20"
                }`}
              ></div>
            ))}
          </div>
        </div>
      )}

      <div className="container max-w-3xl mx-auto px-6 py-16">
        {/* START SCREEN */}
        {screen === "start" && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="text-sm tracking-[3px] uppercase text-gold mb-4">The Deep Brief</div>
              <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-br from-white to-white/70 bg-clip-text text-transparent">
                Leadership Pressure Profile
              </h1>
              <p className="text-lg text-text-secondary max-w-xl mx-auto">Discover how pressure is affecting your leadership and what to do about it</p>
            </div>

            <div className="text-center mb-10 space-y-4">
              <p className="text-text-secondary text-lg">Most leaders don't realise how deep they've gone until the pressure becomes critical. This profile measures 10 key indicators of leadership pressure.</p>
              <p className="text-text-secondary text-lg">Answer honestly. There's no judgement here — just clarity.</p>
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm text-white/70">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Takes 3 minutes
              </div>
            </div>

            <div className="text-center">
              <button onClick={handleStartAudit} className="bg-gradient-to-br from-gold to-gold-dim text-white font-semibold text-lg px-10 py-4 rounded-lg hover:shadow-[0_8px_30px_rgba(212,175,55,0.4)] hover:-translate-y-0.5 transition-all duration-300">
                Begin Your Profile
              </button>
            </div>
          </div>
        )}

        {/* QUESTION SCREEN */}
        {screen === "questions" && (
          <div className="animate-fade-in">
            {/* Progress bar */}
            <div className="w-full h-1 bg-white/10 rounded-full mb-10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-gold to-blue-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="mb-3 text-sm tracking-[2px] text-gold uppercase">Question {currentQuestion + 1} of 10</div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-8 leading-tight">{questions[currentQuestion].text}</h2>

            <div className="space-y-3 mb-8">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectOption(questions[currentQuestion].id, option.score)}
                  className={`w-full text-left px-6 py-5 rounded-xl border-2 transition-all duration-300 ${
                    answers[questions[currentQuestion].id] === option.score
                      ? "bg-gold/15 border-gold"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <button onClick={handleBack} className={`text-white/60 hover:text-white transition-colors ${currentQuestion === 0 ? "invisible" : ""}`}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* EMAIL SCREEN */}
        {screen === "email" && (
          <div className="animate-fade-in text-center">
            <h2 className="font-serif text-4xl font-bold mb-4">One Last Step</h2>
            <p className="text-text-secondary mb-8">Enter your details to receive your personalised Leadership Pressure Profile</p>

            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label htmlFor="name" className="block text-left text-sm mb-2 text-white/80">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-4 text-base border-2 border-white/10 rounded-lg bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-left text-sm mb-2 text-white/80">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 text-base border-2 border-white/10 rounded-lg bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <button
                onClick={handleSubmitEmail}
                disabled={submitResponse.isPending}
                className="w-full bg-gradient-to-br from-gold to-gold-dim text-white font-semibold text-lg px-10 py-4 rounded-lg hover:shadow-[0_8px_30px_rgba(212,175,55,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitResponse.isPending ? "Submitting..." : "Get My Profile"}
              </button>
            </div>
          </div>
        )}

        {/* RESULTS SCREEN */}
        {screen === "results" && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="text-sm tracking-[2px] uppercase text-gold mb-4">Your Profile</div>
              <h1 className="font-serif text-5xl font-bold mb-6">{tier.title}</h1>
              <div className="text-7xl font-bold text-gold mb-2">
                {totalScore}
                <span className="text-4xl text-white/50">/50</span>
              </div>
              <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">{tier.description}</p>
            </div>

            {/* Dive Profile Visualization */}
            <DiveProfile answers={answers} />

            {/* Breakdown */}
            <div className="mb-12 pt-8 border-t border-white/10">
              <h3 className="font-serif text-2xl font-semibold text-center mb-6">Your Breakdown</h3>
              <div className="space-y-4">
                {questions.map((q) => {
                  const qScore = answers[q.id] || 3;
                  const percentage = (qScore / 5) * 100;
                  let fillClass = "bg-red-500";
                  if (qScore >= 4) fillClass = "bg-gold";
                  else if (qScore >= 3) fillClass = "bg-blue-400";
                  else if (qScore >= 2) fillClass = "bg-amber-500";

                  return (
                    <div key={q.id} className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0">
                      <div className="flex-1 text-sm text-white/80">{q.label}</div>
                      <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-1000 ${fillClass}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <div className="w-12 text-right font-semibold text-sm">
                        {qScore}/<span className="text-white/50">5</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CALM Protocol */}
            <div className="mb-12">
              <h3 className="font-serif text-2xl font-semibold text-center mb-6">Your C.A.L.M. Protocol</h3>
              <div className="space-y-4">
                {tier.calm.map((step, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-lg bg-white/5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center font-bold text-gold">{step.letter}</div>
                    <div className="flex-1 text-white/90 leading-relaxed">{step.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Sharing */}
            <div className="text-center mb-8 pb-8 border-b border-white/10">
              <h3 className="font-serif text-xl font-semibold mb-3">Share Your Progress</h3>
              <p className="text-text-secondary text-sm mb-4">Let your network know you're taking leadership pressure seriously</p>
              <button
                onClick={() => {
                  const shareText = `I just completed my Leadership Pressure Profile with The Deep Brief.\n\nMy result: ${tier.name}\n\nMost leaders don't realise how deep they've gone until the pressure becomes critical. This free 3-minute assessment measures 10 key indicators of leadership pressure.\n\nIf you're leading under pressure, I recommend taking it: ${window.location.origin}/leadership-pressure-profile`;
                  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/leadership-pressure-profile')}`;
                  window.open(linkedInUrl, '_blank', 'width=600,height=600');
                  // Copy text to clipboard for easy pasting
                  navigator.clipboard.writeText(shareText);
                }}
                className="inline-flex items-center gap-2 bg-[#0A66C2] text-white font-medium px-6 py-3 rounded-lg hover:bg-[#004182] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Share on LinkedIn
              </button>
              <p className="text-xs text-white/50 mt-2">Post text copied to clipboard for easy sharing</p>
            </div>

            {/* CTAs */}
            <div className="text-center pt-4">
              <h3 className="font-serif text-2xl font-semibold mb-4">What's Next?</h3>
              <p className="text-text-secondary mb-8 max-w-lg mx-auto">
                Your profile reveals where pressure is building. Now you have options.
              </p>
              
              {/* Primary Options */}
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-8">
                {/* Free Demo Option */}
                <div className="bg-white/5 border border-gold/30 rounded-xl p-6 text-left hover:border-gold/50 transition-all">
                  <div className="text-sm uppercase tracking-wide text-gold mb-2">Free Trial</div>
                  <h4 className="text-xl font-semibold mb-3">Try AI Coaching</h4>
                  <p className="text-text-secondary text-sm mb-4">
                    10 free coaching interactions. Experience the AI coach before committing. No card required.
                  </p>
                  <button
                    onClick={() => setLocation("/ai-coach/demo")}
                    className="w-full bg-gold text-navy-deep font-semibold py-3 rounded-lg hover:bg-gold-light transition-colors"
                  >
                    Start Free Demo
                  </button>
                </div>
                
                {/* Subscribe Option */}
                <div className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold rounded-xl p-6 text-left">
                  <div className="text-sm uppercase tracking-wide text-gold mb-2">Full Access</div>
                  <h4 className="text-xl font-semibold mb-3">Subscribe to AI Coaching</h4>
                  <p className="text-text-secondary text-sm mb-4">
                    Unlimited coaching sessions, goal tracking, pattern insights, and more. £19.95/month.
                  </p>
                  <button
                    onClick={() => setLocation("/ai-coach")}
                    className="w-full bg-gold text-navy-deep font-semibold py-3 rounded-lg hover:bg-gold-light transition-colors"
                  >
                    Get Full Access
                  </button>
                </div>
              </div>
              
              {/* Human Coaching Option */}
              <div className="border-t border-white/10 pt-8">
                <p className="text-sm text-text-secondary mb-4">
                  Prefer working with a human? Book a call with Patrick.
                </p>
                <button
                  onClick={() => setLocation("/book-call")}
                  className="bg-transparent border border-white/30 text-white font-medium px-6 py-2.5 rounded-lg hover:border-white hover:bg-white/5 transition-all"
                >
                  Book a Call
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
