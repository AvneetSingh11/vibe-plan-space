import React, { useState } from "react";
import { Task } from "../types";
import { Calendar, GraduationCap, Loader2, Link2, CheckCircle2 } from "lucide-react";
import { useGoogleLogin } from '@react-oauth/google';
import { Skeleton } from 'boneyard-js/react';

interface IntegrationsHubProps {
  onAddTasks: (tasks: Partial<Task>[]) => void;
}

export default function IntegrationsHub({ onAddTasks }: IntegrationsHubProps) {
  const [calendarState, setCalendarState] = useState<"disconnected" | "connecting" | "connected" | "demo">("disconnected");
  const [classroomState, setClassroomState] = useState<"disconnected" | "connecting" | "connected" | "demo">("disconnected");
  const [calendarToken, setCalendarToken] = useState<string | null>(null);
  const [classroomToken, setClassroomToken] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const loginCalendar = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setCalendarToken(tokenResponse.access_token);
      setCalendarState("connected");
    },
    onError: (error) => {
      console.error("Calendar login error:", error);
      // Fallback to demo mode if OAuth fails (e.g. origins not configured)
      setCalendarState("demo");
    },
    onNonOAuthError: (error) => {
      console.error("Calendar non-OAuth error (e.g. popup closed):", error);
      setCalendarState("disconnected");
    },
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  });

  const loginClassroom = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      setClassroomToken(tokenResponse.access_token);
      setClassroomState("connected");
    },
    onError: (error) => {
      console.error("Classroom login error:", error);
      // Fallback to demo mode if OAuth fails
      setClassroomState("demo");
    },
    onNonOAuthError: (error) => {
      console.error("Classroom non-OAuth error (e.g. popup closed):", error);
      setClassroomState("disconnected");
    },
    scope: 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  });

  const handleConnectCalendar = () => {
    setCalendarState("connecting");
    loginCalendar();
  };

  const handleConnectClassroom = () => {
    setClassroomState("connecting");
    loginClassroom();
  };

  const handleSyncTasks = async () => {
    setIsSyncing(true);
    const newTasks: Partial<Task>[] = [];
    const today = new Date();

    try {
      // Fetch Calendar Events
      if (calendarState === "connected" && calendarToken) {
        const calRes = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${today.toISOString()}&maxResults=15&singleEvents=true&orderBy=startTime`,
          { headers: { Authorization: `Bearer ${calendarToken}` } }
        );
        if (calRes.ok) {
          const calData = await calRes.json();
          if (calData.items) {
            calData.items.forEach((event: any) => {
              if (event.summary && event.start) {
                // If the event is happening soon, it's urgent and important
                const eventDate = new Date(event.start.dateTime || event.start.date);
                const isUrgent = (eventDate.getTime() - today.getTime()) < 48 * 60 * 60 * 1000;
                newTasks.push({
                  title: `📅 ${event.summary}`,
                  urgent: isUrgent,
                  important: true,
                  estimatedMinutes: 60,
                  deadline: eventDate.toISOString().split('T')[0]
                });
              }
            });
          }
        }
      } else if (calendarState === "demo") {
        // Generate simulated calendar events
        newTasks.push({
          title: `📅 (Demo) Project Sync Meeting`,
          urgent: true,
          important: true,
          estimatedMinutes: 45,
          deadline: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        newTasks.push({
          title: `📅 (Demo) Doctor Appointment`,
          urgent: false,
          important: true,
          estimatedMinutes: 60,
          deadline: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }

      // Fetch Classroom Assignments
      if (classroomState === "connected" && classroomToken) {
        // 1. Fetch courses
        const coursesRes = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
          headers: { Authorization: `Bearer ${classroomToken}` }
        });
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          if (coursesData.courses) {
            // 2. Fetch coursework for each course
            for (const course of coursesData.courses.slice(0, 5)) { // Limit to 5 courses to prevent rate limits
              const cwRes = await fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`, {
                headers: { Authorization: `Bearer ${classroomToken}` }
              });
              if (cwRes.ok) {
                const cwData = await cwRes.json();
                if (cwData.courseWork) {
                  cwData.courseWork.forEach((work: any) => {
                    // Only add if there is no due date or due date is in the future
                    let isUrgent = false;
                    let deadline = undefined;
                    
                    if (work.dueDate) {
                      const dueDate = new Date(work.dueDate.year, work.dueDate.month - 1, work.dueDate.day);
                      if (dueDate < today) return; // Skip past due assignments for this demo
                      isUrgent = (dueDate.getTime() - today.getTime()) < 3 * 24 * 60 * 60 * 1000;
                      deadline = dueDate.toISOString().split('T')[0];
                    }

                    newTasks.push({
                      title: `🎓 ${work.title} (${course.name})`,
                      urgent: isUrgent,
                      important: true,
                      estimatedMinutes: 90,
                      deadline: deadline
                    });
                  });
                }
              }
            }
          }
        }
      } else if (classroomState === "demo") {
        newTasks.push({
          title: `🎓 (Demo) Submit Hackathon Project`,
          urgent: true,
          important: true,
          estimatedMinutes: 120,
          deadline: new Date(today.getTime() + 12 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }

      if (newTasks.length > 0) {
        onAddTasks(newTasks);
      } else {
        alert("Sync complete! No new upcoming events or assignments were found.");
      }
    } catch (err) {
      console.error("Sync Error:", err);
      alert("There was an error syncing your data. Please check the console.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6 perspective-scene px-4 md:px-8">
      <header className="mb-8">
        <h2 className="text-3xl font-display font-bold tracking-tight mb-2 flex items-center gap-2">
          <Link2 className="w-8 h-8 text-primary" />
          Integrations & Auto-Sync
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Connect your external calendars and classroom accounts. The AI will securely analyze your schedule and automatically import assignments and events directly into your matrix.
        </p>
      </header>

      <Skeleton name="integrations-grid" loading={isSyncing} animate="pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Calendar Card */}
        <div className="card-3d p-6 rounded-3xl relative overflow-hidden bg-card">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-sm">
              <GoogleCalendarLogo />
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
                className="w-full py-2.5 rounded-xl bg-surface hover:bg-surface-elevated text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Connect Calendar
              </button>
            )}
            {calendarState === "connecting" && (
              <div className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </div>
            )}
            {calendarState === "connected" && (
              <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </div>
            )}
            {calendarState === "demo" && (
              <div className="w-full py-2.5 rounded-xl bg-amber-500/10 text-amber-400 text-sm font-medium flex items-center justify-center gap-2" title="OAuth failed, running in simulated demo mode">
                <CheckCircle2 className="w-4 h-4" />
                Connected (Demo Mode)
              </div>
            )}
          </div>
        </div>

        {/* Google Classroom Card */}
        <div className="card-3d p-6 rounded-3xl relative overflow-hidden bg-card">
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-sm">
              <GoogleClassroomLogo />
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
                className="w-full py-2.5 rounded-xl bg-surface hover:bg-surface-elevated text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                Connect Classroom
              </button>
            )}
            {classroomState === "connecting" && (
              <div className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </div>
            )}
            {classroomState === "connected" && (
              <div className="w-full py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </div>
            )}
            {classroomState === "demo" && (
              <div className="w-full py-2.5 rounded-xl bg-amber-500/10 text-amber-400 text-sm font-medium flex items-center justify-center gap-2" title="OAuth failed, running in simulated demo mode">
                <CheckCircle2 className="w-4 h-4" />
                Connected (Demo Mode)
              </div>
            )}
          </div>
          </div>
        </div>
      </Skeleton>

      {/* Manual Sync Trigger (Optional now that auto-sync exists) */}
      {(calendarState === "connected" || classroomState === "connected" || calendarState === "demo" || classroomState === "demo") && (
        <div className="mt-8 p-6 rounded-3xl bg-surface text-center">
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

const GoogleCalendarLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-blue-400" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="4" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <rect x="7" y="14" width="4" height="4" rx="1.5" fill="currentColor" fillOpacity="0.3" />
    <rect x="13" y="14" width="4" height="4" rx="1.5" fill="currentColor" />
  </svg>
);

const GoogleClassroomLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-emerald-400" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 1.5 2 2.5 6 2.5s6-1 6-2.5v-5" />
    <circle cx="12" cy="10" r="2.5" fill="currentColor" fillOpacity="0.3" />
  </svg>
);
