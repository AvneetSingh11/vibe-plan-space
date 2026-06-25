const fs = require('fs');
let content = fs.readFileSync('./src/App.tsx', 'utf8');

// Remove border from emotionInsight div
content = content.replace(/className="mb-4 p-4 rounded-xl bg-primary\/10 border border-primary\/20 text-sm leading-relaxed text-primary-foreground"/g, 
                          'className="mb-4 p-4 rounded-xl bg-primary/10 text-sm leading-relaxed text-primary-foreground"');

// Remove border from Recent Logs list items
content = content.replace(/className="p-3 bg-surface border border-border\/50 rounded-xl text-sm"/g, 
                          'className="p-3 bg-surface rounded-xl text-sm"');

fs.writeFileSync('./src/App.tsx', content);
console.log('Removed borders from Mind Insights');
