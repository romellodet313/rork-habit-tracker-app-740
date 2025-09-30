export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  streakGoal: number;
  createdAt: string;
  archived: boolean;
  completions: Record<string, boolean>;
  streaks?: Record<string, number>;
  reminders?: HabitReminder[];
  category?: string;
  notes?: Record<string, string>;
  weeklyGoal?: number;
  targetDays?: string[];
}

export interface HabitCompletion {
  habitId: string;
  date: string;
  completed: boolean;
}

export interface HabitReminder {
  id: string;
  habitId: string;
  time: string;
  days: string[];
  enabled: boolean;
  title?: string;
  body?: string;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate30Days: number;
  completionRateAllTime: number;
  averagePerWeek: number;
}

export interface HabitCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}