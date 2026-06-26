import React, { useState } from "react";
import { Task } from "../types";
import PremiumDatePicker from "./PremiumDatePicker";
import { Check, Clock, ShieldAlert, Sparkles, AlertCircle, Bookmark, Zap, Trash2, Plus } from "lucide-react";

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
    accentColor: string,
    bgGlow: string,
    icon: React.ReactNode,
    quadrantId: string,
    isUrgent: boolean,
    isImportant: boolean
  ) => {
    return (
      <div
        id={`quadrant-${quadrantId}`}
        className={`card-3d p-5 rounded-3xl flex flex-col h-[340px] bg-card`}
      >
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">
                {title}
              </h3>
              <span className="text-[10px] text-muted-foreground font-medium">{tagline}</span>
            </div>
          </div>
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-900/60 text-foreground border border-slate-800">
            {tasksList.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {tasksList.map((task) => (
            <div
              key={task.id}
              id={`matrix-task-${task.id}`}
              className={`p-3 rounded-xl bg-surface transition-all flex items-start gap-2.5 group relative ${
                task.completed ? "opacity-50" : ""
              }`}
            >
              {/* Custom checkbox */}
              <button
                id={`check-matrix-task-${task.id}`}
                onClick={() => onToggleComplete(task.id)}
                className={`w-5 h-5 mt-0.5 rounded flex items-center justify-center border transition-all cursor-pointer ${
                  task.completed
                    ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border-slate-700 hover:border-slate-500 text-transparent"
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3.5px] checkmark-pop" />
              </button>

              <div className="flex-1 min-w-0 pr-4">
                <p 
                  onClick={() => onSelectTask && onSelectTask(task)}
                  className={`text-xs font-semibold leading-relaxed transition-all cursor-pointer hover:underline hover:text-cyan-400 ${
                    task.completed ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                  title="Click to view details & focus"
                >
                  {task.title}
                </p>
                
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {/* Estimated minutes */}
                  <PremiumDatePicker 
                      value={task.deadline} 
                      onChange={(d) => { if(onUpdateDeadline) onUpdateDeadline(task.id, d); }} 
                    />
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-surface p-1 px-1.5 rounded-lg border-none ring-0">
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
                  </div>

                  {/* Priority Toggle Buttons */}
                  <button
                    id={`toggle-matrix-urgent-${task.id}`}
                    onClick={() => onToggleUrgent(task.id)}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                      task.urgent
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : "bg-slate-900/60 text-muted-foreground border border-slate-800 hover:text-foreground"
                    }`}
                  >
                    Urgent
                  </button>
                  <button
                    id={`toggle-matrix-important-${task.id}`}
                    onClick={() => onToggleImportant(task.id)}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                      task.important
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-slate-900/60 text-muted-foreground border border-slate-800 hover:text-foreground"
                    }`}
                  >
                    Important
                  </button>
                </div>
              </div>

              {/* Delete task button */}
              <button
                id={`delete-matrix-task-${task.id}`}
                onClick={() => onDeleteTask(task.id)}
                className="absolute top-2.5 right-2.5 p-1 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {tasksList.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <span className="text-xs">No tasks in this quadrant</span>
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
          className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/60"
        >
          <input 
            type="text" 
            placeholder="Add task..." 
            value={newTaskText[quadrantId] || ''}
            onChange={(e) => setNewTaskText(prev => ({...prev, [quadrantId]: e.target.value}))}
            className="flex-1 bg-surface text-xs px-2.5 py-1.5 rounded-lg border-none shadow-inner focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50"
          />
          <PremiumDatePicker 
            value={newTaskDate[quadrantId]} 
            onChange={(d) => setNewTaskDate(prev => ({...prev, [quadrantId]: d || ''}))} 
          />
          <button type="submit" className="bg-primary/20 text-primary hover:bg-primary/30 p-1.5 rounded-lg transition-colors cursor-pointer active:scale-95">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    );
  };

  return (
    <div id="eisenhower-matrix-container">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white font-display">Intelligent Prioritization Matrix</h2>
        <p className="text-xs text-muted-foreground">Tasks categorized dynamically using Eisenhower's principles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderQuadrant(
          "Urgent & Important",
          "Do first - critical deadline items",
          q1,
          "text-red-400",
          "border-red-500/10 hover:border-red-500/30",
          <ShieldAlert className="w-4 h-4 text-red-400" />,
          "q1",
          true,
          true
        )}

        {renderQuadrant(
          "Important, Not Urgent",
          "Schedule - planning & goals",
          q2,
          "text-purple-400",
          "border-purple-500/10 hover:border-purple-500/30",
          <Bookmark className="w-4 h-4 text-purple-400" />,
          "q2",
          false,
          true
        )}

        {renderQuadrant(
          "Urgent, Not Important",
          "Delegate - busywork & secondary noise",
          q3,
          "text-cyan-400",
          "border-cyan-500/10 hover:border-cyan-500/30",
          <Zap className="w-4 h-4 text-cyan-400" />,
          "q3",
          true,
          false
        )}

        {renderQuadrant(
          "Not Urgent & Not Important",
          "Eliminate - lowest priority backburner",
          q4,
          "text-muted-foreground",
          "border-slate-800 hover:border-slate-700",
          <AlertCircle className="w-4 h-4 text-muted-foreground" />,
          "q4",
          false,
          false
        )}
      </div>
    </div>
  );
}
