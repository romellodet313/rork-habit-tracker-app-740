import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Habit } from "@/types/habit";
import { useTheme } from "@/providers/ThemeProvider";
import { Zap, Check, Plus } from "lucide-react-native";
import * as Haptics from "expo-haptics";

interface SmartDailyDashboardProps {
  habits: Habit[];
  onToggleCompletion: (habitId: string) => void;
}

export function SmartDailyDashboard({ habits, onToggleCompletion }: SmartDailyDashboardProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const topThreeHabits = useMemo(() => {
    const activeHabits = habits.filter(h => !h.archived);
    const hour = new Date().getHours();
    const currentTimeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'day' : 'evening';

    const scored = activeHabits.map(habit => {
      let score = 0;
      
      if (habit.isPriority) score += 100;
      
      if (habit.timeOfDay?.includes(currentTimeOfDay)) score += 50;
      
      const streak = calculateStreak(habit);
      if (streak > 0) score += streak * 2;
      
      if (!habit.completions?.[today]) score += 30;
      
      if (habit.isMicroHabit) score += 20;
      
      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
      if (habit.targetDays?.includes(dayOfWeek)) score += 15;

      return { habit, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.habit);
  }, [habits, today]);

  const calculateStreak = (habit: Habit): number => {
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (habit.completions?.[dateStr]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const handleToggle = async (habitId: string) => {
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
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onToggleCompletion(habitId);
  };

  if (topThreeHabits.length === 0) {
    return null;
  }

  const completedCount = topThreeHabits.filter(h => h.completions?.[today]).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: '#8B5CF620' }]}>
            <Zap size={20} color="#8B5CF6" />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Today&apos;s Focus</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {completedCount} of 3 completed
            </Text>
          </View>
        </View>
        <View style={[styles.progressCircle, { borderColor: colors.border }]}>
          <Text style={[styles.progressText, { color: colors.tint }]}>
            {completedCount}/3
          </Text>
        </View>
      </View>

      <View style={styles.habitsList}>
        {topThreeHabits.map((habit, index) => {
          const isCompleted = habit.completions?.[today];
          const streak = calculateStreak(habit);
          
          return (
            <TouchableOpacity
              key={habit.id}
              style={[
                styles.habitItem,
                { backgroundColor: colors.background, borderColor: colors.border },
                isCompleted && { borderColor: habit.color },
              ]}
              onPress={() => router.push(`/habit/${habit.id}`)}
            >
              <View style={styles.habitContent}>
                <View style={[styles.habitIconContainer, { backgroundColor: `${habit.color}15` }]}>
                  <Text style={styles.habitIcon}>{habit.icon}</Text>
                </View>
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitName, { color: colors.text }]} numberOfLines={1}>
                    {habit.name}
                  </Text>
                  <View style={styles.habitMeta}>
                    {habit.cue && (
                      <Text style={[styles.cueText, { color: colors.textSecondary }]} numberOfLines={1}>
                        💡 {habit.cue}
                      </Text>
                    )}
                    {streak > 0 && (
                      <View style={styles.streakBadge}>
                        <Text style={styles.streakEmoji}>🔥</Text>
                        <Text style={[styles.streakText, { color: '#F59E0B' }]}>{streak}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <TouchableOpacity
                    style={[
                      styles.checkButton,
                      isCompleted && { backgroundColor: habit.color },
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleToggle(habit.id);
                    }}
                  >
                    {isCompleted ? (
                      <Check size={16} color="#fff" strokeWidth={3} />
                    ) : (
                      <Plus size={16} color={habit.color} strokeWidth={3} />
                    )}
                  </TouchableOpacity>
                </Animated.View>
              </View>
              {habit.identityStatement && !isCompleted && (
                <View style={[styles.identityBanner, { backgroundColor: `${habit.color}10` }]}>
                  <Text style={[styles.identityText, { color: habit.color }]}>
                    ✨ {habit.identityStatement}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {completedCount === 3 && (
        <View style={[styles.celebrationBanner, { backgroundColor: '#10B98110' }]}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={[styles.celebrationText, { color: '#10B981' }]}>
            Amazing! You&apos;ve completed your top 3 habits today!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
  },
  habitsList: {
    gap: 12,
  },
  habitItem: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  habitIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitIcon: {
    fontSize: 18,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cueText: {
    fontSize: 12,
    flex: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 6,
  },
  streakEmoji: {
    fontSize: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
  },
  checkButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  identityBanner: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
  },
  identityText: {
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  celebrationBanner: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  celebrationEmoji: {
    fontSize: 20,
  },
  celebrationText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
