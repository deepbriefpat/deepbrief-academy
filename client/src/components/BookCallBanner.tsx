import { Calendar, Phone } from "lucide-react";

export function BookCallBanner() {
  const calendlyUrl = "https://thedeepbrief.co.uk/book-call";

  return (
    <div className="bg-gradient-to-r from-[#4A6741]/10 to-[#4A6741]/5 border-2 border-[#4A6741]/30 rounded-xl p-4 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#4A6741]/20 rounded-full flex items-center justify-center">
          <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-[#4A6741]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-[#2C2C2C] mb-1 sm:mb-2">
            Want to speak with Patrick directly?
          </h3>
          <p className="text-[#6B6B60] text-xs sm:text-sm mb-3 sm:mb-4">
            Book a 1-on-1 call for personalized guidance, deeper coaching conversations, or strategic planning sessions.
          </p>
          <a
            href={calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#4A6741] text-white font-semibold rounded-lg hover:bg-[#4A6741]/90 transition-all text-sm sm:text-base"
          >
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            Schedule a Call
          </a>
        </div>
      </div>
    </div>
  );
}
