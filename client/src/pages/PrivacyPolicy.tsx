import { Link } from "wouter";
import { Waves } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container py-8">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Waves className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">The Deep Brief</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container py-12 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Introduction</h2>
            <p className="text-muted-foreground mb-4">
              The Deep Brief ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and AI coaching services.
            </p>
            <p className="text-muted-foreground">
              By using The Deep Brief, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Personal Information</h3>
            <p className="text-muted-foreground mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-6">
              <li>Name and email address (for account creation and communication)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Profile information (role, industry, leadership context)</li>
              <li>Coaching session content (messages, commitments, goals)</li>
              <li>Assessment responses and pressure profile data</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3">Usage Data</h3>
            <p className="text-muted-foreground mb-4">
              We automatically collect certain information when you use our services:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Device information (browser type, operating system)</li>
              <li>Usage patterns (pages visited, features used, session duration)</li>
              <li>IP address and approximate location</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide and improve our AI coaching services</li>
              <li>Personalize your coaching experience based on your context and history</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send service-related communications (session summaries, commitment reminders)</li>
              <li>Analyze usage patterns to improve our product</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and ensure platform security</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Service Providers:</strong> We use third-party services (Stripe for payments, OpenAI/Anthropic for AI processing, email service providers) who process data on our behalf</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In the event of a merger or acquisition, your information may be transferred</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">AI Processing and Coaching Data</h2>
            <p className="text-muted-foreground mb-4">
              Your coaching conversations are processed by third-party AI providers (OpenAI, Anthropic) to generate responses. These providers have their own privacy policies and data handling practices:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Coaching conversations are sent to AI providers for processing</li>
              <li>We retain conversation history to provide context and track commitments</li>
              <li>AI providers may use conversations to improve their models (check their policies for opt-out options)</li>
              <li>We do not share your coaching conversations with other users or third parties for marketing</li>
            </ul>
            <p className="text-muted-foreground">
              <strong>Important:</strong> Do not share highly sensitive personal information (financial account details, passwords, medical records) in coaching sessions.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your information, including encryption in transit (HTTPS), secure database storage, and access controls. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Your Rights (GDPR/UK GDPR)</h2>
            <p className="text-muted-foreground mb-4">
              If you are in the UK or EU, you have the following rights:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
              <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to certain types of processing</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, contact us at <a href="mailto:privacy@thedeepbrief.co.uk" className="text-primary hover:underline">privacy@thedeepbrief.co.uk</a>
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your personal information for as long as your account is active or as needed to provide services. After account deletion, we may retain certain information for legal compliance, fraud prevention, and legitimate business purposes. Coaching session data is retained to provide continuity and pattern detection unless you request deletion.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Cookies</h2>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Maintain your login session</li>
              <li>Remember your preferences</li>
              <li>Analyze site usage (Google Analytics)</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              You can control cookies through your browser settings, but disabling them may affect functionality.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our services are not intended for individuals under 18. We do not knowingly collect information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our website. Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about this Privacy Policy or our data practices, contact us at:
            </p>
            <div className="text-muted-foreground">
              <p><strong>Email:</strong> <a href="mailto:privacy@thedeepbrief.co.uk" className="text-primary hover:underline">privacy@thedeepbrief.co.uk</a></p>
              <p className="mt-2"><strong>Address:</strong> The Deep Brief, United Kingdom</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
