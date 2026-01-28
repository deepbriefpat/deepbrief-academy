import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Waves, Clock, Zap, Target, MessageSquare, FileText, Users } from "lucide-react";

export default function HowToUseThis() {
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
            How to Use This
          </h1>
          <p className="text-xl text-gray-600">
            Not a feature tour. Tactical guidance on when to use each mode.
          </p>
        </div>

        {/* When to Use What */}
        <div className="space-y-6 mb-12">
          <Card className="border-l-4 border-l-[#4A6741]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-[#4A6741]" />
                <CardTitle className="text-2xl">Quick Coaching (5-10 minutes)</CardTitle>
              </div>
              <CardDescription className="text-base">
                Use this when you need clarity fast
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">When:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A6741] mt-1">•</span>
                    <span>Pre-meeting prep (15 minutes before a difficult conversation)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A6741] mt-1">•</span>
                    <span>Decision under pressure (need to respond to an email, make a call)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#4A6741] mt-1">•</span>
                    <span>Post-incident debrief (something just went sideways, need to process)</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What you get:</h4>
                <p className="text-gray-700">
                  Focused, tactical support. One clear action. No deep dive—just what you need to move forward right now.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-2xl">Full Coaching (20-45 minutes)</CardTitle>
              </div>
              <CardDescription className="text-base">
                Use this when you need to think something through
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">When:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Strategic decisions (team restructure, role change, big commitment)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Pattern recognition (same problem keeps showing up in different forms)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Pressure audit (feeling heavier than usual, not sure why)</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What you get:</h4>
                <p className="text-gray-700">
                  Exploratory conversation. The coach follows your thread, asks the questions you're avoiding, helps you see what pressure is hiding.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-2xl">Templates (10-20 minutes)</CardTitle>
              </div>
              <CardDescription className="text-base">
                Use this when you know the situation type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">When:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Common high-stakes scenarios (difficult feedback, conflict, delegation)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Recurring situations (weekly 1:1s, quarterly planning, performance reviews)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>Role-specific challenges (first-time manager, new executive, team lead)</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What you get:</h4>
                <p className="text-gray-700">
                  Structured guidance. Pre-built frameworks for common situations. Faster than starting from scratch.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* What This Isn't */}
        <Card className="mb-12 bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-900">What This Isn't</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-amber-900">
              <li className="flex items-start gap-2">
                <span className="mt-1">×</span>
                <span><strong>Not therapy.</strong> If you're experiencing clinical anxiety, depression, or trauma, you need a licensed professional.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">×</span>
                <span><strong>Not a magic fix.</strong> This is a thinking tool. It helps you see more clearly. You still have to do the work.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">×</span>
                <span><strong>Not validation.</strong> The coach won't tell you what you want to hear. It'll tell you what you need to hear.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#4A6741]" />
                  Timing Matters
                </h4>
                <p className="text-gray-700 ml-7">
                  Use Quick Coaching when you're under time pressure. Use Full Coaching when you have space to think. Don't try to rush a deep conversation.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#4A6741]" />
                  Be Specific
                </h4>
                <p className="text-gray-700 ml-7">
                  "I need help with my team" is too vague. "I need to give feedback to Sarah about missing deadlines, and I'm worried she'll get defensive" is specific. Specific gets better results.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#4A6741]" />
                  Track Commitments
                </h4>
                <p className="text-gray-700 ml-7">
                  The system automatically captures commitments you make during sessions. Review them. Follow through. That's where the value is.
                </p>
              </div>
            </div>
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
            <Link href="/coach-selection-guide">
              <Button variant="outline" size="lg">
                Coach Selection Guide →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
