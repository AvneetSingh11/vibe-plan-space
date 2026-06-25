const fs = require('fs');

// 1. Fix App.tsx
let appContent = fs.readFileSync('./src/App.tsx', 'utf8');

// Fix Logo
appContent = appContent.replace('border-2 border-foreground/20 rounded-full', 'border-2 border-primary/60 rounded-full');
appContent = appContent.replace(/border border-foreground\/10 rounded-full/g, 'border border-primary/40 rounded-full');

// Add toggle effects to buttons (if not already present)
// Replace className="..." for buttons to include active:scale-95 transition-transform
appContent = appContent.replace(/<button([^>]+className="[^"]+)"/g, (match, p1) => {
    if (!p1.includes('active:scale-95')) {
        return `<button${p1} active:scale-95 transition-transform"`;
    }
    return match;
});

fs.writeFileSync('./src/App.tsx', appContent);

// 2. Fix index.css for the primary color vibe
let cssContent = fs.readFileSync('./src/index.css', 'utf8');
// Change primary to a vibrant orange/pink to match the aurora gradient
// Currently: --primary: oklch(97% .005 80);
cssContent = cssContent.replace(/--primary:\s*oklch\([^)]+\);/g, '--primary: oklch(65% 0.2 30); /* Vibrant Orange/Red */');
// Make primary-foreground white so text is readable on vibrant orange
cssContent = cssContent.replace(/--primary-foreground:\s*oklch\([^)]+\);/g, '--primary-foreground: oklch(98% 0 0);');

fs.writeFileSync('./src/index.css', cssContent);

console.log('Fixed logo, button effects, and recolored primary vibe.');
