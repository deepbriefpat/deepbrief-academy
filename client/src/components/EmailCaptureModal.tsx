import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function EmailCaptureModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [hasShown, setHasShown] = useState(false);
  const subscribeEmail = trpc.emailCapture.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Check your email for the Pressure Management Guide.");
      setIsOpen(false);
      localStorage.setItem("emailCaptured", "true");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to subscribe. Please try again.");
    },
  });

  useEffect(() => {
    // Check if user has already provided email
    const emailCaptured = localStorage.getItem("emailCaptured");
    if (emailCaptured || hasShown) return;

    // Show after 30 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasShown(true);
    }, 30000);

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown && !emailCaptured) {
        setIsOpen(true);
        setHasShown(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasShown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    subscribeEmail.mutate({ email });
  };

  const handleClose = () => {
    setIsOpen(false);
    // Don't show again this session
    sessionStorage.setItem("emailModalDismissed", "true");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-navy-mid border-gold">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-gold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Free Pressure Management Guide
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Get practical strategies for maintaining clarity under pressure. 
            Download our free guide and join leaders who've moved from overwhelm to clarity.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-navy-deep border-gold-dim focus:border-gold"
          />
          
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-gold hover:bg-gold-light text-navy-deep font-semibold"
              disabled={subscribeEmail.isPending}
            >
              {subscribeEmail.isPending ? "Sending..." : "Get the Guide"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-gold-dim hover:bg-navy-deep"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <p className="text-xs text-text-secondary text-center mt-2">
          We respect your privacy. Unsubscribe anytime.
        </p>
      </DialogContent>
    </Dialog>
  );
}
