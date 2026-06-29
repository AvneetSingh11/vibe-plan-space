import React from "react";

interface VoiceAssistantProps {
  onAddTask: (title: string, urgent: boolean, important: boolean, minutes: number, deadline?: string) => void;
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
  
  const [history, setHistory] = React.useState<{id: string, text: string, time: string, status: string}[]>([
      { id: '1', text: "System initialized. Awaiting voice input.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "Archived" }
  ]);

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
      rec.interimResults = true;
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
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript !== '') {
          setTranscript(finalTranscript);
          handleVoiceCommand(finalTranscript);
        } else if (interimTranscript !== '') {
          setTranscript(interimTranscript);
        }
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
    
    // Add to history
    setHistory(prev => [
        { id: Math.random().toString(), text: command, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "Processing" },
        ...prev
    ].slice(0, 5));

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

      setHistory(prev => prev.map((item, i) => i === 0 ? { ...item, status: "Executed" } : item));

      // Execute Action
      if (parsed.action === "add_task" && parsed.taskDetails) {
        const { title, urgent, important, estimatedMinutes, deadline } = parsed.taskDetails;
        onAddTask(title, urgent, important, estimatedMinutes || 30, deadline);
        onAddNotification("Voice Command Success", parsed.explanation, "success");
        speakText(`Adding task: ${title}`);
      } else if (parsed.action === "get_briefing") {
        onTriggerBriefing();
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
      setHistory(prev => prev.map((item, i) => i === 0 ? { ...item, status: "Error" } : item));
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

  const triggerSimulation = (simCommand: string) => {
    setTranscript(simCommand);
    handleVoiceCommand(simCommand);
  };
  
  const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const input = e.currentTarget.elements.namedItem('manualInput') as HTMLInputElement;
      if (input.value.trim()) {
          triggerSimulation(input.value);
          input.value = '';
      }
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Section */}
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="font-display-hero text-display-hero text-white mb-2">Vocal Resonance</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Initiate command sequence or dictate space parameters. Acoustic environment optimized.</p>
        </div>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 pb-12">
        
        {/* Left Column: Command History & Input */}
        <div className="md:col-span-4 flex flex-col gap-6">
          
          {/* History Module */}
          <div className="glass-panel rounded-3xl p-6 flex-1 flex flex-col relative overflow-hidden group min-h-[300px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-aurora-orange rounded-full blur-3xl opacity-20 -mr-16 -mt-16 group-hover:opacity-40 transition-opacity duration-500"></div>
            <h2 className="font-headline-md text-[20px] text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-fixed-dim">history</span>
              Recent Logs
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {history.map((item, idx) => (
                  <div key={item.id} className="p-4 rounded-xl border border-glass-stroke bg-white/5 hover:bg-white/10 transition-colors group/item cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-label-caps text-label-caps uppercase tracking-wider ${item.status === 'Executed' ? 'text-primary-fixed-dim' : item.status === 'Processing' ? 'text-tertiary-fixed-dim' : item.status === 'Error' ? 'text-error' : 'text-on-surface-variant'}`}>{item.status}</span>
                      <span className="font-data-mono text-[10px] text-on-surface-variant">{item.time}</span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface group-hover/item:text-white transition-colors line-clamp-2">"{item.text}"</p>
                  </div>
              ))}
            </div>
          </div>
          
          {/* Manual Input */}
          <form onSubmit={handleManualSubmit} className="glass-panel rounded-3xl p-4 flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant ml-2">keyboard</span>
            <input name="manualInput" className="glass-input flex-1 rounded-full py-2 px-4 text-on-surface font-body-md text-body-md placeholder-on-surface-variant focus:outline-none focus:ring-0" placeholder="Type override command..." type="text"/>
            <button type="submit" className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </form>
          
          {/* Simulation Presets */}
          <div className="glass-panel rounded-3xl p-4 flex flex-col gap-2">
             <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1 px-2">Simulation Presets</span>
             <button onClick={() => triggerSimulation("add urgent task Draft final research paper")} className="text-left text-xs text-on-surface hover:text-white px-2 py-1.5 hover:bg-white/5 rounded-lg transition-colors">"Add urgent task Draft final research paper"</button>
             <button onClick={() => triggerSimulation("give me my daily briefing")} className="text-left text-xs text-on-surface hover:text-white px-2 py-1.5 hover:bg-white/5 rounded-lg transition-colors">"Give me today's productivity briefing"</button>
          </div>
          
        </div>

        {/* Central Column: Active Voice Module */}
        <div className="md:col-span-8 flex flex-col gap-6 h-full">
          
          {/* Main Visualizer */}
          <div className="glass-panel rounded-3xl flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden min-h-[400px]">
            {/* Background ambient glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-aurora-orange/10 via-transparent to-transparent opacity-50"></div>
            
            <div className="relative w-64 h-64 flex items-center justify-center mb-12">
              {/* Animated Rings */}
              {isListening && (
                  <>
                    <div className="wave-ring"></div>
                    <div className="wave-ring"></div>
                    <div className="wave-ring"></div>
                  </>
              )}
              
              {/* Core Mic Button */}
              <button onClick={isListening ? stopListening : startListening} className="relative z-10 w-32 h-32 rounded-full bg-gradient-to-br from-surface-elevated to-surface-container-highest border border-glass-stroke shadow-[0_0_40px_rgba(255,86,40,0.2)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 group">
                <div className="absolute inset-2 rounded-full bg-surface-container-lowest shadow-inner flex items-center justify-center">
                  <span className={`material-symbols-outlined text-[48px] transition-colors ${isListening ? 'text-error' : 'text-primary-container group-hover:text-primary'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isListening ? 'mic_off' : 'mic'}
                  </span>
                </div>
              </button>
            </div>
            
            {/* Audio Bars (Simulated Activity) */}
            {isListening && (
                <div className="flex items-end justify-center gap-2 h-12 mb-8">
                  <div className="audio-bar" style={{ animationDelay: '0.1s' }}></div>
                  <div className="audio-bar" style={{ animationDelay: '0.3s', height: '30px' }}></div>
                  <div className="audio-bar" style={{ animationDelay: '0.0s', height: '20px' }}></div>
                  <div className="audio-bar" style={{ animationDelay: '0.4s', height: '40px' }}></div>
                  <div className="audio-bar" style={{ animationDelay: '0.2s', height: '25px' }}></div>
                  <div className="audio-bar" style={{ animationDelay: '0.5s', height: '35px' }}></div>
                  <div className="audio-bar" style={{ animationDelay: '0.1s', height: '15px' }}></div>
                </div>
            )}
            
            {/* Status Text */}
            <div className="text-center z-10">
              <h3 className="font-headline-lg text-[28px] text-on-surface mb-2">{isListening ? "Listening..." : "Awaiting Command"}</h3>
              <p className="font-data-mono text-data-mono text-primary-fixed-dim uppercase tracking-widest">{isListening ? "Acoustic Channel Open" : "Systems Standby"}</p>
            </div>
          </div>
          
          {/* Briefing Output */}
          <div className="glass-panel rounded-3xl p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-headline-md text-[18px] text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary-fixed-dim text-[20px]">notes</span>
                Real-time Transcription
              </h2>
              <div className="flex gap-2">
                {speaking && (
                  <button onClick={stopSpeaking} className="text-error hover:text-red-400 transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-[18px]">volume_off</span>
                      <span className="text-xs">Stop</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-black/20 rounded-2xl p-4 border border-white/5 min-h-[120px]">
              {aiLoading ? (
                  <div className="flex items-center gap-2 text-tertiary-fixed-dim font-mono text-sm">
                      <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                      Parsing command sequence...
                  </div>
              ) : (
                  <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                    {transcript || '"Awaiting vocal input..."'}
                    {isListening && <span className="inline-block w-2 h-5 bg-primary-container animate-pulse ml-1 align-middle"></span>}
                  </p>
              )}
              {voiceResult && !aiLoading && (
                 <div className="mt-4 pt-4 border-t border-white/10 text-sm text-tertiary">
                    <strong>AI Response: </strong> {voiceResult.explanation}
                 </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
