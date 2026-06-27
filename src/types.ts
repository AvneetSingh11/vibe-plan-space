export interface Task {
  id: string;
  title: string;
  urgent: boolean;
  important: boolean;
  completed: boolean;
  estimatedMinutes: number;
  deadline?: string; // ISO date-time string
  createdAt: string;
  emotionBefore?: string; // e.g. "Anxious", "Focused"
  emotionAfter?: string;  // e.g. "Satisfied", "Tired"
}

export interface EmotionLog {
  id: string;
  taskId?: string;
  taskTitle?: string;
  stage: "before" | "after" | "independent";
  emotion: string;
  emoji: string;
  energy: "high" | "low";
  pleasantness: "pleasant" | "unpleasant";
  note?: string;
  createdAt: string;
  analysis?: {
    sentiment: "positive" | "negative" | "neutral";
    cognitiveDistortion?: string;
    primaryTrigger?: string;
    copingStrategy?: string;
  };
}

export interface EmotionalInsight {
  summary: string;
  productivityCorrelation: string;
  actionableAdvice: string;
  timestamp: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
  history: string[]; // List of completed date strings (YYYY-MM-DD)
}

export interface ContextNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "alert" | "suggestion" | "success";
  read: boolean;
}

export interface AISuggestion {
  title: string;
  message: string;
  associatedTaskId?: string;
  timeSavingsEstimate?: string;
}
