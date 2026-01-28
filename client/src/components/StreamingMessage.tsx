import { useStreamingText } from "@/hooks/useStreamingText";
import { Streamdown } from "streamdown";

interface StreamingMessageProps {
  content: string;
  enableStreaming: boolean;
  onStreamingComplete?: () => void;
}

export function StreamingMessage({ content, enableStreaming, onStreamingComplete }: StreamingMessageProps) {
  const { displayedText, isStreaming } = useStreamingText(content, enableStreaming);
  
  // Call onStreamingComplete when streaming finishes
  if (!isStreaming && enableStreaming && onStreamingComplete) {
    // Use setTimeout to avoid state updates during render
    setTimeout(onStreamingComplete, 0);
  }
  
  return (
    <>
      <Streamdown>{displayedText}</Streamdown>
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 bg-gold animate-pulse" />
      )}
    </>
  );
}
