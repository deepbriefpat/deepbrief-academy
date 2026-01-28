import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

interface Testimonial {
  id: number;
  authorRole: string;
  content: string;
  outcome?: string | null;
  beforeScore?: number;
  afterScore?: number;
  beforeDepth?: string;
  afterDepth?: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
  variant?: "default" | "compact";
}

export function Testimonials({ testimonials, variant = "default" }: TestimonialsProps) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const getDepthColor = (depth?: string) => {
    switch (depth) {
      case "surface":
        return "text-green-500";
      case "thermocline":
        return "text-yellow-500";
      case "deep_water":
        return "text-orange-500";
      case "crush_depth":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getDepthLabel = (depth?: string) => {
    switch (depth) {
      case "surface":
        return "Surface";
      case "thermocline":
        return "Thermocline";
      case "deep_water":
        return "Deep Water";
      case "crush_depth":
        return "Crush Depth";
      default:
        return "";
    }
  };

  if (variant === "compact") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="bg-navy-mid/50 border-gold/20 hover:border-gold/40 transition-colors">
            <CardContent className="p-6">
              <Quote className="h-8 w-8 text-gold/40 mb-4" />
              <p className="text-gray-300 text-sm mb-4 italic">"{testimonial.content}"</p>
              <div className="flex items-center justify-between">
                <p className="text-gold text-sm font-medium">{testimonial.authorRole}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.id} className="bg-gradient-to-br from-navy-deep to-navy-mid border-gold/30">
          <CardContent className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Quote Section */}
              <div className="flex-1">
                <Quote className="h-10 w-10 text-gold/40 mb-4" />
                <p className="text-gray-200 text-lg mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                {testimonial.outcome && (
                  <div className="bg-navy-deep/50 rounded-lg p-4 border border-turquoise/20">
                    <p className="text-sm text-turquoise font-medium mb-2">Outcome:</p>
                    <p className="text-gray-300 text-sm">{testimonial.outcome}</p>
                  </div>
                )}
              </div>

              {/* Metrics Section */}
              {(testimonial.beforeScore || testimonial.beforeDepth) && (
                <div className="md:w-64 flex-shrink-0">
                  <div className="bg-navy-deep/50 rounded-lg p-6 border border-gold/20">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">
                      Pressure Profile
                    </p>
                    
                    {/* Before */}
                    <div className="mb-6">
                      <p className="text-xs text-gray-500 mb-2">Before</p>
                      {testimonial.beforeScore && (
                        <p className="text-2xl font-bold text-white mb-1">
                          {testimonial.beforeScore}/125
                        </p>
                      )}
                      {testimonial.beforeDepth && (
                        <p className={`text-sm font-medium ${getDepthColor(testimonial.beforeDepth)}`}>
                          {getDepthLabel(testimonial.beforeDepth)}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-center mb-6">
                      <svg className="h-6 w-6 text-turquoise" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>

                    {/* After */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">After</p>
                      {testimonial.afterScore && (
                        <p className="text-2xl font-bold text-white mb-1">
                          {testimonial.afterScore}/125
                        </p>
                      )}
                      {testimonial.afterDepth && (
                        <p className={`text-sm font-medium ${getDepthColor(testimonial.afterDepth)}`}>
                          {getDepthLabel(testimonial.afterDepth)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Author */}
                  <div className="mt-4">
                    <p className="text-gold text-sm font-medium">{testimonial.authorRole}</p>
                  </div>
                </div>
              )}

              {/* Fallback if no metrics */}
              {!testimonial.beforeScore && !testimonial.beforeDepth && (
                <div className="md:w-48 flex-shrink-0 flex items-end">
                  <p className="text-gold text-sm font-medium">{testimonial.authorRole}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
