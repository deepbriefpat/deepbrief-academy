import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Anchor, Building, Compass, Users } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section with Headshot */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h1 className="text-[clamp(2.8rem,6vw,4.5rem)] font-serif leading-[1.2] tracking-[-0.02em] mb-6 text-gold">Patrick Voorma</h1>
              <p className="text-xl text-text-secondary mb-6 leading-relaxed">
                I built and sold South Africa's biggest dive centre. I served as a military officer. 
                I've discovered ten shipwrecks. And for the last decade, I've led corporate teams across 
                Europe and Africa, working in more than 52 countries.
              </p>
              <p className="text-lg text-text-secondary leading-relaxed">
                I know pressure — underwater where mistakes cost lives, and in the boardroom where they cost livelihoods.
              </p>
            </div>
            <div className="relative">
              <img loading="lazy" 
                src="/Patrickheadshot.webp" 
                alt="Patrick Voorma" 
                className="w-full rounded-lg shadow-2xl"
               
              />
            </div>
          </div>

          {/* Elevator Pitch Card */}
          <Card className="mb-16 bg-gradient-to-br from-navy-mid to-navy-deep border-gold">
            <CardContent className="pt-8">
              <blockquote className="text-lg text-text-secondary leading-relaxed italic">
                "That's why I value conversations like this — because none of us master pressure alone. 
                When we share openly, we sharpen faster, perform stronger, and grow further than we ever could on our own."
              </blockquote>
            </CardContent>
          </Card>

          {/* Journey Sections */}
          <div className="space-y-12 mb-16">
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-navy-mid border-gold-dim">
                <CardContent className="pt-6">
                  <Anchor className="w-10 h-10 text-gold mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Diving & Discovery</h3>
                  <p className="text-text-secondary text-sm">
                    Built South Africa's largest dive centre from the ground up. Discovered ten shipwrecks. 
                    Led technical diving expeditions to depths where clarity is everything and mistakes are unforgiving.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-navy-mid border-gold-dim">
                <CardContent className="pt-6">
                  <Building className="w-10 h-10 text-gold mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Military Service</h3>
                  <p className="text-text-secondary text-sm">
                    Served as a military officer, learning to make decisions under extreme pressure 
                    where lives depend on clarity of thought and precision of action.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-navy-mid border-gold-dim">
                <CardContent className="pt-6">
                  <Users className="w-10 h-10 text-gold mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Corporate Leadership</h3>
                  <p className="text-text-secondary text-sm">
                    Led corporate teams across 52+ countries in Europe and Africa. Worked with founders 
                    and senior leaders navigating the pressure of growth, scale, and strategic decisions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="mb-16">
            <h2 className="text-3xl font-semibold mb-8 text-center">From the Depths</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="relative group overflow-hidden rounded-lg">
                <img loading="lazy" 
                  src="/trimix130.webp" 
                  alt="Technical diving at 130 meters" 
                  className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent flex items-end p-4">
                  <p className="text-sm text-white">Technical diving at extreme depth</p>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-lg">
                <img loading="lazy" 
                  src="/istarwreck.webp" 
                  alt="Istar wreck discovery" 
                  className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent flex items-end p-4">
                  <p className="text-sm text-white">Istar wreck at 75 meters</p>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-lg">
                <img loading="lazy" 
                  src="/patrb.webp" 
                  alt="Military service" 
                  className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent flex items-end p-4">
                  <p className="text-sm text-white">Military officer training</p>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-lg">
                <img loading="lazy" 
                  src="/wreckdeep.jpg" 
                  alt="Deep wreck exploration" 
                  className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent flex items-end p-4">
                  <p className="text-sm text-white">Deep wreck exploration</p>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-lg">
                <img loading="lazy" 
                  src="/tecdivertraining.jpg" 
                  alt="Technical diver training" 
                  className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent flex items-end p-4">
                  <p className="text-sm text-white">Training technical divers</p>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-lg">
                <img loading="lazy" 
                  src="/patrickradio.webp" 
                  alt="Podcasts and speaker engagements" 
                  className="w-full h-64 object-cover transition-transform group-hover:scale-105"
                 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent flex items-end p-4">
                  <p className="text-sm text-white">Podcasts and speaker engagements</p>
                </div>
              </div>
            </div>
          </div>

          {/* Why This Work Section */}
          <Card className="mb-12 bg-navy-mid border-gold-dim">
            <CardContent className="pt-8">
              <div className="flex items-start gap-4">
                <Compass className="w-8 h-8 text-gold flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Why This Work Matters</h2>
                  <div className="space-y-4 text-text-secondary">
                    <p>
                      At 75 meters underwater, when your regulator fails and nitrogen narcosis clouds your thinking, 
                      there's no time for panic. You either think clearly or you don't surface.
                    </p>
                    <p>
                      In the boardroom, the pressure is different but the principle is the same. When you're carrying 
                      decisions that affect livelihoods, relationships, and your company's future, clarity isn't optional.
                    </p>
                    <p className="font-semibold text-text-primary border-l-2 border-gold pl-4">
                      I have got this wrong more than once. I have chased growth at the cost of my own clarity. 
                      I have made decisions tired, overloaded, and convinced I was fine. That is why I built The Deep Brief: 
                      not from theory, but from the cost of learning it the hard way.
                    </p>
                    <p>
                      Most leaders I work with aren't in crisis. They're still performing. But they can feel something 
                      shifting. Decisions that used to be obvious now feel heavy. Judgment that used to be sharp now 
                      feels compromised.
                    </p>
                    <p className="font-semibold text-gold">
                      That's the moment this work matters most. Before the pressure breaks you. While you still have 
                      the capacity to think clearly about how you think.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Let's Talk About Pressure</h2>
            <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
              If you're feeling the weight of leadership and want to think more clearly about your next moves, 
              let's have a conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/assessment">
                <Button size="lg" className="gap-2 bg-gold text-navy-deep hover:bg-gold/90">
                  Take the Pressure Audit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/book-call">
                <Button variant="outline" size="lg" className="gap-2 border-gold text-gold hover:bg-gold/10">
                  Book a Call
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
