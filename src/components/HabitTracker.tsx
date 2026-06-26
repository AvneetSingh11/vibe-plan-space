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
    <div className="w-full h-full flex flex-col items-center">
      <header className="w-full max-w-4xl mb-8 flex justify-between items-end">
        <div>
          <h1 className="font-display-hero text-display-hero gradient-text mb-2">Aura Vault</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Behavioral conditioning and consistency protocols.
          </p>
        </div>
      </header>

      <div className="w-full max-w-4xl glass-panel rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row gap-8">
         <div className="absolute top-0 right-0 w-64 h-64 bg-aurora-orange rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
         
         <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-lg text-[28px] text-on-surface">Daily Directives</h2>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-container/20 border border-primary-container/30 text-primary-container">
                <Flame className="w-5 h-5" />
                <span className="font-label-caps text-label-caps uppercase tracking-wider">{maxStreak} Day Prime</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-glass-stroke hover:bg-white/10 transition-colors group/habit"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => onToggleHabit(habit.id)}
                      className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                        habit.completed
                          ? "bg-primary-fixed-dim border-primary-fixed-dim text-on-primary-fixed"
                          : "border-on-surface-variant text-transparent hover:border-on-surface"
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3px]" />
                    </button>
                    
                    <div>
                      <span className={`font-body-md text-[15px] transition-all ${
                        habit.completed ? "text-on-surface-variant line-through" : "text-on-surface"
                      }`}>
                        {habit.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-on-surface-variant font-mono text-[11px] mt-1">
                        <Flame className="w-3.5 h-3.5 text-primary-fixed-dim" />
                        <span>{habit.streak} CYCLE STREAK</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteHabit(habit.id)}
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all cursor-pointer opacity-0 group-hover/habit:opacity-100"
                    title="Terminate Directive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {habits.length === 0 && (
                <div className="text-center py-12 text-on-surface-variant font-body-md">
                  No active directives. System standby.
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Initialize new behavior..."
                  className="w-full glass-input px-4 py-3 rounded-2xl text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary-container font-body-md text-[14px]"
                />
              </div>
              <button
                type="submit"
                className="px-6 rounded-2xl bg-primary-container text-on-primary-container font-headline-md text-[16px] hover:scale-105 transition-transform cursor-pointer flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>
         </div>

         <div className="w-full md:w-72 flex flex-col gap-6">
             <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center text-center border-t border-glass-stroke shadow-inner bg-black/10">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-6">Execution Rate</h3>
                
                <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" className="stroke-white/10" strokeWidth="8" fill="transparent" />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      className="stroke-primary-container transition-all duration-1000 ease-out"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={351.8}
                      strokeDashoffset={351.8 - (351.8 * percentage) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display-hero text-[36px] text-on-surface leading-none">{percentage}</span>
                    <span className="font-label-caps text-[10px] text-primary-fixed-dim">%</span>
                  </div>
                </div>

                <div className="font-body-md text-[13px] text-on-surface">
                   <span className="text-primary-fixed-dim font-bold">{completedHabits}</span> of <span className="font-bold">{totalHabits}</span> parameters met.
                </div>
                <p className="font-data-mono text-[10px] text-on-surface-variant mt-2 text-center">
                  {percentage === 100 ? "OPTIMAL PERFORMANCE REACHED." : "MAINTAIN CONSISTENCY."}
                </p>
             </div>
         </div>
      </div>
    </div>
  );
}
