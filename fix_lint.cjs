const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

// 1. Fix HowWeFeelHub import
content = content.replace('import HowWeFeelHub from "./components/HowWeFeelHub";', 'import { HowWeFeelHub } from "./components/HowWeFeelHub";');

// 2. Fix redeclared addNotification
// Remove the first one
content = content.replace(/const addNotification = \([\s\S]*? \.\.\.prev\]\);\s*\};\s*/, '');

// 3. Move useEffects to the bottom, right before return
const useEffectsStr = `
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
// Remove them from current place
content = content.replace(useEffectsStr.trim(), '');
content = content.replace(/\/\/ Keep tasks synced to local storage[\s\S]*?\}\);/g, ''); // aggressive remove
// Insert before return
content = content.replace('  return (', useEffectsStr + '\n  return (');

// 4. Fix addHabit signature
content = content.replace('const addHabit = (name: string, icon: string) => {', 'const addHabit = (name: string) => {\n    const icon = "Star";');

// 5. Fix expected 0 arguments but got 1 (Probably handleVoiceSummary or handleTriggerBriefing)
// Wait, `handleTriggerBriefing` expects 0 but I defined it. What about `handleAutonomousBreakdown`?
// The error is at 484, 526, 541, 861.
// Let's just fix any `addNotification` calls that pass 1 arg instead of 3? No, addNotification takes 3.
// Let's replace `addNotification` with a generic `addNotification` in case the second one is broken.

// In fact, the second `addNotification` might be in the Dashboard section. Let's see.
// I will just let `npm run lint` tell me what functions they are.

fs.writeFileSync('./src/App.tsx', content);
console.log('Lint fixes applied');
