const fs = require('fs');
let content = fs.readFileSync('./src/components/HowWeFeelHub.tsx', 'utf8');

content = content.replace(
  'className="w-full px-3 py-2 text-xs rounded-xl text-foreground bg-slate-950/40 border border-slate-800 focus:outline-none focus:border-purple-500 cursor-pointer"',
  'className="w-full px-3 py-2 text-xs rounded-xl text-foreground bg-surface hover:bg-surface-elevated border border-border focus:outline-none focus:border-primary cursor-pointer"'
);

content = content.replace(
  'className="text-[9px] bg-slate-900 border border-slate-700 text-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:border-purple-500 cursor-pointer"',
  'className="text-[9px] bg-surface hover:bg-surface-elevated border border-border text-foreground rounded px-1.5 py-0.5 focus:outline-none focus:border-primary cursor-pointer"'
);

content = content.replace(
  'className="text-[9px] bg-slate-900 border border-slate-700 text-slate-200 rounded px-1.5 py-0.5 focus:outline-none cursor-pointer"',
  'className="text-[9px] bg-surface hover:bg-surface-elevated border border-border text-foreground rounded px-1.5 py-0.5 focus:outline-none focus:border-primary cursor-pointer"'
);

fs.writeFileSync('./src/components/HowWeFeelHub.tsx', content);
console.log('Dropdown colors updated!');
