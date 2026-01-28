import { Navigation } from "@/components/Navigation";
import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
}

// Routes that have their own navigation/sidebar
const routesWithOwnNav = [
  '/ai-coach/dashboard',
  '/ai-coach/templates',
  '/ai-coach/subscribe',
  '/subscription-success',
  '/settings',
  '/admin',
];

export function Layout({ children, showNavigation = true }: LayoutProps) {
  const [location] = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);

  // Hide main navigation on routes that have their own nav
  const shouldHideNav = routesWithOwnNav.some(route => location.startsWith(route));

  return (
    <div className="min-h-screen bg-background">
      {showNavigation && !shouldHideNav && <Navigation />}
      {children}
    </div>
  );
}
