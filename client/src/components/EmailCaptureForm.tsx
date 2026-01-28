import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Mail, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface EmailCaptureFormProps {
  source: "assessment_results" | "booking_confirmation" | "general" | "calm_protocol";
  depthLevel?: string;
}

export function EmailCaptureForm({ source, depthLevel }: EmailCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const subscribeMutation = trpc.emailSubscriber.subscribe.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Success! Check your inbox for your follow-up resources.");
    },
    onError: (error) => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    subscribeMutation.mutate({ email, name: name || undefined, source });
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-gold mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">You're all set!</h3>
        <p className="text-text-secondary">
          Check your inbox for personalized resources based on your {depthLevel || "profile"}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-navy-deep border-gold-dim"
          />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-navy-deep border-gold-dim"
          />
        </div>
      </div>
      <Button 
        type="submit" 
        className="w-full bg-gold hover:bg-gold-light text-navy-deep font-semibold"
        disabled={subscribeMutation.isPending}
      >
        <Mail className="w-4 h-4 mr-2" />
        {subscribeMutation.isPending ? "Subscribing..." : "Get My Resources"}
      </Button>
      <p className="text-xs text-text-muted text-center">
        No spam. Unsubscribe anytime. We respect your inbox.
      </p>
    </form>
  );
}
