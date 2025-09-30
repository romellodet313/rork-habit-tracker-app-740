import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Achievement, Challenge } from "@/types/habit";
import { ACHIEVEMENT_DEFINITIONS } from "@/constants/achievements";
import { useHabits } from "./HabitProvider";

interface GamificationContextType {
  achievements: Achievement[];
  challenges: Challenge[];
  level: number;
  xp: number;
  xpToNextLevel: number;
  addChallenge: (challenge: Omit<Challenge, 'id' | 'completedDays' | 'active' | 'completed'>) => void;
  updateChallenge: (id: string, updates: Partial<Challenge>) => void;
  deleteChallenge: (id: string) => void;
  checkAchievements: () => void;
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
}

const STORAGE_KEY_ACHIEVEMENTS = '@habitkit_achievements';
const STORAGE_KEY_CHALLENGES = '@habitkit_challenges';
const STORAGE_KEY_XP = '@habitkit_xp';

export const [GamificationProvider, useGamification] = createContextHook<GamificationContextType>(() => {
  const { habits } = useHabits();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [xp, setXp] = useState<number>(0);

  const level = useMemo(() => {
    return Math.floor(xp / 100) + 1;
  }, [xp]);

  const xpToNextLevel = useMemo(() => {
    return (level * 100) - xp;
  }, [level, xp]);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        let storedAchievements = null;
        let storedChallenges = null;
        let storedXp = null;

        if (Platform.OS === 'web' && typeof Storage !== 'undefined') {
          storedAchievements = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
          storedChallenges = localStorage.getItem(STORAGE_KEY_CHALLENGES);
          storedXp = localStorage.getItem(STORAGE_KEY_XP);
        } else {
          storedAchievements = await AsyncStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
          storedChallenges = await AsyncStorage.getItem(STORAGE_KEY_CHALLENGES);
          storedXp = await AsyncStorage.getItem(STORAGE_KEY_XP);
        }

        if (isMounted) {
          if (storedAchievements) {
            const parsed = JSON.parse(storedAchievements);
            if (Array.isArray(parsed)) {
              setAchievements(parsed);
            }
          } else {
            const initialAchievements = ACHIEVEMENT_DEFINITIONS.map(def => ({
              ...def,
              progress: 0,
              unlockedAt: undefined,
            }));
            setAchievements(initialAchievements);
          }

          if (storedChallenges) {
            const parsed = JSON.parse(storedChallenges);
            if (Array.isArray(parsed)) {
              setChallenges(parsed);
            }
          }

          if (storedXp) {
            setXp(parseInt(storedXp, 10));
          }
        }
      } catch (error) {
        console.error('Failed to load gamification data:', error);
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const saveAchievements = async (newAchievements: Achievement[]) => {
    try {
      const data = JSON.stringify(newAchievements);
      if (Platform.OS === 'web' && typeof Storage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, data);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, data);
      }
      setAchievements(newAchievements);
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  };

  const saveChallenges = async (newChallenges: Challenge[]) => {
    try {
      const data = JSON.stringify(newChallenges);
      if (Platform.OS === 'web' && typeof Storage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_CHALLENGES, data);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY_CHALLENGES, data);
      }
      setChallenges(newChallenges);
    } catch (error) {
      console.error('Failed to save challenges:', error);
    }
  };

  const saveXp = async (newXp: number) => {
    try {
      const data = newXp.toString();
      if (Platform.OS === 'web' && typeof Storage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_XP, data);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY_XP, data);
      }
      setXp(newXp);
    } catch (error) {
      console.error('Failed to save XP:', error);
    }
  };

  const checkAchievements = useCallback(() => {
    const totalCompletions = habits.reduce((sum, habit) => {
      return sum + Object.keys(habit.completions || {}).filter(date => {
        const completion = habit.completions[date];
        return completion === true || (typeof completion === 'object' && completion.completed);
      }).length;
    }, 0);

    const maxStreak = Math.max(...habits.map(habit => {
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        const completion = habit.completions?.[dateStr];
        const isCompleted = completion === true || (typeof completion === 'object' && completion.completed);
        if (isCompleted) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
      return streak;
    }), 0);

    const completedChallenges = challenges.filter(c => c.completed).length;

    const updatedAchievements = achievements.map(achievement => {
      let progress = achievement.progress;

      if (achievement.category === 'completion') {
        progress = totalCompletions;
      } else if (achievement.category === 'streak') {
        progress = maxStreak;
      } else if (achievement.category === 'challenge') {
        progress = completedChallenges;
      }

      const wasUnlocked = !!achievement.unlockedAt;
      const isUnlocked = progress >= achievement.target;

      if (isUnlocked && !wasUnlocked) {
        saveXp(xp + 50);
        return {
          ...achievement,
          progress,
          unlockedAt: new Date().toISOString(),
        };
      }

      return {
        ...achievement,
        progress,
      };
    });

    saveAchievements(updatedAchievements);
  }, [habits, challenges, achievements, xp]);

  const prevHabitsRef = useRef<string>('');
  
  useEffect(() => {
    const habitsStr = JSON.stringify(habits.map(h => ({ id: h.id, completions: h.completions })));
    if (habits.length > 0 && habitsStr !== prevHabitsRef.current) {
      prevHabitsRef.current = habitsStr;
      checkAchievements();
    }
  }, [habits, checkAchievements]);

  const addChallenge = useCallback((challengeData: Omit<Challenge, 'id' | 'completedDays' | 'active' | 'completed'>) => {
    const newChallenge: Challenge = {
      ...challengeData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      completedDays: 0,
      active: true,
      completed: false,
    };
    setChallenges(prev => {
      const updated = [...prev, newChallenge];
      saveChallenges(updated);
      return updated;
    });
  }, []);

  const updateChallenge = useCallback((id: string, updates: Partial<Challenge>) => {
    setChallenges(prev => {
      const updated = prev.map(c => 
        c.id === id ? { ...c, ...updates } : c
      );
      saveChallenges(updated);
      return updated;
    });
  }, []);

  const deleteChallenge = useCallback((id: string) => {
    setChallenges(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveChallenges(updated);
      return updated;
    });
  }, []);

  const getUnlockedAchievements = useCallback(() => {
    return achievements.filter(a => a.unlockedAt);
  }, [achievements]);

  const getLockedAchievements = useCallback(() => {
    return achievements.filter(a => !a.unlockedAt);
  }, [achievements]);

  return {
    achievements,
    challenges,
    level,
    xp,
    xpToNextLevel,
    addChallenge,
    updateChallenge,
    deleteChallenge,
    checkAchievements,
    getUnlockedAchievements,
    getLockedAchievements,
  };
});
