const fs = require('fs');
let content = fs.readFileSync('./src/components/VoiceAssistant.tsx', 'utf8');

// Update main wrapper
content = content.replace(/glass-card p-5 rounded-2xl relative overflow-hidden border border-cyan-500\/10/g, 'card-3d p-6 rounded-3xl relative overflow-hidden bg-card');

// Update colors
content = content.replace(/text-slate-400/g, 'text-muted-foreground');
content = content.replace(/text-slate-500/g, 'text-muted-foreground');
content = content.replace(/text-slate-300/g, 'text-foreground');
content = content.replace(/text-slate-100/g, 'text-foreground');
content = content.replace(/text-white/g, 'text-foreground');

// Update simulation buttons
content = content.replace(/bg-slate-900\/40 hover:bg-slate-800\/50 border border-slate-800\/80/g, 'bg-surface hover:bg-surface-elevated');

fs.writeFileSync('./src/components/VoiceAssistant.tsx', content);
console.log('VoiceAssistant styling updated');
