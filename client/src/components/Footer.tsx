import { Logo } from "@/components/Logo";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-navy-mid border-t border-gold-dim">
      <div className="container py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Logo className="mb-4" />
            <p className="text-sm text-text-secondary mt-4">
              Leadership clarity under pressure. Built on insights from deep-sea diving and founder experience.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gold mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Core</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ai-coach" className="text-text-secondary hover:text-gold transition-colors">
                  AI Executive Coach
                </Link>
              </li>
              <li>
                <Link href="/assessment" className="text-text-secondary hover:text-gold transition-colors">
                  Pressure Audit
                </Link>
              </li>
              <li>
                <Link href="/clarity-under-pressure" className="text-text-secondary hover:text-gold transition-colors">
                  Clarity Program
                </Link>
              </li>
              <li>
                <Link href="/calm-protocol" className="text-text-secondary hover:text-gold transition-colors">
                  C.A.L.M. Protocol
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-text-secondary hover:text-gold transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gold mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/stories" className="text-text-secondary hover:text-gold transition-colors">
                  Diving Stories
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-text-secondary hover:text-gold transition-colors">
                  Peer Support
                </Link>
              </li>
              <li>
                <Link href="/reflection" className="text-text-secondary hover:text-gold transition-colors">
                  Reflection Tool
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-text-secondary hover:text-gold transition-colors">
                  About Patrick
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gold mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/book-call" className="text-text-secondary hover:text-gold transition-colors">
                  Book a Call
                </Link>
              </li>
              <li>
                <a 
                  href="https://www.linkedin.com/in/patrick-voorma" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-gold transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-text-secondary hover:text-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-text-secondary hover:text-gold transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gold-dim text-center">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} The Deep Brief. Created by Patrick Voorma.
          </p>
          <p className="text-sm text-gold mt-2 quote-italic">
            Stay deep. Lead clear.
          </p>
        </div>
      </div>
    </footer>
  );
}
