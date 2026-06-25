const fs = require('fs');

// 1. HabitTracker
let habits = fs.readFileSync('./src/components/HabitTracker.tsx', 'utf8');

// Container
habits = habits.replace(/glass-card p-6 rounded-2xl relative overflow-hidden/g, 'card-3d p-6 rounded-3xl relative overflow-hidden bg-card');
habits = habits.replace(/bg-slate-900\/50 border border-slate-800\/60/g, 'bg-surface border-none');
habits = habits.replace(/hover:border-purple-500\/30 hover:bg-slate-800\/40/g, 'tilt-soft hover:bg-surface-elevated');

// Colors
habits = habits.replace(/text-slate-400/g, 'text-muted-foreground');
habits = habits.replace(/text-slate-500/g, 'text-muted-foreground');
habits = habits.replace(/text-slate-300/g, 'text-foreground');
habits = habits.replace(/text-slate-100/g, 'text-foreground');
habits = habits.replace(/text-white/g, 'text-foreground');

fs.writeFileSync('./src/components/HabitTracker.tsx', habits);


// 2. HowWeFeelHub
let mind = fs.readFileSync('./src/components/HowWeFeelHub.tsx', 'utf8');

mind = mind.replace(/glass-card p-6 rounded-2xl border border-blue-500\/10 relative overflow-hidden/g, 'card-3d p-6 rounded-3xl bg-card border-none relative overflow-hidden');
mind = mind.replace(/glass-card/g, 'card-3d bg-card border-none');
mind = mind.replace(/bg-slate-900\/60 border border-slate-800\/80/g, 'bg-surface border-none');

mind = mind.replace(/text-slate-400/g, 'text-muted-foreground');
mind = mind.replace(/text-slate-500/g, 'text-muted-foreground');
mind = mind.replace(/text-slate-300/g, 'text-foreground');
mind = mind.replace(/text-slate-100/g, 'text-foreground');
mind = mind.replace(/text-white/g, 'text-foreground');

fs.writeFileSync('./src/components/HowWeFeelHub.tsx', mind);

console.log('Habits and Mind styled');
