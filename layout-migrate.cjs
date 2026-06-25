const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

// Replace the layout wrapper
content = content.replace(
  /<div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">/,
  `
      {/* Orbit Beautiful Header */}
      <div className="max-w-3xl mx-auto px-4 pt-16 pb-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
              </div>
              <span className="text-xs font-semibold tracking-[0.15em] text-slate-500 uppercase">Orbit</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-normal text-slate-900 orbit-heading leading-[1.1]">
              Plan softly.<br/><span className="italic text-slate-500">Feel honestly.</span>
            </h1>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              A quiet space for tasks and reminders — with a beat to notice how you feel before, and after.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="orbit-pill w-20 h-24 flex flex-col items-center justify-center gap-1">
              <span className="text-2xl orbit-heading">{tasks.filter(t => !t.completed).length}</span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-slate-500">Open</span>
            </div>
            <div className="orbit-pill w-20 h-24 flex flex-col items-center justify-center gap-1">
              <span className="text-2xl orbit-heading">{tasks.filter(t => t.urgent && !t.completed).length}</span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-slate-500">Due</span>
            </div>
            <div className="orbit-pill w-20 h-24 flex flex-col items-center justify-center gap-1">
              <span className="text-2xl orbit-heading">{totalCompletedTasks}</span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-slate-500">Done</span>
            </div>
          </div>
        </div>

        {/* Orbit Minimal Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { id: "dashboard", label: "01 · Dashboard" },
            { id: "matrix", label: "02 · Matrix" },
            { id: "habits", label: "03 · Routines" },
            { id: "mind", label: "04 · Mind" },
            { id: "command", label: "05 · Command" }
          ].map((navItem) => (
            <button
              key={navItem.id}
              onClick={() => setActiveTab(navItem.id as any)}
              className={\`px-4 py-2 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all \${
                activeTab === navItem.id
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-transparent text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-200"
              }\`}
            >
              {navItem.label}
            </button>
          ))}
        </div>

      <div className="w-full relative z-10">
`
);

// We need to hide the old sidebar entirely to not mess with the new layout
content = content.replace(
  /<aside[\s\S]*?{([^}]*?)sidebarOpen[\s\S]*?<\/aside>/,
  `{/* Sidebar Removed in Orbit Theme */}`
);

// Remove the "PRIMARY MAIN WINDOW" grid col class since it's now just a single column
content = content.replace(
  /<main className="col-span-1 lg:col-span-9 space-y-6">/,
  `<main className="space-y-12">`
);

// Remove the old mobile header
content = content.replace(
  /{[^}]*MOBILE HEADER BAR[\s\S]*?<\/header>/,
  `{/* Mobile header removed for Orbit layout */}`
);

// Remove the old Content Header Block (Good Explorer...)
content = content.replace(
  /{\/\* CONTENT HEADER BLOCK \*\/}[\s\S]*?Keep daily streaks alive and maintain clean spatial matrix discipline\.[\s\S]*?<\/p>[\s\S]*?<\/div>[\s\S]*?<\/div>/,
  `{/* Orbit uses the global header instead */}`
);

fs.writeFileSync('./src/App.tsx', content, 'utf8');
console.log('Layout replaced successfully');
