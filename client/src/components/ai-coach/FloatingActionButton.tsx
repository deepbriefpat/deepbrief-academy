// @ts-nocheck
import { useState } from "react";
import { Pause, Target, TrendingUp, CheckCircle, X } from "lucide-react";

interface FloatingActionButtonProps {
  onPauseSession: () => void;
  onViewCommitments: () => void;
  onViewGoals: () => void;
  onEndSession: () => void;
  isSessionActive: boolean;
}

export function FloatingActionButton({
  onPauseSession,
  onViewCommitments,
  onViewGoals,
  onEndSession,
  isSessionActive,
}: FloatingActionButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isSessionActive) return null;

  const quickActions = [
    {
      icon: Pause,
      label: "Pause",
      onClick: () => {
        onPauseSession();
        setIsMenuOpen(false);
      },
      color: "bg-[#E6E2D6] text-[#2C2C2C]",
    },
    {
      icon: Target,
      label: "Goals",
      onClick: () => {
        onViewGoals();
        setIsMenuOpen(false);
      },
      color: "bg-[#4A6741] text-white",
    },
    {
      icon: TrendingUp,
      label: "Commitments",
      onClick: () => {
        onViewCommitments();
        setIsMenuOpen(false);
      },
      color: "bg-[#4A6741] text-white",
    },
    {
      icon: CheckCircle,
      label: "End",
      onClick: () => {
        onEndSession();
        setIsMenuOpen(false);
      },
      color: "bg-[#4A6741] text-white",
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-24 right-4 z-50">
      {/* Quick Actions Menu */}
      {isMenuOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-2 mb-2">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className={`${action.color} rounded-full p-3 shadow-lg flex items-center gap-2 pr-4 transition-all duration-200 hover:scale-105 active:scale-95`}
                style={{
                  animation: `slideIn 0.2s ease-out ${index * 0.05}s both`,
                }}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`${
          isMenuOpen ? "bg-[#2C2C2C]" : "bg-[#4A6741]"
        } text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 active:scale-95`}
        aria-label="Quick actions"
      >
        {isMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        )}
      </button>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
