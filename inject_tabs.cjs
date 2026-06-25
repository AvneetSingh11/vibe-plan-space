const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

function replaceTab(content, tabName, newJSX) {
    const startPattern = `{activeTab === "${tabName}" && (`;
    const startIndex = content.indexOf(startPattern);
    if (startIndex === -1) {
        console.error(`Could not find start for tab ${tabName}`);
        return content;
    }
    
    let openBrackets = 1;
    let endIndex = startIndex + startPattern.length;
    while (openBrackets > 0 && endIndex < content.length) {
        if (content[endIndex] === '(') openBrackets++;
        if (content[endIndex] === ')') openBrackets--;
        endIndex++;
    }
    
    // endIndex now points just past the closing `)` of the conditional render
    // wait, the closing tag is `)}`
    if (content[endIndex] === '}') endIndex++;
    
    return content.substring(0, startIndex) + `{activeTab === "${tabName}" && (\n  <div className="animate-rise">\n${newJSX}\n  </div>\n)}` + content.substring(endIndex);
}

// MATRIX
const newMatrix = `
<div className="grid gap-4 md:grid-cols-2">
  {[ 
    { q: "Q1", t: "Do now", s: "Urgent · Important", b: "border-destructive/50" },
    { q: "Q2", t: "Schedule", s: "Important", b: "border-primary/40" },
    { q: "Q3", t: "Delegate", s: "Urgent", b: "border-yellow-500/40" },
    { q: "Q4", t: "Drop", s: "Neither", b: "border-border/50" }
  ].map(({ q, t, s, b }) => (
    <div key={q} className={"card-3d rounded-3xl p-5 bg-card border " + b}>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-display text-lg">{t}</h3>
        <span className="text-xs text-muted-foreground">{s}</span>
      </div>
      <form 
        className="flex gap-2 mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem('qInput') as HTMLInputElement;
          if (input.value.trim()) {
            setTasks([{ id: Math.random().toString(36).substr(2, 9), title: input.value, quadrant: q, completed: false, timeEstimate: 15 }, ...tasks]);
            input.value = '';
          }
        }}
      >
        <input name="qInput" placeholder="Add to this quadrant…" className="flex-1 px-3 py-1.5 rounded-full bg-surface border border-border text-sm" />
        <button className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm hover:scale-95 transition">+</button>
      </form>
      <ul className="space-y-1.5">
        {tasks.filter(task => task.quadrant === q).length === 0 ? (
          <li className="text-xs text-muted-foreground">Empty</li>
        ) : (
          tasks.filter(task => task.quadrant === q).map(task => (
            <li key={task.id} className="text-xs text-muted-foreground flex items-center justify-between p-2 rounded bg-surface border border-border/30">
              <span className={task.completed ? "line-through opacity-50" : ""}>{task.title}</span>
              <button onClick={() => setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t))} className="w-5 h-5 rounded-full border border-primary/50 grid place-items-center bg-surface hover:bg-surface-elevated">
                {task.completed && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  ))}
</div>
`;

// HABITS
const newHabits = `
<div className="space-y-5">
  <form 
    className="flex gap-2 max-w-md"
    onSubmit={(e) => {
      e.preventDefault();
      const input = e.currentTarget.elements.namedItem('hInput') as HTMLInputElement;
      if (input.value.trim()) {
        setHabits([{ id: Math.random().toString(36).substr(2, 9), name: input.value, streak: 0 }, ...habits]);
        input.value = '';
      }
    }}
  >
    <input name="hInput" placeholder="New atomic habit…" className="flex-1 px-4 py-2 rounded-full bg-surface border border-border text-sm" />
    <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm hover:scale-95 transition">Add habit</button>
  </form>
  <div className="grid gap-3 md:grid-cols-2">
    {habits.map(habit => (
      <div key={habit.id} className="card-3d rounded-3xl p-5 bg-card border border-border/60 flex items-center gap-4">
        <button 
          onClick={() => setHabits(habits.map(h => h.id === habit.id ? { ...h, streak: h.streak + 1 } : h))}
          className="w-14 h-14 rounded-full grid place-items-center font-display text-xl transition bg-surface border border-primary/40 hover:bg-primary/10 active:scale-95"
        >
          {habit.streak}
        </button>
        <div className="flex-1">
          <div className="font-medium">{habit.name}</div>
          <div className="text-xs text-muted-foreground">Tap the ring to log today</div>
        </div>
        <button 
          onClick={() => setHabits(habits.filter(h => h.id !== habit.id))}
          className="text-xs text-muted-foreground hover:text-destructive w-6 h-6 rounded-full hover:bg-destructive/10 grid place-items-center"
        >
          ✕
        </button>
      </div>
    ))}
    {habits.length === 0 && <p className="text-sm text-muted-foreground">No habits tracked.</p>}
  </div>
</div>
`;

// MIND
const newMind = `
<div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
  <section className="card-3d rounded-3xl p-6 bg-card border border-border/60">
    <h2 className="font-display text-xl mb-4">Calibrate</h2>
    <label className="block text-xs text-muted-foreground mb-1">Energy: {emotionState.energy}</label>
    <input 
      min="1" max="5" className="w-full mb-4 accent-primary" type="range" 
      value={emotionState.energy}
      onChange={(e) => setEmotionState({ ...emotionState, energy: parseInt(e.target.value) })}
    />
    <label className="block text-xs text-muted-foreground mb-1">Pleasantness: {emotionState.pleasantness}</label>
    <input 
      min="1" max="5" className="w-full mb-4 accent-primary" type="range" 
      value={emotionState.pleasantness}
      onChange={(e) => setEmotionState({ ...emotionState, pleasantness: parseInt(e.target.value) })}
    />
    <input 
      placeholder="Note (optional)…" 
      className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm mb-4" 
      value={emotionState.notes}
      onChange={(e) => setEmotionState({ ...emotionState, notes: e.target.value })}
    />
    <button 
      onClick={handleEmotionLog}
      disabled={isAnalyzingEmotion}
      className="w-full px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm hover:scale-95 transition"
    >
      {isAnalyzingEmotion ? "Logging..." : "Log this moment"}
    </button>
  </section>
  <section className="card-3d rounded-3xl p-6 bg-card border border-border/60 flex flex-col max-h-[500px]">
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-display text-xl">Mind insights</h2>
      <button 
        onClick={handleAnalyzeEmotions}
        disabled={isAnalyzingEmotion}
        className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm disabled:opacity-50 hover:scale-95 transition"
      >
        Analyze
      </button>
    </div>
    {emotionInsight && (
      <div className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm leading-relaxed text-primary-foreground">
        {emotionInsight}
      </div>
    )}
    <p className="text-sm text-muted-foreground mb-2">Log a few moments to unlock insights.</p>
    <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Recent Logs</h3>
    <ul className="space-y-2 overflow-auto flex-1 pr-2">
      {emotionLogs.map(log => (
        <li key={log.id} className="p-3 bg-surface border border-border/50 rounded-xl text-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium">Energy: {log.energy} | Mood: {log.pleasantness}</span>
            <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          {log.notes && <p className="text-muted-foreground text-xs">{log.notes}</p>}
        </li>
      ))}
      {emotionLogs.length === 0 && <li className="text-xs text-muted-foreground">No logs yet.</li>}
    </ul>
  </section>
</div>
`;

// VOICE (was command)
const newVoice = `
<div className="max-w-2xl mx-auto mt-10">
  <div className="card-3d rounded-3xl p-8 bg-card border border-border/60 text-center relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
    <h2 className="font-display text-2xl mb-2 relative z-10">Acoustic parse portal</h2>
    <p className="text-sm text-muted-foreground mb-8 relative z-10">Speak or type a command. Try "add file taxes as critical and urgent tomorrow".</p>
    <button 
      onClick={handleVoiceCommand}
      className="mx-auto w-32 h-32 rounded-full grid place-items-center text-5xl transition mb-8 bg-primary text-primary-foreground hover:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)] relative z-10"
    >
      🎙
    </button>
    <form 
      className="flex gap-2 relative z-10"
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem('vInput') as HTMLInputElement;
        if (input.value.trim()) {
           handleVoiceCommand(input.value);
           input.value = '';
        }
      }}
    >
      <input name="vInput" placeholder="Type a command…" className="flex-1 px-5 py-3 rounded-full bg-surface border border-border text-sm focus:ring-2 focus:ring-primary/50 outline-none transition" />
      <button className="px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm hover:scale-95 transition font-medium">Run</button>
    </form>
    
    {voiceCommandResult && (
      <div className="mt-8 text-left p-5 rounded-2xl bg-surface border border-border/50 animate-rise relative z-10">
        <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-bold">Execution Result</h4>
        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{voiceCommandResult}</p>
      </div>
    )}
  </div>
</div>
`;

content = replaceTab(content, "matrix", newMatrix);
content = replaceTab(content, "habits", newHabits);
content = replaceTab(content, "mind", newMind);
content = replaceTab(content, "command", newVoice);

fs.writeFileSync('./src/App.tsx', content);
console.log('All tabs injected and wired up.');
