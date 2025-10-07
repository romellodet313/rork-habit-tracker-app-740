import { useState, useEffect, useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Habit, HabitCompletionData } from "@/types/habit";

interface HabitContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completions' | 'archived'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  restoreHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string, data?: Partial<HabitCompletionData>) => void;
  getStreak: (habitId: string) => number;
  getLongestStreak: (habitId: string) => number;
  getCompletionRate: (habitId: string, days?: number) => number;
  getWeeklyProgress: (habitId: string) => number;
  getTotalCompletions: (habitId: string) => number;
  getCompletionData: (habitId: string, date: string) => HabitCompletionData | boolean | undefined;
  importData: (jsonString: string) => void;
  exportData: () => string;
  clearAllData: () => void;
}

const STORAGE_KEY = '@habitkit_habits';

export const [HabitProvider, useHabits] = createContextHook<HabitContextType>(() => {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        console.log('[HabitProvider] Loading habits from storage...');
        let stored = null;
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
            stored = window.localStorage.getItem(STORAGE_KEY);
          }
        } else {
          stored = await AsyncStorage.getItem(STORAGE_KEY);
        }
        if (stored && isMounted) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            console.log(`[HabitProvider] Loaded ${parsed.length} habits from storage`);
            setHabits(parsed);
          }
        } else {
          console.log('[HabitProvider] No stored habits found, starting fresh');
        }
      } catch (error) {
        console.error('[HabitProvider] Failed to load habits:', error);
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);



  const saveHabits = async (newHabits: Habit[]) => {
    if (!Array.isArray(newHabits)) {
      console.error('[HabitProvider] Invalid habits data');
      return;
    }
    try {
      const validatedHabits = newHabits.filter(h => h && typeof h === 'object' && h.id);
      const habitData = JSON.stringify(validatedHabits);
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, habitData);
        }
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, habitData);
      }
      console.log(`[HabitProvider] Saved ${validatedHabits.length} habits to storage`);
      setHabits(validatedHabits);
    } catch (error) {
      console.error('[HabitProvider] Failed to save habits:', error);
    }
  };

  const addHabit = useCallback((habitData: Omit<Habit, 'id' | 'createdAt' | 'completions' | 'archived'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      completions: {},
      archived: false,
    };
    setHabits(prev => {
      const updated = [...prev, newHabit];
      saveHabits(updated);
      return updated;
    });
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits(prev => {
      const updated = prev.map(h => 
        h.id === id ? { ...h, ...updates } : h
      );
      saveHabits(updated);
      return updated;
    });
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => {
      const updated = prev.filter(h => h.id !== id);
      saveHabits(updated);
      return updated;
    });
  }, []);

  const archiveHabit = useCallback((id: string) => {
    setHabits(prev => {
      const updated = prev.map(h => 
        h.id === id ? { ...h, archived: true } : h
      );
      saveHabits(updated);
      return updated;
    });
  }, []);

  const restoreHabit = useCallback((id: string) => {
    setHabits(prev => {
      const updated = prev.map(h => 
        h.id === id ? { ...h, archived: false } : h
      );
      saveHabits(updated);
      return updated;
    });
  }, []);

  const toggleHabitCompletion = useCallback((habitId: string, date: string, data?: Partial<HabitCompletionData>) => {
    setHabits(prev => {
      const habit = prev.find(h => h.id === habitId);
      if (!habit) return prev;

      const completions = { ...habit.completions };
      const currentCompletion = completions[date];
      const isCurrentlyCompleted = currentCompletion === true || (typeof currentCompletion === 'object' && currentCompletion.completed);
      
      if (isCurrentlyCompleted) {
        delete completions[date];
      } else {
        if (data) {
          completions[date] = { completed: true, ...data };
        } else {
          completions[date] = true;
        }
      }

      const updated = prev.map(h => 
        h.id === habitId ? { ...h, completions } : h
      );
      saveHabits(updated);
      return updated;
    });
  }, []);

  const habitsMap = useMemo(() => {
    const map = new Map<string, Habit>();
    habits.forEach(h => map.set(h.id, h));
    return map;
  }, [habits]);

  const getStreak = useCallback((habitId: string): number => {
    const habit = habitsMap.get(habitId);
    if (!habit || !habit.completions) return 0;

    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (habit.completions[dateStr]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  }, [habitsMap]);
  
  const getLongestStreak = useCallback((habitId: string): number => {
    const habit = habitsMap.get(habitId);
    if (!habit || !habit.completions) return 0;
    
    const completionDates = Object.keys(habit.completions)
      .filter(date => habit.completions[date])
      .sort();
    
    if (completionDates.length === 0) return 0;
    
    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < completionDates.length; i++) {
      const prevDate = new Date(completionDates[i - 1]);
      const currentDate = new Date(completionDates[i]);
      const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    return Math.max(longestStreak, currentStreak);
  }, [habitsMap]);
  
  const getCompletionRate = useCallback((habitId: string, days: number = 30): number => {
    const habit = habitsMap.get(habitId);
    if (!habit || !habit.completions) return 0;
    
    const today = new Date();
    let completedDays = 0;
    
    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (habit.completions[dateStr]) {
        completedDays++;
      }
    }
    
    return Math.round((completedDays / days) * 100);
  }, [habitsMap]);
  
  const getWeeklyProgress = useCallback((habitId: string): number => {
    const habit = habitsMap.get(habitId);
    if (!habit || !habit.completions) return 0;
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    let completedThisWeek = 0;
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(startOfWeek);
      checkDate.setDate(startOfWeek.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (habit.completions[dateStr]) {
        completedThisWeek++;
      }
    }
    
    const weeklyGoal = habit.weeklyGoal || 7;
    return Math.round((completedThisWeek / weeklyGoal) * 100);
  }, [habitsMap]);
  
  const getTotalCompletions = useCallback((habitId: string): number => {
    const habit = habitsMap.get(habitId);
    if (!habit || !habit.completions) return 0;
    
    return Object.keys(habit.completions).filter(date => {
      const completion = habit.completions[date];
      return completion === true || (typeof completion === 'object' && completion.completed);
    }).length;
  }, [habitsMap]);

  const getCompletionData = useCallback((habitId: string, date: string): HabitCompletionData | boolean | undefined => {
    const habit = habitsMap.get(habitId);
    if (!habit || !habit.completions) return undefined;
    return habit.completions[date];
  }, [habitsMap]);

  const importData = useCallback((jsonString: string) => {
    if (!jsonString || typeof jsonString !== 'string' || jsonString.trim().length === 0) {
      throw new Error('Invalid input');
    }
    try {
      const sanitized = jsonString.trim();
      const data = JSON.parse(sanitized);
      if (Array.isArray(data)) {
        saveHabits(data);
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }, []);

  const exportData = useCallback((): string => {
    return JSON.stringify(habits, null, 2);
  }, [habits]);

  const clearAllData = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
      setHabits([]);
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  }, []);

  return {
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    restoreHabit,
    toggleHabitCompletion,
    getStreak,
    getLongestStreak,
    getCompletionRate,
    getWeeklyProgress,
    getTotalCompletions,
    getCompletionData,
    importData,
    exportData,
    clearAllData,
  };
});