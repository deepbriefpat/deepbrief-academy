import { Calendar } from "lucide-react";

export function BookCallButton() {
  const calendlyUrl = "https://thedeepbrief.co.uk/book-call";

  return (
    <a
      href={calendlyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs text-[#6B6B60] hover:text-[#4A6741] hover:bg-[#4A6741]/5 rounded-lg transition-all border border-[#E6E2D6] hover:border-[#4A6741]/30"
      title="Book a 1-on-1 call with Patrick"
    >
      <Calendar className="h-3.5 w-3.5" />
      <span>Book a Call</span>
    </a>
  );
}
