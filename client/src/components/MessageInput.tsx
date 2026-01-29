import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2, Send, HelpCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { VoiceInputDemo } from "./VoiceInputDemo";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ value, onChange, onSend, disabled, placeholder }: MessageInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false); // Loading state for mic initialization
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(80).fill(0)); // 80 bars for full width
  const [showVoiceTip, setShowVoiceTip] = useState(false);
  const [showVoiceDemo, setShowVoiceDemo] = useState(false);
  const [hasSeenDemo, setHasSeenDemo] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isRecordingRef = useRef(false); // Track recording state for animation loop

  // Check if user has seen voice demo on mobile
  useEffect(() => {
    const seen = localStorage.getItem("voiceDemoSeen");
    setHasSeenDemo(!!seen);
    
    // Auto-show demo on first mobile visit
    if (!seen && window.innerWidth < 768) {
      const timer = setTimeout(() => {
        setShowVoiceDemo(true);
      }, 2000); // Show after 2 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const transcribeMutation = trpc.aiCoach.transcribeAudio.useMutation({
    onSuccess: (result) => {
      if (result.text) {
        onChange(value ? `${value} ${result.text}` : result.text);
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      alert("Failed to transcribe audio. Please try again.");
      setIsProcessing(false);
    },
  });

  // Analyze audio level for waveform visualization with scrolling effect
  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average level from current audio data
    const average = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
    const normalizedLevel = Math.min((average / 255) * 2.5, 1); // 2.5x sensitivity

    // Scrolling effect: add new bar on LEFT, remove oldest from RIGHT
    setAudioLevels(prevLevels => {
      const newLevels = [normalizedLevel, ...prevLevels.slice(0, -1)];
      
      // Debug logging
      if (normalizedLevel > 0.1) {
        console.log('[Waveform] Audio detected:', { level: normalizedLevel, firstBars: newLevels.slice(0, 5) });
      }
      
      return newLevels;
    });

    // Use ref instead of state to avoid closure issues
    if (isRecordingRef.current) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  };

  const startRecording = async () => {
    try {
      setIsInitializing(true); // Show loading animation
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analysis for waveform
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048; // Higher resolution for smoother waveform
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        // Check file size (16MB limit)
        if (audioBlob.size > 16 * 1024 * 1024) {
          alert("Recording too long. Please keep recordings under 16MB.");
          setIsProcessing(false);
          return;
        }

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const base64Data = base64Audio.split(',')[1];
          
          setIsProcessing(true);
          transcribeMutation.mutate({
            audioData: base64Data,
            mimeType: 'audio/webm',
          });
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Clean up audio context
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        analyserRef.current = null;
        setAudioLevels(Array(80).fill(0));
      };

      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      isRecordingRef.current = true; // Set ref for animation loop
      mediaRecorder.start();
      
      // Start analyzing audio for waveform
      analyzeAudio();
      setIsInitializing(false); // Hide loading animation
    } catch (error) {
      setIsInitializing(false); // Hide loading on error
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      isRecordingRef.current = false; // Stop animation loop
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      // Show tip on first use
      const hasSeenVoiceTip = localStorage.getItem('hasSeenVoiceTip');
      if (!hasSeenVoiceTip) {
        setShowVoiceTip(true);
        localStorage.setItem('hasSeenVoiceTip', 'true');
        setTimeout(() => setShowVoiceTip(false), 5000);
      }
      startRecording();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 200) + 'px';
  };

  // Auto-resize textarea when value changes (for templates)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [value]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1 relative">
        {/* Voice Input Tip - shown on first use */}
        {showVoiceTip && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#4A6741] text-white text-xs sm:text-sm p-3 rounded-lg shadow-lg z-20 animate-in fade-in slide-in-from-bottom-2">
            <p className="font-medium mb-1">🎤 Voice Input Active</p>
            <p className="opacity-90">Tap the microphone button again to stop recording and transcribe your message.</p>
          </div>
        )}
        {/* Full-width waveform overlay - fills entire textarea when recording */}
        {isRecording && (
          <div className="absolute inset-0 flex items-center justify-center px-2 pointer-events-none rounded-xl overflow-hidden bg-white/50" style={{ gap: '2px' }}>
            {audioLevels.map((level, i) => {
              // Map level (0-1) to height range (12px-80px) for dramatic visualization
              const height = Math.max(12, Math.min(80, 12 + (level * 68)));
              return (
                <div
                  key={i}
                  className="bg-red-500 rounded-sm flex-shrink-0"
                  style={{
                    width: '3px',
                    height: `${height}px`,
                    opacity: 0.95,
                    transition: 'height 0.1s ease-out',
                  }}
                />
              );
            })}
          </div>
        )}
        
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder || "Type or speak your message..."}
          className={`w-full bg-white text-[#2C2C2C] placeholder:text-gray-400 border-[#E6E2D6] focus:border-[#4A6741] focus:ring-2 focus:ring-[#4A6741]/20 rounded-xl min-h-[44px] max-h-[150px] py-2.5 px-3 pr-12 transition-all resize-none text-sm sm:text-base ${
            isRecording ? 'text-transparent' : ''
          }`}
          disabled={disabled || isProcessing}
          rows={1}
          style={{ height: 'auto' }}
        />
        
        {/* Microphone button - positioned inside textarea, larger on mobile */}
        <button
          onClick={handleToggleRecording}
          disabled={isProcessing || disabled}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 lg:p-2 rounded-lg transition-all z-10 shadow-md lg:shadow-none ${
            isRecording
              ? "bg-red-500 text-white hover:bg-red-600 scale-110 lg:scale-100"
              : isProcessing
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#4A6741] text-white hover:bg-[#3d5636] active:scale-95"
          }`}
          title={isRecording ? "Stop recording (click to finish)" : "Start voice input"}
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 lg:w-5 lg:h-5 animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-6 h-6 lg:w-5 lg:h-5" />
          ) : (
            <Mic className="w-6 h-6 lg:w-5 lg:h-5" />
          )}
        </button>
        
        {/* Voice Demo Help Button - only on mobile if not seen */}
        {!hasSeenDemo && window.innerWidth < 768 && (
          <button
            onClick={() => setShowVoiceDemo(true)}
            className="absolute -top-10 right-0 text-xs text-[#4A6741] hover:text-[#3d5636] flex items-center gap-1 bg-[#F2F0E9] px-2 py-1 rounded-lg shadow-sm"
          >
            <HelpCircle className="w-3 h-3" />
            How to use voice
          </button>
        )}
      </div>
      
      <button
        onClick={onSend}
        disabled={!value.trim() || disabled}
        className="bg-[#4A6741] text-white hover:bg-[#4A6741]/90 rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
      >
        <Send className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      
      {/* Voice Input Demo Modal */}
      {showVoiceDemo && (
        <VoiceInputDemo
          onClose={() => setShowVoiceDemo(false)}
          onComplete={() => {
            setHasSeenDemo(true);
            setShowVoiceDemo(false);
          }}
        />
      )}
    </div>
  );
}
