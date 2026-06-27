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

  // Dynamic calculation of overall user consistency streak
  const userStreak = React.useMemo(() => {
    const allDates = new Set<string>();
    habits.forEach(h => {
      if (h.history) {
        h.history.forEach(d => allDates.add(d));
      }
    });

    const today = new Date();
    let streak = 0;
    
    const formatDate = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const todayStr = formatDate(today);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    if (!allDates.has(todayStr) && !allDates.has(yesterdayStr)) {
      return 0;
    }

    let checkDate = allDates.has(todayStr) ? today : yesterday;
    let iterations = 0;
    while (iterations < 1000) {
      iterations++;
      const checkDateStr = formatDate(checkDate);
      if (allDates.has(checkDateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [habits]);

  // Last 7 days visual calendar tracker
  const last7Days = React.useMemo(() => {
    const days = [];
    const today = new Date();
    
    const formatDate = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };

    const allDates = new Set<string>();
    habits.forEach(h => {
      if (h.history) {
        h.history.forEach(d => allDates.add(d));
      }
    });

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = formatDate(d);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.getDate();
      const isToday = i === 0;
      const hasCompleted = allDates.has(dateStr);

      days.push({
        dateStr,
        dayName,
        dayNum,
        isToday,
        hasCompleted
      });
    }
    return days;
  }, [habits]);

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
          <h1 className="font-display-hero text-display-hero gradient-text mb-2">Vibe Vault</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Behavioral conditioning and consistency protocols.
          </p>
        </div>
      </header>

      {/* Dynamic Active Consistency Streak Protocol Card */}
      <div className="w-full max-w-4xl mb-6 glass-panel rounded-3xl p-6 relative overflow-hidden border border-glass-stroke/50 bg-black/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full blur-[90px] opacity-[0.08] pointer-events-none"></div>
        
        <div className="flex flex-col gap-6 relative z-10">
          {/* Top Row: Flame & Live Count AND 7-Day Visualizer */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Flame & Live Count */}
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-[0_4px_15px_rgba(245,158,11,0.25)] relative group">
                <Flame className="w-8 h-8 fill-amber-100 animate-pulse" />
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display-hero text-[30px] text-on-surface leading-none font-black tracking-tight">{userStreak}</span>
                  <span className="font-mono text-[11px] text-amber-400 font-bold uppercase tracking-widest">DAY ACTIVE STREAK</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-1 max-w-[280px] leading-relaxed">
                  {userStreak > 0 
                    ? "Your consistency sequence is currently active. Maintain compliance to upgrade metrics."
                    : "Complete any daily directive below to ignite your live streak protocol!"
                  }
                </p>
              </div>
            </div>

            {/* 7-Day Consistency Week Visualizer */}
            <div className="w-full lg:w-auto flex gap-2 justify-between overflow-x-auto py-1 border-t border-white/5 lg:border-t-0 pt-3 lg:pt-0">
            {last7Days.map((day) => (
              <div
                key={day.dateStr}
                className={`flex flex-col items-center p-2 rounded-xl min-w-[48px] transition-all duration-300 ${
                  day.isToday
                    ? "bg-amber-500/10 border border-amber-500/20 shadow-md"
                    : "border border-transparent"
                }`}
              >
                <span className="text-[9px] font-mono uppercase tracking-wider text-on-surface-variant mb-1 font-bold">
                  {day.dayName}
                </span>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                    day.hasCompleted
                      ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.35)] scale-105"
                      : day.isToday
                      ? "bg-slate-900 border border-slate-700 text-slate-500"
                      : "bg-white/5 border border-white/5 text-slate-600"
                  }`}
                >
                  {day.hasCompleted ? (
                    <Flame className="w-4.5 h-4.5 fill-amber-100" />
                  ) : (
                    <span className="text-[10px] font-mono font-bold">{day.dayNum}</span>
                  )}
                </div>
                {day.isToday && (
                  <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest mt-1">
                    TODAY
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live Status Description Bar */}
        <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-center mb-6">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-2.5 h-2.5 rounded-full ${
              last7Days[6].hasCompleted ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]"
            }`} />
            <span className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant font-bold">
              STREAK SECURITY STANDBY
            </span>
          </div>
          {last7Days[6].hasCompleted ? (
            <p className="text-[11px] text-emerald-400 font-medium">
              🔒 SECURED FOR TODAY. Great job continuing your consistency!
            </p>
          ) : (
            <p className="text-[11px] text-amber-400 font-medium animate-pulse">
              ⚠️ PENDING PROGRESS. Check off any directive below to secure today.
            </p>
          )}
        </div>
        </div>
      </div>

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
                        <Flame className={`w-3.5 h-3.5 transition-colors duration-500 ${habit.completed ? "text-amber-400 fill-amber-400 animate-pulse drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]" : "text-primary-fixed-dim"}`} />
                        <span className={habit.completed ? "text-amber-300 font-bold" : ""}>{habit.streak} CYCLE STREAK</span>
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
