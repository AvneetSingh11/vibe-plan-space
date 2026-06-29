import React, { useState } from "react";
import { Task } from "../types";
import PremiumDatePicker from "./PremiumDatePicker";
import { Check, Clock, ShieldAlert, Bookmark, Zap, AlertCircle, Trash2, Plus } from "lucide-react";

interface EisenhowerMatrixProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleUrgent: (id: string) => void;
  onToggleImportant: (id: string) => void;
  onSelectTask?: (task: Task) => void;
  onUpdateEstimatedMinutes?: (id: string, mins: number) => void;
  onUpdateDeadline?: (id: string, dateStr: string) => void;
  onAddTask?: (title: string, urgent: boolean, important: boolean, mins: number, deadline?: string) => void;
}

export default function EisenhowerMatrix({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onToggleUrgent,
  onToggleImportant,
  onSelectTask,
  onUpdateEstimatedMinutes,
  onUpdateDeadline,
  onAddTask
}: EisenhowerMatrixProps) {
  
  const [newTaskText, setNewTaskText] = useState<Record<string, string>>({});
  const [newTaskDate, setNewTaskDate] = useState<Record<string, string>>({});

  // Categorize tasks
  const q1 = tasks.filter(t => t.urgent && t.important);
  const q2 = tasks.filter(t => !t.urgent && t.important);
  const q3 = tasks.filter(t => t.urgent && !t.important);
  const q4 = tasks.filter(t => !t.urgent && !t.important);

  const renderQuadrant = (
    title: string,
    tagline: string,
    tasksList: Task[],
    accentColor: string, // Tailwind text color class, e.g. text-error
    icon: React.ReactNode,
    quadrantId: string,
    isUrgent: boolean,
    isImportant: boolean
  ) => {
    return (
      <div
        id={`quadrant-${quadrantId}`}
        className={`glass-panel p-6 rounded-3xl flex flex-col h-[500px] relative overflow-hidden group`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-5 -mr-16 -mt-16 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-glass-stroke z-10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-glass-stroke">
                {icon}
             </div>
             <div>
               <h3 className="font-headline-md text-[18px] text-on-surface">{title}</h3>
               <span className="font-body-md text-[11px] text-on-surface-variant line-clamp-1 opacity-80">{tagline}</span>
             </div>
          </div>
          <span className="font-data-mono text-[12px] px-2 py-1 rounded bg-white/5 text-on-surface border border-glass-stroke shadow-inner">
            {tasksList.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar z-10 pb-4">
          {tasksList.map((task) => (
            <div
              key={task.id}
              id={`matrix-task-${task.id}`}
              className={`p-4 rounded-2xl bg-white/5 border border-glass-stroke hover:bg-white/10 transition-all flex flex-col gap-3 group/task relative ${
                task.completed ? "opacity-50 grayscale" : ""
              }`}
            >
               {/* Header: Title and badge */}
               <div className="flex justify-between items-start gap-2">
                 <p 
                    onClick={() => onSelectTask && onSelectTask(task)}
                    className={`font-body-md text-[14px] leading-snug cursor-pointer transition-colors ${task.completed ? "line-through text-on-surface-variant" : "text-on-surface group-hover/task:text-primary-fixed-dim"}`}
                 >
                    {task.title}
                 </p>
                 <span className={`flex-shrink-0 font-label-caps text-label-caps uppercase tracking-wider px-2 py-1 rounded-full ${task.urgent ? 'bg-error/20 text-error border border-error/30' : 'bg-primary-container/20 text-primary-container border border-primary-container/30'}`}>
                    {task.urgent ? 'High' : 'Low'}
                 </span>
               </div>
               
               {/* Footer: Controls */}
               <div className="flex items-center justify-between mt-auto pt-2 border-t border-glass-stroke">
                  <div className="flex items-center gap-2">
                     <button 
                        onClick={() => onToggleComplete(task.id)} 
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${task.completed ? 'bg-primary-fixed-dim border-primary-fixed-dim text-on-primary-fixed' : 'border-on-surface-variant text-transparent hover:border-on-surface'}`}
                     >
                        <Check className="w-3.5 h-3.5 stroke-[3px]" />
                     </button>
                     <PremiumDatePicker 
                        value={task.deadline} 
                        onChange={(d) => { if(onUpdateDeadline) onUpdateDeadline(task.id, d); }} 
                        compact={true}
                     />
                     <div className="flex items-center gap-1 text-[10px] text-on-surface-variant font-mono bg-black/20 p-1 px-1.5 rounded-lg border border-glass-stroke">
                        <Clock className="w-3 h-3" />
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
                          className="w-6 bg-transparent text-right focus:outline-none focus:text-primary-fixed-dim transition-colors"
                        />
                        <span>m</span>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                     <button
                        onClick={() => onToggleUrgent(task.id)}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                          task.urgent
                            ? "bg-error/20 text-error border border-error/30"
                            : "bg-white/5 text-on-surface-variant border border-glass-stroke hover:text-on-surface"
                        }`}
                      >
                        U
                      </button>
                      <button
                        onClick={() => onToggleImportant(task.id)}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                          task.important
                            ? "bg-primary-container/20 text-primary-container border border-primary-container/30"
                            : "bg-white/5 text-on-surface-variant border border-glass-stroke hover:text-on-surface"
                        }`}
                      >
                        I
                      </button>
                  </div>
               </div>

               {/* Delete task button */}
               <button
                 onClick={() => onDeleteTask(task.id)}
                 className="absolute -top-2 -right-2 p-1.5 bg-surface-container-highest text-on-surface-variant border border-glass-stroke hover:text-error hover:border-error/50 rounded-full transition-all opacity-0 group-hover/task:opacity-100 cursor-pointer shadow-lg"
                 title="Delete task"
               >
                 <Trash2 className="w-3.5 h-3.5" />
               </button>
            </div>
          ))}

          {tasksList.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-8 text-center text-on-surface-variant">
              <span className="font-body-md text-[13px] opacity-70">Sector clear. No active tasks.</span>
            </div>
          )}
        </div>

        {/* Quick Add Form inside quadrant */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (newTaskText[quadrantId]?.trim() && onAddTask) {
              onAddTask(
                newTaskText[quadrantId].trim(),
                isUrgent,
                isImportant,
                30,
                newTaskDate[quadrantId]
              );
              setNewTaskText(prev => ({...prev, [quadrantId]: ''}));
              setNewTaskDate(prev => ({...prev, [quadrantId]: ''}));
            }
          }}
          className="flex items-center gap-2 mt-3 pt-3 border-t border-glass-stroke z-10"
        >
          <input 
            type="text" 
            placeholder="Initialize new task..." 
            value={newTaskText[quadrantId] || ''}
            onChange={(e) => setNewTaskText(prev => ({...prev, [quadrantId]: e.target.value}))}
            className="glass-input flex-1 text-on-surface text-xs px-3 py-2 rounded-xl focus:outline-none placeholder-on-surface-variant"
          />
          <PremiumDatePicker 
            value={newTaskDate[quadrantId]} 
            onChange={(d) => setNewTaskDate(prev => ({...prev, [quadrantId]: d || ''}))}
            compact={true}
          />
          <button type="submit" className="bg-primary-container text-on-primary-container hover:scale-105 p-2 rounded-xl transition-transform cursor-pointer">
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-display-hero text-display-hero text-white mb-2">Vibe Task Fleet</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Prioritization matrix. Critical operational tasks sorted by urgency and strategic importance.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 pb-12">
        {renderQuadrant(
          "Do First",
          "Urgent & Important",
          q1,
          "text-error",
          <ShieldAlert className="w-5 h-5 text-error" />,
          "q1",
          true,
          true
        )}

        {renderQuadrant(
          "Schedule",
          "Important, Not Urgent",
          q2,
          "text-tertiary-fixed-dim",
          <Bookmark className="w-5 h-5 text-tertiary-fixed-dim" />,
          "q2",
          false,
          true
        )}

        {renderQuadrant(
          "Delegate",
          "Urgent, Not Important",
          q3,
          "text-primary-container",
          <Zap className="w-5 h-5 text-primary-container" />,
          "q3",
          true,
          false
        )}

        {renderQuadrant(
          "Declutter",
          "Not Urgent & Not Important",
          q4,
          "text-on-surface-variant",
          <AlertCircle className="w-5 h-5 text-on-surface-variant" />,
          "q4",
          false,
          false
        )}
      </div>
    </div>
  );
}
