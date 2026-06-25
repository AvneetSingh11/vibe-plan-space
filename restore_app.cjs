const fs = require('fs');
let content = fs.readFileSync('./src/App.tsx', 'utf8');

// Restore Imports
const imports = `import React from "react";
import { Plus, Check, MoreVertical, Layout, LayoutDashboard, BrainCircuit, HeartPulse, Mic, ChevronRight } from "lucide-react";
import EisenhowerMatrix from "./components/EisenhowerMatrix";
import VoiceAssistant from "./components/VoiceAssistant";
import HabitTracker from "./components/HabitTracker";
import HowWeFeelHub from "./components/HowWeFeelHub";
import AIBreakdownPlanner from "./components/AIBreakdownPlanner";
import SuggestionCard from "./components/SuggestionCard";
import NotificationCenter from "./components/NotificationCenter";
import { Task, Habit, EmotionLog } from "./types";`;

// We will replace the entire imports block
content = content.replace(/import React from "react";[\s\S]*?(?=export default function App)/, imports + '\n\n');

// 1. Restore Matrix Tab
// Current: {activeTab === "matrix" && ( <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> ... </div> )}
const matrixRegex = /{activeTab === "matrix" && \([\s\S]*?\}\)}\s*<\/div>\s*\)}/;
const matrixReplacement = `{activeTab === "matrix" && (
  <EisenhowerMatrix
    tasks={tasks}
    onToggleComplete={toggleTaskComplete}
    onDeleteTask={deleteTask}
    onToggleUrgent={toggleTaskUrgent}
    onToggleImportant={toggleTaskImportant}
  />
)}`;
if (matrixRegex.test(content)) {
  content = content.replace(matrixRegex, matrixReplacement);
} else {
  console.log("Could not find matrix regex");
}

// 2. Restore Habits Tab
const habitsRegex = /{activeTab === "habits" && \([\s\S]*?\}\)}\s*<\/div>\s*\)}/;
const habitsReplacement = `{activeTab === "habits" && (
  <HabitTracker
    habits={habits}
    onToggleHabit={toggleHabit}
    onAddHabit={addHabit}
    onDeleteHabit={deleteHabit}
  />
)}`;
if (habitsRegex.test(content)) {
  content = content.replace(habitsRegex, habitsReplacement);
} else {
  console.log("Could not find habits regex");
}

// 3. Restore Mind Tab
const mindRegex = /{activeTab === "mind" && \([\s\S]*?<\/section>\s*<\/div>\s*\)}/;
const mindReplacement = `{activeTab === "mind" && (
  <HowWeFeelHub 
    emotionLogs={emotionLogs}
    onLogEmotion={logEmotion}
    tasks={tasks}
  />
)}`;
if (mindRegex.test(content)) {
  content = content.replace(mindRegex, mindReplacement);
} else {
  console.log("Could not find mind regex");
}

// 4. Restore Voice Tab
const voiceRegex = /{activeTab === "voice" && \([\s\S]*?<\/button>\s*<\/div>\s*\)}/;
const voiceReplacement = `{activeTab === "voice" && (
  <VoiceAssistant
    onAddTask={addTask}
    onTriggerBriefing={handleTriggerBriefing}
    onSetBreakdownGoal={setBreakdownGoal}
    onAddNotification={addNotification}
  />
)}`;
if (voiceRegex.test(content)) {
  content = content.replace(voiceRegex, voiceReplacement);
} else {
  console.log("Could not find voice regex");
}

fs.writeFileSync('./src/App.tsx', content);
console.log('App.tsx features restored!');
