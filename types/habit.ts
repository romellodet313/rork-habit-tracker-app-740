export interface HabitCompletionData {
  completed: boolean;
  note?: string;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  energy?: 'high' | 'medium' | 'low';
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  streakGoal: number;
  createdAt: string;
  archived: boolean;
  completions: Record<string, boolean | HabitCompletionData>;
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

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
  category: 'streak' | 'completion' | 'consistency' | 'challenge';
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: '30-day' | '100-day' | 'weekly' | 'custom';
  habitId?: string;
  startDate: string;
  endDate: string;
  targetDays: number;
  completedDays: number;
  active: boolean;
  completed: boolean;
}