import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Trash2 } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  isGuestPass?: boolean;
}

export function WelcomeModal({ open, onClose, isGuestPass = false }: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-cream">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-sage-darkest">
            {isGuestPass ? "You're In" : "Welcome"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sage-dark">
          {/* Opening - Grounded and Steady */}
          <div>
            <p className="text-base leading-relaxed text-sage-darkest">
              If you're here, something in your thinking has started to feel heavier than it used to.
            </p>
          </div>

          {/* What This Is - Lived Experience */}
          <div>
            <h3 className="text-lg font-semibold text-sage-darkest mb-3">
              What This Is
            </h3>
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                This isn't ChatGPT with a prompt. It's trained from real pressure situations—the kind where getting it wrong meant people died. As an Army Captain during civil unrest. As a technical diver at 70 metres where a bad decision doesn't give you a second chance.
              </p>
              <p>
                I've seen the same distortion at depth and in boardrooms. Different environments. Same physics.
              </p>
              <p>
                This system is built to locate where pressure is distorting your judgement before anything looks broken on the outside.
              </p>
            </div>
          </div>

          {/* What This Isn't */}
          <div>
            <h3 className="text-lg font-semibold text-sage-darkest mb-3">
              What This Isn't
            </h3>
            <ul className="space-y-2 text-sm leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-sage-darkest mt-0.5">•</span>
                <span><strong className="text-sage-darkest">Not affirmation.</strong> You'll get challenged, not validated.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sage-darkest mt-0.5">•</span>
                <span><strong className="text-sage-darkest">Not therapy.</strong> This is tactical coaching for business decisions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sage-darkest mt-0.5">•</span>
                <span><strong className="text-sage-darkest">Not a magic solution.</strong> It won't make decisions for you—it helps you see where your thinking is compromised.</span>
              </li>
            </ul>
          </div>

          {/* Privacy & Confidentiality */}
          <div className="bg-sage/10 border border-sage-dark/20 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-sage-darkest mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-sage-darkest" />
              Your Data
            </h3>
            <div className="space-y-3 text-sm leading-relaxed">
              <div className="flex items-start gap-3">
                <Lock className="h-4 w-4 text-sage-darkest flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sage-darkest">Complete confidentiality.</p>
                  <p className="text-sage-dark">
                    No one can see your sessions. Not me. Not anyone.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="h-4 w-4 text-sage-darkest flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sage-darkest">Encrypted at rest and in transit.</p>
                  <p className="text-sage-dark">
                    Industry-standard encryption. Your conversations stay yours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Trash2 className="h-4 w-4 text-sage-darkest flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-sage-darkest">You control it.</p>
                  <p className="text-sage-dark">
                    Delete your account and all data at any time from settings. No questions asked.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-sage-dark/20 rounded p-3 mt-4">
                <p className="text-xs text-sage-dark">
                  The AI processes your conversations to provide coaching. Your data never leaves our secure infrastructure and is never used to train other models or shared with third parties.
                </p>
              </div>
            </div>
          </div>

          {/* Guest Pass Specific */}
          {isGuestPass && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900 font-semibold mb-1">
                Your guest pass is active.
              </p>
              <p className="text-sm text-green-800">
                Full access to all coaching features. Start a session and see if this helps you think more clearly under pressure.
              </p>
            </div>
          )}

          {/* CTA Button */}
          <div className="flex justify-end pt-4 border-t border-sage-dark/20">
            <Button
              onClick={onClose}
              className="bg-sage-dark hover:bg-sage-darkest text-white px-8"
            >
              {isGuestPass ? "Start Session" : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
