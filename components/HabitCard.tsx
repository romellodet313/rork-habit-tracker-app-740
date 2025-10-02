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
import { HabitGrid } from "./HabitGrid";
import { Check, TrendingUp, Calendar } from "lucide-react-native";
import * as Haptics from "expo-haptics";

interface HabitCardProps {
  habit: Habit;
  onToggleCompletion: () => void;
  disabled?: boolean;
}

export const HabitCard = memo(function HabitCard({ habit, onToggleCompletion, disabled }: HabitCardProps) {
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

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.header}>
        <View style={styles.info}>
          <View style={[styles.iconContainer, { backgroundColor: `${habit.color}20` }]}>
            <Text style={styles.icon}>{habit.icon}</Text>
          </View>
          <View style={styles.textInfo}>
            <Text style={styles.name}>{habit.name}</Text>
            {habit.description ? (
              <Text style={styles.description} numberOfLines={1}>
                {habit.description}
              </Text>
            ) : null}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Calendar size={12} color="#9CA3AF" />
                <Text style={styles.statText}>{stats.totalCompletions} total</Text>
              </View>
              <View style={styles.statItem}>
                <TrendingUp size={12} color="#9CA3AF" />
                <Text style={styles.statText}>{stats.weeklyProgress}% this week</Text>
              </View>
            </View>
          </View>
        </View>
        {!disabled && (
          <Animated.View style={[styles.animatedButton, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
              style={[
                styles.checkButton,
                isCompletedToday ? 
                  { backgroundColor: habit.color, borderWidth: 0 } :
                  { backgroundColor: '#2A2F4A', borderColor: habit.color, borderWidth: 2 }
              ]}
              onPress={handleComplete}
            >
              <Check 
                size={20} 
                color={isCompletedToday ? "#fff" : habit.color}
                strokeWidth={isCompletedToday ? 2 : 3}
              />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
      
      <HabitGrid habit={habit} days={84} />
      
      <View style={styles.footer}>
        {stats.currentStreak > 0 && (
          <View style={styles.streakContainer}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>{stats.currentStreak} day streak</Text>
          </View>
        )}
        {stats.longestStreak > stats.currentStreak && (
          <View style={styles.bestContainer}>
            <Text style={styles.bestText}>Best: {stats.longestStreak} days</Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1F3A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2F4A',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  disabled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 24,
  },
  textInfo: {
    flex: 1,
    paddingTop: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  checkButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2F4A',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '700',
  },
  bestContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#2A2F4A',
    borderRadius: 8,
  },
  bestText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  animatedButton: {
    // Empty style for animated view
  },
});