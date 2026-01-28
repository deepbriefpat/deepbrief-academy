import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClarityBooking() {
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-navy-deep">
      {/* Header */}
      <header className="border-b border-gold-dim py-12">
        <div className="container max-w-6xl">
          <h1 className="text-4xl md:text-5xl font-serif mb-6 animate-fade-up">Book a Clarity Call</h1>
          <p className="text-text-secondary max-w-2xl animate-fade-up [animation-delay:0.2s] opacity-0 [animation-fill-mode:forwards]">
            This isn't a sales conversation. It's a clarity conversation.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-16">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-2 gap-16 min-h-[900px]">
            
            {/* Left Column - Context */}
            <div className="space-y-12 pt-4">
              <Card className="border-none bg-transparent shadow-none animate-fade-up [animation-delay:0.2s] opacity-0 [animation-fill-mode:forwards]">
                <CardHeader>
                  <CardTitle className="text-xs uppercase tracking-[0.1em] text-gold font-semibold mb-4">
                    What This Is
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-text-secondary">
                    30 minutes to talk about where you are, what's pressing, and whether this work makes sense for you.
                  </p>
                  <p className="text-text-secondary">
                    If it does, we'll talk about next steps. If it doesn't, you'll still leave with something useful.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none bg-transparent shadow-none animate-fade-up [animation-delay:0.4s] opacity-0 [animation-fill-mode:forwards]">
                <CardHeader>
                  <CardTitle className="text-xs uppercase tracking-[0.1em] text-gold font-semibold mb-4">
                    What to Expect
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      "No pitch. No pressure.",
                      "Direct conversation about what's actually happening",
                      "Honest assessment of whether I can help",
                      "Clarity on next steps — either way"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-text-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-none bg-transparent shadow-none animate-fade-up [animation-delay:0.6s] opacity-0 [animation-fill-mode:forwards]">
                <CardHeader>
                  <CardTitle className="text-xs uppercase tracking-[0.1em] text-gold font-semibold mb-4">
                    What I Ask of You
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-text-secondary">
                    Come ready to be honest. That's all this requires.
                  </p>
                  <p className="text-text-secondary">
                    The more clearly you can describe what's shifted, the more useful our conversation will be.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-navy-mid border-l-2 border-l-gold animate-fade-up [animation-delay:0.6s] opacity-0 [animation-fill-mode:forwards]">
                <CardContent className="pt-6">
                  <p className="text-lg italic font-serif text-text-primary">
                    Everything discussed stays between us.<br/>
                    Some clients choose to remain anonymous. That's always respected.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Calendly */}
            <div className="bg-navy-mid rounded min-h-[900px] animate-fade-up [animation-delay:0.4s] opacity-0 [animation-fill-mode:forwards]">
              <div 
                className="calendly-inline-widget" 
                data-url="https://calendly.com/patrick-thedeepbrief/30min?hide_gdpr_banner=1&hide_event_type_details=1&background_color=0f1f35&text_color=e8e6e1&primary_color=c9a962"
                style={{ minHeight: '900px', height: '100%' }}
              />
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gold-dim py-8 text-center">
        <div className="container">
          <p className="text-text-muted text-sm">
            Patrick Voorma · <a href="https://www.linkedin.com/in/patrick-voorma" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light">LinkedIn</a> · <a href="/" className="text-gold hover:text-gold-light">The Deep Brief</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
