import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function Unsubscribe() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error" | "not_found">("loading");

  const unsubscribeMutation = trpc.emailPreferences.unsubscribe.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setStatus("success");
      } else {
        setStatus("not_found");
      }
    },
    onError: () => {
      setStatus("error");
    },
  });

  useEffect(() => {
    // Get token from URL query parameter
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");

    if (!tokenParam) {
      setStatus("error");
      return;
    }
    
    // Automatically unsubscribe using token
    unsubscribeMutation.mutate({ token: tokenParam });
  }, []);

  useEffect(() => {
    document.title = "Unsubscribe | The Deep Brief";
  }, []);

  return (
    <div className="min-h-screen bg-navy-deep flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-gold mb-2">The Deep Brief</h1>
          <p className="text-text-secondary text-sm">Email Preferences</p>
        </div>

        <div className="bg-navy-mid border border-gold-dim/30 rounded-lg p-8">
          {status === "loading" && (
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-gold animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">Processing...</h2>
              <p className="text-text-secondary">Updating your email preferences</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">You've been unsubscribed</h2>
              <p className="text-text-secondary mb-6">
                {email && (
                  <>
                    <span className="text-gold">{email}</span> has been removed from our mailing list.
                  </>
                )}
              </p>
              <p className="text-text-secondary text-sm mb-6">
                You won't receive any more emails from us. If this was a mistake, you can always resubscribe by signing up again on our website.
              </p>
              <Link href="/">
                <Button className="bg-gold hover:bg-gold-light text-navy-deep font-semibold">
                  Return to Homepage
                </Button>
              </Link>
            </div>
          )}

          {status === "not_found" && (
            <div className="text-center">
              <XCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">Email not found</h2>
              <p className="text-text-secondary mb-6">
                {email && (
                  <>
                    <span className="text-gold">{email}</span> is not in our mailing list.
                  </>
                )}
              </p>
              <p className="text-text-secondary text-sm mb-6">
                You may have already unsubscribed, or this email was never subscribed to our list.
              </p>
              <Link href="/">
                <Button className="bg-gold hover:bg-gold-light text-navy-deep font-semibold">
                  Return to Homepage
                </Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">Something went wrong</h2>
              <p className="text-text-secondary mb-6">
                We couldn't process your unsubscribe request. This might be due to an invalid link or a technical issue.
              </p>
              <p className="text-text-secondary text-sm mb-6">
                If you continue to receive emails and want to unsubscribe, please contact us directly.
              </p>
              <Link href="/">
                <Button className="bg-gold hover:bg-gold-light text-navy-deep font-semibold">
                  Return to Homepage
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-text-secondary text-sm">
            Have questions? <a href="mailto:patrick@thedeepbrief.co.uk" className="text-gold hover:text-gold-light">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
}
