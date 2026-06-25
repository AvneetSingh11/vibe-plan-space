import React from "react";
import { Check, Flame, Trophy, Plus, Trash2 } from "lucide-react";
import { Habit } from "../types";

interface HabitTrackerProps {
  habits: Habit[];
  onToggleHabit: (habitId: string) => void;
  onAddHabit: (name: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

export default function HabitTracker({ habits, onToggleHabit, onAddHabit, onDeleteHabit }: HabitTrackerProps) {
  const [newHabitName, setNewHabitName] = React.useState("");

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.completed).length;
  const percentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  // Streak master (highest streak)
  const maxStreak = habits.reduce((max, h) => (h.streak > max ? h.streak : max), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim() === "") return;
    onAddHabit(newHabitName.trim());
    setNewHabitName("");
  };

  return (
    <div id="habit-tracker-panel" className="glass-card p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground font-display">Goal & Habit Tracking</h2>
          <p className="text-xs text-muted-foreground">Build consistency, protect your streaks</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold font-mono">
          <Flame className="w-4 h-4 fill-amber-500/20" />
          <span>{maxStreak} Day Best</span>
        </div>
      </div>

      {/* Progress Ring and Stats */}
      <div className="flex items-center gap-5 mb-5 p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Progress Circle SVG */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              className="stroke-slate-800"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              className="stroke-cyan-500 transition-all duration-500"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={175.9}
              strokeDashoffset={175.9 - (175.9 * percentage) / 100}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-sm font-bold text-foreground font-mono">{percentage}%</span>
        </div>
        <div>
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-0.5">
            <Trophy className="w-3.5 h-3.5" />
            <span>Gamified Momentum</span>
          </div>
          <p className="text-sm font-medium text-slate-200">
            {completedHabits} of {totalHabits} habits locked in today
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {percentage === 100 ? "Amazing! Perfect score reached." : "Check off today's habits to secure your streaks."}
          </p>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 mb-5">
        {habits.map((habit) => (
          <div
            key={habit.id}
            id={`habit-row-${habit.id}`}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700/60 transition-colors group/row"
          >
            <div className="flex items-center gap-3">
              <button
                id={`toggle-habit-${habit.id}`}
                onClick={() => onToggleHabit(habit.id)}
                className={`w-5.5 h-5.5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                  habit.completed
                    ? "bg-cyan-500 border-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                    : "border-slate-700 hover:border-slate-500 text-transparent"
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3px] checkmark-pop" />
              </button>
              
              <div>
                <span className={`text-sm font-medium transition-all ${
                  habit.completed ? "text-muted-foreground line-through" : "text-slate-200"
                }`}>
                  {habit.name}
                </span>
                <div className="flex items-center gap-1 text-muted-foreground text-xs mt-0.5 font-mono">
                  <Flame className="w-3 h-3 text-amber-500/80 fill-amber-500/10" />
                  <span>{habit.streak} day streak</span>
                </div>
              </div>
            </div>

            <button
              id={`delete-habit-${habit.id}`}
              onClick={() => onDeleteHabit(habit.id)}
              className="p-1 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all cursor-pointer opacity-0 group-hover/row:opacity-100"
              title="Delete Habit"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {habits.length === 0 && (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No habits added yet. Let's create your first goal!
          </div>
        )}
      </div>

      {/* Add Habit Form */}
      <div className="flex gap-2">
        <input
          id="new-habit-input"
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (newHabitName.trim() !== "") {
                onAddHabit(newHabitName.trim());
                setNewHabitName("");
              }
            }
          }}
          placeholder="New daily habit..."
          className="flex-1 px-3 py-2 text-xs rounded-xl glass-input text-slate-200 placeholder-slate-500 bg-slate-950/40 border border-slate-800 focus:outline-none focus:border-cyan-500"
        />
        <button
          id="add-habit-btn"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (newHabitName.trim() !== "") {
              onAddHabit(newHabitName.trim());
              setNewHabitName("");
            }
          }}
          className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5px]" />
          Add
        </button>
      </div>
    </div>
  );
}
