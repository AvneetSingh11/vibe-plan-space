const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

// Replace light/white borders with border-none or subtle dark borders
content = content.replace(/border-slate-[0-9]+/g, 'border-none');
content = content.replace(/border-white(\/[0-9]+)?/g, 'border-none');
content = content.replace(/border-transparent/g, 'border-none');

// Some colored borders are used as subtle accents, but if they are too bright, tone them down
// Replace things like border-amber-500/15 with border-none
content = content.replace(/border-[a-z]+-500\/[0-9]+/g, 'border-none');
content = content.replace(/border-[a-z]+-950\/[0-9]+/g, 'border-none');

// Also remove old bg-white/... classes which look like white blocks in dark mode
content = content.replace(/bg-white(\/[0-9]+)?(\/[0-9]+)?/g, 'bg-surface-elevated/50');
content = content.replace(/bg-slate-[0-9]+/g, 'bg-surface-elevated/50');

// Fix text colors in these tabs (slate-600 in dark mode is invisible, slate-200 is fine but foreground is better)
content = content.replace(/text-slate-600/g, 'text-muted-foreground');
content = content.replace(/text-slate-[0-9]+/g, 'text-foreground');

fs.writeFileSync('./src/App.tsx', content);
console.log('App.tsx updated to remove legacy borders and bright backgrounds from tabs.');
