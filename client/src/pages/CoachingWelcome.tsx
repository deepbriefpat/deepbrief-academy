import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Shield, Users, BookOpen, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

interface Coach {
  id: string;
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  avatar: string;
}

const coaches: Coach[] = [
  {
    id: "sarah",
    name: "Sarah Mitchell",
    title: "Executive Leadership Coach",
    bio: "Former Fortune 500 executive with 15 years of experience helping leaders navigate high-pressure decisions and build resilient teams.",
    specialties: ["Strategic Decision-Making", "Team Conflict Resolution", "Executive Presence"],
    avatar: "/avatars/sarah.jpg"
  },
  {
    id: "michael",
    name: "Michael Thompson",
    title: "Leadership Development Specialist",
    bio: "Organizational psychologist specializing in leadership development, delegation strategies, and building high-performing cultures.",
    specialties: ["Delegation & Empowerment", "Leadership Development", "Organizational Culture"],
    avatar: "/avatars/michael.jpg"
  },
  {
    id: "maya",
    name: "Maya Patel",
    title: "Change Management Coach",
    bio: "Expert in guiding leaders through organizational transformation, difficult conversations, and adaptive leadership challenges.",
    specialties: ["Change Management", "Difficult Conversations", "Adaptive Leadership"],
    avatar: "/avatars/maya.jpg"
  },
  {
    id: "bob",
    name: "Bob Bobby",
    title: "Strategic Leadership Advisor",
    bio: "Veteran executive coach with expertise in strategic thinking, decision frameworks, and navigating complex business challenges.",
    specialties: ["Strategic Planning", "Decision Frameworks", "Business Strategy"],
    avatar: "/avatars/bob.jpg"
  }
];

interface CoachingWelcomeProps {
  accessType: "guest" | "subscription";
  guestPassCode?: string;
  onComplete: (selectedCoach: string) => void;
}

export default function CoachingWelcome({ accessType, guestPassCode, onComplete }: CoachingWelcomeProps) {
  const [, setLocation] = useLocation();
  const [selectedCoach, setSelectedCoach] = useState<string>("sarah");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [currentSection, setCurrentSection] = useState<"overview" | "coaches" | "guidelines">("overview");

  const handleContinue = () => {
    if (currentSection === "overview") {
      setCurrentSection("coaches");
    } else if (currentSection === "coaches") {
      setCurrentSection("guidelines");
    } else if (termsAccepted) {
      onComplete(selectedCoach);
    }
  };

  const selectedCoachData = coaches.find(c => c.id === selectedCoach);

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-deep to-navy-medium py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Sparkles className="w-12 h-12 text-gold-accent mx-auto mb-4" />
          <h1 className="text-4xl font-serif font-bold text-white mb-2">
            Welcome to AI Executive Coaching
          </h1>
          <p className="text-gray-300 text-lg">
            {accessType === "guest" 
              ? "You have unlimited coaching access with your guest pass" 
              : "Let's set up your coaching experience"}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          <div className={`h-2 w-24 rounded-full ${currentSection === "overview" ? "bg-gold-accent" : "bg-gray-600"}`} />
          <div className={`h-2 w-24 rounded-full ${currentSection === "coaches" ? "bg-gold-accent" : "bg-gray-600"}`} />
          <div className={`h-2 w-24 rounded-full ${currentSection === "guidelines" ? "bg-gold-accent" : "bg-gray-600"}`} />
        </div>

        {/* Overview Section */}
        {currentSection === "overview" && (
          <div className="space-y-6">
            <Card className="bg-navy-light border-gold-accent/20 p-6">
              <div className="flex items-start gap-4 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white mb-2">What This Service Is</h2>
                  <ul className="space-y-2 text-gray-300">
                    <li>• <strong>Executive Coaching:</strong> Professional guidance for leadership challenges, decision-making, and management skills</li>
                    <li>• <strong>Strategic Support:</strong> Help with delegation, team dynamics, difficult conversations, and organizational challenges</li>
                    <li>• <strong>Confidential Space:</strong> Private conversations to explore leadership dilemmas and develop actionable strategies</li>
                    <li>• <strong>AI-Powered Insights:</strong> Instant access to coaching frameworks, best practices, and personalized recommendations</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="bg-navy-light border-red-500/30 p-6">
              <div className="flex items-start gap-4 mb-4">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white mb-2">What This Service Is NOT</h2>
                  <ul className="space-y-2 text-gray-300">
                    <li>• <strong>Not Therapy:</strong> This is not mental health treatment, psychological counseling, or clinical therapy</li>
                    <li>• <strong>Not Medical Advice:</strong> We do not provide medical, psychiatric, or health-related advice</li>
                    <li>• <strong>Not Crisis Support:</strong> If you're experiencing a mental health emergency, please contact emergency services or a crisis hotline</li>
                    <li>• <strong>Not Legal/Financial Advice:</strong> We provide coaching perspectives, not professional legal or financial counsel</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card className="bg-navy-light border-gold-accent/20 p-6">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-gold-accent flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white mb-2">Privacy & Confidentiality</h2>
                  <p className="text-gray-300 mb-3">
                    Your coaching conversations are private and confidential. We use industry-standard encryption to protect your data.
                  </p>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Conversations are stored securely and accessible only to you</li>
                    <li>• We never share your coaching content with third parties</li>
                    <li>• You can export or delete your conversation history at any time</li>
                    <li>• AI responses are generated in real-time and not reviewed by humans</li>
                  </ul>
                </div>
              </div>
            </Card>

            {accessType === "guest" && guestPassCode && (
              <Card className="bg-navy-light border-gold-accent/20 p-6">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-6 h-6 text-gold-accent flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-white mb-2">Your Guest Pass Access</h2>
                    <p className="text-gray-300 mb-2">
                      You're using guest pass: <span className="font-mono text-gold-accent">{guestPassCode}</span>
                    </p>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li>• Unlimited coaching conversations</li>
                      <li>• Access to all coaching specialties</li>
                      <li>• Conversation history and export</li>
                      <li>• Switch between different coaches</li>
                    </ul>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Coach Selection Section */}
        {currentSection === "coaches" && (
          <div className="space-y-6">
            <Card className="bg-navy-light border-gold-accent/20 p-6">
              <div className="flex items-start gap-4 mb-6">
                <Users className="w-6 h-6 text-gold-accent flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white mb-2">Choose Your Coach</h2>
                  <p className="text-gray-300">
                    Select the coach whose expertise best matches your current leadership challenges. You can switch coaches anytime during your conversations.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {coaches.map((coach) => (
                  <button
                    key={coach.id}
                    onClick={() => setSelectedCoach(coach.id)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      selectedCoach === coach.id
                        ? "border-gold-accent bg-gold-accent/10"
                        : "border-gray-600 hover:border-gray-500 bg-navy-medium"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold-accent to-gold-light flex items-center justify-center text-2xl font-bold text-navy-deep flex-shrink-0">
                        {coach.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-1">{coach.name}</h3>
                        <p className="text-gold-accent text-sm mb-2">{coach.title}</p>
                        <p className="text-gray-300 text-sm mb-3">{coach.bio}</p>
                        <div className="flex flex-wrap gap-2">
                          {coach.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className="px-2 py-1 bg-navy-deep rounded text-xs text-gray-300"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                      {selectedCoach === coach.id && (
                        <CheckCircle className="w-6 h-6 text-gold-accent flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Guidelines Section */}
        {currentSection === "guidelines" && (
          <div className="space-y-6">
            <Card className="bg-navy-light border-gold-accent/20 p-6">
              <div className="flex items-start gap-4 mb-6">
                <BookOpen className="w-6 h-6 text-gold-accent flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white mb-2">Getting the Most from Coaching</h2>
                  <p className="text-gray-300 mb-4">
                    Follow these best practices to maximize the value of your coaching conversations:
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-navy-medium rounded-lg">
                  <h3 className="font-bold text-white mb-2">1. Be Specific About Your Challenge</h3>
                  <p className="text-gray-300 text-sm">
                    Instead of "I need help with leadership," try "I'm struggling to delegate effectively to my senior team without micromanaging."
                  </p>
                </div>

                <div className="p-4 bg-navy-medium rounded-lg">
                  <h3 className="font-bold text-white mb-2">2. Provide Context</h3>
                  <p className="text-gray-300 text-sm">
                    Share relevant details: team size, organizational culture, time constraints, stakeholder dynamics. Context helps generate more relevant advice.
                  </p>
                </div>

                <div className="p-4 bg-navy-medium rounded-lg">
                  <h3 className="font-bold text-white mb-2">3. Ask Follow-Up Questions</h3>
                  <p className="text-gray-300 text-sm">
                    Dig deeper into recommendations. Ask "How would that work in my situation?" or "What if the stakeholder resists?"
                  </p>
                </div>

                <div className="p-4 bg-navy-medium rounded-lg">
                  <h3 className="font-bold text-white mb-2">4. Request Frameworks and Tools</h3>
                  <p className="text-gray-300 text-sm">
                    Ask for decision-making frameworks, conversation scripts, or step-by-step approaches you can apply immediately.
                  </p>
                </div>

                <div className="p-4 bg-navy-medium rounded-lg">
                  <h3 className="font-bold text-white mb-2">5. Reflect and Apply</h3>
                  <p className="text-gray-300 text-sm">
                    After each session, identify 1-2 actionable steps. Return to share results and refine your approach.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-navy-light border-gold-accent/20 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-3">Ready to Start?</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    You'll be coaching with <strong className="text-gold-accent">{selectedCoachData?.name}</strong>. 
                    You can switch coaches anytime from the conversation page.
                  </p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                      className="mt-1"
                    />
                    <span className="text-gray-300 text-sm">
                      I understand this is executive coaching (not therapy or medical advice), and I agree to use this service responsibly for professional leadership development.
                    </span>
                  </label>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={() => {
              if (currentSection === "coaches") setCurrentSection("overview");
              else if (currentSection === "guidelines") setCurrentSection("coaches");
              else setLocation("/");
            }}
            className="bg-transparent border-gray-600 text-gray-300 hover:bg-navy-medium"
          >
            Back
          </Button>

          <div className="flex gap-3">
            {currentSection === "overview" && (
              <Button
                onClick={() => onComplete(selectedCoach)}
                variant="outline"
                className="bg-transparent border-gold-accent text-gold-accent hover:bg-gold-accent/10"
              >
                Start Your Coaching Session
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            <Button
              onClick={handleContinue}
              disabled={currentSection === "guidelines" && !termsAccepted}
              className="bg-gold-accent text-navy-deep hover:bg-gold-light font-bold"
            >
              {currentSection === "guidelines" ? "Start Coaching" : "Continue"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Skip Option for Returning Users */}
        {accessType === "subscription" && (
          <div className="text-center mt-6">
            <button
              onClick={() => onComplete(selectedCoach)}
              className="text-gray-400 text-sm hover:text-gray-300 underline"
            >
              I've seen this before - skip to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
