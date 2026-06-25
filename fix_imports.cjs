const fs = require('fs');
let content = fs.readFileSync('./src/App.tsx', 'utf8');

const importsToAdd = `
import EisenhowerMatrix from "./components/EisenhowerMatrix";
import HabitTracker from "./components/HabitTracker";
import HowWeFeelHub from "./components/HowWeFeelHub";
import VoiceAssistant from "./components/VoiceAssistant";
import AIBreakdownPlanner from "./components/AIBreakdownPlanner";
import SuggestionCard from "./components/SuggestionCard";
import NotificationCenter from "./components/NotificationCenter";
import { Task, Habit, EmotionLog } from "./types";
`;

if (!content.includes('EisenhowerMatrix')) {
    content = content.replace('import React', 'import React' + importsToAdd);
    fs.writeFileSync('./src/App.tsx', content);
    console.log('Imports added successfully');
}
