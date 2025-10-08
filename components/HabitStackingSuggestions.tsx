import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Habit } from "@/types/habit";
import { useTheme } from "@/providers/ThemeProvider";
import { Link2 } from "lucide-react-native";

interface HabitStackingSuggestionsProps {
  habits: Habit[];
  currentHabit?: Habit;
  onSelectStack: (anchorHabit: Habit, position: 'before' | 'after') => void;
}

export function HabitStackingSuggestions({ 
  habits, 
  currentHabit,
  onSelectStack 
}: HabitStackingSuggestionsProps) {
  const { colors } = useTheme();

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

  const suggestions = useMemo(() => {
    const activeHabits = habits.filter(h => !h.archived && h.id !== currentHabit?.id);
    
    const scored = activeHabits.map(habit => {
      let score = 0;
      let reason = '';
      
      if (currentHabit?.timeOfDay && habit.timeOfDay) {
        const overlap = currentHabit.timeOfDay.filter(t => habit.timeOfDay?.includes(t));
        if (overlap.length > 0) {
          score += 50;
          reason = `Both happen in the ${overlap[0]}`;
        }
      }
      
      if (currentHabit?.categories && habit.categories) {
        const overlap = currentHabit.categories.filter(c => habit.categories?.includes(c));
        if (overlap.length > 0) {
          score += 30;
          if (!reason) reason = 'Similar category';
        }
      }
      
      if (habit.estimatedDuration && habit.estimatedDuration <= 5) {
        score += 20;
        if (!reason) reason = 'Quick habit (under 5 min)';
      }
      
      if (habit.isMicroHabit) {
        score += 25;
        if (!reason) reason = 'Micro-habit (2-min rule)';
      }

      const streak = calculateStreak(habit);
      if (streak > 7) {
        score += 15;
        if (!reason) reason = 'Strong existing habit';
      }

      return { habit, score, reason: reason || 'Good pairing' };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [habits, currentHabit]);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: '#10B98120' }]}>
          <Link2 size={20} color="#10B981" />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.text }]}>Habit Stacking</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Pair with existing habits for better consistency
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {suggestions.map(({ habit, reason }) => (
          <View key={habit.id} style={[styles.suggestionCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={[styles.habitIconContainer, { backgroundColor: `${habit.color}15` }]}>
              <Text style={styles.habitIcon}>{habit.icon}</Text>
            </View>
            <Text style={[styles.habitName, { color: colors.text }]} numberOfLines={2}>
              {habit.name}
            </Text>
            <Text style={[styles.reason, { color: colors.textSecondary }]} numberOfLines={2}>
              {reason}
            </Text>
            <View style={styles.stackButtons}>
              <TouchableOpacity
                style={[styles.stackButton, { backgroundColor: colors.card, borderColor: habit.color }]}
                onPress={() => onSelectStack(habit, 'after')}
              >
                <Text style={[styles.stackButtonText, { color: habit.color }]}>After</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.stackButton, { backgroundColor: colors.card, borderColor: habit.color }]}
                onPress={() => onSelectStack(habit, 'before')}
              >
                <Text style={[styles.stackButtonText, { color: habit.color }]}>Before</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.tipBanner, { backgroundColor: `${colors.tint}10` }]}>
        <Text style={[styles.tipText, { color: colors.tint }]}>
          💡 Tip: &quot;After I [existing habit], I will [new habit]&quot;
        </Text>
      </View>
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
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollView: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  suggestionCard: {
    width: 160,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
  },
  habitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  habitIcon: {
    fontSize: 20,
  },
  habitName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    minHeight: 36,
  },
  reason: {
    fontSize: 11,
    marginBottom: 12,
    minHeight: 30,
  },
  stackButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  stackButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  stackButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tipBanner: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
  },
  tipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
