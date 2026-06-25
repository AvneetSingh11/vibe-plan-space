const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

// Matrix tab borders
content = content.replace(/b: "border-destructive\/50"/g, 'b: ""');
content = content.replace(/b: "border-primary\/40"/g, 'b: ""');
content = content.replace(/b: "border-yellow-500\/40"/g, 'b: ""');
content = content.replace(/b: "border-border\/50"/g, 'b: ""');
content = content.replace(/b: "border-border"/g, 'b: ""');
// Also remove ' border ' that is concatenated with b
content = content.replace(/className={"card-3d rounded-3xl p-5 bg-card border " \+ b}/g, 'className={"card-3d rounded-3xl p-5 bg-card " + b}');

// Any other borders left? Let's aggressively remove any `border` from `card-3d` classes if it was somehow missed
content = content.replace(/card-3d[^"]*border-[^"]*/g, (match) => {
    return match.replace(/border-\S+/g, '').replace(/border/g, '').replace(/\s+/g, ' ');
});

// Also for the pomodoro timer, it has `border-white/10` or something
content = content.replace(/className="[^"]*card-3d[^"]*"/g, (match) => {
    return match.replace(/border-\S+/g, '').replace(/\bborder\b/g, '').replace(/\s+/g, ' ');
});

fs.writeFileSync('./src/App.tsx', content);
console.log('Borders removed aggressively.');
