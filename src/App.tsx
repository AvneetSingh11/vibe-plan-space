import React from "react";
import { Plus, Check, MoreVertical, Layout, LayoutDashboard, BrainCircuit, HeartPulse, Mic, ChevronRight, Volume2, TrendingUp, CheckSquare, Target, Settings, Play as PlayIcon, Pause as PauseIcon, User, Mail, Award, Sparkles, X, Cloud, CloudOff, RefreshCw, Upload } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { saveUserProgress, loadUserProgress } from "./lib/firebase";
import EisenhowerMatrix from "./components/EisenhowerMatrix";
import VoiceAssistant from "./components/VoiceAssistant";
import IntegrationsHub from "./components/IntegrationsHub";
import PremiumDatePicker from "./components/PremiumDatePicker";
import HabitTracker from "./components/HabitTracker";
import { HowWeFeelHub } from "./components/HowWeFeelHub";
import AIBreakdownPlanner from "./components/AIBreakdownPlanner";
import SuggestionCard from "./components/SuggestionCard";
import NotificationCenter from "./components/NotificationCenter";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
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
  },
  removeItem: (key: string) => {
    try { localStorage.removeItem(key); } catch (e) {}
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

function AmbientSound({ name, url, volume, onVolumeChange }: { key?: string, name: string, url: string, volume: number, onVolumeChange: (v: number) => void }) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (volume > 0 && audioRef.current.paused) {
        audioRef.current.play().catch(() => console.log('Autoplay prevented'));
      } else if (volume === 0 && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    }
  }, [volume]);

  return (
    <div className="flex items-center gap-4">
      <span className="font-body-md text-[13px] text-on-surface-variant w-24">{name}</span>
      <input 
        type="range" 
        min="0" 
        max="1" 
        step="0.01" 
        value={volume} 
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))} 
        className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-container" 
      />
      <Volume2 className="w-4 h-4 text-on-surface-variant/50" />
      <audio ref={audioRef} src={url} loop preload="auto" />
    </div>
  );
}

export default function App() {
  const [newTaskDate, setNewTaskDate] = React.useState<string | undefined>(undefined);

  const [ambientVolumes, setAmbientVolumes] = React.useState<{ [key: string]: number }>({
    'Rain': 0.0,
    'Ocean': 0.0,
    'Cafe': 0.0
  });

  const ambientSources = [
    { name: 'Rain', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg' },
    { name: 'Ocean', url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg' },
    { name: 'Cafe', url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg' }
  ];

  const [isVoiceLoading, setIsVoiceLoading] = React.useState(false);

  const [isDecomposing, setIsDecomposing] = React.useState(false);
  const handleAutonomousBreakdown = async (title: string) => {
    setIsDecomposing(true);
    try {
      const response = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: title })
      });
      const data = await response.json();
      if (data.subtasks) {
        setTasks(prev => {
          const newTasks = data.subtasks.map((st: any) => ({
            id: generateUniqueId("task"),
            title: st.title || st,
            urgent: false,
            important: true,
            completed: false,
            estimatedMinutes: st.durationMinutes || 25,
            createdAt: new Date().toISOString()
          }));
          return [...newTasks, ...prev];
        });
        addNotification("Goal Shattered", `Successfully broke down "${title}" into ${data.subtasks.length} actionable steps.`, "success");
      }
    } catch (e) {
      console.error(e);
      addNotification("Autonomous Breakdown Error", "Could not connect to the cognitive shatter engine.", "alert");
    }
    setIsDecomposing(false);
  };

  const [activeTab, setActiveTab] = React.useState<string>("dashboard");

  // Simple hash router for legal pages
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#/privacy') setActiveTab('privacy');
    if (hash === '#/terms') setActiveTab('terms');
    
    // Listen for hash changes
    const handleHashChange = () => {
      if (window.location.hash === '#/privacy') setActiveTab('privacy');
      else if (window.location.hash === '#/terms') setActiveTab('terms');
      else setActiveTab('dashboard');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
  const addTask = (title: string, urgent: boolean, important: boolean, estimatedMinutes: number, deadline?: string) => {
    setTasks(prev => [{ id: generateUniqueId(), title, urgent, important, estimatedMinutes, deadline, completed: false, createdAt: new Date().toISOString() }, ...prev]);
  };

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const nextCompleted = !h.completed;
        const todayStr = new Date().toISOString().split("T")[0];
        let nextHistory = h.history ? [...h.history] : [];
        let nextStreak = h.streak;

        if (nextCompleted) {
          if (!nextHistory.includes(todayStr)) {
            nextHistory.push(todayStr);
          }
          nextStreak = h.streak + 1;
          try {
            triggerAlertBeep();
          } catch (e) {
            console.error(e);
          }
          try {
            addNotification(
              "Atomic Streak Ignited! 🔥",
              `A daily routine completed. "${h.name}" is now on a ${nextStreak} day streak.`,
              "success"
            );
          } catch (e) {
            console.error(e);
          }
        } else {
          nextHistory = nextHistory.filter((d) => d !== todayStr);
          nextStreak = Math.max(0, h.streak - 1);
        }
        return { ...h, completed: nextCompleted, streak: nextStreak, history: nextHistory };
      }
      return h;
    }));
  };
  const addHabit = (name: string) => {
    const icon = "Star";
    setHabits(prev => [{ id: generateUniqueId(), name, icon, completed: false, streak: 0, targetDays: 7, history: [] }, ...prev]);
  };
  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const logEmotion = (energy: number, pleasantness: number, notes: string) => {
    setEmotionLogs(prev => [{ id: generateUniqueId(), energy, pleasantness, notes, timestamp: Date.now() }, ...prev]);
  };

  const handleTriggerBriefing = () => {
    if (typeof handleTriggerSpeechBriefing === 'function') {
      handleTriggerSpeechBriefing();
    }
  };

  const setBreakdownGoal = (goal: string) => {
    if (typeof handleAutonomousBreakdown === 'function') {
      handleAutonomousBreakdown(goal);
    }
  };

  


  // Theme state: default to beautiful 'vibe'
  const [theme, setTheme] = React.useState<"vibe" | "cosmic" | "clay" | "brutal" | "alabaster">(() => {
    try {
      const saved = safeLocalStorage.getItem("vibe_theme");
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

  // Daily habit reset checker
  React.useEffect(() => {
    const checkDailyReset = () => {
      const todayStr = new Date().toISOString().split("T")[0];
      setHabits(prev => {
        let changed = false;
        const nextHabits = prev.map(h => {
          const completedToday = h.history && h.history.includes(todayStr);
          if (h.completed && !completedToday) {
            changed = true;
            return { ...h, completed: false };
          }
          return h;
        });
        return changed ? nextHabits : prev;
      });
    };
    
    checkDailyReset();
    const interval = setInterval(checkDailyReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

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

  // User Profile States
  const [userName, setUserName] = React.useState(() => {
    return safeLocalStorage.getItem("actionmate_username") || "Avneet Arora";
  });
  const [userMantra, setUserMantra] = React.useState(() => {
    return safeLocalStorage.getItem("actionmate_mantra") || "Ascending daily orbits with peak compliance.";
  });
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [userAvatar, setUserAvatar] = React.useState(() => {
    return safeLocalStorage.getItem("actionmate_avatar") || "https://lh3.googleusercontent.com/aida-public/AB6AXuAl-laiQcHCZ52LjAnfDbeS4vokKf8qf9qYi26dPMUQnJFXkW7_Su7OrSAj3gS44DNq975mOMy5GUyMptx5sWKqtmM1IhUWC5kBCGXpZl968eK2Gs7wfqXbQ2LU4zhsA5bQKfawd2G2PycrShSwiXUa0W7TZ0ymAVQkr_0YO7xPOSSeClAytrt1kNsMj1oUdawtCx_VjpSfrbZwHPgFOfxTpTbzDCF_oJuoR-0Gt4761i_xmovLUFzK4r7-goRESaIot0OVTpznaqI";
  });

  // Cloud Sync States
  const [spaceId, setSpaceId] = React.useState<string>(() => {
    return safeLocalStorage.getItem("vibe_space_id") || "";
  });
  const [spaceIdInput, setSpaceIdInput] = React.useState("");
  const [syncStatus, setSyncStatus] = React.useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncError, setSyncError] = React.useState<string | null>(null);
  const [lastCloudSync, setLastCloudSync] = React.useState<number | null>(() => {
    const val = safeLocalStorage.getItem("vibe_last_cloud_sync");
    return val ? parseInt(val, 10) : null;
  });

  // Keep spaceIdInput in sync with spaceId when spaceId changes
  React.useEffect(() => {
    setSpaceIdInput(spaceId);
  }, [spaceId]);

  // Action function to connect and sync Space ID
  const handleConnectSpace = async (targetId: string) => {
    const trimmed = targetId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!trimmed) {
      addNotification("Invalid Space ID 🪐", "Please enter alphanumeric characters for your ID.", "alert");
      return;
    }
    setSyncStatus("syncing");
    setSyncError(null);
    try {
      const cloudData = await loadUserProgress(trimmed);
      if (cloudData) {
        // Space exists in the cloud, restore it!
        setUserName(cloudData.userName);
        setUserMantra(cloudData.userMantra);
        setUserAvatar(cloudData.userAvatar);
        setTasks(cloudData.tasks || []);
        setHabits(cloudData.habits || []);
        setEmotionLogs(cloudData.emotionLogs || []);

        // Save local
        safeLocalStorage.setItem("actionmate_username", cloudData.userName);
        safeLocalStorage.setItem("actionmate_mantra", cloudData.userMantra);
        safeLocalStorage.setItem("actionmate_avatar", cloudData.userAvatar);
        safeLocalStorage.setItem("actionmate_tasks", JSON.stringify(cloudData.tasks));
        safeLocalStorage.setItem("actionmate_habits", JSON.stringify(cloudData.habits));
        safeLocalStorage.setItem("actionmate_emotions", JSON.stringify(cloudData.emotionLogs));

        setSpaceId(trimmed);
        safeLocalStorage.setItem("vibe_space_id", trimmed);
        setLastCloudSync(cloudData.lastSynced || Date.now());
        safeLocalStorage.setItem("vibe_last_cloud_sync", String(cloudData.lastSynced || Date.now()));

        setSyncStatus("success");
        addNotification("Space Restored! 🌌", `Successfully recovered orbits for Space ID: "${trimmed}"`, "success");
      } else {
        // Space doesn't exist, register current progress to this space!
        const payload = {
          userName,
          userMantra,
          userAvatar,
          tasks,
          habits,
          emotionLogs,
        };
        await saveUserProgress(trimmed, payload);
        
        setSpaceId(trimmed);
        safeLocalStorage.setItem("vibe_space_id", trimmed);
        const now = Date.now();
        setLastCloudSync(now);
        safeLocalStorage.setItem("vibe_last_cloud_sync", String(now));

        setSyncStatus("success");
        addNotification("New Cloud Space Initialized! 🚀", `Your progress has been backed up to the new Space ID: "${trimmed}"`, "success");
      }
    } catch (err: any) {
      console.error("Cloud Sync Error:", err);
      setSyncStatus("error");
      setSyncError(err?.message || "Unknown error during sync");
      addNotification("Sync Connection Interrupted 📡", err?.message || "Failed to communicate with the cloud database.", "alert");
    }
  };

  // Quick manual backup trigger
  const handleManualBackup = async () => {
    if (!spaceId) return;
    setSyncStatus("syncing");
    setSyncError(null);
    try {
      const payload = {
        userName,
        userMantra,
        userAvatar,
        tasks,
        habits,
        emotionLogs,
      };
      await saveUserProgress(spaceId, payload);
      const now = Date.now();
      setLastCloudSync(now);
      safeLocalStorage.setItem("vibe_last_cloud_sync", String(now));
      setSyncStatus("success");
      addNotification("Cloud Orbit Synced! 🛰️", "Your latest progress is safely stored in the cloud.", "success");
    } catch (err: any) {
      console.error("Manual Sync Error:", err);
      setSyncStatus("error");
      setSyncError(err?.message || "Unknown error during sync");
    }
  };

  // Auto background sync when local states change
  React.useEffect(() => {
    if (!spaceId) return;
    
    // Debounce to prevent rapid fire of writes
    const timer = setTimeout(async () => {
      try {
        const payload = {
          userName,
          userMantra,
          userAvatar,
          tasks,
          habits,
          emotionLogs,
        };
        await saveUserProgress(spaceId, payload);
        const now = Date.now();
        setLastCloudSync(now);
        safeLocalStorage.setItem("vibe_last_cloud_sync", String(now));
        setSyncStatus("success");
      } catch (err) {
        console.warn("Background auto-sync failed:", err);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [tasks, habits, emotionLogs, userName, userMantra, userAvatar, spaceId]);

  // Calculate active streak of user live
  const userStreak = React.useMemo(() => {
    const allDates = new Set<string>();
    habits.forEach(h => {
      if (h.history) {
        h.history.forEach(d => allDates.add(d));
      }
    });

    const today = new Date();
    let streak = 0;
    
    const formatDate = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const todayStr = formatDate(today);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    if (!allDates.has(todayStr) && !allDates.has(yesterdayStr)) {
      return 0;
    }

    let checkDate = allDates.has(todayStr) ? today : yesterday;
    let iterations = 0;
    while (iterations < 1000) {
      iterations++;
      const checkDateStr = formatDate(checkDate);
      if (allDates.has(checkDateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [habits]);

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
  const [customMinutesInput, setCustomMinutesInput] = React.useState("30");

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
    if (hrs < 4) return "Still awake?";
    if (hrs < 12) return "Good morning";
    if (hrs < 18) return "Good afternoon";
    return "Good evening";
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

  const analyzeEmotionNote = async (logId: string, note: string, emotion: string) => {
    try {
      const response = await fetch("/api/ai/analyze-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note, emotion })
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.analysis) {
          setEmotionLogs(prev => prev.map(l => l.id === logId ? { ...l, analysis: data.analysis } : l));
          
          if (data.analysis.copingStrategy) {
            addNotification(
              `AI Mind Strategy: ${emotion}`,
              `${data.analysis.copingStrategy}`,
              "suggestion"
            );
          }
        }
      }
    } catch (e) {
      console.error("Failed to analyze self-reflective note:", e);
    }
  };

  const handleAddEmotionalLog = () => {
    const noteText = emotionNote.trim();
    const newLog: EmotionLog = {
      id: generateUniqueId("log"),
      stage: "independent",
      emotion: selectedEmotion,
      emoji: selectedEmoji,
      energy: emotionEnergy,
      pleasantness: emotionPleasant,
      note: noteText || undefined,
      createdAt: new Date().toISOString()
    };
    setEmotionLogs((prev) => [newLog, ...prev]);
    addNotification("Atmosphere Calibrated 🧘", `Logged feeling ${selectedEmotion} with ${emotionEnergy} energy.`, "success");
    setEmotionNote("");

    if (noteText) {
      analyzeEmotionNote(newLog.id, noteText, selectedEmotion);
    }
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
      className="antialiased min-h-screen relative flex"
    >
      {/* Atmospheric Shader Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-aurora-orange via-background to-background opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-aurora-blue via-transparent to-transparent opacity-30"></div>
      </div>

      {/* SideNavBar removed as per user request */}
      {/* TopNavBar */}
      <nav className="top-nav-container fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-[1000px] rounded-full backdrop-blur-3xl text-primary-container font-headline-md text-sm border border-glass-stroke shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex justify-between items-center px-6 py-2 z-50">
        <div className="flex items-center gap-2">
            <span className="font-headline-md text-lg font-bold tracking-tight text-primary-container">Vibe Plan Space</span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => setActiveTab('dashboard')} className={`transition-colors duration-300 hover:scale-105 hover:bg-white/5 rounded-full px-3 py-1 ${activeTab === 'dashboard' ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim' : 'text-on-surface-variant hover:text-on-surface'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('matrix')} className={`transition-colors duration-300 hover:scale-105 hover:bg-white/5 rounded-full px-3 py-1 ${activeTab === 'matrix' ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim' : 'text-on-surface-variant hover:text-on-surface'}`}>Matrix</button>
          <button onClick={() => setActiveTab('habits')} className={`transition-colors duration-300 hover:scale-105 hover:bg-white/5 rounded-full px-3 py-1 ${activeTab === 'habits' ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim' : 'text-on-surface-variant hover:text-on-surface'}`}>Habits</button>
          <button onClick={() => setActiveTab('mind')} className={`transition-colors duration-300 hover:scale-105 hover:bg-white/5 rounded-full px-3 py-1 ${activeTab === 'mind' ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim' : 'text-on-surface-variant hover:text-on-surface'}`}>Mind</button>
          <button onClick={() => setActiveTab('command')} className={`transition-colors duration-300 hover:scale-105 hover:bg-white/5 rounded-full px-3 py-1 ${activeTab === 'command' ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim' : 'text-on-surface-variant hover:text-on-surface'}`}>Voice</button>
          <button onClick={() => setActiveTab('integrations')} className={`transition-colors duration-300 hover:scale-105 hover:bg-white/5 rounded-full px-3 py-1 ${activeTab === 'integrations' ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim' : 'text-on-surface-variant hover:text-on-surface'}`}>Integrations</button>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-primary-fixed-dim/30 hover:border-primary-fixed-dim hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
            title="User Account"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10">
              <img alt="User profile" className="w-full h-full object-cover" src={userAvatar} />
            </div>
            <span className="text-xs font-bold text-primary-container max-w-[80px] truncate">{userName || "Account"}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-surface-container-highest/80 backdrop-blur-xl border border-glass-stroke rounded-full px-6 py-3 flex justify-between items-center z-50 shadow-2xl">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-primary-fixed-dim' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' " + (activeTab === 'dashboard' ? '1' : '0') }}>grid_view</span>
        </button>
        <button onClick={() => setActiveTab('matrix')} className={`flex flex-col items-center gap-1 ${activeTab === 'matrix' ? 'text-primary-fixed-dim' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' " + (activeTab === 'matrix' ? '1' : '0') }}>blur_on</span>
        </button>
        <button onClick={() => setActiveTab('command')} className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center -mt-8 shadow-[0_0_20px_rgba(255,180,161,0.4)] text-on-primary-container">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
        </button>
        <button onClick={() => setActiveTab('habits')} className={`flex flex-col items-center gap-1 ${activeTab === 'habits' ? 'text-primary-fixed-dim' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' " + (activeTab === 'habits' ? '1' : '0') }}>inventory_2</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-on-surface-variant">
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-1 mt-20 mb-24 md:mb-0 p-6 perspective-container relative z-10 w-full max-w-[1200px] mx-auto min-h-screen flex flex-col">
          
          {/* Orbit uses the global header instead */}

          {/* Old Pomodoro removed as per user request */}

          {/* ACTIVE VIEW BLOCK */}
          {/* ACTIVE VIEW BLOCK */}
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-6 w-full pb-12 animate-rise">
              {/* Dashboard Sub-Header with Account Summary */}
              <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 rounded-3xl glass-panel relative overflow-hidden border border-glass-stroke/50 bg-black/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-fixed-dim to-aurora-orange rounded-full blur-[100px] opacity-[0.06] pointer-events-none"></div>
                
                <div className="relative z-10 space-y-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-primary-fixed-dim font-black flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed-dim animate-ping"></span>
                    Orbit Command Center
                  </span>
                  <h2 className="font-display-hero text-2xl sm:text-3xl font-black text-on-surface tracking-tight leading-none">
                    Good day, {userName.split(" ")[0]}
                  </h2>
                  <p className="text-xs text-on-surface-variant font-body-md italic opacity-90 max-w-xl">
                    "{userMantra}"
                  </p>
                </div>
              </div>

              {/* Grid content columns */}
              <div className="flex flex-col lg:flex-row gap-6 h-full">
              
              {/* Left Column: Today's Prime Objectives */}
              <section className="glass-panel rounded-3xl p-6 lg:w-[40%] flex flex-col h-[850px] relative">
                <h3 className="font-headline-md text-xl mb-6 flex items-center gap-2 text-on-surface">
                  <CheckSquare className="w-5 h-5 text-primary-fixed-dim" /> Today's Prime Objectives
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 mb-4">
                  {(tasks.filter(t => !t.completed && (!t.deadline || t.deadline <= new Date().toISOString().split('T')[0])).length === 0) ? (
                    <p className="text-sm text-on-surface-variant font-body-md text-center mt-10">Nothing pending for today. A clear orbit.</p>
                  ) : (
                    tasks.filter(t => !t.completed && (!t.deadline || t.deadline <= new Date().toISOString().split('T')[0])).map(task => (
                      <div key={task.id} className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-glass-stroke hover:bg-white/10 transition-colors">
                        <div className="flex items-start gap-3">
                          <button 
                            onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))}
                            className="w-5 h-5 mt-0.5 rounded flex items-center justify-center border border-on-surface-variant transition-colors hover:border-on-surface cursor-pointer"
                          />
                          <span className="font-body-md text-[15px] text-on-surface leading-snug">{task.title}</span>
                        </div>
                        <div className="ml-8 mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-primary-fixed-dim w-1/3 rounded-full"></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const titleInput = e.currentTarget.elements.namedItem('taskInput') as HTMLInputElement;
                    if (titleInput.value.trim()) {
                      setTasks([{
                        id: Math.random().toString(36).substr(2, 9),
                        title: titleInput.value,
                        quadrant: "Q2",
                        completed: false,
                        estimatedMinutes: 30,
                        createdAt: new Date().toISOString()
                      }, ...tasks]);
                      titleInput.value = '';
                    }
                  }}
                  className="flex gap-2 items-center pt-4 border-t border-glass-stroke"
                >
                  <input 
                    name="taskInput"
                    placeholder="Type override command..." 
                    className="flex-1 px-4 py-3 rounded-xl glass-input text-on-surface text-sm focus:outline-none placeholder:text-on-surface-variant" 
                  />
                  <button type="submit" className="p-3 rounded-xl bg-primary-container text-on-primary-container hover:scale-105 transition-transform cursor-pointer">
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </button>
                </form>
              </section>

              {/* Right Column: Pomodoro + Ambient Sound + Insights */}
              <section className="lg:w-[60%] flex flex-col gap-6 h-[850px]">
                
                {/* Top: Deep Work Session (Pomodoro) */}
                <div className="glass-panel rounded-3xl p-8 flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className={`absolute inset-0 bg-aurora-orange blur-[120px] transition-opacity duration-1000 ${focusTimerActive ? 'opacity-20' : 'opacity-0'} pointer-events-none`}></div>
                  
                  <div 
                    onClick={() => {
                      if (window.matchMedia("(max-width: 768px)").matches) {
                        setFocusTimerActive(!focusTimerActive);
                        triggerAlertBeep();
                      }
                    }}
                    className="relative w-[280px] h-[280px] xs:w-[320px] xs:h-[320px] sm:w-[400px] sm:h-[400px] flex flex-col items-center justify-center my-2 z-10 group cursor-pointer"
                  >
                    {/* SVG Ring */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 400 400">
                      <circle cx="200" cy="200" r="184" className="stroke-white/10" strokeWidth="12" fill="transparent" />
                      <circle
                        cx="200"
                        cy="200"
                        r="184"
                        className={`stroke-primary-container transition-all duration-1000 ${focusTimerActive ? 'drop-shadow-[0_0_20px_rgba(255,180,161,0.6)]' : ''}`}
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={1156.1}
                        strokeDashoffset={1156.1 - (1156.1 * (focusTimeLeft / (focusSelectedPreset * 60)))}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {/* Inner Content (Title, Time, Status) */}
                    <div className="flex flex-col items-center justify-center relative z-20 gap-2 sm:gap-4 select-none">
                      <h3 className="font-headline-md text-[14px] sm:text-[18px] text-on-surface-variant font-medium tracking-wide">Deep Work Session</h3>
                      
                      <div className={`font-display-hero text-[48px] sm:text-[80px] tracking-tighter leading-none ${focusTimerActive ? 'text-on-surface' : 'text-on-surface-variant'} transition-colors duration-500`}>
                        {Math.floor(focusTimeLeft / 60).toString().padStart(2, "0")}:{Math.floor(focusTimeLeft % 60).toString().padStart(2, "0")}
                      </div>
                      
                      <p className={`font-label-caps text-[11px] sm:text-[13px] uppercase tracking-widest ${focusTimerActive ? 'text-primary-container' : 'text-on-surface-variant'}`}>
                        {focusTimerActive ? 'Focus Mode Active' : 'Tap to Start / Standby'}
                      </p>
                    </div>

                    {/* Hover Controls (Desktop Only) */}
                    <div className="absolute w-[140px] h-[64px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md rounded-full opacity-0 md:group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-3 z-30 shadow-2xl">
                        <button onClick={(e) => {
                          e.stopPropagation();
                          setFocusTimerActive(!focusTimerActive);
                          triggerAlertBeep();
                        }} className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-lg">
                          {focusTimerActive ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6 ml-1 fill-current" />}
                        </button>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          setFocusTimerActive(false);
                          setFocusTimeLeft(focusSelectedPreset * 60);
                        }} className="w-10 h-10 rounded-full bg-white/10 text-on-surface flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer border border-glass-stroke">
                          <span className="material-symbols-outlined text-[20px]">replay</span>
                        </button>
                    </div>
                  </div>

                  {/* Mobile Controls (Always Visible on Mobile/Touch Devices) */}
                  <div className="flex items-center gap-4 mt-2 sm:mt-4 md:hidden z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusTimerActive(!focusTimerActive);
                        triggerAlertBeep();
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-container text-on-primary-container font-semibold tracking-wide active:scale-95 transition-all shadow-md cursor-pointer text-sm"
                    >
                      {focusTimerActive ? (
                        <>
                          <PauseIcon className="w-4 h-4" />
                          <span>Pause Session</span>
                        </>
                      ) : (
                        <>
                          <PlayIcon className="w-4 h-4 fill-current" />
                          <span>Start Session</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusTimerActive(false);
                        setFocusTimeLeft(focusSelectedPreset * 60);
                      }}
                      className="p-2.5 rounded-full bg-white/10 text-on-surface active:scale-95 transition-all cursor-pointer border border-glass-stroke flex items-center justify-center"
                      title="Reset Timer"
                    >
                      <span className="material-symbols-outlined text-[20px]">replay</span>
                    </button>
                  </div>

                  {/* Preset Controls */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-6 z-20">
                    {!showCustomTimer ? (
                      <>
                        {[15, 25, 45, 60].map(preset => (
                          <button
                            key={preset}
                            onClick={() => {
                              setFocusSelectedPreset(preset);
                              setFocusTimeLeft(preset * 60);
                              setFocusTimerActive(false);
                            }}
                            className={`px-4 py-1.5 rounded-full font-label-caps text-[12px] transition-colors border cursor-pointer ${
                              focusSelectedPreset === preset 
                                ? 'bg-primary-container text-on-primary-container border-primary-container shadow-[0_0_15px_rgba(255,180,161,0.3)]' 
                                : 'bg-white/5 text-on-surface-variant border-glass-stroke hover:bg-white/10 hover:text-on-surface'
                            }`}
                          >
                            {preset}m
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            setShowCustomTimer(true);
                          }}
                          className={`px-4 py-1.5 rounded-full font-label-caps text-[12px] transition-colors border cursor-pointer bg-white/5 text-primary-fixed-dim border-glass-stroke hover:bg-white/10`}
                        >
                          + Custom
                        </button>
                      </>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const mins = parseInt(customMinutesInput, 10);
                          if (mins > 0 && mins <= 360) {
                            setFocusSelectedPreset(mins);
                            setFocusTimeLeft(mins * 60);
                            setFocusTimerActive(false);
                            setShowCustomTimer(false);
                          }
                        }}
                        className="flex items-center gap-2 bg-white/5 border border-glass-stroke rounded-full px-3 py-1"
                      >
                        <input
                          type="number"
                          min="1"
                          max="360"
                          value={customMinutesInput}
                          onChange={(e) => setCustomMinutesInput(e.target.value)}
                          className="w-16 bg-transparent text-center text-on-surface focus:outline-none text-xs font-mono"
                          autoFocus
                          placeholder="Min"
                        />
                        <span className="text-on-surface-variant text-[11px] font-label-caps">min</span>
                        <button 
                          type="submit"
                          className="text-primary-fixed-dim hover:text-on-surface p-1 rounded-full hover:bg-white/10 flex items-center justify-center cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => setShowCustomTimer(false)}
                          className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-white/10 flex items-center justify-center cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </form>
                    )}
                  </div>

                </div>

                {/* Middle: Ambient Sound Controls */}
                <div className="glass-panel rounded-3xl p-6">
                  <h3 className="font-headline-md text-[16px] flex items-center gap-2 mb-5 text-on-surface">
                    <Volume2 className="w-4 h-4 text-on-surface-variant" /> Ambient Sound Controls
                  </h3>
                  <div className="space-y-5">
                    {ambientSources.map((sound) => (
                      <AmbientSound 
                        key={sound.name}
                        name={sound.name}
                        url={sound.url}
                        volume={ambientVolumes[sound.name] || 0}
                        onVolumeChange={(v) => setAmbientVolumes(prev => ({...prev, [sound.name]: v}))}
                      />
                    ))}
                  </div>
                </div>

                {/* Bottom: Productivity Insight */}
                <div className="glass-panel rounded-3xl p-5 border-l-[6px] border-l-primary-container bg-primary-container/5">
                  <h3 className="font-headline-md text-[14px] flex items-center gap-2 mb-3 text-on-surface">
                    <TrendingUp className="w-4 h-4 text-primary-fixed-dim" /> Productivity Insight
                  </h3>
                  <p className="font-body-md text-on-surface-variant text-[14px] bg-black/20 p-4 rounded-xl border border-glass-stroke leading-relaxed">
                    Maintaining focus. Next scheduled break in <span className="text-primary-fixed-dim font-bold">{Math.floor(focusTimeLeft / 60)} minutes</span>. Keep the momentum.
                  </p>
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
        onAddEmotionLog={(log) => {
          const newLog: EmotionLog = {
            id: generateUniqueId("log"),
            createdAt: new Date().toISOString(),
            ...log
          };
          setEmotionLogs(prev => [newLog, ...prev]);
          if (log.note && log.note.trim()) {
            analyzeEmotionNote(newLog.id, log.note, log.emotion);
          }
        }}
        tasks={tasks}
        onUpdateTaskDetails={(id, updates) => {
          setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        }}
        onAddNotification={addNotification}
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
    
    {activeTab === "privacy" && <PrivacyPolicy />}
    {activeTab === "terms" && <TermsOfService />}

    {/* FOOTER ZONE */}
    <footer className="mt-auto pt-16 pb-24 md:pb-8 w-full text-center text-xs text-on-surface-variant/50 border-t border-glass-stroke/10 z-10">
      <div className="flex items-center justify-center gap-6 mb-3">
        <button onClick={() => setActiveTab('privacy')} className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</button>
        <button onClick={() => setActiveTab('terms')} className="hover:text-primary transition-colors cursor-pointer">Terms of Service</button>
      </div>
      <p>&copy; {new Date().getFullYear()} Vibe Plan Space. All rights reserved.</p>
    </footer>

    {/* Dynamic, Interactive, High-Fidelity User Account Panel with Scroll-Down/Slide-Down Animation */}
    <AnimatePresence>
      {isProfileOpen && (
        <>
          {/* Subtle click-outside backdrop overlay */}
          <motion.div
            id="user-account-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[45] bg-black/25 backdrop-blur-[2px] cursor-pointer"
            onClick={() => setIsProfileOpen(false)}
          />
          
          {/* Dropdown panel with scroll-down physics animation */}
          <motion.div
            id="user-account-panel"
            initial={{ opacity: 0, y: -40, scaleY: 0.8 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -40, scaleY: 0.8 }}
            transition={{ type: "spring", damping: 24, stiffness: 220 }}
            style={{ transformOrigin: "top right" }}
            className="fixed top-[76px] right-[2.5%] md:right-[calc(50%-500px+24px)] w-[90%] max-w-[420px] z-[50] glass-panel rounded-3xl p-6 md:p-8 border border-white/10 bg-surface-container-highest/95 shadow-2xl overflow-hidden text-center flex flex-col items-center"
          >
            {/* Ambient visual glowing spheres */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary-container/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-aurora-orange/10 rounded-full blur-[80px] pointer-events-none"></div>

            {/* Close Button */}
            <button
              id="close-profile-modal-btn"
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-5 right-5 z-30 p-2 rounded-full hover:bg-white/5 text-on-surface-variant hover:text-on-surface transition-all active:scale-90 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="relative z-10 flex flex-col items-center text-center w-full">
              
              {/* Badge Tag */}
              <span className="font-mono text-[9px] font-black uppercase tracking-widest text-primary-fixed-dim bg-primary-fixed-dim/10 px-2.5 py-1 rounded-full mb-6 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary-fixed-dim animate-pulse" />
                Astronaut Account Core
              </span>

              {/* Avatar image with hovering effects */}
              <div className="relative group w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary-fixed-dim/40 hover:border-primary-fixed-dim transition-all duration-300 shadow-xl mb-4">
                <img
                  alt="Avneet's avatar profile"
                  className="w-full h-full object-cover"
                  src={userAvatar}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-mono tracking-wider font-bold transition-opacity duration-300 pointer-events-none">
                  <span>ACTIVE ORBIT</span>
                </div>
              </div>

              {/* Editable Name & Mantra Form */}
              {isEditingProfile ? (
                <div className="w-full space-y-4 mb-6">
                  <div className="text-left">
                    <label className="font-mono text-[10px] text-primary-fixed-dim font-bold uppercase tracking-widest block mb-1">
                      Cosmological Name
                    </label>
                    <input
                      id="edit-profile-name-input"
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-on-surface text-sm focus:outline-none focus:border-primary-fixed-dim transition-all text-center"
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="text-left">
                    <label className="font-mono text-[10px] text-primary-fixed-dim font-bold uppercase tracking-widest block mb-1">
                      Daily Directive Mantra
                    </label>
                    <textarea
                      id="edit-profile-mantra-input"
                      rows={2}
                      value={userMantra}
                      onChange={(e) => setUserMantra(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-on-surface text-xs focus:outline-none focus:border-primary-fixed-dim transition-all text-center resize-none"
                      placeholder="Your Directive Mantra"
                    />
                  </div>
                  <div className="text-left">
                    <label className="font-mono text-[10px] text-primary-fixed-dim font-bold uppercase tracking-widest block mb-1">
                      Avatar URL
                    </label>
                    <input
                      id="edit-profile-avatar-input"
                      type="text"
                      value={userAvatar}
                      onChange={(e) => setUserAvatar(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-on-surface text-xs font-mono focus:outline-none focus:border-primary-fixed-dim transition-all"
                      placeholder="Avatar URL"
                    />
                    {/* Curated quick-select avatars */}
                    <div className="flex flex-wrap gap-2 justify-center mt-2.5">
                      {[
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuAl-laiQcHCZ52LjAnfDbeS4vokKf8qf9qYi26dPMUQnJFXkW7_Su7OrSAj3gS44DNq975mOMy5GUyMptx5sWKqtmM1IhUWC5kBCGXpZl968eK2Gs7wfqXbQ2LU4zhsA5bQKfawd2G2PycrShSwiXUa0W7TZ0ymAVQkr_0YO7xPOSSeClAytrt1kNsMj1oUdawtCx_VjpSfrbZwHPgFOfxTpTbzDCF_oJuoR-0Gt4761i_xmovLUFzK4r7-goRESaIot0OVTpznaqI",
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
                        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80",
                        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
                        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80"
                      ].map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setUserAvatar(url)}
                          className={`w-7 h-7 rounded-lg overflow-hidden border transition-all ${
                            userAvatar === url ? "border-primary-fixed-dim scale-110 shadow-lg" : "border-white/10 opacity-70 hover:opacity-100 hover:scale-105"
                          }`}
                        >
                          <img src={url} alt={`Option ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      
                      {/* Custom Upload Button */}
                      <label className="w-7 h-7 rounded-lg overflow-hidden border border-dashed border-white/30 hover:border-primary-fixed-dim flex items-center justify-center cursor-pointer transition-all hover:bg-white/5 group">
                        <Upload className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-primary-fixed-dim" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                const MAX_WIDTH = 150;
                                const MAX_HEIGHT = 150;
                                let width = img.width;
                                let height = img.height;

                                if (width > height) {
                                  if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                  }
                                } else {
                                  if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                  }
                                }
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext("2d");
                                ctx?.drawImage(img, 0, 0, width, height);
                                
                                const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
                                setUserAvatar(dataUrl);
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <button
                    id="save-profile-btn"
                    onClick={() => {
                      safeLocalStorage.setItem("actionmate_username", userName);
                      safeLocalStorage.setItem("actionmate_mantra", userMantra);
                      safeLocalStorage.setItem("actionmate_avatar", userAvatar);
                      setIsEditingProfile(false);
                      addNotification("Coordinates Rewritten 🔮", "User profile configuration synced successfully.", "success");
                    }}
                    className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary-container hover:scale-[1.02] active:scale-[0.98] font-bold text-sm transition-all cursor-pointer shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="w-full mb-6">
                  <h3 className="font-display-hero text-xl font-black text-on-surface tracking-tight">
                    {userName}
                  </h3>
                  <p className="font-mono text-xs text-on-surface-variant flex items-center justify-center gap-1 mt-1">
                    <Mail className="w-3.5 h-3.5 text-on-surface-variant/70" />
                    avneetarora1106@gmail.com
                  </p>
                  
                  <p className="text-xs text-on-surface-variant font-body-md italic mt-3 bg-white/5 p-3.5 rounded-2xl border border-glass-stroke">
                    "{userMantra}"
                  </p>

                  <button
                    id="edit-profile-toggle-btn"
                    onClick={() => setIsEditingProfile(true)}
                    className="mt-4 px-5 py-2.5 rounded-full border border-glass-stroke text-xs font-mono text-on-surface-variant hover:text-on-surface hover:bg-white/5 hover:border-white/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Modify Space Credentials
                  </button>
                </div>
              )}

              {/* Cloud Space Synchronizer */}
              <div className="w-full border-t border-glass-stroke/50 pt-6 mt-2 mb-6">
                <h4 className="font-mono text-[10px] text-primary-fixed-dim font-black uppercase tracking-widest text-left mb-3 flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-primary-fixed-dim" /> Cloud Orbit Sync Core
                </h4>
                
                {spaceId ? (
                  /* Connected State */
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-left space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider">
                          Orbit Connected
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-on-surface-variant font-bold bg-white/5 px-2 py-0.5 rounded border border-glass-stroke">
                        ID: {spaceId}
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant/90 leading-relaxed font-body-md">
                      Your emotions, logs, tasks, and habits are backed up in real-time. Close the app or switch devices, and log back in with this ID to restore your progress!
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={handleManualBackup}
                        disabled={syncStatus === "syncing"}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono font-bold text-on-surface hover:bg-white/10 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
                        Sync Now
                      </button>
                      <button
                        onClick={() => {
                          setSpaceId("");
                          safeLocalStorage.removeItem("vibe_space_id");
                          safeLocalStorage.removeItem("vibe_last_cloud_sync");
                          addNotification("Cloud Space Disconnected 📡", "Switched back to offline storage mode.", "suggestion");
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-on-surface-variant hover:text-on-surface hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                      >
                        Disconnect ID
                      </button>
                    </div>

                    {lastCloudSync && (
                      <div className="text-[10px] font-mono text-on-surface-variant/70 text-right">
                        Last saved: {new Date(lastCloudSync).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Disconnected State */
                  <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-4 text-left space-y-3.5">
                    <div className="flex items-center gap-2">
                      <CloudOff className="w-4 h-4 text-on-surface-variant" />
                      <span className="font-mono text-xs text-on-surface-variant font-bold uppercase tracking-wider">
                        Offline Mode (Local Storage Only)
                      </span>
                    </div>

                    <p className="text-xs text-on-surface-variant/85 leading-relaxed font-body-md">
                      Enter a custom Space ID below to connect a cloud backup. Connecting will save your current progress, or load your existing data if the ID is already registered.
                    </p>

                    <div className="flex gap-2">
                      <input
                        id="cloud-space-id-input"
                        type="text"
                        value={spaceIdInput}
                        onChange={(e) => setSpaceIdInput(e.target.value)}
                        placeholder="e.g. pilot_avneet"
                        className="flex-1 px-3 py-1.5 rounded-xl bg-black/30 border border-white/10 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary-fixed-dim transition-all"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleConnectSpace(spaceIdInput);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleConnectSpace(spaceIdInput)}
                        disabled={syncStatus === "syncing" || !spaceIdInput.trim()}
                        className="px-3.5 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
                      >
                        {syncStatus === "syncing" ? "Linking..." : "Connect"}
                      </button>
                    </div>

                    {syncError && (
                      <p className="text-[10px] font-mono text-rose-400">
                        Error: {syncError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Statistics Grid */}
              <div className="w-full border-t border-glass-stroke/50 pt-6 mt-2">
                <h4 className="font-mono text-[10px] text-primary-fixed-dim font-black uppercase tracking-widest text-left mb-4 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary-fixed-dim" /> Metrics Compliance Status
                </h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-glass-stroke flex flex-col items-center justify-center">
                    <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">STREAK</span>
                    <span className="font-display-hero text-lg font-black text-amber-400 mt-1">{userStreak}d</span>
                  </div>
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-glass-stroke flex flex-col items-center justify-center">
                    <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">COMPLETED</span>
                    <span className="font-display-hero text-lg font-black text-primary-fixed-dim mt-1">{totalCompletedTasks}</span>
                  </div>
                  <div className="bg-white/5 p-3.5 rounded-2xl border border-glass-stroke flex flex-col items-center justify-center">
                    <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">COMPLIANCE</span>
                    <span className="font-display-hero text-lg font-black text-emerald-400 mt-1">{taskCompletionRate}%</span>
                  </div>
                </div>

                {/* Performance Rank */}
                <div className="mt-4 bg-primary-container/10 border border-primary-container/20 rounded-2xl p-3 flex items-center justify-between text-left">
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-primary-fixed-dim font-bold block">Current Rank Tier</span>
                    <span className="font-headline-md text-xs font-bold text-on-surface mt-0.5 block">
                      {userStreak >= 5 
                        ? "🌌 Cosmic Orbit Captain" 
                        : userStreak >= 2 
                        ? "🚀 Atmospheric Pilot" 
                        : "📡 Ground Operations Unit"}
                    </span>
                  </div>
                  <span className="text-xl">
                    {userStreak >= 5 ? "🎖️" : userStreak >= 2 ? "🏅" : "🔋"}
                  </span>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </main>
  </div>
);
}
