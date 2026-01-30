import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Waves, Calendar, Mail } from "lucide-react";
import { Link } from "wouter";

// Calendly now embedded on /book-call page

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
            <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-8">
              <img 
                src="/Patrickheadshot.webp" 
                alt="Patrick Voorma" 
                className="rounded-full w-32 h-32 object-cover shadow-xl"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground mb-4">
              Book a pressure audit feedback call or learn more about peer groups
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Patrick Voorma brings insights from building South Africa's biggest dive centre, serving as a military officer, discovering ten shipwrecks, and leading corporate teams across 52 countries.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Book a Call</CardTitle>
                <CardDescription>
                  Schedule a 30-minute conversation to discuss your pressure audit results or learn about peer groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/book-call">
                  <Button className="w-full" size="lg">
                    Schedule on Calendly
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-4">
                  Choose a time that works for you. You'll receive a confirmation email with meeting details.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Mail className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Email Directly</CardTitle>
                <CardDescription>
                  Prefer to reach out via email? Send a message directly to Patrick
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a href="mailto:patrick@thedeepbrief.co.uk">
                  <Button variant="outline" className="w-full" size="lg">
                    patrick@thedeepbrief.co.uk
                  </Button>
                </a>
                <p className="text-sm text-muted-foreground mt-4">
                  We typically respond within 24 hours.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>What to Expect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Pressure Audit Feedback Call (30 min)</h3>
                <p className="text-muted-foreground">
                  We'll review your assessment results, identify your highest-pressure dimensions, and create a personalized protocol for surfacing. You'll leave with clarity on where pressure is distorting your judgment and specific steps to restore signal.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Peer Group Consultation (30 min)</h3>
                <p className="text-muted-foreground">
                  Learn how founder peer groups work, whether they're right for you, and how to join or start one. We'll discuss the structure, commitment, and what makes these groups different from typical networking or coaching.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">General Inquiry</h3>
                <p className="text-muted-foreground">
                  Have questions about Patrick's work, speaking engagements, or something else? Book a call or send an email and we'll figure out how to help.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
