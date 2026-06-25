const fs = require('fs');
let appContent = fs.readFileSync('./src/App.tsx', 'utf8');

const hookTarget = 'const [habits, setHabits] = useState<Habit[]>([]);';
if (!appContent.includes('const [newTaskDate, setNewTaskDate] = useState<string | undefined>')) {
  appContent = appContent.replace(hookTarget, hookTarget + '\n  const [newTaskDate, setNewTaskDate] = useState<string | undefined>(undefined);');
}

appContent = appContent.replace(/formDate/g, 'newTaskDate');
appContent = appContent.replace(/setFormDate/g, 'setNewTaskDate');

fs.writeFileSync('./src/App.tsx', appContent);
console.log('Fixed variable names and state');
