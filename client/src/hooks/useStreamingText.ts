import { useState, useEffect } from "react";

/**
 * Hook to stream text word-by-word at fast reading speed
 * Optimized for AI responses: 500 words per minute (120ms per word)
 */
export function useStreamingText(fullText: string, enabled: boolean = true) {
  const [displayedText, setDisplayedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  
  useEffect(() => {
    if (!enabled || !fullText) {
      setDisplayedText(fullText);
      setIsStreaming(false);
      return;
    }
    
    // Split text into words
    const words = fullText.split(" ");
    let currentIndex = 0;
    
    setIsStreaming(true);
    setDisplayedText("");
    
    // Stream words at ~120ms per word (500 WPM reading speed - 2x faster)
    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedText(prev => {
          const newText = prev + (prev ? " " : "") + words[currentIndex];
          return newText;
        });
        currentIndex++;
      } else {
        setIsStreaming(false);
        clearInterval(interval);
      }
    }, 120); // 120ms per word = 500 words per minute (2x faster)
    
    return () => {
      clearInterval(interval);
      setIsStreaming(false);
    };
  }, [fullText, enabled]);
  
  return { displayedText, isStreaming };
}
