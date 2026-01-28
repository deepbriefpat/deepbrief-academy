import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Link, useLocation } from "wouter";
import { Menu, X, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const [location] = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="border-b border-gold-dim bg-navy-mid/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" onClick={closeMobileMenu}>
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-text-secondary hover:text-gold transition-colors">
              Home
            </Link>
            <Link href="/ai-coach" className="text-sm font-medium text-gold hover:text-gold-light transition-colors font-semibold">
              AI Coach
            </Link>
            <Link href="/assessment" className="text-sm font-medium text-text-secondary hover:text-gold transition-colors">
              Assessment
            </Link>
            <Link href="/leadership-pressure-profile" className="text-sm font-medium text-text-secondary hover:text-gold transition-colors">
              Pressure Profile
            </Link>
            <Link href="/clarity-under-pressure" className="text-sm font-medium text-text-secondary hover:text-gold transition-colors">
              Clarity Program
            </Link>
            <Link href="/resources" className="text-sm font-medium text-text-secondary hover:text-gold transition-colors">
              Resources
            </Link>
            <Link href="/about" className="text-sm font-medium text-text-secondary hover:text-gold transition-colors">
              About
            </Link>
            {user?.role === "admin" && (
              <Link href="/admin" className="text-sm font-medium text-turquoise hover:text-turquoise/80 transition-colors flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
            {!user && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-gold hover:text-gold-light hover:bg-gold/10 font-medium"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Sign In
              </Button>
            )}
            <Link href="/book-call">
              <Button size="sm" variant="outline" className="border-gold text-gold hover:bg-gold hover:text-navy-deep font-medium">
                Book a Call
              </Button>
            </Link>
            <Link href="/assessment">
              <Button size="sm" className="bg-gold hover:bg-gold-light text-navy-deep font-semibold">
                Take Assessment
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gold hover:text-gold-light transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed inset-0 top-[73px] transition-transform duration-300 ease-in-out ${
            mobileMenuOpen
              ? "translate-x-0 pointer-events-auto"
              : "translate-x-full pointer-events-none"
          }`}
          style={{ zIndex: 9999, backgroundColor: '#0a1628' }}
        >
          <div className="container mx-auto px-4 py-8" style={{ backgroundColor: '#0a1628' }}>
            <div className="flex flex-col gap-6" style={{ backgroundColor: '#0a1628' }}>
              <Link
                href="/"
                className="text-lg font-medium text-text-secondary hover:text-gold transition-colors py-2 border-b border-gold-dim/30"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              <Link
                href="/ai-coach"
                className="text-lg font-medium text-gold hover:text-gold-light transition-colors py-2 border-b border-gold-dim/30 font-semibold"
                onClick={closeMobileMenu}
              >
                AI Coach
              </Link>
              <Link
                href="/assessment"
                className="text-lg font-medium text-text-secondary hover:text-gold transition-colors py-2 border-b border-gold-dim/30"
                onClick={closeMobileMenu}
              >
                Assessment
              </Link>
              <Link
                href="/leadership-pressure-profile"
                className="text-lg font-medium text-text-secondary hover:text-gold transition-colors py-2 border-b border-gold-dim/30"
                onClick={closeMobileMenu}
              >
                Pressure Profile
              </Link>
              <Link
                href="/clarity-under-pressure"
                className="text-lg font-medium text-text-secondary hover:text-gold transition-colors py-2 border-b border-gold-dim/30"
                onClick={closeMobileMenu}
              >
                Clarity Program
              </Link>
              <Link
                href="/resources"
                className="text-lg font-medium text-text-secondary hover:text-gold transition-colors py-2 border-b border-gold-dim/30"
                onClick={closeMobileMenu}
              >
                Resources
              </Link>
              <Link
                href="/about"
                className="text-lg font-medium text-text-secondary hover:text-gold transition-colors py-2 border-b border-gold-dim/30"
                onClick={closeMobileMenu}
              >
                About
              </Link>
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-lg font-medium text-turquoise hover:text-turquoise/80 transition-colors py-2 border-b border-gold-dim/30 flex items-center gap-2"
                  onClick={closeMobileMenu}
                >
                  <Shield className="h-5 w-5" />
                  Admin
                </Link>
              )}
              {!user && (
                <Button 
                  size="lg" 
                  variant="ghost" 
                  className="w-full text-gold hover:text-gold-light hover:bg-gold/10 font-medium mb-2"
                  onClick={() => {
                    closeMobileMenu();
                    window.location.href = getLoginUrl();
                  }}
                >
                  Sign In
                </Button>
              )}
              <Link href="/book-call" onClick={closeMobileMenu}>
                <Button size="lg" variant="outline" className="w-full border-gold text-gold hover:bg-gold hover:text-navy-deep font-medium mb-2">
                  Book a Call
                </Button>
              </Link>
              <Link href="/assessment" onClick={closeMobileMenu}>
                <Button size="lg" className="w-full bg-gold hover:bg-gold-light text-navy-deep font-semibold">
                  Take Assessment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
