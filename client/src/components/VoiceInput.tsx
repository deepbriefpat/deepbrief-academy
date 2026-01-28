import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const transcribeMutation = trpc.aiCoach.transcribeAudio.useMutation({
    onSuccess: (result) => {
      if (result.text) {
        onTranscript(result.text);
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      alert("Failed to transcribe audio. Please try again.");
      setIsProcessing(false);
    },
  });

  // Analyze audio level for waveform visualization
  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalized = Math.min(average / 128, 1); // Normalize to 0-1
    setAudioLevel(normalized);

    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analysis for waveform
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
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
        setAudioLevel(0);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
      // Start analyzing audio
      analyzeAudio();
    } catch (error) {
      alert("Could not access microphone. Please check your browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  };

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

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
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={isProcessing}
        className={`p-2 rounded-lg transition-colors ${
          isRecording
            ? "bg-red-500 text-white hover:bg-red-600"
            : isProcessing
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-[#4A6741] text-white hover:bg-[#3d5636]"
        }`}
        title={isRecording ? "Stop recording (click to finish)" : "Start voice input"}
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isRecording ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
      
      {/* Waveform visualization */}
      {isRecording && (
        <div className="flex items-center gap-1 h-8">
          {[...Array(5)].map((_, i) => {
            // Create varying heights based on audio level with slight delay for wave effect
            const height = Math.max(
              8,
              Math.min(32, audioLevel * 40 * (0.5 + Math.random() * 0.5))
            );
            return (
              <div
                key={i}
                className="w-1 bg-red-500 rounded-full transition-all duration-100"
                style={{
                  height: `${height}px`,
                  animationDelay: `${i * 50}ms`,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
