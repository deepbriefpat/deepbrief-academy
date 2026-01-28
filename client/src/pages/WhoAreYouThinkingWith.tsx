import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { MetaTags } from "@/components/MetaTags";

const questions = [
  {
    id: "thinking_partners",
    category: "Network Size",
    question: "How many people do you regularly turn to for strategic thinking support?",
    options: [
      { value: 0, label: "None - I work through everything alone", score: 0 },
      { value: 1, label: "1-2 people", score: 25 },
      { value: 2, label: "3-5 people", score: 50 },
      { value: 3, label: "6+ people", score: 75 },
    ],
  },
  {
    id: "diversity",
    category: "Perspective Diversity",
    question: "How diverse are the perspectives in your thinking network?",
    options: [
      { value: 0, label: "Very similar - same industry, background, and experience level", score: 0 },
      { value: 1, label: "Somewhat similar - mostly same industry but different roles", score: 25 },
      { value: 2, label: "Moderately diverse - mix of industries and experience levels", score: 50 },
      { value: 3, label: "Highly diverse - different industries, backgrounds, and expertise", score: 75 },
    ],
  },
  {
    id: "frequency",
    category: "Engagement Frequency",
    question: "How often do you engage with your thinking partners?",
    options: [
      { value: 0, label: "Rarely or never", score: 0 },
      { value: 1, label: "Only when in crisis", score: 20 },
      { value: 2, label: "Monthly or quarterly", score: 50 },
      { value: 3, label: "Weekly or bi-weekly", score: 75 },
    ],
  },
  {
    id: "reciprocity",
    category: "Reciprocal Value",
    question: "How balanced is the value exchange in these relationships?",
    options: [
      { value: 0, label: "Mostly one-way - I'm always asking for help", score: 0 },
      { value: 1, label: "Somewhat balanced but inconsistent", score: 30 },
      { value: 2, label: "Generally balanced - we help each other", score: 60 },
      { value: 3, label: "Highly reciprocal - mutual growth and support", score: 75 },
    ],
  },
  {
    id: "trust",
    category: "Trust & Safety",
    question: "How safe do you feel being vulnerable with your thinking partners?",
    options: [
      { value: 0, label: "Not safe - I hold back critical information", score: 0 },
      { value: 1, label: "Somewhat safe - I share but with reservations", score: 25 },
      { value: 2, label: "Mostly safe - I share openly most of the time", score: 55 },
      { value: 3, label: "Completely safe - I can be fully honest", score: 75 },
    ],
  },
  {
    id: "challenge",
    category: "Constructive Challenge",
    question: "Do your thinking partners challenge your assumptions?",
    options: [
      { value: 0, label: "Never - they mostly agree with me", score: 0 },
      { value: 1, label: "Rarely - occasional pushback", score: 20 },
      { value: 2, label: "Sometimes - they question my thinking when needed", score: 50 },
      { value: 3, label: "Regularly - they actively challenge and sharpen my thinking", score: 75 },
    ],
  },
  {
    id: "structure",
    category: "Structure & Commitment",
    question: "How structured is your engagement with thinking partners?",
    options: [
      { value: 0, label: "No structure - ad hoc conversations when convenient", score: 0 },
      { value: 1, label: "Loose structure - occasional scheduled check-ins", score: 25 },
      { value: 2, label: "Moderate structure - regular meetings with some agenda", score: 55 },
      { value: 3, label: "High structure - committed schedule with clear frameworks", score: 75 },
    ],
  },
  {
    id: "outcomes",
    category: "Impact & Outcomes",
    question: "How often do conversations with thinking partners lead to actionable insights?",
    options: [
      { value: 0, label: "Rarely - mostly venting without clarity", score: 0 },
      { value: 1, label: "Sometimes - occasional useful insights", score: 25 },
      { value: 2, label: "Often - I usually leave with new perspectives", score: 55 },
      { value: 3, label: "Almost always - clear actions and improved thinking", score: 75 },
    ],
  },
];

export default function WhoAreYouThinkingWith() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [sessionId] = useState(() => `network_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const saveAssessmentMutation = trpc.supportNetwork.submit.useMutation({
    onSuccess: (data) => {
      setLocation(`/network-assessment/results?session=${data.sessionId}`);
    },
    onError: (error) => {
      toast.error("Failed to save assessment. Please try again.");
    },
  });

  const handleAnswer = (questionId: string, value: number) => {
    const newResponses = { ...responses, [questionId]: value };
    setResponses(newResponses);

    // Auto-advance to next question
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    }
  };

  const calculateScore = () => {
    return Object.entries(responses).reduce((total, [questionId, value]) => {
      const question = questions.find(q => q.id === questionId);
      const option = question?.options.find(opt => opt.value === value);
      return total + (option?.score || 0);
    }, 0);
  };

  const handleSubmit = () => {
    const score = calculateScore();
    const maxScore = questions.reduce((sum, q) => sum + Math.max(...q.options.map(o => o.score)), 0);
    
    let networkQuality: "isolated" | "emerging" | "functional" | "thriving";
    const percentage = (score / maxScore) * 100;
    
    if (percentage < 25) networkQuality = "isolated";
    else if (percentage < 50) networkQuality = "emerging";
    else if (percentage < 75) networkQuality = "functional";
    else networkQuality = "thriving";

    saveAssessmentMutation.mutate({
      sessionId,
      responses: JSON.stringify(responses),
      networkQuality,
      score,
    });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const allQuestionsAnswered = Object.keys(responses).length === questions.length;

  return (
    <div className="min-h-screen bg-background py-12">
      <MetaTags
        title="Who Are You Thinking With? | Support Network Assessment"
        description="Evaluate the quality and diversity of your thinking partnerships. Discover how to build a stronger support network for clearer decision-making under pressure."
      />

      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-6">
            <Users className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Who Are You Thinking With?
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Your support network determines how clearly you think under pressure. This assessment evaluates the quality and diversity of your thinking partnerships.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-muted">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-text-muted">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full h-2 bg-navy-mid rounded-full overflow-hidden">
            <div
              className="h-full bg-gold transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="text-sm text-gold font-semibold mb-2">
              {questions[currentQuestion].category}
            </div>
            <CardTitle className="text-2xl">
              {questions[currentQuestion].question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(questions[currentQuestion].id, option.value)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    responses[questions[currentQuestion].id] === option.value
                      ? "border-gold bg-gold/10"
                      : "border-border hover:border-gold/50 hover:bg-navy-mid"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {responses[questions[currentQuestion].id] === option.value && (
                      <CheckCircle2 className="w-5 h-5 text-gold" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          {currentQuestion < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={!responses[questions[currentQuestion].id]}
              className="gap-2"
            >
              Next Question
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || saveAssessmentMutation.isPending}
              className="gap-2 bg-gold hover:bg-gold-light text-navy-deep"
            >
              {saveAssessmentMutation.isPending ? "Analyzing..." : "See My Results"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Question Overview */}
        <div className="mt-12 p-6 bg-navy-mid rounded-lg">
          <h3 className="font-semibold mb-4">Your Progress</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(idx)}
                className={`aspect-square rounded-lg border-2 flex items-center justify-center text-sm font-semibold transition-all ${
                  responses[q.id] !== undefined
                    ? "border-gold bg-gold/20 text-gold"
                    : idx === currentQuestion
                    ? "border-gold bg-navy-deep"
                    : "border-border bg-navy-deep text-text-muted hover:border-gold/50"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
