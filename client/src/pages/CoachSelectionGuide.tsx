import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Waves, AlertCircle, Target, MessageSquare, Zap, Brain } from "lucide-react";

export default function CoachSelectionGuide() {
  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Waves className="h-8 w-8 text-[#4A6741]" />
              <span className="text-xl font-bold text-gray-900">The Deep Brief</span>
            </Link>
            <Link href="/ai-coach/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container max-w-4xl py-12 px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choosing Your Coach
          </h1>
          <p className="text-xl text-gray-600">
            Match your current state to the right coaching style.
          </p>
        </div>

        {/* When to Choose What */}
        <div className="space-y-6 mb-12">
          <Card className="border-l-4 border-l-red-600">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <CardTitle className="text-2xl">When You're Dysregulated</CardTitle>
              </div>
              <CardDescription className="text-base">
                Acute pressure, spiraling, can't think straight
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Choose:</h4>
                <p className="text-gray-700 mb-3">
                  <strong>Olivia Martinez</strong> (Crisis Leadership) or <strong>Marcus Johnson</strong> (Performance Under Pressure)
                </p>
                <p className="text-gray-700">
                  These coaches are trained to help you regulate first, then think. They'll use the C.A.L.M. Protocol to bring you back to baseline before tackling the problem.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What you'll get:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Physical regulation ("What's your body doing right now?")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>Reality check ("What's actually happening, not what it means?")</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>One clear action to move forward</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#4A6741]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-[#4A6741]" />
                <CardTitle className="text-2xl">When You Need Clarity on a Decision</CardTitle>
              </div>
              <CardDescription className="text-base">
                Stuck between options, can't see the right move
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Choose:</h4>
                <p className="text-gray-700 mb-3">
                  <strong>Sarah Mitchell</strong> (Strategic Leadership) or <strong>David Chen</strong> (Strategic Growth)
                </p>
                <p className="text-gray-700">
                  These coaches bring frameworks and systematic thinking. They'll help you see the decision from multiple angles and identify what you're actually optimizing for.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What you'll get:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A6741] mt-1">•</span>
                    <span>Questions that reveal hidden assumptions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A6741] mt-1">•</span>
                    <span>Framework to evaluate options systematically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A6741] mt-1">•</span>
                    <span>Clarity on what you're actually optimizing for</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-2xl">When You Need to Have a Difficult Conversation</CardTitle>
              </div>
              <CardDescription className="text-base">
                Tough feedback, conflict, or high-stakes communication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Choose:</h4>
                <p className="text-gray-700 mb-3">
                  <strong>Alex Rivera</strong> (Conflict Resolution) or <strong>Elena Rodriguez</strong> (Team Dynamics)
                </p>
                <p className="text-gray-700">
                  These coaches specialize in interpersonal dynamics. They'll help you prepare for the conversation, anticipate reactions, and find language that lands.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What you'll get:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Script for opening the conversation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Anticipation of how the other person will react</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Backup plan if the conversation goes sideways</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-2xl">When You're Seeing a Pattern</CardTitle>
              </div>
              <CardDescription className="text-base">
                Same problem keeps showing up, different forms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Choose:</h4>
                <p className="text-gray-700 mb-3">
                  <strong>Casey Rivers</strong> (Emotional Intelligence) or <strong>Sage Mitchell</strong> (Mindful Leadership)
                </p>
                <p className="text-gray-700">
                  These coaches help you look inward. They'll help you see how you're contributing to the pattern and what needs to shift internally.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What you'll get:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Recognition of your default response pattern</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Insight into what triggers the pattern</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Practice with a different response</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-600">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-orange-600" />
                <CardTitle className="text-2xl">When You Just Need to Think Out Loud</CardTitle>
              </div>
              <CardDescription className="text-base">
                Not sure what the problem is yet, need to process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Choose:</h4>
                <p className="text-gray-700 mb-3">
                  <strong>Any coach</strong> — they're all trained for exploratory conversation
                </p>
                <p className="text-gray-700">
                  When you don't know what you need yet, any coach can help. They'll follow your thread, ask open questions, and help you find what's actually bothering you.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What you'll get:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>Space to think without judgment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>Questions that help you clarify what's actually going on</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span>Recognition of patterns you might be missing</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Note */}
        <Card className="mb-12 bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900">You Can Switch Mid-Session</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-900 mb-4">
              If you start with one coach and realize you need a different style, you can switch without losing your conversation history. The coach selector is always available in the chat header.
            </p>
            <p className="text-amber-900">
              <strong>Example:</strong> You start with Sarah (Strategic) for a decision, but realize you're more dysregulated than you thought. Switch to Olivia (Crisis) to regulate first, then switch back to Sarah to make the decision.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4">
          <Link href="/ai-coach/dashboard">
            <Button size="lg" className="bg-[#4A6741] hover:bg-[#3A5631]">
              Start a Session
            </Button>
          </Link>
          <div>
            <Link href="/how-to-use-this">
              <Button variant="link" className="text-[#4A6741]">
                ← Back to How to Use This
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
