const fs = require('fs');
let content = fs.readFileSync('./src/components/EisenhowerMatrix.tsx', 'utf8');

// Update quadrant container
content = content.replace(/className={`glass-card p-4.5 rounded-2xl flex flex-col h-\[280px\] border transition-all duration-300 hover:bg-slate-900\/40 hover:shadow-2xl hover:shadow-slate-950\/45 hover:-translate-y-0.5 \${bgGlow}`}/g, 
  'className={`card-3d p-5 rounded-3xl flex flex-col h-[340px] bg-card`}');

// Update task items inside
content = content.replace(/className={`p-3 rounded-xl bg-slate-950\/40 border border-slate-800\/80 hover:border-slate-700\/60 transition-all flex items-start gap-2.5 group relative \${/g,
  'className={`p-3 rounded-xl bg-surface transition-all flex items-start gap-2.5 group relative ${');

// Update check button
content = content.replace(/bg-emerald-500 border-emerald-500 text-slate-950 shadow-md shadow-emerald-500\/20/g, 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20');

// Title colors
content = content.replace(/text-slate-100/g, 'text-foreground');
content = content.replace(/text-slate-500/g, 'text-muted-foreground');
content = content.replace(/text-slate-400/g, 'text-muted-foreground');
content = content.replace(/text-slate-300/g, 'text-foreground');
content = content.replace(/text-slate-600/g, 'text-muted-foreground');

// Update priority buttons colors
content = content.replace(/bg-red-500\/10 text-red-400 border border-red-500\/20/g, 'bg-destructive/10 text-destructive border border-destructive/20');
content = content.replace(/bg-purple-500\/10 text-purple-400 border border-purple-500\/20/g, 'bg-primary/10 text-primary border border-primary/20');
content = content.replace(/bg-slate-900\/60 text-slate-500 border border-slate-800 hover:text-slate-300/g, 'bg-surface text-muted-foreground hover:text-foreground');

fs.writeFileSync('./src/components/EisenhowerMatrix.tsx', content);
console.log('Matrix styling updated');
