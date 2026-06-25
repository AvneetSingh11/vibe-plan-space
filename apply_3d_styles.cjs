const fs = require('fs');

let css = fs.readFileSync('./src/index.css', 'utf8');

// Update variables: Make border transparent/darker so it's not white
css = css.replace(/--border: oklch\(100% 0 0\/\.08\);/g, '--border: rgba(255, 255, 255, 0.02);');

// Enhance card-3d to have a 3D bevel instead of a flat border
css = css.replace(/--shadow-3d: 0 1px 0 oklch\(100% 0 0\/\.06\) inset, 0 -1px 0 oklch\(0% 0 0\/\.5\) inset, 0 20px 40px -20px oklch\(0% 0 0\/\.7\), 0 40px 80px -40px oklch\(0% 0 0\/\.6\);/g, '--shadow-3d: 0 2px 4px rgba(255, 255, 255, 0.08) inset, 0 -2px 4px rgba(0, 0, 0, 0.8) inset, 0 20px 40px -20px rgba(0, 0, 0, 0.9), 0 40px 80px -40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0,0,0,0.5);');

css = css.replace(/\.card-3d::before {[\s\S]*?}/, `.card-3d::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: inset 0 2px 2px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.6);
    pointer-events: none;
    z-index: 10;
  }`);

fs.writeFileSync('./src/index.css', css);
console.log("Updated index.css");

let app = fs.readFileSync('./src/App.tsx', 'utf8');

// Remove white borders from panels
app = app.replace(/border border-border\/60/g, 'border-none');
app = app.replace(/border border-border\/30/g, 'border-none shadow-inner');
app = app.replace(/border border-border/g, 'border-none shadow-inner bg-surface/50');
app = app.replace(/border-t border-slate-200/g, '');

// Add toggle effects to buttons (active:scale-95 and active:shadow-inner)
app = app.replace(/className="([^"]*?px-3 py-1\.5 rounded-full[^"]*?)"/g, (match, p1) => {
    if (!p1.includes('active:scale-95')) {
        return `className="${p1} active:scale-95 active:shadow-inner"`;
    }
    return match;
});

app = app.replace(/className="([^"]*?px-4 py-2 rounded-full bg-primary[^"]*?)"/g, (match, p1) => {
    if (!p1.includes('active:scale-95')) {
        return `className="${p1} active:scale-95 active:shadow-inner"`;
    }
    return match;
});

fs.writeFileSync('./src/App.tsx', app);
console.log("Updated App.tsx");
