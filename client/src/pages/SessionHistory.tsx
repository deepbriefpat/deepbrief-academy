import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { SessionSummaryModal } from "@/components/SessionSummaryModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, FileText, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function SessionHistory() {
  const { user } = useAuth();
  const [selectedSummary, setSelectedSummary] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const { data: sessions, isLoading } = trpc.aiCoach.getSessions.useQuery(
    { limit: 100 },
    { enabled: !!user }
  );

  // Filter sessions that have summaries
  const sessionsWithSummaries = sessions?.filter(s => s.summary) || [];

  const handleViewSummary = (session: any) => {
    try {
      const summaryData = typeof session.summary === 'string' 
        ? JSON.parse(session.summary) 
        : session.summary;
      setSelectedSummary(summaryData);
      setShowModal(true);
    } catch (error) {
      console.error("Failed to parse summary:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-serif text-[#0A1628] mb-4">Sign In Required</h2>
          <p className="text-[#4A5568] mb-6">Please sign in to view your session history.</p>
          <Link href="/ai-coach">
            <Button className="bg-[#4A6741] hover:bg-[#3d5636]">Go to AI Coach</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      {/* Header */}
      <div className="bg-[#0A1628] text-white py-12">
        <div className="container max-w-4xl">
          <Link href="/ai-coach/dashboard">
            <Button variant="ghost" className="text-white hover:text-[#D4AF37] mb-4">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-serif mb-3">Session History</h1>
          <p className="text-[#B8C5D6]">
            Review your past coaching sessions and export summaries anytime
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#4A6741]" />
          </div>
        ) : sessionsWithSummaries.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <FileText className="h-16 w-16 text-[#CBD5E0] mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-[#0A1628] mb-2">No Session Summaries Yet</h2>
            <p className="text-[#718096] mb-6">
              Complete a coaching session to see your summaries here.
            </p>
            <Link href="/ai-coach/dashboard">
              <Button className="bg-[#4A6741] hover:bg-[#3d5636]">
                Start a Session
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessionsWithSummaries.map((session) => {
              const summaryData = typeof session.summary === 'string'
                ? JSON.parse(session.summary)
                : session.summary;
              
              const sessionDate = new Date(session.createdAt).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });

              return (
                <Card key={session.id} className="p-6 bg-white hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-[#718096] mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>{sessionDate}</span>
                      </div>



                      {/* Key Themes Preview */}
                      {summaryData?.keyThemes && summaryData.keyThemes.length > 0 && (
                        <div className="mb-3">
                          <h3 className="text-sm font-semibold text-[#0A1628] mb-1">Key Themes:</h3>
                          <ul className="text-sm text-[#4A5568] space-y-1">
                            {summaryData.keyThemes.slice(0, 2).map((theme: string, idx: number) => (
                              <li key={idx}>• {theme}</li>
                            ))}
                            {summaryData.keyThemes.length > 2 && (
                              <li className="text-[#718096] italic">
                                +{summaryData.keyThemes.length - 2} more...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Commitments Count */}
                      {summaryData?.commitments && summaryData.commitments.length > 0 && (
                        <div className="text-sm text-[#4A6741]">
                          {summaryData.commitments.length} commitment{summaryData.commitments.length !== 1 ? 's' : ''} logged
                        </div>
                      )}
                    </div>

                    {/* View Button */}
                    <Button
                      onClick={() => handleViewSummary(session)}
                      className="bg-[#4A6741] hover:bg-[#3d5636] text-white"
                    >
                      View Summary
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Modal */}
      {selectedSummary && (
        <SessionSummaryModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedSummary(null);
          }}
          summary={selectedSummary}
        />
      )}
    </div>
  );
}
