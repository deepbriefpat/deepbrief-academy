import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, FileText, MessageCircle, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";

export default function BookCallConfirmation() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-16">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/20 mb-6">
            <CheckCircle className="w-8 h-8 text-gold" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Call Confirmed</h1>
          <p className="text-xl text-text-secondary">
            You should receive a calendar invitation shortly. Check your email for details.
          </p>
        </div>

        {/* Preparation Tips */}
        <Card className="mb-8 bg-navy-mid border-gold-dim">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gold">
              <FileText className="w-5 h-5" />
              Prepare for Your Clarity Call
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Before the Call</h3>
              <ul className="space-y-3 text-text-secondary">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                  <span>
                    <strong className="text-text-primary">Take the Pressure Audit</strong> if you haven't already. 
                    It will give us a shared language for where distortion is building.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                  <span>
                    <strong className="text-text-primary">Think about recent decisions</strong> that felt heavier than they should have. 
                    What made them difficult? What was the context?
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                  <span>
                    <strong className="text-text-primary">Identify your current depth</strong>. 
                    Are you at operational capacity? Stretched thin? Approaching limits?
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                  <span>
                    <strong className="text-text-primary">Be ready to be honest</strong>. 
                    This isn't a pitch. It's a diagnostic conversation. The more clearly you can describe what's shifted, 
                    the more useful our conversation will be.
                  </span>
                </li>
              </ul>
            </div>

            <div className="border-t border-gold-dim/30 pt-6">
              <h3 className="font-semibold text-lg mb-2">What to Expect</h3>
              <ul className="space-y-3 text-text-secondary">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                  <span>
                    <strong className="text-text-primary">30 minutes</strong> to talk about where you are, 
                    what's pressing, and whether this work makes sense for you.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                  <span>
                    <strong className="text-text-primary">No pitch. No pressure.</strong> Just a conversation 
                    about your current state and whether deeper work would help.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                  <span>
                    <strong className="text-text-primary">Honest assessment</strong> of whether I can help. 
                    If this isn't the right fit, I'll tell you.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                  <span>
                    <strong className="text-text-primary">Clarity on next steps</strong> — either way. 
                    If it does make sense, we'll talk about the engagement structure and timeline.
                  </span>
                </li>
              </ul>
            </div>

            <div className="border-t border-gold-dim/30 pt-6">
              <h3 className="font-semibold text-lg mb-2">What I Ask of You</h3>
              <p className="text-text-secondary mb-3">
                Come ready to be honest. That's all this requires.
              </p>
              <p className="text-text-muted italic">
                The more clearly you can describe what's shifted, the more useful our conversation will be.
              </p>
              <p className="text-text-muted italic mt-2">
                Everything discussed stays outside your organisation and outside your personal circles.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-navy-mid border-gold-dim hover:border-gold transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-gold" />
                Take the Pressure Audit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-4">
                Get a detailed analysis of your pressure profile before the call. 
                It will give us a shared starting point.
              </p>
              <Link href="/assessment">
                <Button variant="outline" className="w-full border-gold text-gold hover:bg-gold hover:text-navy-deep">
                  Start Assessment
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-navy-mid border-gold-dim hover:border-gold transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-gold" />
                Read the Stories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary mb-4">
                Understand how pressure shows up at depth through real diving experiences 
                and their leadership parallels.
              </p>
              <Link href="/stories">
                <Button variant="outline" className="w-full border-gold text-gold hover:bg-gold hover:text-navy-deep">
                  Explore Stories
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Reminder */}
        <Card className="bg-navy-deep border-gold-dim">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Calendar className="w-6 h-6 text-gold flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Add to Your Calendar</h3>
                <p className="text-sm text-text-secondary mb-3">
                  Check your email for the calendar invitation. If you don't see it within a few minutes, 
                  check your spam folder or contact me directly.
                </p>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <MessageCircle className="w-4 h-4" />
                  <span>Need to reschedule? Use the calendar link in your confirmation email.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Capture */}
        <Card className="bg-navy-mid border-gold-dim">
          <CardHeader>
            <CardTitle className="text-center">Stay Connected</CardTitle>
            <CardDescription className="text-center">
              Get exclusive insights on pressure management and leadership clarity delivered to your inbox.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailCaptureForm source="booking_confirmation" />
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button variant="ghost" className="text-text-secondary hover:text-gold">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
