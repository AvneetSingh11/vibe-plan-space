import React from "react";
import { Plus, Check, MoreVertical, Layout, LayoutDashboard, BrainCircuit, HeartPulse, Mic, ChevronRight } from "lucide-react";
import EisenhowerMatrix from "./components/EisenhowerMatrix";
import VoiceAssistant from "./components/VoiceAssistant";
import IntegrationsHub from "./components/IntegrationsHub";
import PremiumDatePicker from "./components/PremiumDatePicker";
import HabitTracker from "./components/HabitTracker";
import { HowWeFeelHub } from "./components/HowWeFeelHub";
import AIBreakdownPlanner from "./components/AIBreakdownPlanner";
import SuggestionCard from "./components/SuggestionCard";
import NotificationCenter from "./components/NotificationCenter";
import { Task, Habit, EmotionLog } from "./types";


// Types
interface ContextNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "suggestion" | "alert";
  read?: boolean;
  timestamp: number | string;
}

const safeLocalStorage = {
  getItem: (key: string) => {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key: string, value: string) => {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
};

const generateUniqueId = (prefix?: string) => Math.random().toString(36).substr(2, 9);

const ensureUniqueIds = (items: any[], prefix: string) => {
  return items.map((item, i) => ({ ...item, id: item.id || `${prefix}-${i}-${generateUniqueId()}` }));
};

const initialTasks: Task[] = [];
const initialHabits: Habit[] = [];
const initialNotifications: ContextNotification[] = [];
const initialEmotionLogs: EmotionLog[] = [];

// Icons
const Timer = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const Pause = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
const Play = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
const RotateCcw = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>;

export default function App() {
  const [newTaskDate, setNewTaskDate] = React.useState<string | undefined>(undefined);

  // Navigation / Tab state: default to 'dashboard'

  const [isVoiceLoading, setIsVoiceLoading] = React.useState(false);

  const [emotionState, setEmotionState] = React.useState({ energy: 3, pleasantness: 3, notes: '' });

  const [isAnalyzingEmotion, setIsAnalyzingEmotion] = React.useState(false);
  const [emotionInsight, setEmotionInsight] = React.useState<string | null>(null);

  const handleEmotionLog = () => {
    setEmotionLogs([{ ...emotionState, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() }, ...emotionLogs]);
    setEmotionState({ energy: 3, pleasantness: 3, notes: '' });
  };

  const handleAnalyzeEmotions = async () => {
    setIsAnalyzingEmotion(true);
    try {
      const response = await fetch("http://localhost:5000/api/ai/emotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs: emotionLogs })
      });
      const data = await response.json();
      setEmotionInsight(data.insight);
    } catch(e) {
      console.error(e);
      setEmotionInsight("Could not analyze emotions at this time.");
    }
    setIsAnalyzingEmotion(false);
  };

  const [voiceCommandResult, setVoiceCommandResult] = React.useState<string | null>(null);
  const handleVoiceCommand = async (cmdString: string | any) => {
    // If it's an event (from button click without input), just use a test string or ignore
    const cmd = typeof cmdString === 'string' ? cmdString : "analyze my current matrix priorities";
    
    setVoiceCommandResult("Running: " + cmd + "...");
    try {
      const response = await fetch("http://localhost:5000/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd, context: { tasks, habits } })
      });
      const data = await response.json();
      setVoiceCommandResult(data.message || data.result || "Command executed successfully.");
    } catch (e) {
      console.error(e);
      setVoiceCommandResult("Could not connect to the Acoustic Parse Portal.");
    }
  };

  const [voiceSummary, setVoiceSummary] = React.useState<string | null>(null);

  const handleVoiceSummary = async () => {
    setIsVoiceLoading(true);
    setVoiceSummary(null);
    try {
      const response = await fetch("http://localhost:5000/api/ai/briefing");
      const data = await response.json();
      setVoiceSummary(data.summary);
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(data.summary);
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error(e);
      setVoiceSummary("Could not load AI briefing at this time.");
    }
    setIsVoiceLoading(false);
  };

  const [isDecomposing, setIsDecomposing] = React.useState(false);
  const handleAutonomousBreakdown = async (title: string) => {
    setIsDecomposing(true);
    try {
      const response = await fetch("http://localhost:5000/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskTitle: title })
      });
      const data = await response.json();
      if (data.subtasks) {
        setTasks(prev => {
          const newTasks = data.subtasks.map((st: string) => ({
            id: Math.random().toString(36).substr(2, 9),
            title: st,
            quadrant: "Q2",
            completed: false,
            timeEstimate: 15
          }));
          return [...newTasks, ...prev];
        });
      }
    } catch (e) {
      console.error(e);
    }
    setIsDecomposing(false);
  };

  const [activeTab, setActiveTab] = React.useState<"dashboard" | "matrix" | "habits" | "mind" | "command">("dashboard");

  // Mobile Sidebar Drawer open state
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleTaskComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };
  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };
  const toggleTaskUrgent = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, urgent: !t.urgent } : t));
  };
  const toggleTaskImportant = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, important: !t.important } : t));
  };
  const addTask = (title: string, urgent: boolean, important: boolean, estimatedMinutes: number) => {
    setTasks(prev => [{ id: generateUniqueId(), title, urgent, important, estimatedMinutes, completed: false }, ...prev]);
  };

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, completed: !h.completed, streak: h.completed ? h.streak - 1 : h.streak + 1 } : h));
  };
  const addHabit = (name: string) => {
    const icon = "Star";
    setHabits(prev => [{ id: generateUniqueId(), name, icon, completed: false, streak: 0, targetDays: 7 }, ...prev]);
  };
  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const logEmotion = (energy: number, pleasantness: number, notes: string) => {
    setEmotionLogs(prev => [{ id: generateUniqueId(), energy, pleasantness, notes, timestamp: Date.now() }, ...prev]);
  };

  const handleTriggerBriefing = () => {
    // Calls existing handleVoiceSummary
    if (typeof handleVoiceSummary === 'function') handleVoiceSummary();
  };

  const setBreakdownGoal = (goal: string) => {
    if (typeof handleAutonomousBreakdown === 'function') handleAutonomousBreakdown(goal);
  };

  


  // Theme state: default to beautiful 'vibe'
  const [theme, setTheme] = React.useState<"vibe" | "cosmic" | "clay" | "brutal" | "alabaster">(() => {
    try {
      const saved = safeLocalStorage.getItem("vibe_theme");
    
  // Keep tasks synced to local storage
  React.useEffect(() => {
    safeLocalStorage.setItem("actionmate_tasks", JSON.stringify(tasks));
  }, [tasks]);
  React.useEffect(() => {
    safeLocalStorage.setItem("actionmate_habits", JSON.stringify(habits));
  }, [habits]);
  React.useEffect(() => {
    safeLocalStorage.setItem("actionmate_emotions", JSON.stringify(emotionLogs));
  }, [emotionLogs]);
  React.useEffect(() => {
    safeLocalStorage.setItem("actionmate_notifs", JSON.stringify(notifications));
  }, [notifications]);

  return (saved as any) || "vibe";
    } catch (e) {
      return "vibe";
    }
  });

  // State Management with robust fallback data
  const [tasks, setTasks] = React.useState<Task[]>(() => {
    try {
      const saved = safeLocalStorage.getItem("actionmate_tasks");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return ensureUniqueIds(parsed, "task");
        }
      }
    } catch (e) {
      console.error("Failed to parse saved tasks", e);
    }
    return ensureUniqueIds(initialTasks, "task");
  });

  const [habits, setHabits] = React.useState<Habit[]>(() => {
    try {
      const saved = safeLocalStorage.getItem("actionmate_habits");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return ensureUniqueIds(parsed, "habit");
        }
      }
    } catch (e) {
      console.error("Failed to parse saved habits", e);
    }
    return ensureUniqueIds(initialHabits, "habit");
  });

  const [notifications, setNotifications] = React.useState<ContextNotification[]>(() => {
    try {
      const saved = safeLocalStorage.getItem("actionmate_notifs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return ensureUniqueIds(parsed, "notif");
        }
      }
    } catch (e) {
      console.error("Failed to parse saved notifications", e);
    }
    return ensureUniqueIds(initialNotifications, "notif");
  });

  const [emotionLogs, setEmotionLogs] = React.useState<EmotionLog[]>(() => {
    try {
      const saved = safeLocalStorage.getItem("actionmate_emotions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return ensureUniqueIds(parsed, "log");
        }
      }
    } catch (e) {
      console.error("Failed to parse saved emotions", e);
    }
    return ensureUniqueIds(initialEmotionLogs, "log");
  });

  // Clock & Ambient Time States
  const [timeString, setTimeString] = React.useState("");
  const [dateString, setDateString] = React.useState("");

  // Daily Briefing Speech States
  const [briefingText, setBriefingText] = React.useState("");
  const [briefingLoading, setBriefingLoading] = React.useState(false);
  const [speaking, setSpeaking] = React.useState(false);

  // Active Focus Task Timer States
  const [activeFocusTask, setActiveFocusTask] = React.useState<Task | null>(null);
  const [focusTimeLeft, setFocusTimeLeft] = React.useState(1500); // 25 mins in seconds
  const [focusTimerActive, setFocusTimerActive] = React.useState(false);
  const [focusSelectedPreset, setFocusSelectedPreset] = React.useState<number>(25);
  const [showCustomTimer, setShowCustomTimer] = React.useState(false);

  // Goal Breakdown States
  const [goalInput, setGoalInput] = React.useState("");
  const [breakdownLoading, setBreakdownLoading] = React.useState(false);
  const [breakdownSteps, setBreakdownSteps] = React.useState<Array<{ title: string; durationMinutes: number; description: string }>>([]);

  // Voice Command States
  const [voiceListening, setVoiceListening] = React.useState(false);
  const [voiceTranscript, setVoiceTranscript] = React.useState("");
  const [voiceStatus, setVoiceStatus] = React.useState("");
  const [voiceInputText, setVoiceInputText] = React.useState("");

  // Emotional Advice Insight State
  const [adviceText, setAdviceText] = React.useState("");
  const [adviceLoading, setAdviceLoading] = React.useState(false);

  // New task modal or quick-add coordinates
  const [newTitle, setNewTitle] = React.useState("");
  const [newUrgent, setNewUrgent] = React.useState(false);
  const [newImportant, setNewImportant] = React.useState(false);
  const [newMinutes, setNewMinutes] = React.useState(25);

  // New habit title state
  const [newHabitTitle, setNewHabitTitle] = React.useState("");
  const [selectedMetric, setSelectedMetric] = React.useState<"combined" | "individual">("combined");

  // Inner Emotion Selection States
  const [selectedEmotion, setSelectedEmotion] = React.useState("Calm");
  const [selectedEmoji, setSelectedEmoji] = React.useState("🧘");
  const [emotionEnergy, setEmotionEnergy] = React.useState<"low" | "high">("low");
  const [emotionPleasant, setEmotionPleasant] = React.useState<"pleasant" | "unpleasant">("pleasant");
  const [emotionNote, setEmotionNote] = React.useState("");

  // Sync state variables to safeLocalStorage on change
  React.useEffect(() => {
    safeLocalStorage.setItem("vibe_theme", theme);
  }, [theme]);

  React.useEffect(() => {
    safeLocalStorage.setItem("actionmate_tasks", JSON.stringify(tasks));
  }, [tasks]);

  React.useEffect(() => {
    safeLocalStorage.setItem("actionmate_habits", JSON.stringify(habits));
  }, [habits]);

  React.useEffect(() => {
    safeLocalStorage.setItem("actionmate_notifs", JSON.stringify(notifications));
  }, [notifications]);

  React.useEffect(() => {
    safeLocalStorage.setItem("actionmate_emotions", JSON.stringify(emotionLogs));
  }, [emotionLogs]);

  // Memorize 30-day streak growth trend data
  const chartData = React.useMemo(() => {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dates.push({ dateStr, label });
    }

    const getPreviousDateStr = (dateStr: string): string => {
      const parts = dateStr.split("-");
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      d.setDate(d.getDate() - 1);
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    };

    const calculateStreakOnDate = (habitHistory: string[], targetDateStr: string): number => {
      const today = new Date();
      const todayStr = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
      const isTargetToday = targetDateStr === todayStr;
      
      let checkStr = targetDateStr;
      if (!habitHistory.includes(targetDateStr)) {
        if (isTargetToday) {
          checkStr = getPreviousDateStr(targetDateStr);
        } else {
          return 0;
        }
      }
      
      let streak = 0;
      for (let i = 0; i < 100; i++) {
        if (habitHistory.includes(checkStr)) {
          streak++;
          checkStr = getPreviousDateStr(checkStr);
        } else {
          break;
        }
      }
      return streak;
    };

    return dates.map((d) => {
      const row: any = {
        name: d.label,
        dateStr: d.dateStr,
      };
      
      let totalStreak = 0;
      habits.forEach((habit) => {
        const streak = calculateStreakOnDate(habit.history || [], d.dateStr);
        row[habit.name] = streak;
        totalStreak += streak;
      });
      
      row["Combined Multiplier"] = totalStreak;
      return row;
    });
  }, [habits]);

  // Clock Update Effect
  React.useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDateString(now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" }));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // Focus Countdown Effect
  React.useEffect(() => {
    let timer: any = null;
    if (focusTimerActive && focusTimeLeft > 0) {
      timer = setInterval(() => {
        setFocusTimeLeft((prev) => {
          if (prev <= 1) {
            setFocusTimerActive(false);
            // Complete current focus task
            if (activeFocusTask) {
              handleToggleComplete(activeFocusTask.id);
              triggerAlertBeep();
              addNotification(
                "Focus Session Complete! 🎯",
                `Excellent dedication! You completed the focus sprint for: "${activeFocusTask.title}".`,
                "success"
              );
            } else {
              triggerAlertBeep();
              addNotification(
                "Mind Rest Completed 🧘",
                "Your scheduled mindfulness breathing segment is complete! Resume focus at your own comfortable pace.",
                "success"
              );
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [focusTimerActive, focusTimeLeft, activeFocusTask]);

  // Synthetic beep sound for alerts
  const triggerAlertBeep = () => {
    try {
      const AudioCtxClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) {
        console.warn("AudioContext not supported");
        return;
      }
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 Note
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.warn("Synthesizer audio blocked by browser settings:", e);
    }
  };

  const addNotification = (title: string, message: string, type: "success" | "suggestion" | "alert") => {
    const newNotif: ContextNotification = {
      id: generateUniqueId("notif"),
      title,
      message,
      timestamp: "Just now",
      type,
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Time of day greeting helper
  const getTimePhrase = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Morning";
    if (hrs < 18) return "Afternoon";
    return "Evening";
  };

  // Toggle complete
  const handleToggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextVal = !t.completed;
          if (nextVal) {
            triggerAlertBeep();
            addNotification(
              "Goal Checked Off! ✨",
              `Splendid! You have marked "${t.title}" as completed.`,
              "success"
            );
          }
          return { ...t, completed: nextVal };
        }
        return t;
      })
    );
  };

  const handleAddTaskDirectly = (title: string, urgent: boolean, important: boolean, mins: number) => {
    if (!title.trim()) return;
    const newTask: Task = {
      id: generateUniqueId("task"),
      title: title.trim(),
      urgent,
      important,
      completed: false,
      estimatedMinutes: mins || 25,
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [newTask, ...prev]);
    addNotification("Plan Incorporated 🚀", `Added "${title}" directly into your aesthetic spatial workspace.`, "success");
  };

  const handleQuickAddHabit = () => {
    if (!newHabitTitle.trim()) return;
    const newHabit: Habit = {
      id: generateUniqueId("habit"),
      name: newHabitTitle.trim(),
      streak: 0,
      completed: false,
      history: []
    };
    setHabits((prev) => [...prev, newHabit]);
    addNotification("New Atomic Habit Set ⚡", `Initialized streak tracking for: "${newHabitTitle.trim()}"`, "success");
    setNewHabitTitle("");
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeFocusTask?.id === id) {
      setActiveFocusTask(null);
      setFocusTimerActive(false);
    }
  };

  const handleDeleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  // Toggle Habits
  const handleToggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const nextCompleted = !h.completed;
          const todayStr = new Date().toISOString().split("T")[0];
          let nextHistory = [...h.history];
          let nextStreak = h.streak;

          if (nextCompleted) {
            if (!nextHistory.includes(todayStr)) {
              nextHistory.push(todayStr);
            }
            nextStreak = h.streak + 1;
            triggerAlertBeep();
            addNotification("Atomic Streak Ignited! 🔥", `A daily routine completed. "${h.name}" is now on a ${nextStreak} day streak.`, "success");
          } else {
            nextHistory = nextHistory.filter((d) => d !== todayStr);
            nextStreak = Math.max(0, h.streak - 1);
          }
          return { ...h, completed: nextCompleted, streak: nextStreak, history: nextHistory };
        }
        return h;
      })
    );
  };

  // Highly customizable Habit History Heatmap Toggle
  const handleToggleHabitDate = (habitId: string, dateStr: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const alreadyCompletedOnDate = h.history.includes(dateStr);
          let nextHistory = [...h.history];
          if (alreadyCompletedOnDate) {
            nextHistory = nextHistory.filter((d) => d !== dateStr);
          } else {
            nextHistory.push(dateStr);
          }

          // Simple dynamic streak calculation based on sequential history
          const sortedHistory = [...nextHistory].sort();
          let currentStreak = 0;
          let tempStreak = 0;
          let lastDate: Date | null = null;

          for (const d of sortedHistory) {
            const currentDate = new Date(d);
            if (lastDate === null) {
              tempStreak = 1;
            } else {
              const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays <= 1) {
                tempStreak++;
              } else {
                tempStreak = 1;
              }
            }
            currentStreak = Math.max(currentStreak, tempStreak);
            lastDate = currentDate;
          }

          const todayStr = new Date().toISOString().split("T")[0];
          const completedToday = nextHistory.includes(todayStr);

          return {
            ...h,
            history: nextHistory,
            streak: nextHistory.length > 0 ? currentStreak : 0,
            completed: completedToday
          };
        }
        return h;
      })
    );
  };

  // Core API call 1: Gemini Atmospheric Daily Vocal Guidance
  const handleTriggerSpeechBriefing = async () => {
    if (speaking) {
      try {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {}
      setSpeaking(false);
      return;
    }

    setBriefingLoading(true);
    setBriefingText("");

    try {
      const response = await fetch("/api/ai/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: tasks.filter((t) => !t.completed),
          habits,
          timeOfDay: getTimePhrase().toLowerCase()
        })
      });

      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      setBriefingText(data.briefingText);

      // Play synthesized audio beautifully
      try {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(data.briefingText);
          utterance.onstart = () => setSpeaking(true);
          utterance.onend = () => setSpeaking(false);
          utterance.onerror = () => setSpeaking(false);
          
          // Select high quality English voice if possible
          const voices = window.speechSynthesis.getVoices();
          const selectedVoice = voices.find((v) => v.lang.startsWith("en-") && v.name.includes("Google")) || voices.find((v) => v.lang.startsWith("en"));
          if (selectedVoice) utterance.voice = selectedVoice;
          
          window.speechSynthesis.speak(utterance);
        } else {
          setSpeaking(true);
          setTimeout(() => setSpeaking(false), 5000);
        }
      } catch (e) {
        console.warn("speechSynthesis error", e);
        setSpeaking(true);
        setTimeout(() => setSpeaking(false), 4000);
      }
    } catch (e) {
      console.error(e);
      setBriefingText("Good day! Prioritize your Urgent goals in the Space. Track your streaks and maintain your mindful state. You got this!");
      addNotification("Guidance Generated Offline", "Speech connection timed out. Used local atmospheric advice.", "alert");
    } finally {
      setBriefingLoading(false);
    }
  };

  // Core API call 2: Gemini Cognitive Insights advisor
  const handleRequestCognitiveInsights = async () => {
    setAdviceLoading(true);
    setAdviceText("");
    try {
      const response = await fetch("/api/ai/emotional-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotionLogs,
          tasks: tasks.slice(0, 10)
        })
      });
      if (!response.ok) throw new Error("API failed");
      const data = await response.json();
      setAdviceText(data.insights?.actionableAdvice || data.insightsText || "Atmosphere balance: Stay focused on high energy tasks in brief intervals. Hydrate often and use cognitive shift cycles.");
    } catch (e) {
      setAdviceText("Take regular 5-minute breathing cycles between tasks to alleviate tension. Your energy levels align perfectly with high focus goals during mornings.");
    } finally {
      setAdviceLoading(false);
    }
  };

  // Core API call 3: AI Objective Breakdown
  const handleBreakdownObjective = async () => {
    if (!goalInput.trim()) return;
    setBreakdownLoading(true);
    setBreakdownSteps([]);
    try {
      const response = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goalInput.trim() })
      });
      if (!response.ok) throw new Error("Breakdown failed");
      const data = await response.json();
      
      const parsedSteps = Array.isArray(data.subtasks)
        ? data.subtasks
        : [
            { title: "Define Core Layout", durationMinutes: 30, description: "Sketch interface layout and list key components." },
            { title: "Bootstrap Variables", durationMinutes: 20, description: "Set up states and custom themes configurations." },
            { title: "Incorporate Styling", durationMinutes: 45, description: "Polish spacing, typography, and backdrop glassmorphism." }
          ];
      
      setBreakdownSteps(parsedSteps);
      addNotification("Goal Breakdown Formulated! 🧠", `Shattered "${goalInput.trim()}" into actionable phases!`, "success");
    } catch (e) {
      setBreakdownSteps([
        { title: "Phase 1: Blueprint core specifications", durationMinutes: 30, description: "Draw basic mockups and structure states." },
        { title: "Phase 2: Assemble workspace variables", durationMinutes: 45, description: "Set up state managers and local storage caching." },
        { title: "Phase 3: Prototype layout modules", durationMinutes: 60, description: "Design responsive grid panels and visual stats widgets." }
      ]);
    } finally {
      setBreakdownLoading(false);
    }
  };

  const handleIncorporateBreakdownSteps = () => {
    if (breakdownSteps.length === 0) return;
    breakdownSteps.forEach((step, idx) => {
      const isUrgent = idx === 0;
      const isImportant = idx < 2;
      handleAddTaskDirectly(step.title, isUrgent, isImportant, step.durationMinutes || 30);
    });
    setBreakdownSteps([]);
    setGoalInput("");
    addNotification("Shattered Tasks Added!", "Subtasks integrated directly into your Eisenhower Workspace.", "success");
  };

  // Core API call 4: Voice / Text Intent Parsing
  const handleProcessVoiceCommand = async (inputStr: string) => {
    const cmd = inputStr || voiceInputText;
    if (!cmd.trim()) return;
    setVoiceStatus("Parsing atmospheric command...");
    try {
      const response = await fetch("/api/ai/voice-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cmd })
      });
      if (!response.ok) throw new Error("Voice API failure");
      const data = await response.json();
      const payload = data.result;
      
      if (payload.action === "add_task" && payload.taskDetails) {
        handleAddTaskDirectly(
          payload.taskDetails.title,
          payload.taskDetails.urgent,
          payload.taskDetails.important,
          payload.taskDetails.estimatedMinutes || 25
        );
        setVoiceStatus(payload.explanation || `Successfully added task: "${payload.taskDetails.title}"`);
      } else if (payload.action === "get_briefing") {
        setVoiceStatus("Starting Daily Vocal Guidance briefing...");
        handleTriggerSpeechBriefing();
      } else if (payload.action === "breakdown" && payload.goal) {
        setGoalInput(payload.goal);
        setVoiceStatus(payload.explanation || `Loaded goal breakdown target: "${payload.goal}"`);
        // Trigger breakdown
        setGoalInput(payload.goal);
      } else {
        // Fallback simple parsing
        handleAddTaskDirectly(cmd, true, false, 25);
        setVoiceStatus("Command parsed. Incorporated as plan block.");
      }
    } catch (e) {
      // Direct offline fallback
      handleAddTaskDirectly(cmd, false, true, 30);
      setVoiceStatus("Offline parsing complete. Logged as plan block.");
    } finally {
      setVoiceInputText("");
    }
  };

  const handleTriggerAcousticRecording = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        addNotification("Voice Recording Blocked", "Your browser does not support Voice API or permission was denied in this view. Please type into the command field.", "alert");
        return;
      }
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setVoiceListening(true);
        setVoiceTranscript("Listening to vocal frequency...");
      };
      rec.onerror = (evt: any) => {
        console.error(evt);
        setVoiceListening(false);
        setVoiceTranscript("Audio signal lost. Try typing instead.");
      };
      rec.onend = () => {
        setVoiceListening(false);
      };
      rec.onresult = (evt: any) => {
        const textResult = evt.results[0][0].transcript;
        setVoiceTranscript(`Vocal match: "${textResult}"`);
        handleProcessVoiceCommand(textResult);
      };
      rec.start();
    } catch (e) {
      console.warn("Speech recognition initialization failed:", e);
      addNotification("Voice Recording Blocked", "Microphone access is restricted in this frame environment.", "alert");
      setVoiceListening(false);
      setVoiceTranscript("Microphone access blocked.");
    }
  };

  const handleAddEmotionalLog = () => {
    const newLog: EmotionLog = {
      id: generateUniqueId("log"),
      stage: "independent",
      emotion: selectedEmotion,
      emoji: selectedEmoji,
      energy: emotionEnergy,
      pleasantness: emotionPleasant,
      note: emotionNote.trim() || undefined,
      createdAt: new Date().toISOString()
    };
    setEmotionLogs((prev) => [newLog, ...prev]);
    addNotification("Atmosphere Calibrated 🧘", `Logged feeling ${selectedEmotion} with ${emotionEnergy} energy.`, "success");
    setEmotionNote("");
  };

  // Clean workspaces and seed demo data
  const handleWipeAndSeed = () => {
    setTasks(initialTasks);
    setHabits(initialHabits);
    setNotifications(initialNotifications);
    setEmotionLogs(initialEmotionLogs);
    addNotification("Workspace Reset Complete", "Orbit reset to premium baseline coordinates.", "success");
  };

  // Helper values for Eisenhower matrix
  const getQuadrantTasks = (urgent: boolean, important: boolean) => {
    return tasks.filter((t) => t.urgent === urgent && t.important === important);
  };

  // Quick move coordinates helper
  const handleMoveTaskQuadrant = (id: string, nextUrgent: boolean, nextImportant: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, urgent: nextUrgent, important: nextImportant } : t))
    );
    addNotification("Coordinates Relocated 🌐", "Re-mapped task placement coordinates inside the spatial matrix.", "success");
  };

  // Generate 7 days range of the current week for habit heatmap
  const getDaysOfWeek = () => {
    const today = new Date();
    const days = [];
    // Start from 6 days ago up to today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const str = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString([], { weekday: "short" });
      const dayNum = d.getDate();
      days.push({ dateStr: str, dayLabel, dayNum });
    }
    return days;
  };

  const daysRange = getDaysOfWeek();

  // Stats calculation
  const totalCompletedTasks = tasks.filter((t) => t.completed).length;
  const totalPendingTasks = tasks.filter((t) => !t.completed).length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((totalCompletedTasks / tasks.length) * 100) : 0;

  const totalStreakPoints = habits.reduce((acc, h) => acc + h.streak, 0);
  const activeHabitsCompletedTodayCount = habits.filter((h) => h.completed).length;
  const navItems: { id: "dashboard" | "matrix" | "habits" | "mind" | "command" | "integrations"; label: string }[] = [
    { id: "dashboard", label: "today" },
    { id: "matrix", label: "matrix" },
    { id: "habits", label: "habits" },
    { id: "mind", label: "mind" },
    { id: "command", label: "voice" },
    { id: "integrations", label: "integrations" }
  ];

  return (
    <div
      id="vibe-plan-space"
      className="min-h-screen bg-aurora text-foreground"
    >
      {/* Decorative Spatial Pulsing Orbs (activated by theme class inside index.css) */}
      

      {/* Mobile header removed for Orbit layout */}

      {/* FULL RESPONSIVE NAVIGATION & MAIN LAYOUT DECK */}
      
      {/* Orbit Beautiful Header */}
      <header className="backdrop-blur sticky top-0 z-30 bg-background/60 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 perspective-scene">
              <div className="absolute inset-0 preserve-3d spin-slow">
                <div className="absolute inset-0 rounded-full border-2 border-primary/60 rounded-full"></div>
                <div className="absolute inset-1 rounded-full border border-primary/40 rounded-full" style={{ transform: 'rotateX(70deg)' }}></div>
                <div className="absolute inset-1 rounded-full border border-primary/40 rounded-full" style={{ transform: 'rotateY(70deg)' }}></div>
                <div className="absolute inset-[35%] rounded-full bg-primary"></div>
              </div>
            </div>
            <div>
              <h1 className="font-display text-xl leading-none">Orbit</h1>
              <p className="text-xs text-muted-foreground">AI productivity companion</p>
            </div>
          </div>
          <nav className="flex gap-1 text-sm">
            {navItems.map((navItem) => (
              <button
                key={navItem.id}
                onClick={() => setActiveTab(navItem.id)}
                className={`px-3 py-1.5 rounded-full capitalize transition ${
                  activeTab === navItem.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {navItem.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="space-y-12">
          
          {/* Orbit uses the global header instead */}

          {/* POMODORO TIMER BAR WIDGET (Always prominent if active or simple widget at top of tabs) */}
          <div className="card-3d bg-card -none p-5 rounded-3xl -none bg-gradient-to-r from-purple-500/5 via-slate-950/10 to-transparent flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-14 h-14 rounded-full border-2 ${focusTimerActive ? "border-none" : "border-none"} flex items-center justify-center transition-all`}>
                  <Timer className={`w-6 h-6 ${focusTimerActive ? "text-primary-foreground font-medium animate-pulse" : "text-muted-foreground"}`} />
                </div>
                {focusTimerActive && (
                  <span className="absolute inset-0 rounded-full border-2 border-pink-500 animate-ping opacity-60" />
                )}
              </div>
              <div className="space-y-0.5 text-center md:text-left">
                <span className="text-[9px] uppercase font-mono font-extrabold tracking-widest text-primary-foreground font-medium">
                  {activeFocusTask ? "Active Sprint Target" : "Mindfulness Breathing Clock"}
                </span>
                <h3 className="text-sm font-bold text-foreground">
                  {activeFocusTask ? activeFocusTask.title : "Unscheduled Mind focus Loop"}
                </h3>
                <p className="text-[11px] font-mono text-muted-foreground">
                  Remaining Session:{" "}
                  <span className="text-foreground font-bold font-mono text-xs">
                    {Math.floor(focusTimeLeft / 60)}:{(focusTimeLeft % 60).toString().padStart(2, "0")}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Timer presets and actions */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="bg-surface-elevated/50 p-1 rounded-xl border border-none flex gap-1 text-[10px] font-bold font-mono">
                {([15, 25, 45] as const).map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setFocusSelectedPreset(mins);
                      setFocusTimeLeft(mins * 60);
                      setFocusTimerActive(false);
                      triggerAlertBeep();
                    }}
                    className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                      focusSelectedPreset === mins
                        ? "bg-primary shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-none text-pink-300"
                        : "text-muted-foreground hover:text-muted-foreground"
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => {
                    setFocusTimerActive(!focusTimerActive);
                    triggerAlertBeep();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    focusTimerActive ? "bg-surface-elevated/50 text-muted-foreground hover:bg-surface-elevated/50" : "orbit-button-primary"
                  }`}
                >
                  {focusTimerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {focusTimerActive ? "Pause" : "Start"}
                </button>
                <button
                  onClick={() => {
                    setFocusTimerActive(false);
                    setFocusTimeLeft(focusSelectedPreset * 60);
                    triggerAlertBeep();
                  }}
                  className="p-2 rounded-xl bg-surface-elevated/50 border border-none text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE VIEW BLOCK */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-rise">
              
              {/* Keep the Pomodoro Timer Feature */}
              

              <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
                <section className="card-3d rounded-3xl p-6 bg-card -none">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-2xl">Good {getTimePhrase().toLowerCase()}</h2>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleVoiceSummary}
                        disabled={isVoiceLoading}
                        className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm disabled:opacity-50 flex items-center gap-2 transition hover:opacity-90 active:scale-95 active:shadow-inner"
                      >
                        {isVoiceLoading ? (
                          <>
                            <div className="w-3 h-3 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                            Loading
                          </>
                        ) : (
                          <>🎙 Vocal briefing</>
                        )}
                      </button>
                      <button className="px-3 py-1.5 rounded-full border-none shadow-inner bg-surface/50 text-sm hover:bg-surface transition active:scale-95 active:shadow-inner">Stop</button>
                    </div>
                  </div>
                  
                  {voiceSummary && (
                    <div className="mb-4 p-4 rounded-2xl bg-surface border-none shadow-inner bg-surface/50/50 text-sm">
                      <p className="text-muted-foreground leading-relaxed">{voiceSummary}</p>
                    </div>
                  )}

                  
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const titleInput = e.currentTarget.elements.namedItem('taskInput') as HTMLInputElement;
                      const timeInput = e.currentTarget.elements.namedItem('timeInput') as HTMLInputElement;
                      
                      if (titleInput.value.trim()) {
                        setTasks([{
                          id: Math.random().toString(36).substr(2, 9),
                          title: titleInput.value,
                          quadrant: "Q2",
                          completed: false,
                          estimatedMinutes: parseInt(timeInput.value) || 30,
                          deadline: newTaskDate,
                          createdAt: new Date().toISOString()
                        }, ...tasks]);
                        titleInput.value = '';
                        timeInput.value = '';
                        setNewTaskDate(undefined);
                      }
                    }}
                    className="flex gap-2 mb-4 flex-wrap items-center"
                  >

                    <input 
                      name="taskInput"
                      placeholder="Add a task..." 
                      className="flex-1 px-4 py-2 rounded-full bg-surface border-none shadow-inner bg-surface/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition" 
                    />
                    <div className="flex items-center px-3 py-2 rounded-full bg-surface border-none shadow-inner bg-surface/50 focus-within:ring-2 focus-within:ring-primary/20 transition">
                      <input
                        name="timeInput"
                        type="number"
                        placeholder="30"
                        min="1"
                        max="999"
                        className="w-10 bg-transparent text-sm text-center focus:outline-none placeholder:text-muted-foreground/50"
                      />
                      <span className="text-xs text-muted-foreground ml-1">min</span>
                    </div>
                    <PremiumDatePicker value={newTaskDate} onChange={setNewTaskDate} />
                    <button type="submit" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm hover:opacity-90 transition active:scale-95 active:shadow-inner">Add</button>
                  </form>
                  
                  <ul className="space-y-2">
                    {(tasks.filter(t => !t.completed && (!t.deadline || t.deadline <= new Date().toISOString().split('T')[0])).length === 0) ? (
                      <p className="text-sm text-muted-foreground">Nothing pending for today. A clear orbit.</p>
                    ) : (
                      tasks.filter(t => !t.completed && (!t.deadline || t.deadline <= new Date().toISOString().split('T')[0])).slice(0, 5).map(task => (
                        <li key={task.id} className="flex items-center gap-3 p-3 rounded-2xl bg-surface border-none shadow-inner">
                          <button 
                            onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))}
                            className="w-5 h-5 rounded-full bg-surface-elevated shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border-none flex items-center justify-center transition hover:bg-primary/10"
                          />
                          <span className="text-sm">{task.title}</span>
                          <div className="ml-auto flex items-center gap-3">
                            <PremiumDatePicker 
                              value={task.deadline} 
                              onChange={(d) => setTasks(tasks.map(t => t.id === task.id ? { ...t, deadline: d } : t))} 
                            />
                            <span className="text-xs text-muted-foreground flex items-center font-mono bg-surface p-1 px-2 rounded-lg border-none ring-0">
                              <input 
                                type="number" 
                                min="1" 
                                max="999" 
                                value={task.estimatedMinutes || task.timeEstimate || 30} 
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val) && val > 0) {
                                    setTasks(tasks.map(t => t.id === task.id ? { ...t, estimatedMinutes: val } : t));
                                  }
                                }}
                                className="w-8 bg-transparent text-right focus:outline-none focus:bg-surface-elevated rounded hover:bg-surface transition-colors"
                              />
                              <span className="ml-1">m</span>
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground bg-surface-elevated px-2 py-1 rounded-md">{task.quadrant}</span>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </section>
                
                <section className="space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl p-4 bg-card -none tilt-soft text-center">
                      <div className="font-display text-3xl">{tasks.filter(t => !t.completed).length}</div>
                      <div className="text-xs text-muted-foreground mt-1">Open</div>
                    </div>
                    <div className="rounded-2xl p-4 bg-card -none tilt-soft text-center">
                      <div className="font-display text-3xl">{tasks.filter(t => t.completed).length}</div>
                      <div className="text-xs text-muted-foreground mt-1">Done</div>
                    </div>
                    <div className="rounded-2xl p-4 bg-card -none tilt-soft text-center">
                      <div className="font-display text-3xl">{Math.max(0, ...habits.map(h => h.streak))}</div>
                      <div className="text-xs text-muted-foreground mt-1">Top streak</div>
                    </div>
                  </div>
                  
                  <div className="rounded-3xl p-5 bg-card -none card-3d">
                    <h3 className="font-display text-lg mb-2">Objective decomposer</h3>
                    <p className="text-xs text-muted-foreground mb-3">Turn a milestone into a chronological checklist.</p>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem('breakdownInput') as HTMLInputElement;
                        if (input.value.trim()) {
                          handleAutonomousBreakdown(input.value);
                          input.value = '';
                        }
                      }}
                      className="flex gap-2 mb-3"
                    >
                      <input 
                        name="breakdownInput"
                        placeholder="Launch portfolio site…" 
                        className="flex-1 px-3 py-2 rounded-full bg-surface border-none shadow-inner bg-surface/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition" 
                      />
                      <button 
                        type="submit" 
                        disabled={isDecomposing}
                        className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm disabled:opacity-50 transition hover:opacity-90 active:scale-95 active:shadow-inner"
                      >
                        {isDecomposing ? "Breaking..." : "Break"}
                      </button>
                    </form>
                  </div>
                </section>
              </div>
            </div>
          )}

          
    {/* Matrix Tab */}
    {activeTab === "matrix" && (
      <EisenhowerMatrix
        tasks={tasks}
        onToggleComplete={toggleTaskComplete}
        onDeleteTask={deleteTask}
        onToggleUrgent={toggleTaskUrgent}
        onToggleImportant={toggleTaskImportant}
        onUpdateEstimatedMinutes={(id, mins) => setTasks(tasks.map(t => t.id === id ? { ...t, estimatedMinutes: mins } : t))}
        onUpdateDeadline={(id, dateStr) => setTasks(tasks.map(t => t.id === id ? { ...t, deadline: dateStr || undefined } : t))}
        onAddTask={(title, urgent, important, mins, deadline) => {
          setTasks(prev => [{ id: Math.random().toString(36).substr(2, 9), title, urgent, important, estimatedMinutes: mins || 30, deadline, completed: false, createdAt: new Date().toISOString() }, ...prev]);
        }}
      />
    )}

    {/* Habits Tab */}
    {activeTab === "habits" && (
      <HabitTracker
        habits={habits}
        onToggleHabit={toggleHabit}
        onAddHabit={addHabit}
        onDeleteHabit={deleteHabit}
      />
    )}

    {/* Mind Tab */}
    {activeTab === "mind" && (
      <HowWeFeelHub 
        emotionLogs={emotionLogs}
        onLogEmotion={logEmotion}
        tasks={tasks}
      />
    )}

    {/* Voice Tab */}
    {activeTab === "command" && (
      <VoiceAssistant
        onAddTask={addTask}
        onTriggerBriefing={handleTriggerBriefing}
        onSetBreakdownGoal={setBreakdownGoal}
        onAddNotification={addNotification}
      />
    )}

    {/* Integrations Tab */}
    {activeTab === "integrations" && (
      <IntegrationsHub
        onAddTasks={(newTasks) => {
          const formattedTasks = newTasks.map(t => ({
            id: Math.random().toString(36).substr(2, 9),
            title: t.title || "Imported Task",
            urgent: t.urgent || false,
            important: t.important || false,
            completed: false,
            quadrant: t.urgent && t.important ? "Q1" : !t.urgent && t.important ? "Q2" : t.urgent && !t.important ? "Q3" : "Q4",
            estimatedMinutes: t.estimatedMinutes || 30,
            deadline: t.deadline,
            createdAt: new Date().toISOString()
          }));
          setTasks([...formattedTasks, ...tasks]);
          addNotification("Sync Complete", `Successfully imported ${formattedTasks.length} tasks from your connected accounts.`, "success");
        }}
      />
    )}
    </main>

      {/* FOOTER ZONE */}
      <div className="h-24"></div>
    </div>
  );
}
