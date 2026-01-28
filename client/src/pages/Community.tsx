import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, ArrowRight, Target, Lightbulb, Shield, Network } from "lucide-react";
import { Link } from "wouter";

export default function Community() {
  const { data: testimonials, isLoading } = trpc.testimonials.featured.useQuery();

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Users className="h-16 w-16 text-gold mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-serif mb-4">Leadership Peer Groups</h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Clarity isn't found in isolation. It's forged in conversation with people who understand the weight.
            </p>
          </div>

          {/* MyBigSky Partnership Section */}
          <Card className="mb-12 bg-navy-mid border-gold-dim">
            <CardContent className="pt-8">
              <div className="flex items-start gap-4 mb-6">
                <Network className="w-8 h-8 text-gold flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">Your Non-Executive Board</h2>
                <p className="text-text-secondary mb-4">
                  Through our partnership with <a href="https://www.mybigsky.co.uk/" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold/80 font-semibold underline">MyBigSky</a>, we offer structured peer groups 
                  that act as your trusted Non-Executive Board—a confidential circle of experienced leaders who meet monthly 
                  to share insights, solve challenges, and develop actionable strategies.
                </p>
                <p className="text-text-secondary mb-4">
                  These aren't networking events. They're strategic sessions where founders and senior leaders bring real problems, 
                  get real perspectives, and leave with real clarity.
                </p>
                <a 
                  href="https://www.mybigsky.co.uk/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-gold hover:text-gold/80 font-semibold"
                >
                  Learn more about MyBigSky
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              </div>
            </CardContent>
          </Card>

          {/* Why Peer Groups Work */}
          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-8 text-center">Why Peer Groups Work</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-navy-mid border-gold-dim">
                <CardHeader>
                  <Target className="w-8 h-8 text-gold mb-2" />
                  <CardTitle>Real Accountability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary">
                    Set clear goals and be held to them by a supportive group of driven leaders who understand your challenges 
                    because they're living them.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-navy-mid border-gold-dim">
                <CardHeader>
                  <Lightbulb className="w-8 h-8 text-gold mb-2" />
                  <CardTitle>Expand Your Perspective</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary">
                    Learn from others' experiences to avoid costly mistakes and uncover new opportunities. 
                    Gain objective insights from leaders who've navigated similar depths.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-navy-mid border-gold-dim">
                <CardHeader>
                  <Shield className="w-8 h-8 text-gold mb-2" />
                  <CardTitle>Confidential Space</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary">
                    A room where you can say "I've forgotten how to think" and be met with questions, not judgment. 
                    Everything discussed stays outside your organisation.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-navy-mid border-gold-dim">
                <CardHeader>
                  <Users className="w-8 h-8 text-gold mb-2" />
                  <CardTitle>Trusted Advisors</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary">
                    Build a network of experienced professionals who truly understand your journey. 
                    More than networking—it's your personal board of directors.
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-navy-deep border-gold-dim">
              <CardContent className="pt-6">
                <p className="text-text-secondary mb-4">
                  Most leadership advice comes from people who don't carry your weight. Consultants who've never run a company. 
                  Coaches who've never made a decision at depth.
                </p>
                <p className="text-text-secondary mb-4">
                  Peer groups are different. Everyone in the room understands the pressure because they're living it. 
                  They don't give advice. They ask questions that make you think.
                </p>
                <p className="font-semibold text-gold">
                  The most valuable thing for a leader isn't another framework. It's a room where you can think clearly 
                  with people who understand the depth you're operating at.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* T.E.A.M Model Section */}
          <Card className="mb-12 bg-gradient-to-br from-navy-mid to-navy-deep border-gold">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">The T.E.A.M. Model</CardTitle>
              <CardDescription className="text-text-secondary">
                Our peer groups use the T.E.A.M. (The Expectation Achievement Model) framework developed by MyBigSky
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gold">1. Getting to Know Yourself</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Understand your motivators, pressure patterns, and leadership style before setting direction.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gold">2. Setting the Right Expectations</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Define goals beyond financial targets—prosperity, people, planet, and personal fulfilment.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gold">3. Empowering Your Team</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Build capacity in others so leadership isn't a solo journey. Distribute decision-making effectively.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-gold">4. Executing Your Plan</h3>
                  <p className="text-sm text-text-secondary mb-4">
                    Turn clarity into action with accountability, strategic thinking, and peer support.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testimonials */}
          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-8 text-center">What Founders Say</h2>
            <div className="space-y-6">
              {testimonials?.map((testimonial, index) => (
                <Card key={index} className="bg-navy-mid border-gold-dim">
                  <CardHeader>
                    <CardDescription className="text-sm font-semibold text-gold">
                      {testimonial.authorRole}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <blockquote className="text-lg italic text-text-secondary">
                      "{testimonial.content}"
                    </blockquote>
                    {testimonial.outcome && (
                      <p className="text-sm text-text-muted border-l-2 border-gold pl-4">
                        <strong className="text-text-primary">Outcome:</strong> {testimonial.outcome}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <Card className="mb-12 bg-navy-mid border-gold-dim">
            <CardHeader>
              <CardTitle className="text-2xl">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 text-gold font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Discovery Call</h3>
                  <p className="text-sm text-text-secondary">
                    30-minute conversation to understand your current challenges and whether a peer group is the right fit.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 text-gold font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Group Matching</h3>
                  <p className="text-sm text-text-secondary">
                    We match you with a cohort of 6-8 leaders at similar stages, facing comparable challenges.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 text-gold font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Monthly Sessions</h3>
                  <p className="text-sm text-text-secondary">
                    Half-day sessions facilitated by experienced leaders. Bring real challenges, leave with real clarity.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 text-gold font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Ongoing Support</h3>
                  <p className="text-sm text-text-secondary">
                    Access to your peer group between sessions, plus resources and frameworks from both The Deep Brief and MyBigSky.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-gold/10 to-gold/5 border-gold">
            <CardHeader>
              <CardTitle className="text-2xl text-gold">Ready to Think with Others?</CardTitle>
              <CardDescription className="text-text-secondary">
                Book a 30-minute conversation to learn more about peer groups and how they work
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/book-call" className="flex-1">
                  <Button size="lg" className="gap-2 w-full bg-gold text-navy-deep hover:bg-gold/90">
                    Schedule Discovery Call
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact" className="flex-1">
                  <Button variant="outline" size="lg" className="gap-2 w-full border-gold text-gold hover:bg-gold/10">
                    Other Contact Options
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
