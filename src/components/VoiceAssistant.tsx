import React from "react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, AlertCircle, Play, HelpCircle } from "lucide-react";

interface VoiceAssistantProps {
  onAddTask: (title: string, urgent: boolean, important: boolean, minutes: number) => void;
  onTriggerBriefing: () => void;
  onSetBreakdownGoal: (goal: string) => void;
  onAddNotification: (title: string, message: string, type: "success" | "suggestion" | "alert") => void;
}

export default function VoiceAssistant({
  onAddTask,
  onTriggerBriefing,
  onSetBreakdownGoal,
  onAddNotification
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState("");
  const [speechSupported, setSpeechSupported] = React.useState(true);
  const [speaking, setSpeaking] = React.useState(false);
  const [voiceResult, setVoiceResult] = React.useState<any>(null);
  const [aiLoading, setAiLoading] = React.useState(false);

  const recognitionRef = React.useRef<any>(null);
  const synthRef = React.useRef<SpeechSynthesis | null>(null);

  React.useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    } else {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setTranscript("Listening...");
        setVoiceResult(null);
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error", event.error);
        setIsListening(false);
        setTranscript(`Error: ${event.error}. Try again.`);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const textResult = event.results[0][0].transcript;
        setTranscript(textResult);
        handleVoiceCommand(textResult);
      };

      recognitionRef.current = rec;
    }

    try {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        synthRef.current = window.speechSynthesis;
      }
    } catch (e) {
      console.warn("speechSynthesis access blocked/unavailable in this context:", e);
    }

    return () => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
      } catch (e) {
        console.warn("recognition.abort failed:", e);
      }
      try {
        if (synthRef.current) {
          synthRef.current.cancel();
        }
      } catch (e) {
        console.warn("speechSynthesis.cancel failed:", e);
      }
    };
  }, []);

  const startListening = () => {
    try {
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
        setSpeaking(false);
      }
    } catch (e) {
      console.warn("speechSynthesis.cancel failed:", e);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Recognition already started or error:", err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Recognition stop failed:", err);
      }
    }
  };

  const speakText = (text: string) => {
    try {
      if (!synthRef.current) return;
      
      // Stop ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      
      // Select an English speaking voice if available
      const voices = synthRef.current.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith("en"));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      synthRef.current.speak(utterance);
    } catch (err) {
      console.warn("Speech synthesis speak operation blocked or failed:", err);
      setSpeaking(false);
    }
  };

  const handleVoiceCommand = async (command: string) => {
    if (!command || command.trim() === "" || command === "Listening...") return;

    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: command })
      });

      if (!response.ok) {
        throw new Error("Failed to reach AI Server.");
      }

      const data = await response.json();
      const parsed = data.result;

      setVoiceResult(parsed);

      // Execute Action
      if (parsed.action === "add_task" && parsed.taskDetails) {
        const { title, urgent, important, estimatedMinutes } = parsed.taskDetails;
        onAddTask(title, urgent, important, estimatedMinutes || 30);
        onAddNotification("Voice Command Success", parsed.explanation, "success");
        speakText(`Adding task: ${title}`);
      } else if (parsed.action === "get_briefing") {
        onTriggerBriefing();
        // The parent layout will execute briefing and call speakText when text is loaded!
      } else if (parsed.action === "breakdown" && parsed.goal) {
        onSetBreakdownGoal(parsed.goal);
        onAddNotification("Voice Breakdown Triggered", parsed.explanation, "success");
        speakText(`Breaking down your goal: ${parsed.goal}`);
      } else {
        speakText(parsed.explanation);
      }

    } catch (err) {
      console.error(err);
      onAddNotification("Voice Processing Error", "Failed to parse vocal command. Try again.", "alert");
    } finally {
      setAiLoading(false);
    }
  };

  const stopSpeaking = () => {
    try {
      if (synthRef.current) {
        synthRef.current.cancel();
        setSpeaking(false);
      }
    } catch (e) {
      console.warn("speechSynthesis.cancel failed:", e);
    }
  };

  // Simulating user-dictated input for cases where mic permission is restricted inside iframe
  const triggerSimulation = (simCommand: string) => {
    setTranscript(simCommand);
    handleVoiceCommand(simCommand);
  };

  return (
    <div id="voice-assistant-panel" className="card-3d p-6 rounded-3xl relative overflow-hidden bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground font-display">Voice Assistant</h2>
            <p className="text-xs text-muted-foreground">Natural speech command capture</p>
          </div>
        </div>

        {speaking && (
          <button
            id="stop-speaking-btn"
            onClick={stopSpeaking}
            className="flex items-center gap-1 text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full cursor-pointer"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Stop Audio</span>
          </button>
        )}
      </div>

      <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-slate-950/30 border border-slate-900/60 text-center mb-4">
        {/* Glowing Mic Button */}
        <button
          id="mic-action-btn"
          onClick={isListening ? stopListening : startListening}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isListening
              ? "bg-red-500 text-slate-950 glow-cyan animate-pulse scale-105"
              : "bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20"
          }`}
          title={isListening ? "Stop listening" : "Start speaking"}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 stroke-[2.5px]" />
          ) : (
            <Mic className="w-6 h-6 stroke-[2.5px]" />
          )}
        </button>

        {isListening && (
          <div className="flex items-center gap-1.5 mt-3 justify-center">
            <div className="w-1.5 h-3.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-1.5 h-5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
            <div className="w-1.5 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
            <div className="w-1.5 h-6 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0.45s" }}></div>
          </div>
        )}

        <div className="mt-3.5 max-w-[280px]">
          <p className="text-xs font-semibold text-muted-foreground">Captured Output:</p>
          <p className={`text-sm mt-1 leading-relaxed ${transcript ? "text-foreground font-medium" : "text-muted-foreground italic"}`}>
            {transcript || '"Click mic and try adding a task or asking for a briefing!"'}
          </p>
        </div>

        {aiLoading && (
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-purple-400 font-mono">
            <span className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></span>
            <span>Parsing command...</span>
          </div>
        )}

        {voiceResult && (
          <div className="mt-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-left w-full">
            <div className="flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wide">AI Parser Outcome</span>
            </div>
            <p className="text-[11px] text-foreground">{voiceResult.explanation}</p>
          </div>
        )}
      </div>

      {/* Fallback Simulation Commands for standard iframe restrictions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          <span>Simulation Presets (Safe Iframe Testing)</span>
          <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" title="If microphone is blocked by iframe security policy, use these instant testing simulation buttons!" />
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          <button
            id="preset-add-task"
            onClick={() => triggerSimulation("add urgent task Draft final research paper")}
            className="flex items-center justify-between p-2 rounded-lg bg-surface hover:bg-surface-elevated text-left text-xs text-foreground transition-colors cursor-pointer group"
          >
            <span>"Add urgent task Draft final research paper"</span>
            <Play className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            id="preset-briefing"
            onClick={() => triggerSimulation("give me my daily briefing")}
            className="flex items-center justify-between p-2 rounded-lg bg-surface hover:bg-surface-elevated text-left text-xs text-foreground transition-colors cursor-pointer group"
          >
            <span>"Give me today's productivity briefing"</span>
            <Play className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            id="preset-breakdown"
            onClick={() => triggerSimulation("break down Launch SaaS startup")}
            className="flex items-center justify-between p-2 rounded-lg bg-surface hover:bg-surface-elevated text-left text-xs text-foreground transition-colors cursor-pointer group"
          >
            <span>"Plan breakdown for Launch SaaS startup"</span>
            <Play className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
