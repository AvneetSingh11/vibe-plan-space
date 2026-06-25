const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

// Global Background and Theme
content = content.replace(/className=\{`min-h-screen theme-\$\{theme\} antialiased text-slate-100 font-sans relative overflow-x-hidden transition-colors duration-500 bg-\[#030014\] pb-12`\}/g, 
  'className={`min-h-screen antialiased text-slate-900 font-sans relative overflow-x-hidden transition-colors duration-500 pb-12`}');

content = content.replace(/<div className="vibe-gradient-bg" \/>/g, ''); // Handled by body css

// Glass components to Orbit components
content = content.replace(/glass-card-hover/g, 'orbit-card-hover');
content = content.replace(/glass-card/g, 'orbit-card');
content = content.replace(/glass-panel/g, 'orbit-card');
content = content.replace(/glass-input/g, 'orbit-input');

// Typography
content = content.replace(/font-display/g, 'orbit-heading');
content = content.replace(/text-slate-100/g, 'text-slate-900');
content = content.replace(/text-white/g, 'text-slate-900');
content = content.replace(/text-slate-400/g, 'text-slate-500');
content = content.replace(/text-slate-300/g, 'text-slate-600');
content = content.replace(/text-slate-500/g, 'text-slate-500');
content = content.replace(/text-fuchsia-400/g, 'text-slate-800');
content = content.replace(/text-fuchsia-500/g, 'text-slate-800');

// Buttons and accents
content = content.replace(/vibe-btn-primary/g, 'orbit-button-primary');
content = content.replace(/bg-fuchsia-600/g, 'bg-slate-900 text-white');
content = content.replace(/bg-fuchsia-500/g, 'bg-slate-900 text-white');

// Borders and dark mode elements
content = content.replace(/border-slate-800\/40/g, 'border-slate-200');
content = content.replace(/border-slate-800/g, 'border-slate-200');
content = content.replace(/border-slate-900\/40/g, 'border-slate-200');
content = content.replace(/border-slate-900\/60/g, 'border-slate-200');
content = content.replace(/border-slate-900/g, 'border-slate-200');

content = content.replace(/bg-slate-900\/40/g, 'bg-white/40');
content = content.replace(/bg-slate-950\/40/g, 'bg-white/40');
content = content.replace(/bg-slate-950\/60/g, 'bg-white/60');
content = content.replace(/bg-slate-950\/80/g, 'bg-white/80');
content = content.replace(/bg-slate-900/g, 'bg-white/50');
content = content.replace(/bg-slate-950/g, 'bg-white/50');

// Logo update to Orbit
content = content.replace(/Vibe Plan Space/g, 'Orbit');

fs.writeFileSync('./src/App.tsx', content, 'utf8');
console.log('App.tsx migrated successfully');
