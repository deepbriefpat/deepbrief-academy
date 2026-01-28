import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Footer } from "@/components/Footer";
import { StickyCTA } from "@/components/StickyCTA";
import { ScrollToTop } from "@/components/ScrollToTop";
import { trpc } from "@/lib/trpc";

export default function ClarityProgram() {
  const { data: testimonials = [] } = trpc.testimonials.featured.useQuery();

  return (
    <div className="min-h-screen bg-navy-deep text-text-primary">
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep to-navy-mid" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(201,169,98,0.03)_0%,transparent_50%)] pointer-events-none" />
        
        <div className="container relative z-10 text-center max-w-[900px]">
          <div className="text-[0.85rem] uppercase tracking-[0.2em] text-gold mb-6 opacity-0 animate-[fadeUp_0.8s_ease_forwards]">
            One to One Partnership
          </div>
          <h1 className="text-[clamp(2.8rem,6vw,4.5rem)] font-serif leading-[1.2] tracking-[-0.02em] mb-8 opacity-0 animate-[fadeUp_0.8s_ease_0.2s_forwards]">
            Clarity Under Pressure
          </h1>
          <p className="text-[1.4rem] text-text-secondary mb-0 max-w-[750px] mx-auto opacity-0 animate-[fadeUp_0.8s_ease_0.4s_forwards]">
            For founders and senior leaders who are still performing — but can feel their judgement starting to bend under&nbsp;pressure.
          </p>
          <p className="text-[1.25rem] mt-6 italic text-text-muted font-serif max-w-[700px] mx-auto opacity-0 animate-[fadeUp_0.8s_ease_0.6s_forwards]">
            Not burned out. Not falling apart. Just aware that something subtle is shifting.<br/>
            The kind of shift most people miss until it becomes a problem.
          </p>
          <p className="text-[1.25rem] mt-4 italic text-text-muted font-serif max-w-[700px] mx-auto opacity-0 animate-[fadeUp_0.8s_ease_0.6s_forwards]">
            The pressure hasn't broken you yet — but you can feel the strain in ways you can't explain to your team.
          </p>
          <p className="text-base text-text-secondary leading-[1.8] mt-6 max-w-[700px] mx-auto opacity-0 animate-[fadeUp_0.8s_ease_0.6s_forwards]">
            Pressure doesn't show up dramatically. It shows up quietly.<br/>
            Shorter patience. Shorter breath.<br/>
            A loss of situational awareness.<br/>
            A decision you delay for no good reason.<br/>
            A meeting where you feel present but not fully in the room.<br/>
            You know something is drifting — but you can't quite name it.
          </p>
        </div>
      </section>

      {/* Is This You Section */}
      <section className="py-20 bg-navy-mid">
        <div className="container max-w-[1000px]">
          <h2 className="text-[clamp(2rem,4vw,2.8rem)] font-serif text-gold mb-6">Is This You?</h2>
          <ul className="space-y-3 mb-8">
            {[
              "Running a business or leading a significant team",
              "Not in crisis, but something feels off",
              "Decisions that used to be obvious now feel heavy",
              "Nobody else can see the distortion yet",
              "Needs someone who has actually operated under extreme pressure — not a coach reading from a manual"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-text-secondary pl-6 relative py-3">
                <span className="absolute left-0 top-[1.1rem] w-1.5 h-1.5 rounded-full bg-gold" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-[1.2rem] font-serif italic text-text-primary mt-8">
            This is the leader who is still moving forward but knows the depth has changed.
          </p>
          <p className="text-[1.15rem] font-serif text-text-primary mt-6">
            If you ignore distortion long enough, it becomes expensive.
          </p>
          <p className="text-[0.95rem] text-text-muted mt-6">
            Everything discussed stays outside your organisation and outside your personal circles.<br/>
            Some clients choose to remain anonymous. That's always respected.
          </p>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-24 bg-gradient-to-b from-navy-mid to-navy-deep">
        <div className="container max-w-[1000px]">
          <div className="border border-gold/15 bg-navy-mid/55 p-9 rounded-[14px] max-w-[760px] mx-auto">
            <h3 className="text-[1.4rem] font-serif text-gold-light mb-4">Download the Map</h3>
            <p className="text-text-secondary mb-5">
              If you're not ready to talk yet, start here. The Pressure Audit is the same diagnostic I use in the first month of the engagement.
              It will show you where the distortion is building and which decisions are being bent by load.
            </p>
            <div className="flex gap-4 flex-wrap items-center">
              <Link href="/assessment">
                <Button className="bg-gold hover:bg-gold-light text-navy-deep font-semibold px-5 py-3.5 rounded-[10px] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.25)]">
                  Get the Pressure Audit
                </Button>
              </Link>
              <a href="#top" className="text-gold underline hover:text-gold-light transition-colors">
                Not ready? Just bookmark this page
              </a>
            </div>
            <p className="text-text-muted text-[0.95rem] mt-5 mb-0">
              No spam. No funnel games. Just the tool.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Month Engagement Section */}
      <section className="py-24 bg-navy-deep">
        <div className="container max-w-[1000px]">
          <h2 className="text-[clamp(2rem,4vw,2.8rem)] font-serif text-gold mb-12">The 3-Month Engagement</h2>
          
          {/* Month 1 */}
          <div className="mb-12 p-8 bg-navy-mid border-l-2 border-gold">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-[0.9rem] font-serif text-gold uppercase tracking-[0.1em]">Month 1</span>
              <span className="text-[1.5rem] font-serif text-text-primary">Establish Depth</span>
            </div>
            <ul className="space-y-2 mb-6">
              {[
                "90-minute deep dive",
                "Full Pressure Audit diagnostic",
                "Two 45-minute sessions (fortnightly)",
                "Voice note access for real-time decisions"
              ].map((item, i) => (
                <li key={i} className="text-text-secondary pl-5 relative py-2">
                  <span className="absolute left-0 text-gold/25">—</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 pt-4 border-t border-gold/15 italic text-text-muted">
              Map the distortion. Identify where judgement is slipping. Immediate stabilisation.
            </p>
          </div>

          {/* Month 2 */}
          <div className="mb-12 p-8 bg-navy-mid border-l-2 border-gold">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-[0.9rem] font-serif text-gold uppercase tracking-[0.1em]">Month 2</span>
              <span className="text-[1.5rem] font-serif text-text-primary">Operate</span>
            </div>
            <ul className="space-y-2 mb-6">
              {[
                "Two 45-minute sessions (fortnightly)",
                "Tactical decision support",
                "Live correction during pressure moments",
                "Continued async access"
              ].map((item, i) => (
                <li key={i} className="text-text-secondary pl-5 relative py-2">
                  <span className="absolute left-0 text-gold/25">—</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 pt-4 border-t border-gold/15 italic text-text-muted">
              Hold perspective during peak execution. Make cleaner calls faster. Signal over noise. Zero theatre.
            </p>
          </div>

          {/* Month 3 */}
          <div className="mb-12 p-8 bg-navy-mid border-l-2 border-gold">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-[0.9rem] font-serif text-gold uppercase tracking-[0.1em]">Month 3</span>
              <span className="text-[1.5rem] font-serif text-text-primary">Surface</span>
            </div>
            <ul className="space-y-2 mb-6">
              {[
                "Two 45-minute sessions (fortnightly)",
                "Repeat Pressure Audit",
                "Final reset and forward model",
                "30-day post-engagement check-in"
              ].map((item, i) => (
                <li key={i} className="text-text-secondary pl-5 relative py-2">
                  <span className="absolute left-0 text-gold/25">—</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 pt-4 border-t border-gold/15 italic text-text-muted">
              New clarity locked in. Early warning markers built.
            </p>
          </div>

          {/* Summary */}
          <div className="bg-navy-light p-8 mt-8 border border-gold/15">
            <p className="mb-0">
              <strong>Total:</strong> 7 sessions + async access + full diagnostic + 30-day follow-up
            </p>
          </div>
        </div>
      </section>

      {/* Investment Section */}
      <section className="py-24 bg-navy-mid">
        <div className="container max-w-[1000px]">
          <h2 className="text-[clamp(2rem,4vw,2.8rem)] font-serif text-gold mb-6">The Investment</h2>
          <p className="text-text-secondary mb-8">
            This work prevents drift from becoming damage. That's what the investment protects.
          </p>
          <div className="text-[5rem] font-serif text-gold leading-none mb-4">£3,000</div>
          <p className="text-text-secondary mb-8">For the complete 3-month engagement</p>
          
          <ul className="space-y-3 mb-12">
            {[
              "Serious enough to ensure you show up",
              "Accessible without board approval",
              "Room to go deeper if you need it"
            ].map((item, i) => (
              <li key={i} className="text-text-secondary pl-5 relative">
                <span className="absolute left-0 text-gold/25">—</span>
                {item}
              </li>
            ))}
          </ul>

          {/* 6-Month Option */}
          <div className="border-t border-gold/15 pt-12">
            <h3 className="text-[1.4rem] font-serif text-gold-light mb-4">The 6-Month Engagement</h3>
            <p className="text-text-secondary mb-4">
              For leaders navigating heavier waters — exits, raises, restructures, identity shifts.
            </p>
            <div className="text-[3.5rem] font-serif text-gold leading-none mb-4">£5,500</div>
            <p className="text-text-secondary mb-4">Same rhythm. Longer runway. Mid-point recalibration session.</p>
            <p className="text-text-muted italic">
              This version is for clients who need more than clarity. They need capacity.
            </p>
          </div>
        </div>
      </section>

      {/* What Makes This Different */}
      <section className="py-24 bg-navy-deep">
        <div className="container max-w-[1000px]">
          <h2 className="text-[clamp(2rem,4vw,2.8rem)] font-serif text-gold mb-8">What Makes This Different</h2>
          <div className="space-y-6 text-text-secondary">
            <p>I'm not guiding from theory.</p>
            <p>I've made life-or-death decisions at 150 metres.</p>
            <p>I've built and sold businesses.</p>
            <p>I've led teams across 52 countries.</p>
            <p>I've operated where pressure bends judgement long before people realise it's happening.</p>
            <p className="text-text-primary pt-4">
              This isn't coaching.<br/>
              It's recalibration from someone who has actually been at depth — and knows how to bring you back safely.
            </p>
            <p className="text-text-primary">
              This isn't advice-giving. It's thinking together — with someone who has carried real weight.
            </p>
            <p className="text-text-primary font-semibold pt-4">
              Your clarity will return. That's the outcome of this work.
            </p>
          </div>
        </div>
      </section>

      {/* Who You'd Be Working With */}
      <section className="py-24 bg-navy-mid">
        <div className="container max-w-[1000px]">
          <h2 className="text-[clamp(2rem,4vw,2.8rem)] font-serif text-gold mb-8">Who You'd Be Working With</h2>
          <h3 className="text-[1.4rem] font-serif text-gold-light mb-6">Patrick Voorma</h3>
          <div className="space-y-6 text-text-secondary">
            <p>
              Former Army Captain. Former PADI Territory Director across Europe, Middle East, and Africa. 
              Built and sold businesses across three continents — including South Africa's largest dive centre.
            </p>
            <p>
              Over 10,000 technical dives. Ten shipwrecks discovered. Decisions made at 150 metres where pressure 
              distorts judgement long before you feel it happening.
            </p>
            <p>
              A decade leading teams in 52 countries. A career built on operating clearly when the stakes were real.
            </p>
            <p className="text-text-primary">
              Now working with founders and senior leaders who need someone who understands pressure — not from a 
              textbook, but from lived experience.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-navy-deep">
          <div className="container max-w-[1000px]">
            <h2 className="text-[clamp(2rem,4vw,2.8rem)] font-serif text-gold mb-12">From Leaders Who've Been Here</h2>
            <div className="space-y-8">
              {testimonials.map((testimonial, i) => (
                <div 
                  key={testimonial.id} 
                  className="p-8 bg-navy-mid border-l-2 border-gold transition-all duration-300 hover:border-l-4 hover:translate-x-1 hover:shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
                >
                  <p className="text-text-secondary mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <p className="text-text-primary font-semibold">
                    {testimonial.authorRole}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-navy-mid">
        <div className="container max-w-[1000px] text-center">
          <h2 className="text-[clamp(2rem,4vw,2.8rem)] font-serif text-gold mb-6">Start the Conversation</h2>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
            A 30-minute call to see if this is the right fit. No pitch. No pressure. Just clarity on whether this makes sense for where you are.
          </p>
          <Link href="/book-call">
            <Button className="bg-gold hover:bg-gold-light text-navy-deep font-semibold px-8 py-4 text-lg rounded-[10px] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.25)]">
              Book a Call
            </Button>
          </Link>
          <p className="text-text-muted text-sm mt-6">
            Or email directly: <a href="mailto:patrick.voorma@thedeepbrief.co.uk" className="text-gold hover:text-gold-light border-b border-gold/35 hover:border-gold-light/60">patrick.voorma@thedeepbrief.co.uk</a>
          </p>
        </div>
      </section>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <StickyCTA 
        primaryText="Book a Call"
        primaryHref="/book-call"
        secondaryText="Get the Pressure Audit"
        secondaryHref="/assessment"
        showAfterScroll={600}
      />
      <ScrollToTop />
      <Footer />
    </div>
  );
}
