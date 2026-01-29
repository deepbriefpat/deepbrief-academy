import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  
  const googleLoginMutation = trpc.auth.googleLogin.useMutation({
    onSuccess: () => {
      // Redirect to dashboard on success
      setLocation("/ai-coach/dashboard");
    },
    onError: (err) => {
      setError(err.message || "Authentication failed");
    },
  });

  useEffect(() => {
    // Get the authorization code from URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    
    if (!code) {
      setError("No authorization code received");
      return;
    }

    // Exchange code for token on the server
    // For now, we'll redirect to a server endpoint that handles the exchange
    window.location.href = `/api/auth/google/callback?code=${code}`;
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-deep">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-gold mb-4">Authentication Error</h1>
          <p className="text-text-secondary mb-6">{error}</p>
          <a href="/" className="text-gold hover:underline">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-deep">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin mx-auto mb-4" />
        <p className="text-text-secondary">Completing sign in...</p>
      </div>
    </div>
  );
}
