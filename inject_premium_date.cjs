const fs = require('fs');

// 1. Update App.tsx
let appContent = fs.readFileSync('./src/App.tsx', 'utf8');

// Add import for PremiumDatePicker
const appImports = `import IntegrationsHub from "./components/IntegrationsHub";`;
const appImportsNew = `import IntegrationsHub from "./components/IntegrationsHub";\nimport PremiumDatePicker from "./components/PremiumDatePicker";`;
if (!appContent.includes("import PremiumDatePicker")) {
  appContent = appContent.replace(appImports, appImportsNew);
}

// Replace date picker in Add Task Form
const oldFormDate = `<input
                      name="dateInput"
                      type="date"
                      className="px-3 py-2 rounded-full bg-surface border-none shadow-inner bg-surface/50 text-sm text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                      title="Schedule for later"
                    />`;

// Since it's a controlled component, we need state for the Add form date
// Wait, the form uses e.currentTarget.elements.namedItem('dateInput'). 
// PremiumDatePicker doesn't use a native input with a name.
// So we need to add a hidden input or state. 
// We can just add a useState for the Add Task form date.

const oldFormHeader = `<form 
                    onSubmit={(e) => {`;

const newFormHeader = `
                  {(() => {
                    const [formDate, setFormDate] = React.useState<string | undefined>(undefined);
                    return (
                  <form 
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
                          estimatedMinutes: parseInt(timeInput.value) || 30,
                          deadline: formDate,
                          createdAt: new Date().toISOString()
                        }, ...tasks]);
                        titleInput.value = '';
                        timeInput.value = '';
                        setFormDate(undefined);
                      }
                    }}
                    className="flex gap-2 mb-4 flex-wrap items-center"
                  >
`;

const oldFormClosing = `                    <button type="submit" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm hover:opacity-90 transition active:scale-95 active:shadow-inner">Add</button>
                  </form>`;

const newFormClosing = `                    <button type="submit" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm hover:opacity-90 transition active:scale-95 active:shadow-inner">Add</button>
                  </form>
                  );})()}`;

const newFormDate = `<PremiumDatePicker value={formDate} onChange={setFormDate} />`;

// Apply form changes manually using index to avoid regex mismatches
// Replace the old oldFormDate
appContent = appContent.replace(oldFormDate, newFormDate);

// Replace the form submit logic block
const oldSubmitBlock = `<form 
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
                  >`;

appContent = appContent.replace(oldSubmitBlock, newFormHeader);
appContent = appContent.replace(oldFormClosing, newFormClosing);


// Replace inline date picker in the list
const oldInlineDate = `<input 
                              type="date"
                              value={task.deadline || ""}
                              onChange={(e) => {
                                setTasks(tasks.map(t => t.id === task.id ? { ...t, deadline: e.target.value || undefined } : t));
                              }}
                              className="text-xs text-muted-foreground bg-surface px-2 py-1 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                              title="Scheduled date"
                            />`;

const newInlineDate = `<PremiumDatePicker 
                              value={task.deadline} 
                              onChange={(d) => setTasks(tasks.map(t => t.id === task.id ? { ...t, deadline: d } : t))} 
                            />`;

appContent = appContent.replace(oldInlineDate, newInlineDate);

fs.writeFileSync('./src/App.tsx', appContent);


// 2. Update EisenhowerMatrix.tsx
let matrixContent = fs.readFileSync('./src/components/EisenhowerMatrix.tsx', 'utf8');

const matrixImports = `import { Task } from "../types";`;
const matrixImportsNew = `import { Task } from "../types";\nimport PremiumDatePicker from "./PremiumDatePicker";`;
if (!matrixContent.includes("import PremiumDatePicker")) {
  matrixContent = matrixContent.replace(matrixImports, matrixImportsNew);
}

const oldMatrixInlineDate = `<input 
                      type="date"
                      value={task.deadline || ""}
                      onChange={(e) => {
                        if (onUpdateDeadline) {
                          onUpdateDeadline(task.id, e.target.value);
                        }
                      }}
                      className="text-[10px] text-muted-foreground bg-surface px-1.5 py-1 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-pointer"
                      title="Scheduled date"
                    />`;

const newMatrixInlineDate = `<PremiumDatePicker 
                      value={task.deadline} 
                      onChange={(d) => { if(onUpdateDeadline) onUpdateDeadline(task.id, d); }} 
                    />`;

matrixContent = matrixContent.replace(oldMatrixInlineDate, newMatrixInlineDate);

fs.writeFileSync('./src/components/EisenhowerMatrix.tsx', matrixContent);

console.log('Successfully injected PremiumDatePicker logic!');
