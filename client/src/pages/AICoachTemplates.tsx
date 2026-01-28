import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Target, 
  HelpCircle, 
  Search,
  ArrowRight,
  Sparkles,
  TrendingUp,
  User,
  Zap,
  AlertTriangle,
  Heart,
  Brain
} from "lucide-react";
import { tacticalTemplates, type TacticalTemplate } from "@/data/tacticalTemplates";

// Using tactical templates directly
const templates = tacticalTemplates;

// Legacy templates kept for reference
const legacyTemplates = [
  // Conversation Starters
  {
    id: "difficult-conversation",
    category: "conversation",
    title: "Preparing for a Difficult Conversation",
    description: "Get ready to handle a tough conversation with a team member",
    prompt: "I need to have a difficult conversation with a team member about [describe situation]. Can you help me think through how to approach this?",
    tags: ["feedback", "conflict", "communication"]
  },
  {
    id: "delegation-challenge",
    category: "conversation",
    title: "Delegation Dilemma",
    description: "Work through challenges with delegating effectively",
    prompt: "I'm struggling to delegate [specific task/responsibility]. I keep taking it back or micromanaging. Help me understand what's really going on.",
    tags: ["delegation", "trust", "control"]
  },
  {
    id: "decision-pressure",
    category: "conversation",
    title: "High-Stakes Decision",
    description: "Navigate a critical decision under pressure",
    prompt: "I need to make a decision about [describe decision] by [deadline]. I'm feeling [emotion]. Can we work through this?",
    tags: ["decision-making", "pressure", "strategy"]
  },
  {
    id: "team-conflict",
    category: "conversation",
    title: "Team Conflict Resolution",
    description: "Address tension or conflict within your team",
    prompt: "There's conflict on my team between [parties]. It's affecting [impact]. I need help figuring out how to address this.",
    tags: ["conflict", "team dynamics", "leadership"]
  },
  
  // Coaching Scenarios
  {
    id: "first-90-days",
    category: "scenario",
    title: "First 90 Days as a Leader",
    description: "Navigate your first three months in a new leadership role",
    prompt: "I just started as [role] at [company/team]. I want to make sure I set the right tone and build credibility in my first 90 days. What should I focus on?",
    tags: ["onboarding", "strategy", "relationships"]
  },
  {
    id: "underperformance",
    category: "scenario",
    title: "Managing Underperformance",
    description: "Address a team member's declining performance",
    prompt: "One of my team members, [name/role], has been underperforming for [timeframe]. I've noticed [specific behaviors]. I'm not sure if this is a skill issue, motivation issue, or something else.",
    tags: ["performance", "feedback", "coaching"]
  },
  {
    id: "promotion-readiness",
    category: "scenario",
    title: "Preparing for Promotion",
    description: "Get ready for the next level of leadership",
    prompt: "I'm being considered for [next role]. What gaps do I need to close? What should I be demonstrating now to show I'm ready?",
    tags: ["career", "growth", "strategy"]
  },
  {
    id: "burnout-prevention",
    category: "scenario",
    title: "Preventing Burnout",
    description: "Recognize and address early signs of burnout",
    prompt: "I'm feeling [symptoms: exhausted, cynical, ineffective]. I think I might be heading toward burnout. Help me figure out what's driving this and what I can change.",
    tags: ["wellbeing", "boundaries", "sustainability"]
  },
  {
    id: "strategic-thinking",
    category: "scenario",
    title: "Developing Strategic Thinking",
    description: "Move from tactical to strategic leadership",
    prompt: "I'm stuck in the weeds. I know I need to think more strategically, but I'm not sure how to make that shift. What does strategic thinking actually look like in practice?",
    tags: ["strategy", "growth", "mindset"]
  },
  
  // Question Frameworks
  {
    id: "decision-framework",
    category: "framework",
    title: "Decision-Making Framework",
    description: "Structured approach to making tough decisions",
    prompt: "Walk me through a decision-making framework for [decision]. Ask me the hard questions I need to consider.",
    tags: ["decision-making", "framework", "clarity"]
  },
  {
    id: "feedback-framework",
    category: "framework",
    title: "Giving Effective Feedback",
    description: "Framework for delivering clear, actionable feedback",
    prompt: "I need to give feedback to [person] about [behavior/performance]. Help me structure this using a feedback framework that will land well.",
    tags: ["feedback", "communication", "framework"]
  },
  {
    id: "priority-framework",
    category: "framework",
    title: "Priority Clarification",
    description: "Sort through competing priorities and focus on what matters",
    prompt: "I have too many priorities: [list them]. Help me use a framework to figure out what actually matters most right now.",
    tags: ["priorities", "focus", "strategy"]
  },
  {
    id: "delegation-framework",
    category: "framework",
    title: "Delegation Decision Framework",
    description: "Decide what to delegate and to whom",
    prompt: "I need help deciding what to delegate and what to keep. Walk me through a framework for making these decisions.",
    tags: ["delegation", "framework", "efficiency"]
  },
  {
    id: "conflict-framework",
    category: "framework",
    title: "Conflict Resolution Framework",
    description: "Structured approach to resolving team conflicts",
    prompt: "There's a conflict between [parties] about [issue]. Guide me through a conflict resolution framework to address this effectively.",
    tags: ["conflict", "framework", "resolution"]
  },
  {
    id: "1-on-1-framework",
    category: "framework",
    title: "Effective 1-on-1 Framework",
    description: "Structure for meaningful one-on-one conversations",
    prompt: "I want to improve my 1-on-1s with [team member]. What framework should I use to make these conversations more valuable?",
    tags: ["1-on-1", "coaching", "framework"]
  }
];

export default function AICoachTemplates() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | TacticalTemplate["category"]>("all");

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.situation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: TacticalTemplate) => {
    // Store template prompt and auto-start flag
    localStorage.setItem("coaching_template_prompt", template.prompt);
    localStorage.setItem("coaching_auto_start", "true");
    setLocation("/ai-coach/dashboard");
  };

  const categoryIcons: Record<TacticalTemplate["category"], any> = {
    people: MessageSquare,
    money: Target,
    strategy: HelpCircle,
    crisis: Sparkles,
    growth: TrendingUp,
    identity: User,
    power: Zap,
    pressure: AlertTriangle,
    trust: Heart,
    "self-leadership": Brain
  };

  const categoryLabels: Record<TacticalTemplate["category"], string> = {
    people: "People & Teams",
    money: "Financial Decisions",
    strategy: "Strategic Choices",
    crisis: "Crisis Moments",
    growth: "Scaling Challenges",
    identity: "Leadership Identity",
    power: "Power & Authority",
    pressure: "Pressure Scenarios",
    trust: "Trust & Loyalty",
    "self-leadership": "Self-Leadership"
  };

  const categoryColors: Record<TacticalTemplate["category"], string> = {
    people: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    money: "text-green-400 bg-green-500/10 border-green-500/30",
    strategy: "text-purple-400 bg-purple-500/10 border-purple-500/30",
    crisis: "text-red-400 bg-red-500/10 border-red-500/30",
    growth: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    identity: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
    power: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    pressure: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    trust: "text-pink-400 bg-pink-500/10 border-pink-500/30",
    "self-leadership": "text-cyan-400 bg-cyan-500/10 border-cyan-500/30"
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-deep via-navy to-navy-deep">
      {/* Fixed back button for mobile */}
      <button
        onClick={() => setLocation('/ai-coach/dashboard')}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/10 backdrop-blur-sm text-white rounded-full shadow-lg border border-white/20"
        aria-label="Back to Dashboard"
      >
        <ArrowRight className="h-5 w-5 rotate-180" />
      </button>
      
      <div className="container mx-auto px-4 py-8 sm:py-12 pt-16 lg:pt-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-gold-400" />
            <h1 className="text-2xl sm:text-4xl font-bold text-white">Coaching Templates</h1>
          </div>
          <p className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto px-4">
            Jump-start your coaching session with proven conversation starters, scenarios, and frameworks
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-navy-800/50 border-gold-400/20 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap px-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              size="sm"
              className={`text-xs sm:text-sm ${selectedCategory === "all" ? "bg-gold text-navy-deep" : ""}`}
            >
              All
            </Button>
            <Button
              variant={selectedCategory === "identity" ? "default" : "outline"}
              onClick={() => setSelectedCategory("identity")}
              size="sm"
              className={`text-xs sm:text-sm ${selectedCategory === "identity" ? "bg-gold text-navy-deep" : ""}`}
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Identity
            </Button>
            <Button
              variant={selectedCategory === "power" ? "default" : "outline"}
              onClick={() => setSelectedCategory("power")}
              size="sm"
              className={`text-xs sm:text-sm ${selectedCategory === "power" ? "bg-gold text-navy-deep" : ""}`}
            >
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Power
            </Button>
            <Button
              variant={selectedCategory === "pressure" ? "default" : "outline"}
              onClick={() => setSelectedCategory("pressure")}
              size="sm"
              className={`text-xs sm:text-sm ${selectedCategory === "pressure" ? "bg-gold text-navy-deep" : ""}`}
            >
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Pressure
            </Button>
            <Button
              variant={selectedCategory === "trust" ? "default" : "outline"}
              onClick={() => setSelectedCategory("trust")}
              size="sm"
              className={`text-xs sm:text-sm ${selectedCategory === "trust" ? "bg-gold text-navy-deep" : ""}`}
            >
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Trust
            </Button>
            <Button
              variant={selectedCategory === "self-leadership" ? "default" : "outline"}
              onClick={() => setSelectedCategory("self-leadership")}
              size="sm"
              className={`text-xs sm:text-sm ${selectedCategory === "self-leadership" ? "bg-gold text-navy-deep" : ""}`}
            >
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Self-Leadership
            </Button>
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center bg-navy-800/50 border-gold-400/20">
            <p className="text-gray-400 text-base sm:text-lg">No templates found matching your search.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTemplates.map((template) => {
              const Icon = categoryIcons[template.category];
              return (
                <Card
                  key={template.id}
                  className="p-4 sm:p-6 bg-navy-800/50 border-gold-400/20 hover:border-gold-400/40 transition-all hover:shadow-lg hover:shadow-gold/10"
                >
                  <div className="flex items-start gap-3 mb-3 sm:mb-4">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${categoryColors[template.category]}`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">{template.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-400">{categoryLabels[template.category]}</p>
                    </div>
                  </div>

                  <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{template.situation}</p>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded-full bg-gold-500/10 text-gold-400 border border-gold-400/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full bg-gold hover:bg-gold-light text-navy-deep font-semibold py-3 min-h-[48px]"
                  >
                    Use This Template
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8 sm:mt-12 text-center pb-8">
          <Button
            variant="outline"
            onClick={() => setLocation("/ai-coach/dashboard")}
            className="border-gold-400/30 text-gold-400 hover:bg-gold-400/10"
          >
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
