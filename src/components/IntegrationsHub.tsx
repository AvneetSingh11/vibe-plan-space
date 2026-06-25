import React, { useState } from "react";
import { Task } from "../types";
import { Calendar, GraduationCap, Loader2, Link2, CheckCircle2 } from "lucide-react";

interface IntegrationsHubProps {
  onAddTasks: (tasks: Partial<Task>[]) => void;
}

export default function IntegrationsHub({ onAddTasks }: IntegrationsHubProps) {
  const [calendarState, setCalendarState] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [classroomState, setClassroomState] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnectCalendar = () => {
    setCalendarState("connecting");
    setTimeout(() => {
      setCalendarState("connected");
    }, 1500);
  };

  const handleConnectClassroom = () => {
    setClassroomState("connecting");
    setTimeout(() => {
      setClassroomState("connected");
    }, 1500);
  };

  const handleSyncTasks = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 5);

      const mockTasks: Partial<Task>[] = [];

      if (calendarState === "connected") {
        mockTasks.push(
          { title: "Project Sync Meeting Prep", urgent: true, important: true, estimatedMinutes: 20, deadline: tomorrow.toISOString().split('T')[0] },
          { title: "Weekly Review Event", urgent: false, important: true, estimatedMinutes: 45, deadline: nextWeek.toISOString().split('T')[0] }
        );
      }

      if (classroomState === "connected") {
        mockTasks.push(
          { title: "Study for Midterms (Classroom)", urgent: true, important: true, estimatedMinutes: 120, deadline: tomorrow.toISOString().split('T')[0] },
          { title: "Read Chapter 4 (Classroom)", urgent: false, important: false, estimatedMinutes: 60, deadline: nextWeek.toISOString().split('T')[0] }
        );
      }

      if (mockTasks.length > 0) {
        onAddTasks(mockTasks);
      }
      setIsSyncing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 perspective-scene">
      <header className="mb-8">
        <h2 className="text-3xl font-display font-bold tracking-tight mb-2 flex items-center gap-2">
          <Link2 className="w-8 h-8 text-primary" />
          Integrations & Auto-Sync
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Connect your external calendars and classroom accounts. The AI will securely analyze your schedule and automatically import assignments and events directly into your matrix.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Calendar Card */}
        <div className="card-3d p-6 rounded-3xl relative overflow-hidden bg-card border border-border">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Google Calendar</h3>
              <p className="text-sm text-muted-foreground">Sync your meetings and events.</p>
            </div>
          </div>

          <div className="mt-6">
            {calendarState === "disconnected" && (
              <button 
                onClick={handleConnectCalendar}
                className="w-full py-2.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Connect Calendar
              </button>
            )}
            {calendarState === "connecting" && (
              <div className="w-full py-2.5 rounded-xl border border-border text-sm font-medium flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </div>
            )}
            {calendarState === "connected" && (
              <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </div>
            )}
          </div>
        </div>

        {/* Google Classroom Card */}
        <div className="card-3d p-6 rounded-3xl relative overflow-hidden bg-card border border-border">
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Google Classroom</h3>
              <p className="text-sm text-muted-foreground">Sync your assignments and deadlines.</p>
            </div>
          </div>

          <div className="mt-6">
            {classroomState === "disconnected" && (
              <button 
                onClick={handleConnectClassroom}
                className="w-full py-2.5 rounded-xl bg-surface hover:bg-surface-elevated border border-border text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Connect Classroom
              </button>
            )}
            {classroomState === "connecting" && (
              <div className="w-full py-2.5 rounded-xl border border-border text-sm font-medium flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </div>
            )}
            {classroomState === "connected" && (
              <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sync Action Area */}
      {(calendarState === "connected" || classroomState === "connected") && (
        <div className="mt-8 p-6 rounded-3xl bg-surface border border-border text-center">
          <p className="text-muted-foreground text-sm mb-4">
            Your accounts are connected. You can now use the AI to pull your upcoming events and assignments directly into your Eisenhower Matrix.
          </p>
          <button
            onClick={handleSyncTasks}
            disabled={isSyncing}
            className={`px-6 py-3 rounded-full font-medium transition active:scale-95 flex items-center gap-2 mx-auto ${
              isSyncing 
                ? 'bg-primary/50 text-primary-foreground/50 cursor-not-allowed' 
                : 'bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_20px_rgba(var(--primary),0.3)]'
            }`}
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Schedules...
              </>
            ) : (
              <>
                <SparklesIcon />
                Run AI Auto-Sync
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

const SparklesIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);
