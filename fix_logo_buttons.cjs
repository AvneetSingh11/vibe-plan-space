const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

// 1. Fix Orbit Logo: Restore hollow rings but with subtle borders
content = content.replace(/bg-surface shadow-\[inset_0_1px_3px_rgba\(255,255,255,0\.1\),_0_4px_10px_rgba\(0,0,0,0\.5\)\] border-none/g, 'border-2 border-foreground/20 rounded-full');
content = content.replace(/bg-surface\/50 shadow-\[inset_0_1px_2px_rgba\(255,255,255,0\.05\)\] border-none/g, 'border border-foreground/10 rounded-full');

// 2. Fix Pomodoro timer buttons
// Remove old pink and slate classes for the duration selector
content = content.replace(/bg-slate-500\/20/g, 'bg-surface border border-border/50');
content = content.replace(/bg-pink-500\/20/g, 'bg-primary shadow-[0_0_10px_rgba(255,255,255,0.1)]');
content = content.replace(/text-pink-400/g, 'text-primary-foreground font-medium');

// The unselected duration buttons (hover text)
content = content.replace(/text-slate-300 hover:text-white/g, 'text-muted-foreground hover:text-foreground');

// The "Start" and "Restart" buttons
// Currently they might be using some slate colors
content = content.replace(/text-slate-300 hover:text-pink-400/g, 'text-muted-foreground hover:text-foreground active:scale-95 transition');
content = content.replace(/w-10 h-10 rounded-full bg-slate-500\/20 flex items-center justify-center hover:bg-slate-500\/40/g, 'w-10 h-10 rounded-full bg-surface border border-border/50 flex items-center justify-center hover:bg-surface-elevated active:scale-95 transition text-foreground');

fs.writeFileSync('./src/App.tsx', content);
console.log('App.tsx updated to fix logo and recolor buttons.');
