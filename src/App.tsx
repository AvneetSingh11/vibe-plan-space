import React from "react";
import { Plus, Check, MoreVertical, Layout, LayoutDashboard, BrainCircuit, HeartPulse, Mic, ChevronRight, Volume2, TrendingUp, CheckSquare, Target, Settings, Play as PlayIcon, Pause as PauseIcon, User, Mail, Award, Sparkles, X, Cloud, CloudOff, RefreshCw, Upload } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { saveUserProgress, loadUserProgress, auth, trackEvent } from "./lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { autoSyncTasks } from "./lib/autoSync";
import CookieConsent from "./components/CookieConsent";
import AuthModal from "./components/AuthModal";
import AuraDashboard from "./components/AuraDashboard";
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
      <audio 
        ref={audioRef} 
        src={url} 
        loop 
        preload="auto" 
        onEnded={() => {
          if (audioRef.current && volume > 0) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => console.log('Autoplay prevented on loop'));
          }
        }}
      />
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
  const [currentUser, setCurrentUser] = React.useState<FirebaseUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
  
  React.useEffect(() => {
    trackEvent("page_view", { page_path: "/" + activeTab });
  }, [activeTab]);
  
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setSpaceId(user.uid);
        safeLocalStorage.setItem("vibe_space_id", user.uid);
        try {
          const cloudData = await loadUserProgress(user.uid);
          if (cloudData) {
            setUserName(cloudData.userName || user.displayName || "Guest");
            setUserMantra(cloudData.userMantra || "");
            if (cloudData.userAvatar) setUserAvatar(cloudData.userAvatar);
            if (cloudData.tasks) setTasks(cloudData.tasks);
            if (cloudData.habits) setHabits(cloudData.habits);
            if (cloudData.emotionLogs) setEmotionLogs(cloudData.emotionLogs);
            const now = Date.now();
            setLastCloudSync(cloudData.lastSynced || now);
            safeLocalStorage.setItem("vibe_last_cloud_sync", String(cloudData.lastSynced || now));
            setSyncStatus("success");
          }
        } catch (e) {
          console.error("Failed to load user data", e);
        }
      } else {
        setSpaceId("");
        safeLocalStorage.removeItem("vibe_space_id");
      }
    });
    return () => unsubscribe();
  }, []);
  
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

    // Auto-sync integrations in background
    const runAutoSync = async () => {
      const synced = await autoSyncTasks(new Date());
      if (synced.length > 0) {
        setTasks(prev => {
          // Avoid duplicating tasks by title
          const existingTitles = new Set(prev.map(t => t.title));
          const toAdd = synced.filter(t => !existingTitles.has(t.title)).map(t => ({
            id: generateUniqueId(),
            title: t.title,
            urgent: t.urgent,
            important: t.important,
            completed: false,
            estimatedMinutes: t.estimatedMinutes,
            deadline: t.deadline,
            createdAt: new Date().toISOString()
          }));
          if (toAdd.length > 0) {
            const updated = [...toAdd, ...prev];
            safeLocalStorage.setItem("actionmate_tasks", JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      }
    };
    runAutoSync();

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
    return safeLocalStorage.getItem("actionmate_username") || "Guest User";
  });
  const [userEmail, setUserEmail] = React.useState(() => {
    return safeLocalStorage.getItem("actionmate_email") || "";
  });
  const [userMantra, setUserMantra] = React.useState(() => {
    return safeLocalStorage.getItem("actionmate_mantra") || "Ascending daily orbits with peak compliance.";
  });
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [userAvatar, setUserAvatar] = React.useState(() => {
    return safeLocalStorage.getItem("actionmate_avatar") || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest";
  });

  // Global Timer State
  const [timerMode, setTimerMode] = React.useState<'standby' | 'running' | 'paused'>('standby');
  const [timeLeft, setTimeLeft] = React.useState(25 * 60);
  const [totalTime, setTotalTime] = React.useState(25 * 60);

  // Timer Logic
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerMode === 'running' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerMode === 'running') {
      setTimerMode('standby');
      // Play a simple beep when done
      const beep = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      beep.play().catch(e => console.log(e));
    }
    return () => clearInterval(interval);
  }, [timerMode, timeLeft]);

  const toggleTimer = () => {
    if (timerMode === 'standby' || timerMode === 'paused') setTimerMode('running');
    else setTimerMode('paused');
  };

  const setTimerDuration = (minutes: number) => {
    setTimerMode('standby');
    setTotalTime(minutes * 60);
    setTimeLeft(minutes * 60);
  };

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

  // Auto-sync to cloud if connected to a space
  React.useEffect(() => {
    if (spaceId) {
      // Debounce saving to avoid spamming the backend
      const timer = setTimeout(() => {
        saveUserProgress(spaceId, {
          userName, userMantra, userAvatar,
          tasks, habits, emotionLogs,
          lastSynced: Date.now()
        }).catch(err => console.error("Auto-sync to cloud failed:", err));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [spaceId, tasks, habits, emotionLogs, userName, userMantra, userAvatar]);

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
    { id: "dashboard", label: "home" },
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-container-highest via-background to-background opacity-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-30"></div>
      </div>

      {/* SideNavBar removed as per user request */}
      {/* TopNavBar */}
      <nav className="top-nav-container fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-[1000px] rounded-full backdrop-blur-3xl text-primary-container font-headline-md text-sm border border-glass-stroke shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex justify-between items-center px-6 py-2 z-50">
        <div className="flex items-center gap-2">
            <span className="font-headline-md text-lg font-bold tracking-tight text-white">Vibe Plan Space</span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => { setActiveTab('dashboard'); setIsProfileOpen(false); }} className={`transition-colors duration-300 hover:scale-105 hover:bg-white/5 rounded-full px-3 py-1 ${activeTab === 'dashboard' ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim' : 'text-on-surface-variant hover:text-on-surface'}`}>Home</button>
          <button onClick={() => { setActiveTab('matrix'); setIsProfileOpen(false); }} className={`transition-colors duration-300 hover:scale-105 hover:bg-white/5 rounded-full px-3 py-1 ${activeTab === 'matrix' ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim' : 'text-on-surface-variant hover:text-on-surface'}`}>Matrix</button>
          <button onClick={() => { setActiveTab('habits'); setIsProfileOpen(false); }} className={`transition-colors duration-300 hover:scale-105 hover:bg-white/5 rounded-full px-3 py-1 ${activeTab === 'habits' ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim' : 'text-on-surface-variant hover:text-on-surface'}`}>Habits</button>
          <button onClick={() => { setActiveTab('mind'); setIsProfileOpen(false); }} className={`transition-colors duration-300 hover:scale-105 hover:bg-white/5 rounded-full px-3 py-1 ${activeTab === 'mind' ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim' : 'text-on-surface-variant hover:text-on-surface'}`}>Mind</button>
          <button onClick={() => { setActiveTab('command'); setIsProfileOpen(false); }} className={`transition-colors duration-300 hover:scale-105 hover:bg-white/5 rounded-full px-3 py-1 ${activeTab === 'command' ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim' : 'text-on-surface-variant hover:text-on-surface'}`}>Voice</button>
          <button onClick={() => { setActiveTab('integrations'); setIsProfileOpen(false); }} className={`transition-colors duration-300 hover:scale-105 hover:bg-white/5 rounded-full px-3 py-1 ${activeTab === 'integrations' ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim' : 'text-on-surface-variant hover:text-on-surface'}`}>Integrations</button>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="hidden md:flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-primary-fixed-dim/30 hover:border-primary-fixed-dim hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
            title="User Account"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10">
              <img alt="User profile" className="w-full h-full object-cover" src={userAvatar} />
            </div>
            <span className="text-xs font-bold text-primary-container max-w-[80px] truncate">{userName || "Account"}</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex flex-col items-center justify-center p-1.5 rounded-full border border-primary-fixed-dim/30 hover:bg-white/5 transition-all text-primary-fixed-dim cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[72px] left-1/2 -translate-x-1/2 w-[95%] bg-surface-container-highest/95 backdrop-blur-xl border border-glass-stroke rounded-3xl p-4 flex flex-col gap-2 z-40 shadow-2xl animate-rise">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); setIsProfileOpen(false); }}
              className={`text-left px-4 py-3 rounded-2xl transition-colors font-headline-md uppercase tracking-wider text-sm ${activeTab === item.id ? 'bg-primary-fixed-dim text-black font-black' : 'text-on-surface-variant hover:bg-white/10'}`}
            >
              {item.label}
            </button>
          ))}
          <div className="h-px w-full bg-glass-stroke my-2"></div>
          <button 
            onClick={() => { setIsProfileOpen(true); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors hover:bg-white/10 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
              <img alt="User profile" className="w-full h-full object-cover" src={userAvatar} />
            </div>
            <span className="font-headline-md text-sm text-primary-container truncate">{userName || "Account"}</span>
          </button>
        </div>
      )}

      {/* Main Content Canvas */}
      <main className="flex-1 mt-20 mb-6 px-3 py-6 md:px-4 perspective-container relative z-10 w-full max-w-[1400px] mx-auto min-h-screen flex flex-col">
          
          {/* Orbit uses the global header instead */}

          {/* ACTIVE VIEW BLOCK */}
          {activeTab === "dashboard" && (
            <AuraDashboard 
              userName={userName} 
              userMantra={userMantra} 
              tasks={tasks} 
              onNavigate={setActiveTab} 
              timerMode={timerMode}
              timeLeft={timeLeft}
              totalTime={totalTime}
              toggleTimer={toggleTimer}
              setTimerDuration={setTimerDuration}
            />
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
          const updatedTasks = [...formattedTasks, ...tasks];
          setTasks(updatedTasks);
          safeLocalStorage.setItem("actionmate_tasks", JSON.stringify(updatedTasks));
          if (spaceId) {
            saveUserProgress(spaceId, {
              userName, userMantra, userAvatar, tasks: updatedTasks, habits, emotionLogs
            }).catch(e => console.error("Cloud sync failed", e));
          }
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
            className="fixed top-[76px] right-[2.5%] md:right-[calc(50%-500px+24px)] w-[90%] max-w-[420px] z-[50] abyssal-card rounded-3xl py-6 px-4 md:py-8 md:px-6 overflow-y-auto overflow-x-hidden max-h-[85vh] text-center flex flex-col items-center"
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
                  alt={`${userName}'s avatar profile`}
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
                        "https://api.dicebear.com/7.x/bottts/svg?seed=vibe1",
                        "https://api.dicebear.com/7.x/shapes/svg?seed=vibe2",
                        "https://api.dicebear.com/7.x/fun-emoji/svg?seed=vibe3",
                        "https://api.dicebear.com/7.x/lorelei/svg?seed=vibe4",
                        "https://api.dicebear.com/7.x/pixel-art/svg?seed=vibe5",
                        "https://api.dicebear.com/7.x/thumbs/svg?seed=vibe6",
                        "https://api.dicebear.com/7.x/rings/svg?seed=vibe7",
                        "https://api.dicebear.com/7.x/identicon/svg?seed=vibe8",
                        "https://api.dicebear.com/7.x/micah/svg?seed=vibe9",
                        "https://api.dicebear.com/7.x/adventurer/svg?seed=vibe10",
                        "https://api.dicebear.com/7.x/avataaars/svg?seed=vibe11"
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
                  {userEmail && (
                    <p className="font-mono text-xs text-on-surface-variant flex items-center justify-center gap-1 mt-1">
                      <Mail className="w-3.5 h-3.5 text-on-surface-variant/70" />
                      {userEmail}
                    </p>
                  )}
                  
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
                      Sign in with your Google account to securely back up your space. Your progress will be saved to the cloud and synced across devices.
                    </p>

                    <div className="mt-2 flex justify-start rounded-full overflow-hidden w-max" style={{ backgroundColor: 'transparent' }}>
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-6 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-full hover:bg-primary/90 transition-colors shadow-sm"
                      >
                        Sign In / Register
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
  <CookieConsent />
  <AuthModal 
    isOpen={isAuthModalOpen} 
    onClose={() => setIsAuthModalOpen(false)} 
    currentUser={currentUser} 
  />
  </div>
);
}
