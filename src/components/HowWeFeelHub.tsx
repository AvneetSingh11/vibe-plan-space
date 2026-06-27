import React, { useState } from "react";
import { EmotionLog, Task, EmotionalInsight } from "../types";
import { 
  Heart, 
  Brain, 
  Sparkles, 
  ChevronRight,
  ChevronDown, 
  Clock, 
  PenTool, 
  Calendar, 
  HelpCircle,
  Activity,
  Smile,
  Zap,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  BarChart2,
  ArrowRight
} from "lucide-react";
import { EmotionBlock } from "./EmotionBlock";
import { QuadrantEmotionPicker } from "./QuadrantEmotionPicker";

interface HowWeFeelHubProps {
  tasks: Task[];
  onUpdateTaskDetails: (id: string, updates: Partial<Task>) => void;
  emotionLogs: EmotionLog[];
  onAddEmotionLog: (log: Omit<EmotionLog, "id" | "createdAt">) => void;
  onAddNotification: (title: string, message: string, type: "success" | "alert" | "suggestion") => void;
}

export const EMOTION_TEMPLATES = [
  // High Energy, Pleasant
  { emotion: "Excited", emoji: "⚡", energy: "high", pleasantness: "pleasant", color: "from-indigo-400 to-slate-500", glow: "glow-slate" },
  { emotion: "Focused", emoji: "🧠", energy: "high", pleasantness: "pleasant", color: "from-slate-400 to-blue-500", glow: "glow-slate" },
  { emotion: "Happy", emoji: "😊", energy: "high", pleasantness: "pleasant", color: "from-yellow-400 to-indigo-500", glow: "glow-slate" },
  { emotion: "Proud", emoji: "🦁", energy: "high", pleasantness: "pleasant", color: "from-slate-400 to-sky-500", glow: "glow-slate" },
  { emotion: "Energetic", emoji: "🔥", energy: "high", pleasantness: "pleasant", color: "from-red-400 to-slate-500", glow: "glow-slate" },
  { emotion: "Inspired", emoji: "✨", energy: "high", pleasantness: "pleasant", color: "from-slate-400 to-indigo-300", glow: "glow-slate" },
  { emotion: "Playful", emoji: "🎈", energy: "high", pleasantness: "pleasant", color: "from-sky-400 to-yellow-400", glow: "glow-slate" },
  { emotion: "Motivated", emoji: "🎯", energy: "high", pleasantness: "pleasant", color: "from-indigo-400 to-blue-500", glow: "glow-slate" },
  { emotion: "Euphoric", emoji: "🤩", energy: "high", pleasantness: "pleasant", color: "from-yellow-400 to-blue-500", glow: "glow-slate" },
  { emotion: "Empowered", emoji: "🦸", energy: "high", pleasantness: "pleasant", color: "from-indigo-500 to-red-600", glow: "glow-slate" },
  { emotion: "Confident", emoji: "😎", energy: "high", pleasantness: "pleasant", color: "from-slate-400 to-slate-500", glow: "glow-slate" },


  // High Energy, Unpleasant
  { emotion: "Anxious", emoji: "😰", energy: "high", pleasantness: "unpleasant", color: "from-blue-400 to-red-500", glow: "glow-sky" },
  { emotion: "Stressed", emoji: "🤯", energy: "high", pleasantness: "unpleasant", color: "from-red-500 to-sky-600", glow: "glow-sky" },
  { emotion: "Frustrated", emoji: "😤", energy: "high", pleasantness: "unpleasant", color: "from-slate-500 to-red-600", glow: "glow-sky" },
  { emotion: "Angry", emoji: "😡", energy: "high", pleasantness: "unpleasant", color: "from-red-600 to-blue-700", glow: "glow-sky" },
  { emotion: "Overwhelmed", emoji: "🌀", energy: "high", pleasantness: "unpleasant", color: "from-indigo-500 to-blue-500", glow: "glow-sky" },
  { emotion: "Panicked", emoji: "🚨", energy: "high", pleasantness: "unpleasant", color: "from-red-500 to-slate-800", glow: "glow-sky" },
  { emotion: "Irritated", emoji: "💢", energy: "high", pleasantness: "unpleasant", color: "from-slate-500 to-slate-800", glow: "glow-sky" },
  { emotion: "Jittery", emoji: "🫨", energy: "high", pleasantness: "unpleasant", color: "from-yellow-600 to-red-700", glow: "glow-sky" },
  { emotion: "Furious", emoji: "🤬", energy: "high", pleasantness: "unpleasant", color: "from-red-700 to-black", glow: "glow-sky" },
  { emotion: "Restless", emoji: "😬", energy: "high", pleasantness: "unpleasant", color: "from-blue-500 to-indigo-600", glow: "glow-sky" },
  { emotion: "Defensive", emoji: "🛡️", energy: "high", pleasantness: "unpleasant", color: "from-slate-700 to-blue-900", glow: "glow-sky" },


  // Low Energy, Pleasant
  { emotion: "Calm", emoji: "🧘", energy: "low", pleasantness: "pleasant", color: "from-slate-400 to-blue-500", glow: "glow-green" },
  { emotion: "Relaxed", emoji: "😌", energy: "low", pleasantness: "pleasant", color: "from-blue-400 to-sky-500", glow: "glow-green" },
  { emotion: "Peaceful", emoji: "🕊️", energy: "low", pleasantness: "pleasant", color: "from-indigo-400 to-slate-500", glow: "glow-green" },
  { emotion: "Grateful", emoji: "🙏", energy: "low", pleasantness: "pleasant", color: "from-green-400 to-slate-500", glow: "glow-green" },
  { emotion: "Satisfied", emoji: "💚", energy: "low", pleasantness: "pleasant", color: "from-slate-500 to-green-600", glow: "glow-green" },
  { emotion: "Serene", emoji: "🌊", energy: "low", pleasantness: "pleasant", color: "from-indigo-300 to-blue-400", glow: "glow-green" },
  { emotion: "Content", emoji: "☕", energy: "low", pleasantness: "pleasant", color: "from-blue-400 to-lime-300", glow: "glow-green" },
  { emotion: "Thoughtful", emoji: "💬", energy: "low", pleasantness: "pleasant", color: "from-blue-400 to-blue-400", glow: "glow-green" },
  { emotion: "Cozy", emoji: "🍵", energy: "low", pleasantness: "pleasant", color: "from-indigo-200 to-blue-300", glow: "glow-green" },
  { emotion: "Mellow", emoji: "🪴", energy: "low", pleasantness: "pleasant", color: "from-blue-200 to-green-400", glow: "glow-green" },
  { emotion: "Reflective", emoji: "🪞", energy: "low", pleasantness: "pleasant", color: "from-blue-300 to-indigo-400", glow: "glow-green" },


  // Low Energy, Unpleasant
  { emotion: "Tired", emoji: "🥱", energy: "low", pleasantness: "unpleasant", color: "from-blue-400 to-blue-500", glow: "" },
  { emotion: "Bored", emoji: "😐", energy: "low", pleasantness: "unpleasant", color: "from-slate-400 to-blue-500", glow: "" },
  { emotion: "Sad", emoji: "😢", energy: "low", pleasantness: "unpleasant", color: "from-blue-500 to-blue-600", glow: "" },
  { emotion: "Lonely", emoji: "🥀", energy: "low", pleasantness: "unpleasant", color: "from-blue-600 to-slate-600", glow: "" },
  { emotion: "Disappointed", emoji: "🥺", energy: "low", pleasantness: "unpleasant", color: "from-slate-500 to-blue-600", glow: "" },
  { emotion: "Exhausted", emoji: "🔋", energy: "low", pleasantness: "unpleasant", color: "from-slate-700 to-black", glow: "" },
  { emotion: "Gloomy", emoji: "🌧️", energy: "low", pleasantness: "unpleasant", color: "from-blue-800 to-slate-900", glow: "" },
  { emotion: "Apathetic", emoji: "💨", energy: "low", pleasantness: "unpleasant", color: "from-zinc-500 to-zinc-700", glow: "" },
  { emotion: "Numb", emoji: "🧊", energy: "low", pleasantness: "unpleasant", color: "from-slate-400 to-slate-600", glow: "" },
  { emotion: "Drained", emoji: "🪫", energy: "low", pleasantness: "unpleasant", color: "from-zinc-600 to-slate-800", glow: "" },
  { emotion: "Hopeless", emoji: "🌌", energy: "low", pleasantness: "unpleasant", color: "from-blue-900 to-black", glow: "" },

];


const CustomSelect = ({ value, onChange, options, placeholder, className = "" }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[], placeholder: string, className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-[10px] sm:text-xs rounded-xl text-left flex items-center justify-between bg-slate-950/60 border border-slate-800 hover:border-slate-500/50 transition-colors cursor-pointer text-slate-200"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                className="w-full text-left px-3 py-2 text-[10px] sm:text-xs text-slate-200 hover:bg-slate-600/20 hover:text-slate-300 transition-colors first:rounded-t-xl last:rounded-b-xl truncate"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const HowWeFeelHub: React.FC<HowWeFeelHubProps> = ({
  tasks,
  onUpdateTaskDetails,
  emotionLogs,
  onAddEmotionLog,
  onAddNotification
}) => {
  // Input states
  const [selectedQuadrant, setSelectedQuadrant] = useState<"high-pleasant" | "high-unpleasant" | "low-pleasant" | "low-unpleasant" | null>(null);
  const [chosenEmotion, setChosenEmotion] = useState<typeof EMOTION_TEMPLATES[0] | null>(null);
  const [logNote, setLogNote] = useState("");
  const [associatedTaskId, setAssociatedTaskId] = useState("");

  // Task-specific mood states
  const [taskBeforeLogSelected, setTaskBeforeLogSelected] = useState<string>("");
  const [taskBeforeEmotion, setTaskBeforeEmotion] = useState<string>("");
  const [taskAfterLogSelected, setTaskAfterLogSelected] = useState<string>("");
  const [taskAfterEmotion, setTaskAfterEmotion] = useState<string>("");

  // AI Insights states
  const [aiInsights, setAiInsights] = useState<EmotionalInsight | null>(() => {
    const saved = localStorage.getItem("actionmate_emotional_insights");
    return saved ? JSON.parse(saved) : null;
  });
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Tab control inside the hub
  const [hubTab, setHubTab] = useState<"log" | "stats" | "insights" | "analytics">("log");
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Filtering template list based on quadrant selection
  const filteredTemplates = EMOTION_TEMPLATES.filter(item => {
    if (!selectedQuadrant) return true;
    if (selectedQuadrant === "high-pleasant") return item.energy === "high" && item.pleasantness === "pleasant";
    if (selectedQuadrant === "high-unpleasant") return item.energy === "high" && item.pleasantness === "unpleasant";
    if (selectedQuadrant === "low-pleasant") return item.energy === "low" && item.pleasantness === "pleasant";
    if (selectedQuadrant === "low-unpleasant") return item.energy === "low" && item.pleasantness === "unpleasant";
    return true;
  });

  const handleQuickLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosenEmotion) {
      alert("Please select an emotion from the templates first!");
      return;
    }

    const taskMatch = tasks.find(t => t.id === associatedTaskId);

    onAddEmotionLog({
      taskId: associatedTaskId || undefined,
      taskTitle: taskMatch ? taskMatch.title : undefined,
      stage: "independent",
      emotion: chosenEmotion.emotion,
      emoji: chosenEmotion.emoji,
      energy: chosenEmotion.energy as "high" | "low",
      pleasantness: chosenEmotion.pleasantness as "pleasant" | "unpleasant",
      note: logNote.trim() || undefined
    });

    onAddNotification(
      `Mood Recorded: ${chosenEmotion.emotion}`,
      `You recorded feeling ${chosenEmotion.emotion} ${chosenEmotion.emoji}. Cultivating self-awareness increases cognitive control!`,
      "success"
    );

    // If associated with a task, update the task's pre-emotion state
    if (associatedTaskId) {
      onUpdateTaskDetails(associatedTaskId, { emotionBefore: chosenEmotion.emotion });
    }

    // Reset inputs
    setLogNote("");
    setChosenEmotion(null);
    setAssociatedTaskId("");
    setSelectedQuadrant(null);
  };

  const handleTaskBeforeSubmit = (taskId: string, emotion: string) => {
    if (!emotion) return;
    onUpdateTaskDetails(taskId, { emotionBefore: emotion });
    
    const template = EMOTION_TEMPLATES.find(t => t.emotion === emotion) || EMOTION_TEMPLATES[1]; // default focused
    
    onAddEmotionLog({
      taskId,
      taskTitle: tasks.find(t => t.id === taskId)?.title,
      stage: "before",
      emotion,
      emoji: template.emoji,
      energy: template.energy as "high" | "low",
      pleasantness: template.pleasantness as "pleasant" | "unpleasant",
      note: "Logged before starting task"
    });

    setTaskBeforeLogSelected("");
    setTaskBeforeEmotion("");

    onAddNotification(
      "Focus Intent Logged",
      `Mindset primed as "${emotion}" for your next deep focus block. Execute with purpose.`,
      "success"
    );
  };

  const handleTaskAfterSubmit = (taskId: string, emotion: string) => {
    if (!emotion) return;
    onUpdateTaskDetails(taskId, { emotionAfter: emotion });

    const template = EMOTION_TEMPLATES.find(t => t.emotion === emotion) || EMOTION_TEMPLATES[10]; // default calm
    
    onAddEmotionLog({
      taskId,
      taskTitle: tasks.find(t => t.id === taskId)?.title,
      stage: "after",
      emotion,
      emoji: template.emoji,
      energy: template.energy as "high" | "low",
      pleasantness: template.pleasantness as "pleasant" | "unpleasant",
      note: "Logged after completing task"
    });

    setTaskAfterLogSelected("");
    setTaskAfterEmotion("");

    onAddNotification(
      "Reflection Captured",
      `Completed task reflection logged as "${emotion}". Transition successful.`,
      "success"
    );
  };

  const fetchAIInsights = async () => {
    setInsightsLoading(true);
    try {
      const response = await fetch("/api/ai/emotional-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tasks,
          emotionLogs
        })
      });

      const data = await response.json();
      if (data.insights) {
        setAiInsights(data.insights);
        localStorage.setItem("actionmate_emotional_insights", JSON.stringify(data.insights));
        onAddNotification(
          "Mind & Focus Insights Ready",
          "Gemini has generated direct psychodynamic insights from your productivity and emotional history.",
          "success"
        );
      }
    } catch (err) {
      console.error("Failed to generate emotional insights:", err);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Math stats for local rendering
  const totalLogs = emotionLogs.length;
  const countHighPleasant = emotionLogs.filter(l => l.energy === "high" && l.pleasantness === "pleasant").length;
  const countHighUnpleasant = emotionLogs.filter(l => l.energy === "high" && l.pleasantness === "unpleasant").length;
  const countLowPleasant = emotionLogs.filter(l => l.energy === "low" && l.pleasantness === "pleasant").length;
  const countLowUnpleasant = emotionLogs.filter(l => l.energy === "low" && l.pleasantness === "unpleasant").length;

  const pctHP = totalLogs > 0 ? Math.round((countHighPleasant / totalLogs) * 100) : 0;
  const pctHU = totalLogs > 0 ? Math.round((countHighUnpleasant / totalLogs) * 100) : 0;
  const pctLP = totalLogs > 0 ? Math.round((countLowPleasant / totalLogs) * 100) : 0;
  const pctLU = totalLogs > 0 ? Math.round((countLowUnpleasant / totalLogs) * 100) : 0;

  // Average emotional energy index
  const highEnergyCount = emotionLogs.filter(l => l.energy === "high").length;
  const lowEnergyCount = emotionLogs.filter(l => l.energy === "low").length;
  const energyPercent = totalLogs > 0 ? Math.round((highEnergyCount / totalLogs) * 100) : 50;

  // Average pleasantness level index
  const pleasantCount = emotionLogs.filter(l => l.pleasantness === "pleasant").length;
  const pleasantPercent = totalLogs > 0 ? Math.round((pleasantCount / totalLogs) * 100) : 50;

  return (
    <div id="how-we-feel-hub" className="space-y-6">
      
      {/* Banner introduction with glass design */}
      <div className="card-3d bg-card border-none p-6 rounded-2xl border border-slate-500/10 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[120%] bg-gradient-to-br from-slate-500/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase font-mono flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-slate-400 fill-slate-400/20" /> Mind & Focus Hub
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-foreground font-display">
              The "How We Feel" Focus Engine
            </h2>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Emotions drive focus. Track your emotional state before and after task execution. Optimize your workflow, manage performance anxiety, and unlock tailored AI cognitive recommendations.
            </p>
          </div>

          <div className="flex bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80 self-start md:self-auto shrink-0 max-w-full overflow-x-auto no-scrollbar scrollbar-none">
            <button
              onClick={() => setHubTab("log")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                hubTab === "log" ? "bg-slate-600 text-slate-950 shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Log Emotion
            </button>
            <button
              onClick={() => setHubTab("stats")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                hubTab === "stats" ? "bg-slate-600 text-slate-950 shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mind Statistics
            </button>
            <button
              onClick={() => setHubTab("analytics")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                hubTab === "analytics" ? "bg-slate-600 text-slate-950 shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Deep Analytics
            </button>
            <button
              onClick={() => setHubTab("insights")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                hubTab === "insights" ? "bg-slate-600 text-slate-950 shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              AI Insights Guide
            </button>
          </div>
        </div>
      </div>

      {/* RENDER LOG MOOD TAB */}
      {hubTab === "log" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Interactive 2x2 grid (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="card-3d bg-card border-none p-5 rounded-2xl border border-slate-800/60 flex flex-col h-full">
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-1.5 font-display">
                <Smile className="w-4 h-4 text-slate-400" />
                Select Your Emotional Quadrant
              </h3>

              {/* The "How We Feel" style 2x2 Grid Layout */}
              <div className="grid grid-cols-2 gap-4 aspect-square md:aspect-auto md:h-[380px] w-full mb-4">
                
                {/* Yellow Quadrant: High Energy, Pleasant */}
                <button
                  type="button"
                  onClick={() => setSelectedQuadrant("high-pleasant")}
                  className={`relative p-5 rounded-2xl flex flex-col justify-between text-left transition-all duration-300 border cursor-pointer ${
                    selectedQuadrant === "high-pleasant"
                      ? "bg-indigo-500/15 border-indigo-400/80 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                      : "bg-indigo-950/5 border-indigo-500/10 hover:border-indigo-500/40 hover:bg-indigo-500/5"
                  }`}
                >
                  <div>
                    <span className="block text-sm font-extrabold text-indigo-300 uppercase tracking-wider font-sans">High Energy</span>
                    <span className="block text-xs text-indigo-500 font-semibold font-mono mt-1">Pleasant Feelings</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex -space-x-1.5">
                      <EmotionBlock emotion="Happy" size="sm" animate={false} />
                      <EmotionBlock emotion="Excited" size="sm" animate={false} />
                    </div>
                    <span className="text-xs font-bold bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20">Yellow</span>
                  </div>
                </button>

                {/* Red Quadrant: High Energy, Unpleasant */}
                <button
                  type="button"
                  onClick={() => setSelectedQuadrant("high-unpleasant")}
                  className={`relative p-5 rounded-2xl flex flex-col justify-between text-left transition-all duration-300 border cursor-pointer ${
                    selectedQuadrant === "high-unpleasant"
                      ? "bg-blue-500/15 border-blue-400/80 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                      : "bg-blue-950/5 border-blue-500/10 hover:border-blue-500/40 hover:bg-blue-500/5"
                  }`}
                >
                  <div>
                    <span className="block text-sm font-extrabold text-blue-300 uppercase tracking-wider font-sans">High Energy</span>
                    <span className="block text-xs text-blue-500 font-semibold font-mono mt-1">Unpleasant Feelings</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex -space-x-1.5">
                      <EmotionBlock emotion="Anxious" size="sm" animate={false} />
                      <EmotionBlock emotion="Stressed" size="sm" animate={false} />
                    </div>
                    <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">Red</span>
                  </div>
                </button>

                {/* Green Quadrant: Low Energy, Pleasant */}
                <button
                  type="button"
                  onClick={() => setSelectedQuadrant("low-pleasant")}
                  className={`relative p-5 rounded-2xl flex flex-col justify-between text-left transition-all duration-300 border cursor-pointer ${
                    selectedQuadrant === "low-pleasant"
                      ? "bg-slate-500/15 border-slate-400/80 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                      : "bg-slate-950/5 border-slate-500/10 hover:border-slate-500/40 hover:bg-slate-500/5"
                  }`}
                >
                  <div>
                    <span className="block text-sm font-extrabold text-slate-300 uppercase tracking-wider font-sans">Low Energy</span>
                    <span className="block text-xs text-slate-500 font-semibold font-mono mt-1">Pleasant Feelings</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex -space-x-1.5">
                      <EmotionBlock emotion="Calm" size="sm" animate={false} />
                      <EmotionBlock emotion="Relaxed" size="sm" animate={false} />
                    </div>
                    <span className="text-xs font-bold bg-slate-500/10 text-slate-400 px-2 py-1 rounded border border-slate-500/20">Green</span>
                  </div>
                </button>

                {/* Blue Quadrant: Low Energy, Unpleasant */}
                <button
                  type="button"
                  onClick={() => setSelectedQuadrant("low-unpleasant")}
                  className={`relative p-5 rounded-2xl flex flex-col justify-between text-left transition-all duration-300 border cursor-pointer ${
                    selectedQuadrant === "low-unpleasant"
                      ? "bg-blue-500/15 border-blue-400/80 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                      : "bg-blue-950/5 border-blue-500/10 hover:border-blue-500/40 hover:bg-blue-500/5"
                  }`}
                >
                  <div>
                    <span className="block text-sm font-extrabold text-blue-300 uppercase tracking-wider font-sans">Low Energy</span>
                    <span className="block text-xs text-blue-500 font-semibold font-mono mt-1">Unpleasant Feelings</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex -space-x-1.5">
                      <EmotionBlock emotion="Tired" size="sm" animate={false} />
                      <EmotionBlock emotion="Bored" size="sm" animate={false} />
                    </div>
                    <span className="text-xs font-bold bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">Blue</span>
                  </div>
                </button>

              </div>

              {/* Specific Emotion Word Selector based on selection */}
              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    {selectedQuadrant ? "Select Specific Feeling Template:" : "Select a category above or choose from all:"}
                  </span>
                  {selectedQuadrant && (
                    <button
                      onClick={() => setSelectedQuadrant(null)}
                      className="text-[10px] text-slate-400 hover:text-slate-300 font-mono"
                    >
                      Show All Categories
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pr-1">
                  {filteredTemplates.map(item => (
                    <button
                      key={item.emotion}
                      type="button"
                      onClick={() => setChosenEmotion(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                        chosenEmotion?.emotion === item.emotion
                          ? "bg-slate-600 text-slate-950 border-slate-500 font-extrabold"
                          : "bg-slate-950/50 border-slate-800 hover:border-slate-700 text-foreground"
                      }`}
                    >
                      <EmotionBlock emotion={item.emotion} size="xs" animate={false} />
                      <span>{item.emotion}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT: Logging form and active task triggers (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Log Form */}
            <div className="card-3d bg-card border-none p-5 rounded-2xl border border-slate-800/60">
              <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5 font-display">
                <PenTool className="w-4 h-4 text-slate-400" />
                Submit Emotional Check-In
              </h3>

              <form onSubmit={handleQuickLog} className="space-y-4">
                {/* Active Choice Summary */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center gap-3">
                  <div className="shrink-0">
                    {chosenEmotion ? (
                      <EmotionBlock emotion={chosenEmotion.emotion} size="md" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-muted-foreground text-xs font-bold">
                        ?
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Active Emotion</span>
                    <span className="block text-sm font-bold text-foreground">
                      {chosenEmotion ? `${chosenEmotion.emotion} (${chosenEmotion.energy} energy, ${chosenEmotion.pleasantness})` : "Please select an emotion..."}
                    </span>
                  </div>
                </div>

                {/* Associate Task */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1 font-mono">
                    Associate with Task (Optional)
                  </label>
                  <CustomSelect
                    value={associatedTaskId}
                    onChange={setAssociatedTaskId}
                    placeholder="No specific task (general log)"
                    options={[
                      { value: "", label: "No specific task (general log)" },
                      ...tasks.map(t => ({ value: t.id, label: `${t.completed ? "✓" : "⏰"} ${t.title}` }))
                    ]}
                  />
                </div>

                {/* Personal Reflexive Note */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1 font-mono">
                    Self-Reflective Note (Context or triggers)
                  </label>
                  <textarea
                    rows={2}
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    placeholder="E.g., I'm feeling stressed due to a close deadline, but I'm ready to write down the final code."
                    className="w-full px-3 py-2 text-xs rounded-xl text-foreground placeholder-slate-500 bg-slate-950/40 border border-slate-800 focus:outline-none focus:border-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!chosenEmotion}
                  className="w-full py-2.5 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 fill-slate-950/10" />
                  Record Reflection Entry
                </button>
              </form>
            </div>

            {/* Pre/Post Task Specific Action Panel */}
            <div className="card-3d bg-card border-none p-5 rounded-2xl border border-slate-800/60 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 font-display">
                <Brain className="w-4 h-4 text-slate-400" />
                Before & After Task reflections
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Connect your emotional state directly to tasks. Start a task with an intentional focus mindset, and reflect once complete.
              </p>

              {/* Before Starting List */}
              <div className="space-y-2.5">
                <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                  Pending Task Mood Trigger
                </span>

                {tasks.filter(t => !t.completed).length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic">No active tasks available to track.</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.filter(t => !t.completed).map(task => (
                      <div key={task.id} className="p-2 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-200 truncate">{task.title}</p>
                          <div className="text-[9px] text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
                            Before state: {task.emotionBefore ? (
                              <span className="text-slate-400 font-bold flex items-center gap-1">
                                <EmotionBlock emotion={task.emotionBefore} size="xs" animate={false} />
                                {task.emotionBefore}
                              </span>
                            ) : (
                              <span className="text-slate-600 italic">Not logged</span>
                            )}
                          </div>
                        </div>

                        {taskBeforeLogSelected === task.id ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <QuadrantEmotionPicker
                              value={taskBeforeEmotion}
                              onChange={setTaskBeforeEmotion}
                              placeholder="Choose..."
                              className="w-[110px]"
                            />
                            <button
                              onClick={() => handleTaskBeforeSubmit(task.id, taskBeforeEmotion)}
                              disabled={!taskBeforeEmotion}
                              className="text-[9px] bg-slate-600 hover:bg-slate-500 text-slate-950 px-1.5 py-0.5 rounded font-bold cursor-pointer"
                            >
                              Log
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setTaskBeforeLogSelected(task.id);
                              setTaskBeforeEmotion("");
                            }}
                            className="text-[9px] bg-slate-900 hover:bg-slate-800 border border-slate-700 text-foreground px-2 py-1 rounded-lg font-bold cursor-pointer shrink-0"
                          >
                            Set Mindset
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* After Completing List */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/40">
                <span className="block text-[10px] uppercase font-bold text-sky-400 tracking-wider font-mono">
                  Reflect on Completed Tasks
                </span>

                {tasks.filter(t => t.completed).length === 0 ? (
                  <p className="text-[10px] text-muted-foreground italic">Complete a task on your board to log reflection stats.</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.filter(t => t.completed).map(task => (
                      <div key={task.id} className="p-2 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-muted-foreground line-through truncate">{task.title}</p>
                          <div className="text-[9px] text-muted-foreground font-mono flex items-center gap-1.5 flex-wrap mt-0.5">
                            Mindset Flow: 
                            {task.emotionBefore ? (
                              <span className="text-foreground flex items-center gap-1">
                                <EmotionBlock emotion={task.emotionBefore} size="xs" animate={false} />
                                {task.emotionBefore}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">Unknown</span>
                            )}
                            <span className="text-slate-600">&rarr;</span>
                            {task.emotionAfter ? (
                              <span className="text-sky-400 font-bold flex items-center gap-1">
                                <EmotionBlock emotion={task.emotionAfter} size="xs" animate={false} />
                                {task.emotionAfter}
                              </span>
                            ) : (
                              <span className="text-slate-600 italic">Not logged</span>
                            )}
                          </div>
                        </div>

                        {!task.emotionAfter && (
                          taskAfterLogSelected === task.id ? (
                            <div className="flex items-center gap-1 shrink-0">
                              <QuadrantEmotionPicker
                                value={taskAfterEmotion}
                                onChange={setTaskAfterEmotion}
                                placeholder="Choose..."
                                className="w-[110px]"
                              />
                              <button
                                onClick={() => handleTaskAfterSubmit(task.id, taskAfterEmotion)}
                                disabled={!taskAfterEmotion}
                                className="text-[9px] bg-sky-600 hover:bg-sky-500 text-slate-950 px-1.5 py-0.5 rounded font-bold cursor-pointer"
                              >
                                Log
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setTaskAfterLogSelected(task.id);
                                setTaskAfterEmotion("");
                              }}
                              className="text-[9px] bg-sky-600/10 hover:bg-sky-600/20 border border-sky-500/20 text-sky-400 px-2 py-1 rounded-lg font-bold cursor-pointer shrink-0"
                            >
                              Reflect Mood
                            </button>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* RENDER STATISTICS TAB */}
      {hubTab === "stats" && (() => {
        const triggerCounts: Record<string, number> = {};
        const distortionCounts: Record<string, number> = {};
        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;
        let logsWithAnalysis = 0;

        emotionLogs.forEach(l => {
          if (l.analysis) {
            logsWithAnalysis++;
            const t = l.analysis.primaryTrigger || "Unknown";
            triggerCounts[t] = (triggerCounts[t] || 0) + 1;

            const d = l.analysis.cognitiveDistortion || "Mindful Reflection";
            distortionCounts[d] = (distortionCounts[d] || 0) + 1;

            if (l.analysis.sentiment === "positive") positiveCount++;
            else if (l.analysis.sentiment === "negative") negativeCount++;
            else neutralCount++;
          }
        });

        return (
          <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Visual Donut Dial Metrics (5 cols) */}
            <div className="md:col-span-5 card-3d bg-card border-none p-5 rounded-2xl border border-slate-800/60 flex flex-col items-center justify-center min-h-[300px]">
              <h3 className="text-sm font-bold text-slate-200 mb-6 self-start flex items-center gap-1.5 font-display">
                <Activity className="w-4 h-4 text-slate-400" /> Average Mood Coordinates
              </h3>

              <div className="grid grid-cols-2 gap-8 w-full">
                
                {/* Energy Ring Gauge */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="10" fill="transparent" />
                      <circle cx="50" cy="50" r="40" stroke="url(#energyGlow)" strokeWidth="10" fill="transparent" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - energyPercent / 100)}`} strokeLinecap="round" />
                      <defs>
                        <linearGradient id="energyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#d97706" />
                          <stop offset="100%" stopColor="#c084fc" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-lg font-extrabold text-foreground font-mono">{energyPercent}%</p>
                      <p className="text-[8px] text-muted-foreground font-mono uppercase tracking-wider">High Energy</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground">Energy Level Index</p>
                    <p className="text-[9px] text-muted-foreground font-mono mt-0.5">High vs. low body battery</p>
                  </div>
                </div>

                {/* Pleasantness Ring Gauge */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="10" fill="transparent" />
                      <circle cx="50" cy="50" r="40" stroke="url(#pleasantGlow)" strokeWidth="10" fill="transparent" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - pleasantPercent / 100)}`} strokeLinecap="round" />
                      <defs>
                        <linearGradient id="pleasantGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute text-center">
                      <p className="text-lg font-extrabold text-foreground font-mono">{pleasantPercent}%</p>
                      <p className="text-[8px] text-muted-foreground font-mono uppercase tracking-wider">Pleasant</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-foreground">Affective Pleasantness</p>
                    <p className="text-[9px] text-muted-foreground font-mono mt-0.5">Positive vs. anxious states</p>
                  </div>
                </div>

              </div>

            </div>

            {/* Distribution Stats Bars (7 cols) */}
            <div className="md:col-span-7 card-3d bg-card border-none p-5 rounded-2xl border border-slate-800/60 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 font-display">
                <TrendingUp className="w-4 h-4 text-slate-400" /> Affect Quadrant Distribution
              </h3>

              {totalLogs === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs italic">
                  Not enough log entries captured yet. Log some emotional coordinates!
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  {/* Yellow Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-yellow-200 flex items-center gap-1">💛 Yellow: High Energy, Pleasant</span>
                      <span className="font-mono text-muted-foreground">{countHighPleasant} logs ({pctHP}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/50">
                      <div className="bg-gradient-to-r from-yellow-200/80 to-amber-300/80 h-full rounded-full transition-all duration-500" style={{ width: `${pctHP}%` }}></div>
                    </div>
                  </div>

                  {/* Red Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-rose-300 flex items-center gap-1">❤️ Red: High Energy, Unpleasant</span>
                      <span className="font-mono text-muted-foreground">{countHighUnpleasant} logs ({pctHU}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/50">
                      <div className="bg-gradient-to-r from-rose-300/80 to-red-300/80 h-full rounded-full transition-all duration-500" style={{ width: `${pctHU}%` }}></div>
                    </div>
                  </div>

                  {/* Green Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-300 flex items-center gap-1">💚 Green: Low Energy, Pleasant</span>
                      <span className="font-mono text-muted-foreground">{countLowPleasant} logs ({pctLP}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/50">
                      <div className="bg-gradient-to-r from-emerald-300/80 to-teal-300/80 h-full rounded-full transition-all duration-500" style={{ width: `${pctLP}%` }}></div>
                    </div>
                  </div>

                  {/* Blue Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-300 flex items-center gap-1">💙 Blue: Low Energy, Unpleasant</span>
                      <span className="font-mono text-muted-foreground">{countLowUnpleasant} logs ({pctLU}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800/50">
                      <div className="bg-gradient-to-r from-blue-300/80 to-indigo-300/80 h-full rounded-full transition-all duration-500" style={{ width: `${pctLU}%` }}></div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Reflective Mindset Analytics (AI-Powered) */}
          <div className="card-3d bg-card border-none p-5 rounded-2xl border border-slate-800/60 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 font-display">
              <Sparkles className="w-4 h-4 text-slate-400 animate-pulse" /> Reflective Mindset Analytics (AI)
            </h3>

            {logsWithAnalysis === 0 ? (
              <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-2">
                <p className="text-xs font-bold text-slate-300">Unlock Deep Cognitive Insights</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Start logging your thoughts in the <strong>Self-Reflective Note</strong> box when capturing your mood.
                  Gemini will analyze your cognitive triggers and patterns, building customized sentiment and psychological graphs right here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Column 1: Sentiment */}
                <div className="bg-slate-950/30 border border-slate-900 rounded-xl p-4 space-y-3">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground font-mono">Reflective Sentiment</p>
                  <div className="space-y-2">
                    {/* Positive */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-emerald-400 font-medium">🟢 Positive Outcomes</span>
                        <span className="font-mono text-muted-foreground">{positiveCount} ({Math.round((positiveCount / logsWithAnalysis) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(positiveCount / logsWithAnalysis) * 100}%` }}></div>
                      </div>
                    </div>

                    {/* Negative */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-rose-400 font-medium">🔴 Cognitive Strain</span>
                        <span className="font-mono text-muted-foreground">{negativeCount} ({Math.round((negativeCount / logsWithAnalysis) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(negativeCount / logsWithAnalysis) * 100}%` }}></div>
                      </div>
                    </div>

                    {/* Neutral */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">⚪ Grounded / Neutral</span>
                        <span className="font-mono text-muted-foreground">{neutralCount} ({Math.round((neutralCount / logsWithAnalysis) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-slate-400 h-full rounded-full" style={{ width: `${(neutralCount / logsWithAnalysis) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Emotional Triggers */}
                <div className="bg-slate-950/30 border border-slate-900 rounded-xl p-4 space-y-3">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground font-mono">Top Mind Triggers</p>
                  <div className="space-y-2">
                    {Object.entries(triggerCounts).sort((a,b) => b[1] - a[1]).slice(0, 3).map(([trigger, count]) => (
                      <div key={trigger} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300 truncate max-w-[150px] font-medium">{trigger}</span>
                          <span className="font-mono text-muted-foreground">{count} times</span>
                        </div>
                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(count / logsWithAnalysis) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 3: Mindset Patterns */}
                <div className="bg-slate-950/30 border border-slate-900 rounded-xl p-4 space-y-3">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground font-mono">Cognitive Patterns</p>
                  <div className="space-y-2 overflow-y-auto max-h-[100px] pr-1">
                    {Object.entries(distortionCounts).sort((a,b) => b[1] - a[1]).map(([distortion, count]) => (
                      <div key={distortion} className="flex justify-between items-center text-[11px] py-0.5 border-b border-slate-900/40">
                        <span className="text-slate-300 font-medium truncate max-w-[160px]">{distortion}</span>
                        <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 font-bold">{count}x</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Historical Check-Ins log feed list */}
          <div className="card-3d bg-card border-none p-5 rounded-2xl border border-slate-800/60">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-1.5 font-display">
              <Calendar className="w-4 h-4 text-slate-400" />
              Mind Reflection Feed History
            </h3>

            {emotionLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6 italic">No reflection logs stored. Share how you feel above!</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {emotionLogs.slice().map((log) => {
                  let badgeColor = "bg-slate-900 border-slate-800 text-muted-foreground";
                  if (log.energy === "high" && log.pleasantness === "pleasant") badgeColor = "bg-indigo-500/10 border-indigo-500/20 text-indigo-300";
                  if (log.energy === "high" && log.pleasantness === "unpleasant") badgeColor = "bg-blue-500/10 border-blue-500/20 text-blue-300";
                  if (log.energy === "low" && log.pleasantness === "pleasant") badgeColor = "bg-slate-500/10 border-slate-500/20 text-slate-300";
                  if (log.energy === "low" && log.pleasantness === "unpleasant") badgeColor = "bg-blue-500/10 border-blue-500/20 text-blue-300";

                  return (
                    <div key={log.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <EmotionBlock emotion={log.emotion} size="sm" className="mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-foreground text-[12px]">{log.emotion}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                              {log.energy} Energy &bull; {log.pleasantness}
                            </span>
                            {log.taskTitle && (
                              <span className="text-[9px] bg-slate-900 text-muted-foreground px-2 py-0.5 rounded border border-slate-800 truncate max-w-[200px]">
                                Task: {log.taskTitle}
                              </span>
                            )}
                          </div>
                          {log.note && (
                            <div className="mt-1 space-y-1">
                              <p className="text-muted-foreground italic text-[11px] leading-relaxed">
                                "{log.note}"
                              </p>
                              {log.analysis && (
                                <div className="flex flex-wrap items-center gap-2 mt-1.5 pt-1.5 border-t border-slate-900/30">
                                  {/* Sentiment */}
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                                    log.analysis.sentiment === "positive" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                    log.analysis.sentiment === "negative" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                                    "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                                  }`}>
                                    <span>{log.analysis.sentiment === "positive" ? "🟢 Positive" : log.analysis.sentiment === "negative" ? "🔴 Negative" : "⚪ Neutral"}</span>
                                  </span>

                                  {/* Trigger */}
                                  {log.analysis.primaryTrigger && (
                                    <span className="text-[9px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-1.5 py-0.5 rounded-md font-mono">
                                      🎯 {log.analysis.primaryTrigger}
                                    </span>
                                  )}

                                  {/* Cognitive Distortion */}
                                  {log.analysis.cognitiveDistortion && (
                                    <span className="text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded-md font-mono">
                                      🧠 Pattern: {log.analysis.cognitiveDistortion}
                                    </span>
                                  )}
                                </div>
                              )}
                              {log.analysis?.copingStrategy && (
                                <p className="text-[10px] text-amber-200/90 bg-amber-500/5 border border-amber-500/10 p-2 rounded-lg mt-1 font-sans leading-relaxed">
                                  💡 <strong>AI Strategy:</strong> {log.analysis.copingStrategy}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-[10px] text-muted-foreground font-mono shrink-0 md:text-right">
                        <span>{new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    })()}

      {/* RENDER AI INSIGHTS TAB */}
      {hubTab === "insights" && (
        <div className="space-y-6">
          <div className="card-3d bg-card border-none p-6 rounded-2xl border border-slate-800/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Sparkles className="w-24 h-24 text-slate-400 animate-pulse" />
            </div>

            <div className="space-y-4 max-w-3xl">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 font-display">
                <Sparkles className="w-5 h-5 text-slate-400 animate-spin" style={{ animationDuration: "12s" }} />
                Gemini Cognitive Mindset Companion
              </h3>
              <p className="text-xs text-foreground leading-relaxed">
                Unlock psychodynamic correlations mapping your emotions to task durations and completion success. Vibe Plan Space runs advanced server-side Gemini LLMs to analyze emotional blockages and offer scientific productivity hacks.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={fetchAIInsights}
                  disabled={insightsLoading}
                  className="px-4 py-2 bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-500 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-600 rounded-xl text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-slate-500/10 transition-all duration-200"
                >
                  {insightsLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      Analyzing Mind Vectors...
                    </>
                  ) : (
                    <>
                      <Brain className="w-3.5 h-3.5" />
                      Generate Mind-to-Focus Analysis
                    </>
                  )}
                </button>

                {aiInsights && (
                  <span className="text-[10px] text-muted-foreground self-center font-mono">
                    Last computed: {new Date(aiInsights.timestamp).toLocaleDateString()} at {new Date(aiInsights.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Render Active Insights Card */}
          {insightsLoading && (
            <div className="card-3d bg-card border-none p-12 rounded-2xl border border-slate-800/60 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-600/10 border border-slate-500/20 flex items-center justify-center animate-bounce">
                <Brain className="w-6 h-6 text-slate-400 animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-200">Processing Psychometric Metrics...</p>
                <p className="text-[10px] text-muted-foreground font-mono">Aligning emotional state histories with task duration ratios</p>
              </div>
            </div>
          )}

          {!insightsLoading && !aiInsights && (
            <div className="card-3d bg-card border-none p-8 rounded-2xl border border-slate-800/60 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="max-w-md mx-auto space-y-1">
                <p className="text-xs font-bold text-foreground">No active psychodynamic profile computed.</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Log a few tasks with before/after emotions, record some independent daily check-ins, and tap 'Generate' to query Gemini's analysis.
                </p>
              </div>
            </div>
          )}

          {!insightsLoading && aiInsights && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Cognitive Summary */}
              <div className="card-3d bg-card border-none p-5 rounded-2xl border border-slate-500/10 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Smile className="w-16 h-16 text-slate-400" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-400">
                    <Smile className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Cognitive Summary</h4>
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  {aiInsights.summary}
                </p>
              </div>

              {/* Productivity Correlation */}
              <div className="card-3d bg-card border-none p-5 rounded-2xl border border-sky-500/10 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <TrendingUp className="w-16 h-16 text-sky-400" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                    <TrendingUp className="w-4 h-4 text-sky-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Productivity Correlation</h4>
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  {aiInsights.productivityCorrelation}
                </p>
              </div>

              {/* Tactical Mindset Hacks */}
              <div className="card-3d bg-card border-none p-5 rounded-2xl border border-slate-500/10 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <MessageSquare className="w-16 h-16 text-slate-400" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-500/10 border border-slate-500/20 text-slate-400">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Tactical Mindset Hacks</h4>
                </div>
                <div className="text-xs text-foreground leading-relaxed">
                  {aiInsights.actionableAdvice}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* RENDER ANALYTICS TAB */}
      {hubTab === "analytics" && (() => {
        // Local calculations for Deep Analytics
        const logPoints = emotionLogs.slice(0, 12).reverse().map((log, index) => {
          const energyVal = log.energy === "high" ? 85 : 25;
          const pleasantVal = log.pleasantness === "pleasant" ? 85 : 25;
          return {
            ...log,
            index,
            energyVal,
            pleasantVal,
          };
        });

        // Compute dominant emotions leaderboard
        const emotionFrequency: Record<string, number> = {};
        emotionLogs.forEach(l => {
          emotionFrequency[l.emotion] = (emotionFrequency[l.emotion] || 0) + 1;
        });
        const leaderboard = Object.entries(emotionFrequency)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Mindset transitions: completed tasks with both emotionBefore and emotionAfter
        const completedTransitions = tasks.filter(t => t.completed && t.emotionBefore && t.emotionAfter);

        // Circadian times
        const morningLogs = emotionLogs.filter(l => {
          const h = new Date(l.createdAt).getHours();
          return h >= 5 && h < 12;
        });
        const afternoonLogs = emotionLogs.filter(l => {
          const h = new Date(l.createdAt).getHours();
          return h >= 12 && h < 17;
        });
        const eveningLogs = emotionLogs.filter(l => {
          const h = new Date(l.createdAt).getHours();
          return h >= 17 && h < 22;
        });
        const nightLogs = emotionLogs.filter(l => {
          const h = new Date(l.createdAt).getHours();
          return h < 5 || h >= 22;
        });

        const getDominant = (logs: typeof emotionLogs) => {
          if (logs.length === 0) return "No Log";
          const counts: Record<string, number> = {};
          logs.forEach(l => {
            counts[l.emotion] = (counts[l.emotion] || 0) + 1;
          });
          return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        };

        const getPleasantPct = (logs: typeof emotionLogs) => {
          if (logs.length === 0) return 0;
          const pleasant = logs.filter(l => l.pleasantness === "pleasant").length;
          return Math.round((pleasant / logs.length) * 100);
        };

        const circadianPeriods = [
          { name: "Morning Routine", hours: "5 AM - 12 PM", logs: morningLogs, dominant: getDominant(morningLogs), pleasant: getPleasantPct(morningLogs), color: "from-indigo-500/20 to-slate-500/5", border: "border-indigo-500/20", textColor: "text-indigo-400" },
          { name: "Midday Focus", hours: "12 PM - 5 PM", logs: afternoonLogs, dominant: getDominant(afternoonLogs), pleasant: getPleasantPct(afternoonLogs), color: "from-indigo-500/20 to-sky-500/5", border: "border-indigo-500/20", textColor: "text-indigo-400" },
          { name: "Evening Wind Down", hours: "5 PM - 10 PM", logs: eveningLogs, dominant: getDominant(eveningLogs), pleasant: getPleasantPct(eveningLogs), color: "from-blue-500/20 to-slate-500/5", border: "border-blue-500/20", textColor: "text-blue-400" },
          { name: "Late Night Sleep", hours: "10 PM - 5 AM", logs: nightLogs, dominant: getDominant(nightLogs), pleasant: getPleasantPct(nightLogs), color: "from-indigo-500/20 to-sky-500/5", border: "border-indigo-500/20", textColor: "text-indigo-400" },
        ];

        if (emotionLogs.length < 2) {
          return (
            <div className="card-3d bg-card border-none p-12 rounded-2xl border border-slate-800/60 text-center space-y-4 max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-slate-600/10 border border-slate-500/20 flex items-center justify-center mx-auto animate-bounce">
                <BarChart2 className="w-8 h-8 text-slate-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-foreground">Unlock Deep Affective Analytics</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Track circadian patterns, daily energy levels, and focus transition vectors. 
                  To construct a statistically reliable mindset profile, please log at least **2 emotional check-ins** or complete task reflections.
                </p>
              </div>
              <button
                onClick={() => setHubTab("log")}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer shadow-lg shadow-slate-500/20 transition-all"
              >
                Go Log Your First Mood Coordinates
              </button>
            </div>
          );
        }

        // Generate SVG Path data points
        // Width: 500, Height: 200, Margin-left: 30, Margin-right: 30, Margin-top: 30, Margin-bottom: 30
        const w = 500;
        const h = 200;
        const xOffset = 30;
        const xSpan = w - xOffset * 2;
        const step = xSpan / (logPoints.length - 1 || 1);

        const getX = (idx: number) => xOffset + idx * step;
        const getEnergyY = (val: number) => h - 30 - ((val - 20) * (h - 60) / 80);
        const getPleasantY = (val: number) => h - 30 - ((val - 20) * (h - 60) / 80);

        const formatAxisTime = (dateStr: string) => {
          const d = new Date(dateStr);
          return `${d.toLocaleDateString([], { month: "short", day: "numeric" })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}`;
        };

        // Line and area paths generators
        let energyPath = "";
        let energyAreaPath = "";
        let pleasantPath = "";
        let pleasantAreaPath = "";

        if (logPoints.length > 0) {
          // Energy Path
          energyPath = `M ${getX(0)} ${getEnergyY(logPoints[0].energyVal)}`;
          for (let i = 1; i < logPoints.length; i++) {
            energyPath += ` L ${getX(i)} ${getEnergyY(logPoints[i].energyVal)}`;
          }
          energyAreaPath = `${energyPath} L ${getX(logPoints.length - 1)} ${h - 30} L ${getX(0)} ${h - 30} Z`;

          // Pleasantness Path
          pleasantPath = `M ${getX(0)} ${getPleasantY(logPoints[0].pleasantVal)}`;
          for (let i = 1; i < logPoints.length; i++) {
            pleasantPath += ` L ${getX(i)} ${getPleasantY(logPoints[i].pleasantVal)}`;
          }
          pleasantAreaPath = `${pleasantPath} L ${getX(logPoints.length - 1)} ${h - 30} L ${getX(0)} ${h - 30} Z`;
        }

        const hoveredLog = hoveredPointIndex !== null ? logPoints[hoveredPointIndex] : null;

        return (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Interactive Mind Timeline Graph (8 cols) */}
              <div className="lg:col-span-8 card-3d bg-card border-none p-5 rounded-2xl border border-slate-800/60 flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 font-display">
                      <TrendingUp className="w-4 h-4 text-slate-400" /> High-Resolution Affective Timeline
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-mono">Last {logPoints.length} mindset check-ins mapped chronologically</p>
                  </div>
                  
                  {/* Legend indicator */}
                  <div className="flex items-center gap-4 text-[9px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-indigo-500 block"></span>
                      <span className="text-muted-foreground">Energy Level</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded bg-slate-500 block"></span>
                      <span className="text-muted-foreground">Pleasantness</span>
                    </div>
                  </div>
                </div>

                {/* The Interactive SVG Graph */}
                <div className="relative w-full h-[220px] bg-slate-950/40 rounded-xl border border-slate-900 overflow-hidden p-2">
                  <svg 
                    viewBox={`0 0 ${w} ${h}`} 
                    width="100%" 
                    height="100%" 
                    preserveAspectRatio="none" 
                    className="overflow-visible animate-fade-in"
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  >
                    <defs>
                      <linearGradient id="energyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="pleasantAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Gridlines */}
                    <line x1={xOffset} y1={h - 30} x2={w - xOffset} y2={h - 30} stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                    <line x1={xOffset} y1={h / 2} x2={w - xOffset} y2={h / 2} stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={xOffset} y1={30} x2={w - xOffset} y2={30} stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />

                    {/* Labels for Y axis */}
                    <text x={10} y={34} fill="#64748b" className="text-[8px] font-mono font-bold">HIGH</text>
                    <text x={10} y={h / 2 + 3} fill="#64748b" className="text-[8px] font-mono font-bold">MID</text>
                    <text x={10} y={h - 26} fill="#64748b" className="text-[8px] font-mono font-bold">LOW</text>

                    {/* X-axis time labels */}
                    {logPoints.length >= 2 && (
                      <>
                        <text x={xOffset} y={h - 10} fill="#475569" className="text-[7.5px] font-mono font-bold" textAnchor="start">
                          {formatAxisTime(logPoints[0].createdAt)}
                        </text>
                        <text x={w - xOffset} y={h - 10} fill="#475569" className="text-[7.5px] font-mono font-bold" textAnchor="end">
                          {formatAxisTime(logPoints[logPoints.length - 1].createdAt)}
                        </text>
                      </>
                    )}

                    {/* Filled Area Paths */}
                    {energyAreaPath && <path d={energyAreaPath} fill="url(#energyAreaGrad)" />}
                    {pleasantAreaPath && <path d={pleasantAreaPath} fill="url(#pleasantAreaGrad)" />}

                    {/* Line Paths */}
                    {energyPath && <path d={energyPath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                    {pleasantPath && <path d={pleasantPath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

                    {/* Nodes (Interactive circles) */}
                    {logPoints.map((pt, idx) => {
                      const x = getX(idx);
                      const yEnergy = getEnergyY(pt.energyVal);
                      const yPleasant = getPleasantY(pt.pleasantVal);
                      const isHovered = hoveredPointIndex === idx;

                      return (
                        <g key={pt.id} className="cursor-pointer">
                          {/* Invisible vertical trigger bar for easier hovering */}
                          <line
                            x1={x} y1={20} x2={x} y2={h - 20}
                            stroke="transparent"
                            strokeWidth="12"
                            onMouseEnter={() => setHoveredPointIndex(idx)}
                          />

                          {/* Hover indicator vertical line */}
                          {isHovered && (
                            <line
                              x1={x} y1={25} x2={x} y2={h - 25}
                              stroke="rgba(168, 85, 247, 0.25)"
                              strokeWidth="1.5"
                              strokeDasharray="2 2"
                            />
                          )}

                          {/* Energy Circle Node */}
                          <circle
                            cx={x}
                            cy={yEnergy}
                            r={isHovered ? 6 : 4}
                            fill="#020617"
                            stroke="#f59e0b"
                            strokeWidth={isHovered ? 3 : 2}
                            className="transition-all duration-150"
                          />

                          {/* Pleasantness Circle Node */}
                          <circle
                            cx={x}
                            cy={yPleasant}
                            r={isHovered ? 6 : 4}
                            fill="#020617"
                            stroke="#10b981"
                            strokeWidth={isHovered ? 3 : 2}
                            className="transition-all duration-150"
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Absolute Timeline Info overlay on hover */}
                  {hoveredLog ? (
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-950/95 border border-slate-500/30 rounded-xl p-2.5 flex items-center justify-between gap-3 animate-fade-in shadow-xl backdrop-blur-md">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <EmotionBlock emotion={hoveredLog.emotion} size="xs" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-foreground leading-none">
                            {hoveredLog.emotion} <span className="text-[9px] font-normal text-muted-foreground">({hoveredLog.energy} energy, {hoveredLog.pleasantness})</span>
                          </p>
                          <p className="text-[9px] text-muted-foreground truncate mt-1">
                            {hoveredLog.note ? `"${hoveredLog.note}"` : "No reflection logs attached."}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[9px] font-mono text-slate-400 font-bold uppercase">Check-In Node</p>
                        <p className="text-[8px] text-muted-foreground font-mono mt-0.5">
                          {new Date(hoveredLog.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-surface border-none px-2.5 py-1 rounded-full text-[8px] text-muted-foreground font-mono pointer-events-none">
                      Hover over nodes to inspect granular coordinates
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Dominant Emotions Leaderboard & Core Frequency (4 cols) */}
              <div className="lg:col-span-4 card-3d bg-card border-none p-5 rounded-2xl border border-slate-800/60 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 mb-1 flex items-center gap-1.5 font-display">
                    <BarChart2 className="w-4 h-4 text-slate-400" /> Mind Block Leaderboard
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-mono mb-4">Your most frequently recorded affective blocks</p>
                </div>

                <div className="space-y-3.5 my-auto">
                  {leaderboard.map((item, idx) => {
                    const maxCount = leaderboard[0]?.count || 1;
                    const fillPct = Math.round((item.count / maxCount) * 100);
                    return (
                      <div key={item.name} className="flex items-center gap-3">
                        <EmotionBlock emotion={item.name} size="sm" animate={true} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-slate-200 truncate">{item.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">{item.count} check-ins</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                            <div 
                              className="bg-gradient-to-r from-slate-500 to-blue-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${fillPct}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-6 text-right shrink-0">
                          <span className="text-[10px] font-mono text-slate-400 font-bold">#{idx + 1}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[9px] text-muted-foreground italic leading-snug mt-4 border-t border-slate-900 pt-3">
                  A balanced mind integrates multiple blocks. Spikes in single blocks can signal cognitive lockups or sustained high-pressure periods.
                </p>
              </div>

            </div>

            {/* Middle Section: Time-of-Day Affect Circadian Analysis (Bento) */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 font-display">
                  <Clock className="w-4 h-4 text-slate-400" /> Circadian Rhythm Chronobiology
                </h3>
                <p className="text-[10px] text-muted-foreground font-mono">Mapping dominant mind states across physical day segments</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {circadianPeriods.map((period) => (
                  <div key={period.name} className={`bg-gradient-to-br ${period.color} border ${period.border} p-4 rounded-xl flex flex-col justify-between space-y-3`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`text-[11px] font-bold ${period.textColor} leading-tight`}>{period.name}</p>
                        <p className="text-[9px] text-muted-foreground font-mono">{period.hours}</p>
                      </div>
                      <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-900 text-muted-foreground font-mono font-bold">
                        {period.logs.length} logs
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        {period.dominant !== "No Log" ? (
                          <EmotionBlock emotion={period.dominant} size="xs" animate={false} />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 text-[8px] font-bold">
                            ?
                          </div>
                        )}
                        <span className="text-[11px] text-foreground font-semibold truncate">
                          Dominant: {period.dominant !== "No Log" ? period.dominant : <span className="text-slate-600 italic">None yet</span>}
                        </span>
                      </div>
                      
                      {period.logs.length > 0 && (
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Pleasantness ratio:</span>
                          <span className="font-mono text-foreground font-bold">{period.pleasant}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Section: Task Transition Analytics ("Mindset Flows") */}
            <div className="card-3d bg-card border-none p-5 rounded-2xl border border-slate-800/60">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 font-display">
                  <Activity className="w-4 h-4 text-slate-400" /> Completed Task Mindset Transitions
                </h3>
                <p className="text-[10px] text-muted-foreground font-mono">Real-world cognitive state transformations logged during task completions</p>
              </div>

              {completedTransitions.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-950/40 border border-slate-900 text-center space-y-2">
                  <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-foreground">No Task Transitions Recorded Yet</p>
                  <p className="text-[10px] text-muted-foreground max-w-md mx-auto leading-relaxed">
                    To track focus flows, complete tasks inside your list by reflecting on how you felt **before** starting and **after** completion.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
                  {completedTransitions.map((task) => {
                    // Formulate shift label
                    let shiftBadge = "bg-slate-900 border-slate-800 text-muted-foreground";
                    let shiftLabel = "Affective Neutral Shift";

                    if (task.emotionBefore && task.emotionAfter) {
                      const bTemplate = EMOTION_TEMPLATES.find(t => t.emotion === task.emotionBefore);
                      const aTemplate = EMOTION_TEMPLATES.find(t => t.emotion === task.emotionAfter);

                      if (bTemplate && aTemplate) {
                        if (bTemplate.pleasantness === "unpleasant" && aTemplate.pleasantness === "pleasant") {
                          shiftBadge = "bg-slate-500/10 border-slate-500/20 text-slate-400";
                          shiftLabel = "Mind Shift: Positive Resolution";
                        } else if (bTemplate.energy === "high" && bTemplate.pleasantness === "unpleasant" && aTemplate.pleasantness === "pleasant") {
                          shiftBadge = "bg-blue-500/10 border-blue-500/20 text-blue-400";
                          shiftLabel = "Anxiety Discharged";
                        } else if (bTemplate.emotion === "Focused" && aTemplate.emotion === "Proud") {
                          shiftBadge = "bg-slate-500/10 border-slate-500/20 text-slate-400";
                          shiftLabel = "Flow State Mastered";
                        } else if (aTemplate.emotion === "Tired" || aTemplate.emotion === "Exhausted") {
                          shiftBadge = "bg-blue-500/10 border-blue-500/20 text-blue-400";
                          shiftLabel = "Energy Depleted";
                        }
                      }
                    }

                    return (
                      <div key={task.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between gap-4 text-xs">
                        <div className="min-w-0 space-y-1">
                          <p className="font-bold text-slate-200 truncate leading-none">{task.title}</p>
                          <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border ${shiftBadge}`}>
                            {shiftLabel}
                          </span>
                        </div>

                        {/* Transition Flow visual */}
                        <div className="flex items-center gap-2 shrink-0 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-900">
                          <div className="flex flex-col items-center">
                            <EmotionBlock emotion={task.emotionBefore!} size="xs" animate={false} />
                            <span className="text-[8px] text-muted-foreground font-mono mt-0.5">{task.emotionBefore}</span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                          <div className="flex flex-col items-center">
                            <EmotionBlock emotion={task.emotionAfter!} size="xs" animate={false} />
                            <span className="text-[8px] text-muted-foreground font-mono mt-0.5">{task.emotionAfter}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        );
      })()}

    </div>
  );
};
