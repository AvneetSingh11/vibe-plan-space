const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

// 1. Navigation bar border
content = content.replace(/className="border-b border-border\/40 backdrop-blur sticky top-0 z-30 bg-background\/60"/g, 'className="backdrop-blur sticky top-0 z-30 bg-background/60 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"');

// 2. Circles in the Atom Logo
content = content.replace(/border-2 border-primary\/60/g, 'bg-surface shadow-[inset_0_1px_3px_rgba(255,255,255,0.1),_0_4px_10px_rgba(0,0,0,0.5)] border-none');
content = content.replace(/border border-primary\/40/g, 'bg-surface/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] border-none');

// 3. Circles in Task Checkboxes (Dashboard, Matrix, Habits)
content = content.replace(/w-5 h-5 rounded-full border border-primary\/50/g, 'w-5 h-5 rounded-full bg-surface-elevated shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border-none');
content = content.replace(/w-5 h-5 rounded-full border border-slate-700/g, 'w-5 h-5 rounded-full bg-surface-elevated shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border-none');
content = content.replace(/w-6 h-6 rounded-full border-2 border-slate-300/g, 'w-6 h-6 rounded-full bg-surface-elevated shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border-none');
content = content.replace(/w-6 h-6 rounded-full border-2 border-primary/g, 'w-6 h-6 rounded-full bg-primary shadow-[0_0_10px_rgba(255,255,255,0.2)] border-none');

// 4. Pomodoro Circle (if any border was left)
content = content.replace(/border-4 border-slate-800/g, 'bg-surface-elevated shadow-[inset_0_4px_10px_rgba(0,0,0,0.6)] border-none');

fs.writeFileSync('./src/App.tsx', content);
console.log('App.tsx updated to remove borders from nav and circles.');
