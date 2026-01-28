import { ChevronDown } from "lucide-react";

export function ScrollIndicator() {
  const handleScroll = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth"
    });
  };

  return (
    <button
      onClick={handleScroll}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-gold/60 hover:text-gold transition-colors cursor-pointer animate-bounce"
      aria-label="Scroll to content"
    >
      <ChevronDown className="h-8 w-8" />
    </button>
  );
}
