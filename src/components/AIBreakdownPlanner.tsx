import React from "react";
import { Sparkles, Play, Plus, Clock, CheckCircle2, ArrowRight, BrainCircuit } from "lucide-react";
import { Task } from "../types";

interface SubTask {
  title: string;
  durationMinutes: number;
  description: string;
}

interface AIBreakdownPlannerProps {
  onAddSubtasks: (subtasks: Task[]) => void;
  onAddNotification: (title: string, message: string, type: "success" | "suggestion" | "alert") => void;
}

export default function AIBreakdownPlanner({ onAddSubtasks, onAddNotification }: AIBreakdownPlannerProps) {
  const [goalInput, setGoalInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [generatedSubtasks, setGeneratedSubtasks] = React.useState<SubTask[]>([]);
  const [isUrgent, setIsUrgent] = React.useState(true);
  const [isImportant, setIsImportant] = React.useState(true);
  const [source, setSource] = React.useState("");
  const [addedIndices, setAddedIndices] = React.useState<number[]>([]);

  const handleAddSingleSubtask = (st: SubTask, index: number) => {
    const newTask: Task = {
      id: `task-ai-single-${Date.now()}-${index}`,
      title: `${goalInput || "AI Plan"}: ${st.title}`,
      urgent: isUrgent,
      important: isImportant,
      completed: false,
      estimatedMinutes: st.durationMinutes,
      createdAt: new Date().toISOString()
    };
    onAddSubtasks([newTask]);
    setAddedIndices((prev) => [...prev, index]);
    onAddNotification(
      "Sub-task Seeded",
      `"${st.title}" loaded safely into priority grid.`,
      "success"
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (goalInput.trim() === "") return;

    setLoading(true);
    setGeneratedSubtasks([]);
    setSource("");
    setAddedIndices([]);

    try {
      const response = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: goalInput })
      });

      if (!response.ok) {
        throw new Error("Breakdown api failed");
      }

      const data = await response.json();
      setGeneratedSubtasks(data.subtasks || []);
      setSource(data.source || "simulation");
      
      onAddNotification(
        "Autonomous AI Planner Ready",
        `Plan fully generated for: "${goalInput}". Review steps below.`,
        "success"
      );
    } catch (err) {
      console.error(err);
      // Fallback local simulation in case of connection failure
      const fallbackSubtasks = [
        { title: "Define Core Objective", durationMinutes: 15, description: `Draft clear, measurable targets for: "${goalInput}"` },
        { title: "Gather Resources", durationMinutes: 20, description: "Collect all templates, documents, and reference materials needed." },
        { title: "Focus Execution Sprint 1", durationMinutes: 45, description: "Initiate fundamental building blocks or draft first chapters." },
        { title: "Review & Refine Drafts", durationMinutes: 30, description: "Double-check for requirements, edit spelling, and fix structural bugs." },
        { title: "Deliver Final Output", durationMinutes: 15, description: "Synthesize outputs into final format ready for submission." }
      ];
      setGeneratedSubtasks(fallbackSubtasks);
      setSource("simulation-fallback");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToMatrix = () => {
    if (generatedSubtasks.length === 0) return;

    const newTasks: Task[] = generatedSubtasks.map((st, idx) => ({
      id: `task-ai-${Date.now()}-${idx}`,
      title: `${goalInput}: ${st.title}`,
      urgent: isUrgent,
      important: isImportant,
      completed: false,
      estimatedMinutes: st.durationMinutes,
      createdAt: new Date().toISOString()
    }));

    onAddSubtasks(newTasks);
    onAddNotification(
      "Tasks Seeded in Matrix",
      `Successfully loaded ${newTasks.length} sub-tasks into your active board. Go crush them!`,
      "success"
    );

    // Clear state
    setGeneratedSubtasks([]);
    setGoalInput("");
  };

  return (
    <div id="ai-breakdown-planner" className="glass-card p-5 rounded-2xl relative overflow-hidden border border-purple-500/10">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <BrainCircuit className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white font-display">AI Task Breakdown</h2>
          <p className="text-xs text-slate-400">Autonomously decompose complex, overwhelming goals</p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            What is your big goal or project?
          </label>
          <div className="flex gap-2">
            <input
              id="ai-goal-input"
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g., Complete chemistry lab report, finish slide deck pitch..."
              className="flex-1 px-3.5 py-2.5 text-sm rounded-xl glass-input text-slate-100 placeholder-slate-500"
            />
            <button
              id="ai-generate-btn"
              type="submit"
              disabled={loading || goalInput.trim() === ""}
              className="px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Sparkles className="w-4 h-4 fill-slate-950" />
              )}
              Break Down
            </button>
          </div>
        </div>
      </form>

      {/* Loading state messages */}
      {loading && (
        <div className="mt-5 p-6 rounded-xl bg-slate-900/30 border border-slate-800/80 text-center flex flex-col items-center justify-center space-y-2">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mb-1"></div>
          <p className="text-xs font-bold text-purple-300 font-display">Vibe Plan Space Autonomous Engine Active</p>
          <p className="text-[11px] text-slate-500">Decomposing goal objectives, evaluating workloads, and planning time allocations...</p>
        </div>
      )}

      {/* Generated subtasks layout */}
      {generatedSubtasks.length > 0 && (
        <div className="mt-5 space-y-4 border-t border-slate-800/80 pt-4 checkmark-pop">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-purple-300">Generated Action Plan</span>
              {source === "gemini" && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  Gemini Flash
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-[10px] font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Total: {generatedSubtasks.reduce((sum, st) => sum + st.durationMinutes, 0)} mins
              </span>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {generatedSubtasks.map((st, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-purple-950/10 border border-purple-500/10 hover:border-purple-500/25 transition-all">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-purple-400 w-4 h-4 rounded-full bg-purple-500/10 flex items-center justify-center">
                      {idx + 1}
                    </span>
                    {st.title}
                  </h4>
                  <span className="text-[10px] font-bold text-cyan-400 font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/10 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {st.durationMinutes}m
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed mb-2">
                  {st.description}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-purple-500/10 mt-2">
                  <span className="text-[9px] text-slate-500">Step Action:</span>
                  {addedIndices.includes(idx) ? (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 font-mono">
                      Added ✓
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddSingleSubtask(st, idx)}
                      className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg bg-purple-500/20 hover:bg-purple-500/40 text-purple-200 transition-all cursor-pointer flex items-center gap-1 border border-purple-500/30 hover:border-purple-500/50"
                    >
                      <Plus className="w-3 h-3 stroke-[3px]" />
                      Add to Board
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quadrant allocation select */}
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Allocate Generated Tasks into Priority Grid:
            </h4>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-0 w-3.5 h-3.5"
                />
                Urgent
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-0 w-3.5 h-3.5"
                />
                Important
              </label>
            </div>

            <button
              id="apply-plan-btn"
              onClick={handleApplyToMatrix}
              className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 hover:from-purple-500 hover:to-cyan-500 transition-colors shadow-lg shadow-purple-500/15 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Inject Tasks into Board
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
