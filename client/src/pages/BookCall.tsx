import { useEffect } from "react";
import { Link } from "wouter";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

export default function BookCall() {
  useEffect(() => {
    // Load Calendly script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container py-8">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Book a Clarity Call</h1>
          <p className="text-lg text-muted-foreground">
            This isn't a sales conversation. It's a clarity conversation.
          </p>
        </div>
      </header>

      {/* AI Coach Alternative Banner */}
      <div className="bg-green-900/20 border-y border-green-500/30">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-1">
                Not ready to talk to a human yet?
              </h3>
              <p className="text-text-secondary text-sm">
                Try the AI Executive Coach first — available 24/7, no scheduling required. 10 free coaching interactions.
              </p>
            </div>
            <Link href="/ai-coach">
              <button className="whitespace-nowrap px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
                Try AI Coach Free
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <div className="container py-12">
          <div className="grid lg:grid-cols-2 gap-12 min-h-[900px]">
            
            {/* Left Column - Context */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                  What This Is
                </h3>
                <p className="text-muted-foreground">
                  30 minutes to talk about where you are, what's pressing, and whether this work makes sense for you.
                </p>
                <p className="text-muted-foreground">
                  If it does, we'll talk about next steps. If it doesn't, you'll still leave with something useful.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                  What to Expect
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <span>No pitch. No pressure.</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <span>Direct conversation about what's actually happening</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <span>Honest assessment of whether I can help</span>
                  </li>
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                    <span>Clarity on next steps — either way</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                  What I Ask of You
                </h3>
                <p className="text-muted-foreground">
                  Come ready to be honest. That's all this requires.
                </p>
                <p className="text-muted-foreground">
                  The more clearly you can describe what's shifted, the more useful our conversation will be.
                </p>
              </div>

              <div className="bg-card border-l-2 border-primary p-6 italic text-lg font-serif">
                Everything discussed stays between us.<br />
                Some clients choose to remain anonymous. That's always respected.
              </div>
            </div>

            {/* Right Column - Calendly */}
            <div className="bg-card rounded-lg overflow-hidden min-h-[900px]">
              <div 
                className="calendly-inline-widget" 
                data-url="https://calendly.com/patrick-thedeepbrief/30min?hide_gdpr_banner=1&hide_event_type_details=1&background_color=0f1f35&text_color=e8e6e1&primary_color=c9a962"
                style={{ minHeight: "900px", height: "100%" }}
              />
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
