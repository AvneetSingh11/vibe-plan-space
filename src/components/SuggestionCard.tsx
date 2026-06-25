import React from "react";
import { Sparkles, ArrowRight, Clock } from "lucide-react";
import { Task } from "../types";

interface SuggestionCardProps {
  tasks: Task[];
  onTriggerTask: (taskId: string) => void;
}

export default function SuggestionCard({ tasks, onTriggerTask }: SuggestionCardProps) {
  // Find a pending task that fits nicely
  const pendingTasks = tasks.filter(t => !t.completed);
  
  let suggestedTask: Task | null = null;
  let suggestionMessage = "";
  let suggestionTitle = "Proactive Focus Suggestion";

  if (pendingTasks.length === 0) {
    suggestionTitle = "All Tasks Completed!";
    suggestionMessage = "You've crushed all your tasks! Perfect time to set a new goal or establish a daily healthy habit.";
  } else {
    // Find a quick task (under 30 mins) first
    const quickTask = pendingTasks.find(t => t.estimatedMinutes <= 30);
    if (quickTask) {
      suggestedTask = quickTask;
      suggestionMessage = `You have a perfect 30-minute window. Knock out "${quickTask.title}" right now and claim an early victory!`;
    } else {
      // Find the most urgent/important task
      const criticalTask = pendingTasks.find(t => t.urgent && t.important) || pendingTasks[0];
      suggestedTask = criticalTask;
      suggestionMessage = `High cognitive energy detected. Start on your most critical objective: "${criticalTask.title}". Every minute counts!`;
    }
  }

  return (
    <div id="proactive-suggestion-card" className="glass-card p-5 rounded-2xl relative overflow-hidden ai-pulse border border-purple-500/20">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Sparkles className="w-24 h-24 text-cyan-400" />
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold tracking-wider uppercase text-purple-300 font-display">
          Proactive AI Suggestion
        </span>
      </div>

      <h3 className="text-lg font-bold text-white mb-2 font-display">
        {suggestedTask ? "Quick Win Available" : suggestionTitle}
      </h3>
      
      <p className="text-sm text-slate-300 mb-4 leading-relaxed">
        {suggestionMessage}
      </p>

      {suggestedTask && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-cyan-400 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{suggestedTask.estimatedMinutes}m</span>
            </div>
            <span className="text-sm font-medium text-slate-200 truncate max-w-[180px] md:max-w-[220px]">
              {suggestedTask.title}
            </span>
          </div>
          <button
            id={`suggested-task-btn-${suggestedTask.id}`}
            onClick={() => onTriggerTask(suggestedTask!.id)}
            className="flex items-center gap-1 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer group"
          >
            Start Now
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
