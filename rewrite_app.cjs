const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

// Replace the main outer wrapper
content = content.replace(/className={`min-h-screen [^`]+`}/g, 'className="min-h-screen bg-aurora text-foreground"');
content = content.replace(/className="max-w-3xl mx-auto px-4 pt-16 pb-8 relative z-10"[\s\S]*?<main/g, `className="border-b border-border/40 backdrop-blur sticky top-0 z-30 bg-background/60">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 perspective-scene">
              <div className="absolute inset-0 preserve-3d spin-slow">
                <div className="absolute inset-0 rounded-full border-2 border-primary/60"></div>
                <div className="absolute inset-1 rounded-full border border-primary/40" style={{ transform: 'rotateX(70deg)' }}></div>
                <div className="absolute inset-1 rounded-full border border-primary/40" style={{ transform: 'rotateY(70deg)' }}></div>
                <div className="absolute inset-[35%] rounded-full bg-primary"></div>
              </div>
            </div>
            <div>
              <h1 className="font-display text-xl leading-none">Orbit</h1>
              <p className="text-xs text-muted-foreground">AI productivity companion</p>
            </div>
          </div>
          <nav className="flex gap-1 text-sm">
            {navItems.map((navItem) => (
              <button
                key={navItem.id}
                onClick={() => setActiveTab(navItem.id)}
                className={\`px-3 py-1.5 rounded-full capitalize transition \${
                  activeTab === navItem.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }\`}
              >
                {navItem.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main`);

// Make sure to replace any leftover "<div className="w-full relative z-10">" if present
content = content.replace(/<div className="w-full relative z-10">\s*<main className="space-y-12">/, '<main className="max-w-6xl mx-auto px-5 py-8 space-y-12">');

// Update Orbit card references
content = content.replace(/orbit-card/g, 'card-3d bg-card border border-border/60');
content = content.replace(/backdrop-blur-xl/g, '');
content = content.replace(/text-slate-900/g, 'text-foreground');
content = content.replace(/text-slate-500/g, 'text-muted-foreground');
content = content.replace(/text-slate-100/g, 'text-primary-foreground');
content = content.replace(/bg-slate-900/g, 'bg-primary');

// Replace footer
content = content.replace(/<footer className="max-w-xl mx-auto text-center mt-12 py-6 text-slate-600 text-xs space-y-2 border-t border-slate-200 relative z-10 px-4">[\s\S]*?<\/footer>/, `<footer className="max-w-6xl mx-auto px-5 py-10 text-xs text-muted-foreground text-center">Built with Lovable AI · stored locally on this device</footer>`);

fs.writeFileSync('./src/App.tsx', content);
console.log('App.tsx layout rewritten to dark mode.');
