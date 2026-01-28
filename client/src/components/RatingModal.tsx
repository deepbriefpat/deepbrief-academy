import { useState } from "react";
import { Star, X, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RatingModalProps {
  open: boolean;
  onClose: () => void;
  coachName: string;
  onSubmit: (rating: number, feedback: string) => void;
}

export function RatingModal({ open, onClose, coachName, onSubmit }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, feedback);
      setSubmitted(true);
    }
  };
  
  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setFeedback("");
    setSubmitted(false);
    onClose();
  };
  
  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="bg-navy-mid border-gold-dim max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-gold text-center">
              Thank You! 🎉
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-center pt-4">
              Your feedback helps us improve the coaching experience.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            <div className="text-center space-y-4">
              <p className="text-white">
                Ready to unlock unlimited coaching conversations and personalized goal tracking?
              </p>
              
              <div className="bg-navy-light border border-gold-dim rounded-lg p-6 space-y-3">
                <div className="text-gold font-semibold text-lg">£19.95/month</div>
                <div className="text-sm text-gray-400">3-day free trial • Cancel anytime</div>
                <ul className="text-sm text-gray-300 space-y-2 text-left">
                  <li>✓ Unlimited coaching conversations</li>
                  <li>✓ Personalized goal tracking</li>
                  <li>✓ Templates & playbooks library</li>
                  <li>✓ Growth insights & analytics</li>
                </ul>
              </div>
              
              <Link href="/ai-coach">
                <Button className="w-full bg-gold text-navy-deep hover:bg-gold/90 font-semibold">
                  Start 3-Day Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                onClick={handleClose}
                className="w-full text-gray-400 hover:text-white"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-navy-mid border-gold-dim max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-gold">
            How was your experience?
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Rate your coaching session with {coachName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Star Rating */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoveredRating || rating)
                      ? "fill-gold text-gold"
                      : "text-gray-600"
                  }`}
                />
              </button>
            ))}
          </div>
          
          {rating > 0 && (
            <div className="text-center text-sm text-gray-400">
              {rating === 5 && "Excellent! 🌟"}
              {rating === 4 && "Great! 😊"}
              {rating === 3 && "Good 👍"}
              {rating === 2 && "Could be better 🤔"}
              {rating === 1 && "Needs improvement 😕"}
            </div>
          )}
          
          {/* Optional Feedback */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">
              Any feedback or suggestions? (Optional)
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you think..."
              className="bg-navy-light border-gold-dim text-white placeholder:text-gray-500 min-h-[100px]"
            />
          </div>
          
          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-navy-light"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0}
              className="flex-1 bg-gold text-navy-deep hover:bg-gold/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Rating
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
