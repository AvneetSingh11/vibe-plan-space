const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

// Find the dashboard block
const dashboardStart = content.indexOf('{activeTab === "dashboard" && (');
if (dashboardStart === -1) {
    console.error("Could not find dashboard block");
    process.exit(1);
}

// Extract the Pomodoro timer widget to keep it
const pomodoroStart = content.indexOf('{/* POMODORO TIMER BAR WIDGET', dashboardStart);
const pomodoroEnd = content.indexOf('{/* METRICS ROW */}', pomodoroStart);
const pomodoroWidget = content.substring(pomodoroStart, pomodoroEnd);

const newDashboard = `{activeTab === "dashboard" && (
            <div className="space-y-6 animate-rise">
              
              {/* Keep the Pomodoro Timer Feature */}
              ${pomodoroWidget.trim()}

              <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
                <section className="card-3d rounded-3xl p-6 bg-card border border-border/60">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-2xl">Good afternoon</h2>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleSynthesizeBriefing}
                        disabled={isSynthesizing}
                        className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-sm disabled:opacity-50 flex items-center gap-2 transition hover:opacity-90"
                      >
                        {isSynthesizing ? (
                          <>
                            <div className="w-3 h-3 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                            Loading
                          </>
                        ) : (
                          <>🎙 Vocal briefing</>
                        )}
                      </button>
                      <button className="px-3 py-1.5 rounded-full border border-border text-sm hover:bg-surface transition">Stop</button>
                    </div>
                  </div>
                  
                  {aiSummary && (
                    <div className="mb-4 p-4 rounded-2xl bg-surface border border-border/50 text-sm">
                      <p className="text-muted-foreground leading-relaxed">{aiSummary}</p>
                    </div>
                  )}

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const input = e.currentTarget.elements.namedItem('taskInput') as HTMLInputElement;
                      if (input.value.trim()) {
                        setTasks([{
                          id: Math.random().toString(36).substr(2, 9),
                          title: input.value,
                          quadrant: "Q2",
                          completed: false,
                          timeEstimate: 30
                        }, ...tasks]);
                        input.value = '';
                      }
                    }}
                    className="flex gap-2 mb-4"
                  >
                    <input 
                      name="taskInput"
                      placeholder="Add a task…" 
                      className="flex-1 px-4 py-2 rounded-full bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition" 
                    />
                    <button type="submit" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm hover:opacity-90 transition">Add</button>
                  </form>
                  
                  <ul className="space-y-2">
                    {tasks.filter(t => !t.completed).length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nothing pending. A clear orbit.</p>
                    ) : (
                      tasks.filter(t => !t.completed).slice(0, 5).map(task => (
                        <li key={task.id} className="flex items-center gap-3 p-3 rounded-2xl bg-surface border border-border/30">
                          <button 
                            onClick={() => toggleTaskCompletion(task.id)}
                            className="w-5 h-5 rounded-full border border-primary/50 flex items-center justify-center transition hover:bg-primary/10"
                          />
                          <span className="text-sm">{task.title}</span>
                          <span className="ml-auto text-xs text-muted-foreground">{task.quadrant}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </section>
                
                <section className="space-y-6">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl p-4 bg-card border border-border/60 tilt-soft text-center">
                      <div className="font-display text-3xl">{tasks.filter(t => !t.completed).length}</div>
                      <div className="text-xs text-muted-foreground mt-1">Open</div>
                    </div>
                    <div className="rounded-2xl p-4 bg-card border border-border/60 tilt-soft text-center">
                      <div className="font-display text-3xl">{tasks.filter(t => t.completed).length}</div>
                      <div className="text-xs text-muted-foreground mt-1">Done</div>
                    </div>
                    <div className="rounded-2xl p-4 bg-card border border-border/60 tilt-soft text-center">
                      <div className="font-display text-3xl">{Math.max(0, ...habits.map(h => h.streak))}</div>
                      <div className="text-xs text-muted-foreground mt-1">Top streak</div>
                    </div>
                  </div>
                  
                  <div className="rounded-3xl p-5 bg-card border border-border/60 card-3d">
                    <h3 className="font-display text-lg mb-2">Objective decomposer</h3>
                    <p className="text-xs text-muted-foreground mb-3">Turn a milestone into a chronological checklist.</p>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem('breakdownInput') as HTMLInputElement;
                        if (input.value.trim()) {
                          handleAutonomousBreakdown(input.value);
                          input.value = '';
                        }
                      }}
                      className="flex gap-2 mb-3"
                    >
                      <input 
                        name="breakdownInput"
                        placeholder="Launch portfolio site…" 
                        className="flex-1 px-3 py-2 rounded-full bg-surface border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition" 
                      />
                      <button 
                        type="submit" 
                        disabled={isDecomposing}
                        className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm disabled:opacity-50 transition hover:opacity-90"
                      >
                        {isDecomposing ? "Breaking..." : "Break"}
                      </button>
                    </form>
                  </div>
                </section>
              </div>
            </div>
          )}`;

const dashboardEnd = content.indexOf('{activeTab === "matrix" && (');
content = content.substring(0, dashboardStart) + newDashboard + "\n\n          " + content.substring(dashboardEnd);

fs.writeFileSync('./src/App.tsx', content);
console.log('Dashboard rewritten.');
