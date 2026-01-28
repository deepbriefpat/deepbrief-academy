import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Copy, Download, X, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { exportSummaryToPDF } from "@/lib/pdfExport";

interface SessionSummaryData {
  userName: string;
  sessionDate: string;
  keyThemes: string[];
  patrickObservation: string;
  nextSessionPrompt: string;
  commitments: Array<{
    action: string;
    context?: string;
    deadline?: string;
  }>;
}

interface SessionSummaryModalProps {
  open: boolean;
  onClose: () => void;
  summary: SessionSummaryData;
}

export function SessionSummaryModal({ open, onClose, summary }: SessionSummaryModalProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareNote, setShareNote] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const formatSummaryAsText = () => {
    let text = `COACHING SESSION SUMMARY\n`;
    text += `${summary.sessionDate}\n\n`;
    
    text += `KEY THEMES\n`;
    summary.keyThemes.forEach((theme, i) => {
      text += `${i + 1}. ${theme}\n`;
    });
    
    text += `\nPATRICK'S OBSERVATION\n`;
    text += `${summary.patrickObservation}\n\n`;
    
    text += `NEXT SESSION\n`;
    text += `${summary.nextSessionPrompt}\n\n`;
    
    if (summary.commitments.length > 0) {
      text += `COMMITMENTS\n`;
      summary.commitments.forEach((c, i) => {
        text += `${i + 1}. ${c.action}`;
        if (c.deadline) text += ` (by ${c.deadline})`;
        if (c.context) text += `\n   ${c.context}`;
        text += `\n`;
      });
    }
    
    return text;
  };

  const handleEmailToMe = () => {
    const subject = encodeURIComponent(`Coaching Session Summary - ${summary.sessionDate}`);
    const body = encodeURIComponent(formatSummaryAsText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success("Opening your email client...");
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formatSummaryAsText());
      toast.success("Summary copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownloadPDF = () => {
    try {
      exportSummaryToPDF(summary);
      toast.success("PDF downloaded!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const shareSummaryMutation = trpc.aiCoach.shareSummary.useMutation();

  const handleShareSummary = async () => {
    if (!shareEmail) {
      toast.error("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shareEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSharing(true);
    try {
      await shareSummaryMutation.mutateAsync({
        recipientEmail: shareEmail,
        summary,
        personalNote: shareNote || undefined,
      });
      toast.success("Summary shared successfully!");
      setShowShareDialog(false);
      setShareEmail("");
      setShareNote("");
    } catch (error) {
      console.error("Failed to share summary:", error);
      toast.error("Failed to share summary. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#FDFCF8]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-[#0A1628]">
            Session Summary
          </DialogTitle>
          <p className="text-sm text-[#4A5568] mt-1">{summary.sessionDate}</p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Key Themes */}
          <div>
            <h3 className="text-lg font-semibold text-[#0A1628] mb-3">Key Themes</h3>
            <ul className="space-y-2">
              {summary.keyThemes.map((theme, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#4A6741] font-semibold mt-0.5">{index + 1}.</span>
                  <span className="text-[#2D3748]">{theme}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Patrick's Observation */}
          <div className="bg-[#F7F5F0] p-4 rounded-lg border-l-4 border-[#4A6741]">
            <h3 className="text-lg font-semibold text-[#0A1628] mb-2">Patrick's Observation</h3>
            <p className="text-[#2D3748] leading-relaxed">{summary.patrickObservation}</p>
          </div>

          {/* Next Session Prompt */}
          <div className="bg-[#E8F4F8] p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-[#0A1628] mb-2">Before Next Session</h3>
            <p className="text-[#2D3748] leading-relaxed">{summary.nextSessionPrompt}</p>
          </div>

          {/* Commitments */}
          {summary.commitments.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-[#0A1628] mb-3">Your Commitments</h3>
              <div className="space-y-3">
                {summary.commitments.map((commitment, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-[#E2E8F0]">
                    <div className="flex items-start gap-2">
                      <span className="text-[#4A6741] font-semibold mt-0.5">{index + 1}.</span>
                      <div className="flex-1">
                        <p className="text-[#2D3748] font-medium">{commitment.action}</p>
                        {commitment.context && (
                          <p className="text-sm text-[#718096] mt-1">{commitment.context}</p>
                        )}
                        {commitment.deadline && (
                          <p className="text-sm text-[#4A6741] mt-1">Due: {commitment.deadline}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-[#E2E8F0]">
            <Button
              onClick={handleEmailToMe}
              className="flex-1 min-w-[140px] bg-[#4A6741] hover:bg-[#3d5636] text-white"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email to Me
            </Button>
            <Button
              onClick={handleCopyToClipboard}
              variant="outline"
              className="flex-1 min-w-[140px]"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="flex-1 min-w-[140px]"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>

          {/* Share Button */}
          <div className="pt-2">
            <Button
              onClick={() => setShowShareDialog(!showShareDialog)}
              variant="outline"
              className="w-full border-[#4A6741] text-[#4A6741] hover:bg-[#4A6741] hover:text-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share with Coach or Accountability Partner
            </Button>
          </div>

          {/* Share Dialog */}
          {showShareDialog && (
            <div className="space-y-3 p-4 bg-[#F7F5F0] rounded-lg border border-[#E2E8F0]">
              <div>
                <label className="text-sm font-medium text-[#0A1628] mb-1 block">
                  Recipient Email *
                </label>
                <Input
                  type="email"
                  placeholder="coach@example.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#0A1628] mb-1 block">
                  Personal Note (Optional)
                </label>
                <Textarea
                  placeholder="Add a personal message..."
                  value={shareNote}
                  onChange={(e) => setShareNote(e.target.value)}
                  className="bg-white min-h-[80px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleShareSummary}
                  disabled={isSharing}
                  className="flex-1 bg-[#4A6741] hover:bg-[#3d5636] text-white"
                >
                  {isSharing ? "Sending..." : "Send Summary"}
                </Button>
                <Button
                  onClick={() => {
                    setShowShareDialog(false);
                    setShareEmail("");
                    setShareNote("");
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-[#718096] hover:text-[#2D3748]"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
