/**
 * Empty State Components
 * 
 * Friendly, actionable empty states for:
 * - No goals
 * - No commitments  
 * - No sessions
 * - No patterns yet
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Target, 
  CheckSquare, 
  MessageSquare, 
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  onAction?: () => void;
  className?: string;
}

/**
 * Empty state for Goals section
 */
export function EmptyGoalsState({ onAction, className }: EmptyStateProps) {
  return (
    <Card className={cn("p-8 text-center border-dashed border-2 border-gray-200 bg-gray-50/50", className)}>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
          <Target className="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Goals Yet
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        Goals give your coaching sessions direction. Set a goal to track progress 
        and get more relevant guidance from your coach.
      </p>

      <div className="bg-blue-50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
        <div className="flex items-start gap-3 text-left">
          <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Good goals are:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Specific and measurable</li>
              <li>• Challenging but achievable</li>
              <li>• Time-bound with a target date</li>
            </ul>
          </div>
        </div>
      </div>

      {onAction && (
        <Button onClick={onAction} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Set Your First Goal
        </Button>
      )}
    </Card>
  );
}

/**
 * Empty state for Commitments section
 */
export function EmptyCommitmentsState({ onAction, className }: EmptyStateProps) {
  return (
    <Card className={cn("p-8 text-center border-dashed border-2 border-gray-200 bg-gray-50/50", className)}>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
          <CheckSquare className="w-8 h-8 text-purple-600" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Active Commitments
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        Commitments are concrete actions you agree to take after a coaching session. 
        They turn insights into results.
      </p>

      <div className="bg-purple-50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
        <div className="flex items-start gap-3 text-left">
          <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-800">
            <p className="font-medium mb-1">Commitments come from sessions</p>
            <p className="text-purple-700">
              Start a coaching conversation and your coach will help you 
              identify specific actions to take.
            </p>
          </div>
        </div>
      </div>

      {onAction && (
        <Button onClick={onAction} className="gap-2 bg-purple-600 hover:bg-purple-700">
          <MessageSquare className="w-4 h-4" />
          Start a Session
        </Button>
      )}
    </Card>
  );
}

/**
 * Empty state for Sessions/History section
 */
export function EmptySessionsState({ onAction, className }: EmptyStateProps) {
  return (
    <Card className={cn("p-8 text-center border-dashed border-2 border-gray-200 bg-gray-50/50", className)}>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-[#4A6741]/10 flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-[#4A6741]" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No Sessions Yet
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        Your coaching journey starts with a single conversation. 
        What's on your mind today?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-6">
        <div className="bg-[#4A6741]/5 rounded-lg p-3 text-left border border-[#4A6741]/20">
          <p className="text-sm font-medium text-[#4A6741] mb-1">Quick Session</p>
          <p className="text-xs text-gray-600">5-10 min • Fast clarity</p>
        </div>
        <div className="bg-[#4A6741]/5 rounded-lg p-3 text-left border border-[#4A6741]/20">
          <p className="text-sm font-medium text-[#4A6741] mb-1">Full Session</p>
          <p className="text-xs text-gray-600">20-45 min • Deep exploration</p>
        </div>
      </div>

      {onAction && (
        <Button onClick={onAction} className="gap-2 bg-[#4A6741] hover:bg-[#3d5636]">
          <Sparkles className="w-4 h-4" />
          Start Your First Session
        </Button>
      )}
    </Card>
  );
}

/**
 * Empty state for Patterns section
 */
export function EmptyPatternsState({ onAction, className }: EmptyStateProps) {
  return (
    <Card className={cn("p-8 text-center border-dashed border-2 border-gray-200 bg-gray-50/50", className)}>
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
          <TrendingUp className="w-8 h-8 text-indigo-600" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Patterns Emerging...
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        After a few sessions, your coach will identify recurring themes 
        and patterns. This is where deep insights happen.
      </p>

      <div className="bg-indigo-50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
        <div className="flex items-center justify-center gap-6 text-sm text-indigo-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">3-5</div>
            <div className="text-xs">sessions needed</div>
          </div>
          <div className="h-8 w-px bg-indigo-200" />
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">∞</div>
            <div className="text-xs">insights possible</div>
          </div>
        </div>
      </div>

      {onAction && (
        <Button onClick={onAction} variant="outline" className="gap-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50">
          <ArrowRight className="w-4 h-4" />
          Keep Coaching
        </Button>
      )}
    </Card>
  );
}

/**
 * Compact empty state for sidebars
 */
interface CompactEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function CompactEmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className 
}: CompactEmptyStateProps) {
  return (
    <div className={cn("text-center py-6 px-4", className)}>
      <div className="flex justify-center mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
          {icon}
        </div>
      </div>
      <p className="text-sm font-medium text-gray-700 mb-1">{title}</p>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      {onAction && actionLabel && (
        <Button variant="ghost" size="sm" onClick={onAction} className="text-xs">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
