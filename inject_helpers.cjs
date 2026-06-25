const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

const helpers = `
// Types
interface ContextNotification {
  id: string;
  title: string;
  message: string;
  type: "success" | "suggestion" | "alert";
  timestamp: number;
}

const safeLocalStorage = {
  getItem: (key: string) => {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem: (key: string, value: string) => {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
};

const generateUniqueId = () => Math.random().toString(36).substr(2, 9);

const ensureUniqueIds = (items: any[], prefix: string) => {
  return items.map((item, i) => ({ ...item, id: item.id || \`\${prefix}-\${i}-\${generateUniqueId()}\` }));
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
`;

content = content.replace(/export default function App\(\) \{/, helpers);

// Inject state handler functions inside App
const handlers = `
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
  const addHabit = (name: string, icon: string) => {
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

  const addNotification = (title: string, message: string, type: "success" | "suggestion" | "alert") => {
    setNotifications(prev => [{ id: generateUniqueId(), title, message, type, timestamp: Date.now() }, ...prev]);
  };

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
`;

content = content.replace('const [sidebarOpen, setSidebarOpen] = React.useState(false);', 'const [sidebarOpen, setSidebarOpen] = React.useState(false);\n' + handlers);

fs.writeFileSync('./src/App.tsx', content);
console.log('Helpers injected!');
