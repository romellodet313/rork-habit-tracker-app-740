import React, { useMemo, memo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import { Habit } from "@/types/habit";
import { YearGrid } from "./YearGrid";
import { Check, Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { CATEGORIES } from "@/constants/categories";
import { useTheme } from "@/providers/ThemeProvider";

interface HabitCardProps {
  habit: Habit;
  onToggleCompletion: () => void;
  disabled?: boolean;
}

export const HabitCard = memo(function HabitCard({ habit, onToggleCompletion, disabled }: HabitCardProps) {
  const { colors } = useTheme();
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completions?.[today] || false;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  const stats = useMemo(() => {
    const now = new Date();
    let currentStreak = 0;
    let longestStreak = 0;
    let totalCompletions = 0;
    let weeklyCompletions = 0;
    
    // Calculate current streak
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (habit.completions?.[dateStr]) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }
    
    // Calculate total completions and weekly progress
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    
    Object.keys(habit.completions || {}).forEach(date => {
      if (habit.completions?.[date]) {
        totalCompletions++;
        const completionDate = new Date(date);
        if (completionDate >= startOfWeek && completionDate <= now) {
          weeklyCompletions++;
        }
      }
    });
    
    // Calculate longest streak
    const completionDates = Object.keys(habit.completions || {})
      .filter(date => habit.completions?.[date])
      .sort();
    
    if (completionDates.length > 0) {
      let tempStreak = 1;
      for (let i = 1; i < completionDates.length; i++) {
        const prevDate = new Date(completionDates[i - 1]);
        const currentDate = new Date(completionDates[i]);
        const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }
    
    const weeklyGoal = habit.weeklyGoal || 7;
    const weeklyProgress = Math.round((weeklyCompletions / weeklyGoal) * 100);
    
    return {
      currentStreak,
      longestStreak,
      totalCompletions,
      weeklyProgress,
      weeklyCompletions,
      weeklyGoal
    };
  }, [habit.completions, habit.weeklyGoal]);

  const handleComplete = async () => {
    if (disabled) return;
    
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(
        isCompletedToday 
          ? Haptics.ImpactFeedbackStyle.Light 
          : Haptics.ImpactFeedbackStyle.Medium
      );
    }
    onToggleCompletion();
  };

  const categories = useMemo(() => {
    const cats = habit.categories || (habit.category ? [habit.category] : []);
    return cats.map(catId => CATEGORIES.find(c => c.id === catId)).filter(Boolean);
  }, [habit.categories, habit.category]);

  const completionsPerDay = habit.completionsPerDay || 1;
  const todayCompletionCount = typeof habit.completions?.[today] === 'object' 
    ? (habit.completions[today] as any).count || 1
    : isCompletedToday ? 1 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }, disabled && styles.disabled]}>
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.leftSection}>
            <View style={[styles.iconContainer, { backgroundColor: `${habit.color}15` }]}>
              <Text style={styles.icon}>{habit.icon}</Text>
            </View>
            <View style={styles.textInfo}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{habit.name}</Text>
              {categories.length > 0 && (
                <View style={styles.categoriesRow}>
                  {categories.slice(0, 2).map((cat: any) => (
                    <View key={cat.id} style={[styles.categoryTag, { backgroundColor: `${colors.border}80` }]}>
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                      <Text style={[styles.categoryText, { color: colors.textSecondary }]}>{cat.name}</Text>
                    </View>
                  ))}
                  {habit.timeOfDay && habit.timeOfDay.length > 0 && (
                    <View style={[styles.timeTag, { backgroundColor: `${colors.border}80` }]}>
                      <Text style={styles.timeText}>
                        {habit.timeOfDay[0] === 'morning' ? '🌅' : habit.timeOfDay[0] === 'day' ? '☀️' : '🌙'}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
          {!disabled && (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.checkButton,
                  isCompletedToday && { backgroundColor: habit.color },
                ]}
                onPress={handleComplete}
              >
                {isCompletedToday ? (
                  <Check size={18} color="#fff" strokeWidth={3} />
                ) : (
                  <Plus size={18} color={habit.color} strokeWidth={3} />
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>
      
      {completionsPerDay > 1 && (
        <View style={styles.completionProgress}>
          {Array.from({ length: completionsPerDay }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.completionDot,
                i < todayCompletionCount && { backgroundColor: habit.color },
              ]}
            />
          ))}
        </View>
      )}
      
      <YearGrid habit={habit} days={365} />
      
      {habit.streakInterval && habit.streakInterval !== 'none' && (
        <View style={[styles.streakGoalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.streakGoalText, { color: colors.textSecondary }]}>
            {habit.completionsPerInterval || 3} / {habit.streakInterval === 'daily' ? 'Day' : habit.streakInterval === 'week' ? 'Week' : 'Month'}
          </Text>
          {stats.currentStreak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>{stats.currentStreak}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.6,
  },
  header: {
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  textInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryIcon: {
    fontSize: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  timeTag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 12,
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  completionProgress: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  completionDot: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  streakGoalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  streakGoalText: {
    fontSize: 13,
    fontWeight: '500',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakText: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '700',
  },
});