import { Link } from "wouter";
import { Waves } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container py-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Waves className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">The Deep Brief</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using The Deep Brief ("Service", "Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use our Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Description of Service</h2>
            <p className="text-muted-foreground mb-4">
              The Deep Brief provides AI-powered executive coaching services, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>24/7 AI coaching conversations using the C.A.L.M. Protocol</li>
              <li>Leadership pressure assessment and profiling</li>
              <li>Commitment tracking and pattern detection</li>
              <li>Session history and progress analytics</li>
              <li>Resources and frameworks for pressure management</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Eligibility</h2>
            <p className="text-muted-foreground">
              You must be at least 18 years old to use this Service. By using the Service, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Account Registration</h2>
            <p className="text-muted-foreground mb-4">
              To access certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Subscription and Payment</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Pricing</h3>
            <p className="text-muted-foreground mb-4">
              Subscription pricing is £19.95/month (or as displayed at the time of purchase). Prices are subject to change with 30 days' notice.
            </p>

            <h3 className="text-xl font-semibold mb-3">Billing</h3>
            <p className="text-muted-foreground mb-4">
              Subscriptions are billed monthly in advance. Payment is processed through Stripe. By subscribing, you authorize us to charge your payment method on a recurring basis.
            </p>

            <h3 className="text-xl font-semibold mb-3">Free Trial</h3>
            <p className="text-muted-foreground mb-4">
              New users receive 10 free coaching interactions. After the trial, you must subscribe to continue using the Service.
            </p>

            <h3 className="text-xl font-semibold mb-3">Cancellation</h3>
            <p className="text-muted-foreground mb-4">
              You may cancel your subscription at any time through your account settings or the Stripe Customer Portal. Cancellation takes effect at the end of the current billing period. No refunds are provided for partial months.
            </p>

            <h3 className="text-xl font-semibold mb-3">Refund Policy</h3>
            <p className="text-muted-foreground">
              We offer a 14-day money-back guarantee for first-time subscribers. To request a refund, contact us at <a href="mailto:support@thedeepbrief.co.uk" className="text-primary hover:underline">support@thedeepbrief.co.uk</a> within 14 days of your initial payment.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Reverse engineer, decompile, or extract the source code of our AI models</li>
              <li>Use automated tools (bots, scrapers) to access the Service</li>
              <li>Share your account credentials with others</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Harass, abuse, or harm others through the Service</li>
              <li>Use the Service to generate spam or unsolicited communications</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">AI Coaching Disclaimer</h2>
            <p className="text-muted-foreground mb-4">
              <strong>Important:</strong> The Deep Brief provides AI-powered coaching, not professional medical, psychological, legal, or financial advice.
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Our AI coach is a tool for reflection and decision-making support, not a replacement for licensed professionals</li>
              <li>If you are experiencing mental health crisis, suicidal thoughts, or severe distress, contact emergency services or a mental health professional immediately</li>
              <li>Do not rely solely on AI coaching for critical business, legal, or financial decisions</li>
              <li>AI responses may contain errors or inaccuracies; use your judgment</li>
              <li>We are not liable for decisions you make based on AI coaching conversations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              The Service, including all content, features, and functionality, is owned by The Deep Brief and protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-muted-foreground mb-4">
              You retain ownership of the content you create (coaching conversations, commitments, notes). By using the Service, you grant us a license to process and store this content to provide the Service.
            </p>
            <p className="text-muted-foreground">
              You may not copy, modify, distribute, or create derivative works from our content without permission.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              To the fullest extent permitted by law:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>The Service is provided "as is" without warranties of any kind</li>
              <li>We do not guarantee uninterrupted, error-free, or secure access</li>
              <li>We are not liable for any indirect, incidental, consequential, or punitive damages</li>
              <li>Our total liability is limited to the amount you paid in the 12 months preceding the claim</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold harmless The Deep Brief, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Termination</h2>
            <p className="text-muted-foreground mb-4">
              We may suspend or terminate your access to the Service at any time for:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Violation of these Terms</li>
              <li>Fraudulent or illegal activity</li>
              <li>Non-payment of subscription fees</li>
              <li>Any reason at our sole discretion</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Upon termination, your right to use the Service ceases immediately. We may delete your account data after termination, subject to our data retention policies.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. We will notify you of material changes by email or through a prominent notice on the Service. Continued use after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of England and Wales. Any disputes will be resolved in the courts of England and Wales.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about these Terms, contact us at:
            </p>
            <div className="text-muted-foreground">
              <p><strong>Email:</strong> <a href="mailto:support@thedeepbrief.co.uk" className="text-primary hover:underline">support@thedeepbrief.co.uk</a></p>
              <p className="mt-2"><strong>Address:</strong> The Deep Brief, United Kingdom</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
