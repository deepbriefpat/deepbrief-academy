import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Gauge, AlertCircle } from "lucide-react";

export function PressureStateIndicator() {
  const { data: assessments } = trpc.dashboard.myAssessments.useQuery();

  if (!assessments || assessments.length === 0) {
    return (
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 mb-2">
                No pressure baseline yet
              </p>
              <p className="text-sm text-amber-700 mb-3">
                Take the assessment to establish your pressure baseline. It helps the coach understand where you're starting from.
              </p>
              <Link href="/assessment">
                <Button size="sm" variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100">
                  Take Assessment
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const latest = assessments[0];
  
  const depthInfo: Record<string, { 
    title: string; 
    color: string; 
    bgColor: string;
    description: string;
  }> = {
    surface: {
      title: "Surface",
      color: "text-green-700",
      bgColor: "bg-green-50 border-green-200",
      description: "Minimal pressure distortion — thinking remains clear"
    },
    thermocline: {
      title: "Thermocline",
      color: "text-yellow-700",
      bgColor: "bg-yellow-50 border-yellow-200",
      description: "Moderate pressure — some signal degradation beginning"
    },
    deep_water: {
      title: "Deep Water",
      color: "text-orange-700",
      bgColor: "bg-orange-50 border-orange-200",
      description: "Significant pressure — judgment impairment affecting performance"
    },
    crush_depth: {
      title: "Crush Depth",
      color: "text-red-700",
      bgColor: "bg-red-50 border-red-200",
      description: "Critical pressure — urgent intervention needed"
    }
  };

  const info = depthInfo[latest.depthLevel] || depthInfo.surface;

  return (
    <Card className={`${info.bgColor} border-2`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Gauge className={`h-5 w-5 ${info.color} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold ${info.color}">
                Current Depth: {info.title}
              </p>
              <span className="text-xs text-gray-600">
                {latest.score}/125
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              {info.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Last assessed: {new Date(latest.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <Link href="/assessment">
                <button className="text-[#4A6741] hover:underline font-medium">
                  Retake
                </button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
