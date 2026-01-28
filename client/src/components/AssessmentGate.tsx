import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Waves } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface AssessmentGateProps {
  onStart: (name: string, email: string) => void;
}

export function AssessmentGate({ onStart }: AssessmentGateProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    
    onStart(name.trim(), email.trim());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Waves className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">The Deep Brief</span>
          </Link>
        </div>
      </nav>

      {/* Gate Content */}
      <div className="container max-w-2xl py-16">
        <div className="text-center mb-12">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            Internal Diagnostic
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">The Pressure Audit</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A 5-section diagnostic that locates the distortion in your judgement, authority, and recovery.
          </p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Before You Begin</CardTitle>
            <CardDescription className="text-base">
              This assessment takes 8-10 minutes. Your results will be sent to your email immediately upon completion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-base">Full Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError("");
                    }}
                    placeholder="Patrick Sheridan"
                    className="mt-2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-base">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="patrick@thedeepbrief.co.uk"
                    className="mt-2"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    We'll send your detailed pressure profile to this address.
                  </p>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="space-y-4 pt-4">
                <Button type="submit" size="lg" className="w-full">
                  Start Assessment
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By continuing, you agree to receive your assessment results and occasional insights from The Deep Brief. Unsubscribe anytime.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-primary mb-2">5</p>
            <p className="text-sm text-muted-foreground">Pressure Dimensions</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary mb-2">25</p>
            <p className="text-sm text-muted-foreground">Diagnostic Questions</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary mb-2">8-10</p>
            <p className="text-sm text-muted-foreground">Minutes to Complete</p>
          </div>
        </div>
      </div>
    </div>
  );
}
