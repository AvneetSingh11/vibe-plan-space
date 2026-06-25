const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

// 1. Ensure main wrapper has bg-aurora
// Find: <div className="min-h-screen
// or something similar.
if (!content.includes('bg-aurora text-foreground')) {
    content = content.replace(/className="min-h-screen[^"]*"/, 'className="min-h-screen bg-aurora text-foreground"');
}

// 2. Remove white borders from panels
// Specifically targeting the `card-3d` and `tilt-soft` panels which had borders in my injection
const borderClassesToRemove = [
    'border-border/60',
    'border-border/50',
    'border-border',
    'border-destructive/50',
    'border-primary/40',
    'border-yellow-500/40',
    'border border-border/60',
    'border border-border/50',
    'border border-border',
    'border border-destructive/50',
    'border border-primary/40',
    'border border-yellow-500/40',
    'border-border/40', // header
    'border border-border/40' // header
];

// Let's replace ' border ' followed by any of the specific border classes
// Actually, it's easier to just remove `border ` and `border-...` from any class string that contains `card-3d` or `tilt-soft`
// We can use a regex to find className="..." that contains card-3d
content = content.replace(/className="([^"]*card-3d[^"]*)"/g, (match, classes) => {
    let newClasses = classes.replace(/\bborder\b/g, '')
                            .replace(/\bborder-\S+/g, '')
                            .replace(/\s+/g, ' ').trim();
    return `className="${newClasses}"`;
});

content = content.replace(/className="([^"]*tilt-soft[^"]*)"/g, (match, classes) => {
    let newClasses = classes.replace(/\bborder\b/g, '')
                            .replace(/\bborder-\S+/g, '')
                            .replace(/\s+/g, ' ').trim();
    return `className="${newClasses}"`;
});

// Remove border from the header
content = content.replace(/className="([^"]*backdrop-blur[^"]*)"/g, (match, classes) => {
    let newClasses = classes.replace(/\bborder\b/g, '')
                            .replace(/\bborder-\S+/g, '')
                            .replace(/\s+/g, ' ').trim();
    return `className="${newClasses}"`;
});

fs.writeFileSync('./src/App.tsx', content);
console.log('Fixed App.tsx classes');
