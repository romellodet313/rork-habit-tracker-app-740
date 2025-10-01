import { useState, useEffect, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Routine, HabitStack } from "@/types/habit";

interface RoutineContextType {
  routines: Routine[];
  habitStacks: HabitStack[];
  addRoutine: (routine: Omit<Routine, 'id' | 'createdAt'>) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  reorderRoutineHabits: (routineId: string, habitIds: string[]) => void;
  addHabitStack: (stack: Omit<HabitStack, 'id' | 'createdAt'>) => void;
  updateHabitStack: (id: string, updates: Partial<HabitStack>) => void;
  deleteHabitStack: (id: string) => void;
  getRoutineByType: (type: 'morning' | 'evening' | 'custom') => Routine[];
  completeRoutine: (routineId: string, date: string) => void;
}

const ROUTINES_STORAGE_KEY = '@momentpro_routines';
const STACKS_STORAGE_KEY = '@momentpro_stacks';

export const [RoutineProvider, useRoutines] = createContextHook<RoutineContextType>(() => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [habitStacks, setHabitStacks] = useState<HabitStack[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        let storedRoutines = null;
        let storedStacks = null;
        
        if (Platform.OS === 'web' && typeof Storage !== 'undefined') {
          storedRoutines = localStorage.getItem(ROUTINES_STORAGE_KEY);
          storedStacks = localStorage.getItem(STACKS_STORAGE_KEY);
        } else {
          storedRoutines = await AsyncStorage.getItem(ROUTINES_STORAGE_KEY);
          storedStacks = await AsyncStorage.getItem(STACKS_STORAGE_KEY);
        }
        
        if (storedRoutines && isMounted) {
          const parsed = JSON.parse(storedRoutines);
          if (Array.isArray(parsed)) {
            setRoutines(parsed);
          }
        }
        
        if (storedStacks && isMounted) {
          const parsed = JSON.parse(storedStacks);
          if (Array.isArray(parsed)) {
            setHabitStacks(parsed);
          }
        }
      } catch (error) {
        console.error('Failed to load routines:', error);
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const saveRoutines = async (newRoutines: Routine[]) => {
    if (!Array.isArray(newRoutines)) {
      console.error('Invalid routines data');
      return;
    }
    try {
      const validatedRoutines = newRoutines.filter(r => r && typeof r === 'object' && r.id);
      const routineData = JSON.stringify(validatedRoutines);
      if (Platform.OS === 'web' && typeof Storage !== 'undefined') {
        localStorage.setItem(ROUTINES_STORAGE_KEY, routineData);
      } else {
        await AsyncStorage.setItem(ROUTINES_STORAGE_KEY, routineData);
      }
      setRoutines(validatedRoutines);
    } catch (error) {
      console.error('Failed to save routines:', error);
    }
  };

  const saveStacks = async (newStacks: HabitStack[]) => {
    if (!Array.isArray(newStacks)) {
      console.error('Invalid stacks data');
      return;
    }
    try {
      const validatedStacks = newStacks.filter(s => s && typeof s === 'object' && s.id);
      const stackData = JSON.stringify(validatedStacks);
      if (Platform.OS === 'web' && typeof Storage !== 'undefined') {
        localStorage.setItem(STACKS_STORAGE_KEY, stackData);
      } else {
        await AsyncStorage.setItem(STACKS_STORAGE_KEY, stackData);
      }
      setHabitStacks(validatedStacks);
    } catch (error) {
      console.error('Failed to save stacks:', error);
    }
  };

  const addRoutine = useCallback((routineData: Omit<Routine, 'id' | 'createdAt'>) => {
    const newRoutine: Routine = {
      ...routineData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setRoutines(prev => {
      const updated = [...prev, newRoutine];
      saveRoutines(updated);
      return updated;
    });
  }, []);

  const updateRoutine = useCallback((id: string, updates: Partial<Routine>) => {
    setRoutines(prev => {
      const updated = prev.map(r => 
        r.id === id ? { ...r, ...updates } : r
      );
      saveRoutines(updated);
      return updated;
    });
  }, []);

  const deleteRoutine = useCallback((id: string) => {
    setRoutines(prev => {
      const updated = prev.filter(r => r.id !== id);
      saveRoutines(updated);
      return updated;
    });
  }, []);

  const reorderRoutineHabits = useCallback((routineId: string, habitIds: string[]) => {
    setRoutines(prev => {
      const updated = prev.map(r => 
        r.id === routineId ? { ...r, habitIds } : r
      );
      saveRoutines(updated);
      return updated;
    });
  }, []);

  const addHabitStack = useCallback((stackData: Omit<HabitStack, 'id' | 'createdAt'>) => {
    const newStack: HabitStack = {
      ...stackData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setHabitStacks(prev => {
      const updated = [...prev, newStack];
      saveStacks(updated);
      return updated;
    });
  }, []);

  const updateHabitStack = useCallback((id: string, updates: Partial<HabitStack>) => {
    setHabitStacks(prev => {
      const updated = prev.map(s => 
        s.id === id ? { ...s, ...updates } : s
      );
      saveStacks(updated);
      return updated;
    });
  }, []);

  const deleteHabitStack = useCallback((id: string) => {
    setHabitStacks(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveStacks(updated);
      return updated;
    });
  }, []);

  const getRoutineByType = useCallback((type: 'morning' | 'evening' | 'custom'): Routine[] => {
    return routines.filter(r => r.type === type && r.enabled);
  }, [routines]);

  const completeRoutine = useCallback((routineId: string, date: string) => {
    console.log(`Routine ${routineId} completed on ${date}`);
  }, []);

  return {
    routines,
    habitStacks,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    reorderRoutineHabits,
    addHabitStack,
    updateHabitStack,
    deleteHabitStack,
    getRoutineByType,
    completeRoutine,
  };
});
