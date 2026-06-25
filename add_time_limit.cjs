const fs = require('fs');

// 1. Update App.tsx
let appContent = fs.readFileSync('./src/App.tsx', 'utf8');

// Replace the Add Task form in Dashboard
const oldForm = `<form 
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
                      placeholder="Add a task?" 
                      className="flex-1 px-4 py-2 rounded-full bg-surface border-none shadow-inner bg-surface/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition" 
                    />
                    <button type="submit" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm hover:opacity-90 transition active:scale-95 active:shadow-inner">Add</button>
                  </form>`;

const newForm = `<form 
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

// We have to use a regex because of the weird character ? in the placeholder due to encoding
appContent = appContent.replace(/<form[\s\S]*?<input[\s\S]*?name="taskInput"[\s\S]*?<\/form>/, newForm);

// Replace the dashboard task rendering
const oldTaskRender = `<span className="ml-auto text-xs text-muted-foreground">{task.quadrant}</span>`;
const newTaskRender = `<div className="ml-auto flex items-center gap-3">
                            <span className="text-xs text-muted-foreground flex items-center font-mono bg-surface p-1 px-2 rounded-lg border border-border">
                              <input 
                                type="number" 
                                min="1" 
                                max="999" 
                                value={task.estimatedMinutes || task.timeEstimate || 30} 
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val) && val > 0) {
                                    setTasks(tasks.map(t => t.id === task.id ? { ...t, estimatedMinutes: val } : t));
                                  }
                                }}
                                className="w-8 bg-transparent text-right focus:outline-none focus:bg-surface-elevated rounded hover:bg-surface transition-colors"
                              />
                              <span className="ml-1">m</span>
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground bg-surface-elevated px-2 py-1 rounded-md">{task.quadrant}</span>
                          </div>`;
appContent = appContent.replace(oldTaskRender, newTaskRender);

// Replace EisenhowerMatrix usage
const oldMatrixProp = `onSetFocusTask={(task) => {
              setActiveFocusTask(task);
              setFocusSelectedPreset(task.estimatedMinutes as any || 25);
              setFocusTimeLeft((task.estimatedMinutes || 25) * 60);
              setFocusTimerActive(false);
            }}
          />`;
const newMatrixProp = `onSetFocusTask={(task) => {
              setActiveFocusTask(task);
              setFocusSelectedPreset(task.estimatedMinutes as any || 25);
              setFocusTimeLeft((task.estimatedMinutes || 25) * 60);
              setFocusTimerActive(false);
            }}
            onUpdateEstimatedMinutes={(id, mins) => setTasks(tasks.map(t => t.id === id ? { ...t, estimatedMinutes: mins } : t))}
          />`;
appContent = appContent.replace(oldMatrixProp, newMatrixProp);

fs.writeFileSync('./src/App.tsx', appContent);

// 2. Update EisenhowerMatrix.tsx
let matrixContent = fs.readFileSync('./src/components/EisenhowerMatrix.tsx', 'utf8');

const oldInterface = `onSetFocusTask?: (task: Task) => void;
}`;
const newInterface = `onSetFocusTask?: (task: Task) => void;
  onUpdateEstimatedMinutes?: (id: string, mins: number) => void;
}`;
matrixContent = matrixContent.replace(oldInterface, newInterface);

const oldProps = `onMoveQuadrant,
  onSetFocusTask
}) => {`;
const newProps = `onMoveQuadrant,
  onSetFocusTask,
  onUpdateEstimatedMinutes
}) => {`;
matrixContent = matrixContent.replace(oldProps, newProps);

const oldTimeRender = `<div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span>{task.estimatedMinutes}m</span>
                  </div>`;
const newTimeRender = `<div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-surface p-1 px-1.5 rounded-lg border border-border">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <input 
                      type="number" 
                      min="1" 
                      max="999" 
                      value={task.estimatedMinutes || 30} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0 && onUpdateEstimatedMinutes) {
                          onUpdateEstimatedMinutes(task.id, val);
                        }
                      }}
                      className="w-6 bg-transparent text-right focus:outline-none focus:bg-surface-elevated rounded hover:bg-surface transition-colors"
                    />
                    <span>m</span>
                  </div>`;
matrixContent = matrixContent.replace(oldTimeRender, newTimeRender);

fs.writeFileSync('./src/components/EisenhowerMatrix.tsx', matrixContent);

console.log('Successfully added time limit logic!');
