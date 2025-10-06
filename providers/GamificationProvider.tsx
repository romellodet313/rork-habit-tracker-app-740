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
  trackShare: () => void;
  trackNote: () => void;
  trackMood: () => void;
  trackTemplateUse: () => void;
  firstAppOpenDate?: string;
}

const STORAGE_KEY_ACHIEVEMENTS = '@habitkit_achievements';
const STORAGE_KEY_CHALLENGES = '@habitkit_challenges';
const STORAGE_KEY_XP = '@habitkit_xp';
const STORAGE_KEY_STATS = '@habitkit_gamification_stats';

interface GamificationStats {
  shareCount: number;
  noteCount: number;
  moodTrackCount: number;
  templateUseCount: number;
  firstAppOpenDate: string;
  habitCreationCount: number;
  categoriesUsed: Set<string>;
  dailyCompletions: Record<string, number>;
  monthlyCompletions: Record<string, number>;
  earlyMorningDays: number;
  lateNightDays: number;
  weekendStreaks: number;
  comebackCount: number;
  phoenixCount: number;
  routineCompletions: number;
  gardenPlantsGrown: number;
}

export const [GamificationProvider, useGamification] = createContextHook<GamificationContextType>(() => {
  const { habits } = useHabits();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [xp, setXp] = useState<number>(0);
  const [stats, setStats] = useState<GamificationStats>({
    shareCount: 0,
    noteCount: 0,
    moodTrackCount: 0,
    templateUseCount: 0,
    firstAppOpenDate: new Date().toISOString(),
    habitCreationCount: 0,
    categoriesUsed: new Set(),
    dailyCompletions: {},
    monthlyCompletions: {},
    earlyMorningDays: 0,
    lateNightDays: 0,
    weekendStreaks: 0,
    comebackCount: 0,
    phoenixCount: 0,
    routineCompletions: 0,
    gardenPlantsGrown: 0,
  });

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
        let storedStats = null;

        if (Platform.OS === 'web' && typeof Storage !== 'undefined') {
          storedAchievements = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
          storedChallenges = localStorage.getItem(STORAGE_KEY_CHALLENGES);
          storedXp = localStorage.getItem(STORAGE_KEY_XP);
          storedStats = localStorage.getItem(STORAGE_KEY_STATS);
        } else {
          storedAchievements = await AsyncStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
          storedChallenges = await AsyncStorage.getItem(STORAGE_KEY_CHALLENGES);
          storedXp = await AsyncStorage.getItem(STORAGE_KEY_XP);
          storedStats = await AsyncStorage.getItem(STORAGE_KEY_STATS);
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

          if (storedStats) {
            const parsed = JSON.parse(storedStats);
            setStats({
              ...parsed,
              categoriesUsed: new Set(parsed.categoriesUsed || []),
            });
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

  const saveStats = async (newStats: GamificationStats) => {
    try {
      const data = JSON.stringify({
        ...newStats,
        categoriesUsed: Array.from(newStats.categoriesUsed),
      });
      if (Platform.OS === 'web' && typeof Storage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_STATS, data);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY_STATS, data);
      }
      setStats(newStats);
    } catch (error) {
      console.error('Failed to save stats:', error);
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
    const habitCount = habits.filter(h => !h.archived).length;
    const uniqueCategories = new Set(habits.flatMap(h => h.categories || [h.category || '']).filter(Boolean));
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayCompletions = habits.filter(h => {
      const completion = h.completions?.[todayStr];
      return completion === true || (typeof completion === 'object' && completion.completed);
    }).length;

    const currentMonth = today.toISOString().slice(0, 7);
    const monthlyTotal = habits.reduce((sum, habit) => {
      return sum + Object.keys(habit.completions || {}).filter(date => {
        if (!date.startsWith(currentMonth)) return false;
        const completion = habit.completions[date];
        return completion === true || (typeof completion === 'object' && completion.completed);
      }).length;
    }, 0);

    const daysUsed = Math.floor(
      (today.getTime() - new Date(stats.firstAppOpenDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    const updatedAchievements = achievements.map(achievement => {
      let progress = achievement.progress;

      switch (achievement.category) {
        case 'completion':
          progress = totalCompletions;
          break;
        case 'streak':
          progress = maxStreak;
          break;
        case 'challenge':
          progress = completedChallenges;
          break;
        case 'consistency':
          if (achievement.id === 'perfect-week' || achievement.id === 'perfect-month') {
            progress = 0;
          } else if (achievement.id === 'weekend-warrior') {
            progress = stats.weekendStreaks;
          }
          break;
        case 'time':
          if (achievement.id.includes('early') || achievement.id.includes('morning')) {
            progress = stats.earlyMorningDays;
          } else if (achievement.id.includes('night') || achievement.id.includes('midnight')) {
            progress = stats.lateNightDays;
          }
          break;
        case 'resilience':
          if (achievement.id === 'comeback-kid') {
            progress = stats.comebackCount;
          } else if (achievement.id === 'phoenix-rising') {
            progress = stats.phoenixCount;
          }
          break;
        case 'variety':
          if (achievement.id === 'multi-tasker' || achievement.id === 'habit-collector' || achievement.id === 'life-optimizer') {
            progress = habitCount;
          } else if (achievement.id === 'category-master' || achievement.id === 'balanced-life') {
            progress = uniqueCategories.size;
          }
          break;
        case 'social':
          progress = stats.shareCount;
          break;
        case 'reflection':
          if (achievement.id === 'note-taker' || achievement.id === 'thoughtful-tracker') {
            progress = stats.noteCount;
          } else if (achievement.id === 'mood-master') {
            progress = stats.moodTrackCount;
          }
          break;
        case 'routine':
          if (achievement.id === 'routine-builder') {
            progress = stats.routineCompletions > 0 ? 1 : 0;
          } else if (achievement.id === 'routine-master') {
            progress = stats.routineCompletions;
          }
          break;
        case 'garden':
          if (achievement.id === 'garden-starter') {
            progress = stats.gardenPlantsGrown > 0 ? 1 : 0;
          } else {
            progress = stats.gardenPlantsGrown;
          }
          break;
        case 'exploration':
          progress = stats.templateUseCount;
          break;
        case 'intensity':
          if (achievement.id === 'speed-demon') {
            progress = todayCompletions >= 5 ? 1 : 0;
          } else if (achievement.id === 'productivity-beast') {
            progress = todayCompletions >= 10 ? 1 : 0;
          } else if (achievement.id === 'monthly-champion') {
            progress = monthlyTotal >= 100 ? 1 : 0;
          }
          break;
        case 'loyalty':
          progress = daysUsed;
          break;
      }

      const wasUnlocked = !!achievement.unlockedAt;
      const isUnlocked = progress >= achievement.target;

      if (isUnlocked && !wasUnlocked) {
        const xpReward = achievement.tier === 'diamond' ? 200 : 
                        achievement.tier === 'platinum' ? 150 : 
                        achievement.tier === 'gold' ? 100 : 
                        achievement.tier === 'silver' ? 75 : 50;
        saveXp(xp + xpReward);
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
  }, [habits, challenges, achievements, xp, stats]);

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

  const trackShare = useCallback(() => {
    const newStats = { ...stats, shareCount: stats.shareCount + 1 };
    saveStats(newStats);
    checkAchievements();
  }, [stats, checkAchievements]);

  const trackNote = useCallback(() => {
    const newStats = { ...stats, noteCount: stats.noteCount + 1 };
    saveStats(newStats);
    checkAchievements();
  }, [stats, checkAchievements]);

  const trackMood = useCallback(() => {
    const newStats = { ...stats, moodTrackCount: stats.moodTrackCount + 1 };
    saveStats(newStats);
    checkAchievements();
  }, [stats, checkAchievements]);

  const trackTemplateUse = useCallback(() => {
    const newStats = { ...stats, templateUseCount: stats.templateUseCount + 1 };
    saveStats(newStats);
    checkAchievements();
  }, [stats, checkAchievements]);

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
    trackShare,
    trackNote,
    trackMood,
    trackTemplateUse,
    firstAppOpenDate: stats.firstAppOpenDate,
  };
});
