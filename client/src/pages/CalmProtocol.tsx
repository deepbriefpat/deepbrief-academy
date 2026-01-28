import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ExternalLink } from "lucide-react";
import { EmailCaptureForm } from "@/components/EmailCaptureForm";

export default function CalmProtocol() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b14] via-[#0a1628] to-[#0b1118]">
      {/* Navigation */}
            {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-turquoise"></div>
              <span className="text-xs font-sans font-medium tracking-[0.3em] text-turquoise uppercase">
                Field-Ready Protocol
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-turquoise"></div>
            </div>
            
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
              C.A.L.M. Protocol™
            </h1>
            
            <p className="font-serif text-xl md:text-2xl text-gray-400 mb-8">
              A 3-minute reset for leaders under pressure
            </p>
          </div>

          <Card className="bg-navy-deep/60 border-gold/20 backdrop-blur-sm mb-12">
            <CardContent className="p-8 md:p-12 text-center">
              <p className="font-sans text-lg md:text-xl text-gray-300 leading-relaxed">
                When pressure hits, clarity slips first.
                <br />
                <span className="text-white font-medium">This protocol brings it back fast.</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Four-Step Grid */}
      <section className="py-16 px-4">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {/* CONTROL */}
            <Card className="bg-navy-deep/80 border-turquoise/30 hover:border-turquoise/60 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-turquoise/10 flex items-center justify-center text-turquoise font-serif text-2xl font-semibold group-hover:bg-turquoise/20 transition-colors">
                    C
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl text-white mb-2">Control</h3>
                    <p className="text-sm text-turquoise/80 font-medium uppercase tracking-wider">Regain Physical Control</p>
                  </div>
                </div>
                <div className="space-y-3 text-gray-300 leading-relaxed">
                  <p>Slow your breath. Reset your posture.</p>
                  <p className="text-white font-medium">Your physiology is the doorway to your clarity.</p>
                  <p className="text-sm text-gray-400 italic">
                    If you can't control your body, you can't control your thinking.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* ACKNOWLEDGE */}
            <Card className="bg-navy-deep/80 border-turquoise/30 hover:border-turquoise/60 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-turquoise/10 flex items-center justify-center text-turquoise font-serif text-2xl font-semibold group-hover:bg-turquoise/20 transition-colors">
                    A
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl text-white mb-2">Acknowledge</h3>
                    <p className="text-sm text-turquoise/80 font-medium uppercase tracking-wider">Name What's Happening</p>
                  </div>
                </div>
                <div className="space-y-3 text-gray-300 leading-relaxed">
                  <p>No judgement. No story. Just truth.</p>
                  <p className="text-white font-medium">Truth shrinks pressure.</p>
                  <p className="text-sm text-gray-400 italic">
                    Pressure loses half its power the moment you call it what it is.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* LIMIT */}
            <Card className="bg-navy-deep/80 border-turquoise/30 hover:border-turquoise/60 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-turquoise/10 flex items-center justify-center text-turquoise font-serif text-2xl font-semibold group-hover:bg-turquoise/20 transition-colors">
                    L
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl text-white mb-2">Limit</h3>
                    <p className="text-sm text-turquoise/80 font-medium uppercase tracking-wider">Contain The Problem</p>
                  </div>
                </div>
                <div className="space-y-3 text-gray-300 leading-relaxed">
                  <p>What's actually yours? What matters now?</p>
                  <p className="text-white font-medium">Tunnel vision collapses once you set boundaries.</p>
                  <p className="text-sm text-gray-400 italic">
                    Leaders spiral when they let one issue become ten.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* MOVE */}
            <Card className="bg-navy-deep/80 border-turquoise/30 hover:border-turquoise/60 transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-turquoise/10 flex items-center justify-center text-turquoise font-serif text-2xl font-semibold group-hover:bg-turquoise/20 transition-colors">
                    M
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl text-white mb-2">Move</h3>
                    <p className="text-sm text-turquoise/80 font-medium uppercase tracking-wider">Take One Clear Action</p>
                  </div>
                </div>
                <div className="space-y-3 text-gray-300 leading-relaxed">
                  <p>A single controlled step breaks the freeze.</p>
                  <p className="text-white font-medium">Movement restores clarity. Always.</p>
                  <p className="text-sm text-gray-400 italic">
                    Not a heroic leap. A deliberate step that shifts you forward.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tagline Bar */}
      <section className="py-12 px-4 border-y border-gold/10 bg-navy-deep/40">
        <div className="container max-w-4xl text-center">
          <p className="font-serif text-lg md:text-xl text-gray-300 leading-relaxed">
            A protocol built from the same physics that keep divers alive at depth
            <br className="hidden md:block" />
            <span className="text-white"> and leaders steady when everything around them is shaking.</span>
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container max-w-3xl">
          <Card className="bg-gradient-to-br from-navy-deep via-[#0a1628] to-navy-deep border-gold/30">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">
                Three Minutes. Zero Fluff.
              </h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                This is your field-ready protocol. Built for the moment when pressure hits and clarity matters most.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href="https://deepbriefacademy.com/depth-reset/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button 
                    size="lg" 
                    className="bg-gold hover:bg-gold/90 text-navy-deep font-medium px-8 py-6 text-base group"
                  >
                    Download The Depth Reset Guide
                    <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                
                <Link href="/book-call">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-gold/50 text-gold hover:bg-gold/10 px-8 py-6 text-base group"
                  >
                    Work With Patrick
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Email Capture Section */}
      <section className="py-16 px-4 bg-navy-mid/30">
        <div className="container max-w-2xl">
          <Card className="bg-gradient-to-br from-turquoise/5 to-navy-deep border-turquoise/30">
            <CardContent className="p-8 md:p-10">
              <div className="text-center mb-6">
                <h2 className="font-serif text-2xl md:text-3xl text-white mb-3">
                  Get the Depth Reset Guide
                </h2>
                <p className="text-gray-400">
                  Receive the full C.A.L.M. Protocol™ PDF guide plus additional pressure management tools delivered to your inbox.
                </p>
              </div>
              
              <EmailCaptureForm source="calm_protocol" />
              
              <p className="text-xs text-gray-500 text-center mt-4">
                No spam. Unsubscribe anytime. We respect your inbox.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gold/10">
        <div className="container text-center">
          <p className="text-gray-500 text-sm">
            © 2026 The Deep Brief. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
