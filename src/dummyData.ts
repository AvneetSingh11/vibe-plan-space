import { Task, Habit, ContextNotification, EmotionLog } from "./types";

export const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Draft Hackathon Final Submission",
    urgent: true,
    important: true,
    completed: false,
    estimatedMinutes: 90,
    deadline: "2026-06-23T18:00:00",
    createdAt: "2026-06-23T08:00:00",
    emotionBefore: "Anxious"
  },
  {
    id: "task-2",
    title: "Refine Slide Presentation Pitch Deck",
    urgent: false,
    important: true,
    completed: false,
    estimatedMinutes: 45,
    deadline: "2026-06-24T14:00:00",
    createdAt: "2026-06-23T09:00:00",
    emotionBefore: "Focused"
  },
  {
    id: "task-3",
    title: "Verify Hosting Container Ingress Routing",
    urgent: true,
    important: false,
    completed: true,
    estimatedMinutes: 15,
    deadline: "2026-06-23T12:00:00",
    createdAt: "2026-06-23T07:30:00",
    emotionBefore: "Anxious",
    emotionAfter: "Satisfied"
  },
  {
    id: "task-4",
    title: "Review French Vocabulary & Flashcards",
    urgent: false,
    important: false,
    completed: false,
    estimatedMinutes: 20,
    deadline: "2026-06-25T17:00:00",
    createdAt: "2026-06-23T09:15:00"
  }
];

export const initialHabits: Habit[] = [
  {
    id: "habit-1",
    name: "Deep Focus Session (2 hours)",
    streak: 6,
    completed: false,
    history: ["2026-06-22", "2026-06-21", "2026-06-20", "2026-06-19", "2026-06-18", "2026-06-17"]
  },
  {
    id: "habit-2",
    name: "Stay Hydrated (3L Water)",
    streak: 14,
    completed: true,
    history: ["2026-06-23", "2026-06-22", "2026-06-21", "2026-06-20", "2026-06-19", "2026-06-18", "2026-06-17", "2026-06-16", "2026-06-15", "2026-06-14", "2026-06-13", "2026-06-12", "2026-06-11", "2026-06-10"]
  },
  {
    id: "habit-3",
    name: "Physical Exercise (30 mins)",
    streak: 4,
    completed: false,
    history: ["2026-06-22", "2026-06-21", "2026-06-20", "2026-06-19"]
  }
];

export const initialNotifications: ContextNotification[] = [
  {
    id: "notif-1",
    title: "Proactive Nudge: Focus Window Open",
    message: "You have a 45-minute clear slot in your agenda right now. Excellent opportunity to chip away at 'Refine Slide Presentation'!",
    timestamp: "10 mins ago",
    type: "suggestion",
    read: false
  },
  {
    id: "notif-2",
    title: "Immediate Action Required",
    message: "'Draft Hackathon Final Submission' is due in less than 9 hours. Let's start the autonomous AI breakdown to tackle it safely.",
    timestamp: "35 mins ago",
    type: "alert",
    read: false
  }
];

export const initialEmotionLogs: EmotionLog[] = [
  {
    id: "log-1",
    taskId: "task-3",
    taskTitle: "Verify Hosting Container Ingress Routing",
    stage: "before",
    emotion: "Anxious",
    emoji: "😰",
    energy: "high",
    pleasantness: "unpleasant",
    note: "Nervous about getting the custom server ports mapped in the Cloud Sandbox.",
    createdAt: "2026-06-23T07:25:00"
  },
  {
    id: "log-2",
    taskId: "task-3",
    taskTitle: "Verify Hosting Container Ingress Routing",
    stage: "after",
    emotion: "Satisfied",
    emoji: "😌",
    energy: "low",
    pleasantness: "pleasant",
    note: "Ingress connection routing verified and port 3000 is open! Big relief.",
    createdAt: "2026-06-23T07:45:00"
  },
  {
    id: "log-3",
    taskId: "task-1",
    taskTitle: "Draft Hackathon Final Submission",
    stage: "before",
    emotion: "Stressed",
    emoji: "🤯",
    energy: "high",
    pleasantness: "unpleasant",
    note: "So much copy to write, time is ticking.",
    createdAt: "2026-06-23T08:00:00"
  },
  {
    id: "log-4",
    stage: "independent",
    emotion: "Calm",
    emoji: "🧘",
    energy: "low",
    pleasantness: "pleasant",
    note: "Breathing exercise complete. Ready to resume coding.",
    createdAt: "2026-06-22T14:30:00"
  },
  {
    id: "log-5",
    stage: "independent",
    emotion: "Bored",
    emoji: "🥱",
    energy: "low",
    pleasantness: "unpleasant",
    note: "Feeling a bit uninspired today, need a focus trigger.",
    createdAt: "2026-06-21T11:00:00"
  },
  {
    id: "log-6",
    stage: "independent",
    emotion: "Excited",
    emoji: "⚡",
    energy: "high",
    pleasantness: "pleasant",
    note: "Just finished a killer demo run! High-energy flow.",
    createdAt: "2026-06-22T17:15:00"
  }
];

