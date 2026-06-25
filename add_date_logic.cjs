const fs = require('fs');

// 1. Update App.tsx
let appContent = fs.readFileSync('./src/App.tsx', 'utf8');

// A. Replace the Add Task form in Dashboard
const oldForm = `<form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const titleInput = e.currentTarget.elements.namedItem('taskInput') as HTMLInputElement;
                      const timeInput = e.currentTarget.elements.namedItem('timeInput') as HTMLInputElement;
                      if (titleInput.value.trim()) {
                        setTasks([{
                          id: Math.random().toString(36).substr(2, 9),
                          title: titleInput.value,
                          quadrant: "Q2",
                          completed: false,
                          estimatedMinutes: parseInt(timeInput.value) || 30
                        }, ...tasks]);
                        titleInput.value = '';
                        timeInput.value = '';
                      }
                    }}
                    className="flex gap-2 mb-4"
                  >
                    <input 
                      name="taskInput"
                      placeholder="Add a task..." 
                      className="flex-1 px-4 py-2 rounded-full bg-surface border-none shadow-inner bg-surface/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition" 
                    />
                    <div className="flex items-center px-3 py-2 rounded-full bg-surface border-none shadow-inner bg-surface/50 focus-within:ring-2 focus-within:ring-primary/20 transition">
                      <input
                        name="timeInput"
                        type="number"
                        placeholder="30"
                        min="1"
                        max="999"
                        className="w-10 bg-transparent text-sm text-center focus:outline-none placeholder:text-muted-foreground/50"
                      />
                      <span className="text-xs text-muted-foreground ml-1">min</span>
                    </div>
                    <button type="submit" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm hover:opacity-90 transition active:scale-95 active:shadow-inner">Add</button>
                  </form>`;

const newForm = `<form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const titleInput = e.currentTarget.elements.namedItem('taskInput') as HTMLInputElement;
                      const timeInput = e.currentTarget.elements.namedItem('timeInput') as HTMLInputElement;
                      const dateInput = e.currentTarget.elements.namedItem('dateInput') as HTMLInputElement;
                      if (titleInput.value.trim()) {
                        setTasks([{
                          id: Math.random().toString(36).substr(2, 9),
                          title: titleInput.value,
                          quadrant: "Q2",
                          completed: false,
                          estimatedMinutes: parseInt(timeInput.value) || 30,
                          deadline: dateInput.value || undefined,
                          createdAt: new Date().toISOString()
                        }, ...tasks]);
                        titleInput.value = '';
                        timeInput.value = '';
                        dateInput.value = '';
                      }
                    }}
                    className="flex gap-2 mb-4 flex-wrap"
                  >
                    <input 
                      name="taskInput"
                      placeholder="Add a task..." 
                      className="flex-1 px-4 py-2 rounded-full bg-surface border-none shadow-inner bg-surface/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition" 
                    />
                    <div className="flex items-center px-3 py-2 rounded-full bg-surface border-none shadow-inner bg-surface/50 focus-within:ring-2 focus-within:ring-primary/20 transition">
                      <input
                        name="timeInput"
                        type="number"
                        placeholder="30"
                        min="1"
                        max="999"
                        className="w-10 bg-transparent text-sm text-center focus:outline-none placeholder:text-muted-foreground/50"
                      />
                      <span className="text-xs text-muted-foreground ml-1">min</span>
                    </div>
                    <input
                      name="dateInput"
                      type="date"
                      className="px-3 py-2 rounded-full bg-surface border-none shadow-inner bg-surface/50 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                      title="Schedule for later"
                    />
                    <button type="submit" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm hover:opacity-90 transition active:scale-95 active:shadow-inner">Add</button>
                  </form>`;

appContent = appContent.replace(oldForm, newForm);

// B. Replace the dashboard task filtering logic
const oldFilter = `{tasks.filter(t => !t.completed).length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nothing pending. A clear orbit.</p>
                    ) : (
                      tasks.filter(t => !t.completed).slice(0, 5).map(task => (`;

const newFilter = `{(tasks.filter(t => !t.completed && (!t.deadline || t.deadline <= new Date().toISOString().split('T')[0])).length === 0) ? (
                      <p className="text-sm text-muted-foreground">Nothing pending for today. A clear orbit.</p>
                    ) : (
                      tasks.filter(t => !t.completed && (!t.deadline || t.deadline <= new Date().toISOString().split('T')[0])).slice(0, 5).map(task => (`;

appContent = appContent.replace(oldFilter, newFilter);

// C. Replace the task rendering in the dashboard list to add editable date
const oldTaskRender = `<div className="ml-auto flex items-center gap-3">
                            <span className="text-xs text-muted-foreground flex items-center font-mono bg-surface p-1 px-2 rounded-lg border border-border">`;

const newTaskRender = `<div className="ml-auto flex items-center gap-3">
                            <input 
                              type="date"
                              value={task.deadline || ""}
                              onChange={(e) => {
                                setTasks(tasks.map(t => t.id === task.id ? { ...t, deadline: e.target.value || undefined } : t));
                              }}
                              className="text-xs text-muted-foreground bg-surface px-2 py-1 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                              title="Scheduled date"
                            />
                            <span className="text-xs text-muted-foreground flex items-center font-mono bg-surface p-1 px-2 rounded-lg border border-border">`;

appContent = appContent.replace(oldTaskRender, newTaskRender);

// D. Replace the EisenhowerMatrix instantiation to include onUpdateDeadline
const oldMatrixProp = `onUpdateEstimatedMinutes={(id, mins) => setTasks(tasks.map(t => t.id === id ? { ...t, estimatedMinutes: mins } : t))}
      />`;

const newMatrixProp = `onUpdateEstimatedMinutes={(id, mins) => setTasks(tasks.map(t => t.id === id ? { ...t, estimatedMinutes: mins } : t))}
        onUpdateDeadline={(id, dateStr) => setTasks(tasks.map(t => t.id === id ? { ...t, deadline: dateStr || undefined } : t))}
      />`;

appContent = appContent.replace(oldMatrixProp, newMatrixProp);

// Update nav items
const oldNav = `{ id: "command", label: "voice" }`;
const newNav = `{ id: "command", label: "voice" },
    { id: "integrations", label: "integrations" }`;
appContent = appContent.replace(oldNav, newNav);

fs.writeFileSync('./src/App.tsx', appContent);

// 2. Update EisenhowerMatrix.tsx
let matrixContent = fs.readFileSync('./src/components/EisenhowerMatrix.tsx', 'utf8');

const oldInterface = `onUpdateEstimatedMinutes?: (id: string, mins: number) => void;
}`;
const newInterface = `onUpdateEstimatedMinutes?: (id: string, mins: number) => void;
  onUpdateDeadline?: (id: string, dateStr: string) => void;
}`;
matrixContent = matrixContent.replace(oldInterface, newInterface);

const oldProps = `onUpdateEstimatedMinutes
}: EisenhowerMatrixProps) {`;
const newProps = `onUpdateEstimatedMinutes,
  onUpdateDeadline
}: EisenhowerMatrixProps) {`;
matrixContent = matrixContent.replace(oldProps, newProps);

const oldTimeRender = `<div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-surface p-1 px-1.5 rounded-lg border border-border">`;
const newTimeRender = `<input 
                      type="date"
                      value={task.deadline || ""}
                      onChange={(e) => {
                        if (onUpdateDeadline) {
                          onUpdateDeadline(task.id, e.target.value);
                        }
                      }}
                      className="text-[10px] text-muted-foreground bg-surface px-1.5 py-1 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                      title="Scheduled date"
                    />
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-surface p-1 px-1.5 rounded-lg border border-border">`;

matrixContent = matrixContent.replace(oldTimeRender, newTimeRender);

fs.writeFileSync('./src/components/EisenhowerMatrix.tsx', matrixContent);

console.log('Successfully added date logic!');
