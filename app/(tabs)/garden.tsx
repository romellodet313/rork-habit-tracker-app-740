import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabits } from '@/providers/HabitProvider';
import { HabitGarden3D } from '@/components/HabitGarden3D';
import { Sparkles, Info } from 'lucide-react-native';
import colors from '@/constants/colors';

export default function GardenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { habits, getStreak } = useHabits();

  const gardenHabits = useMemo(() => {
    return habits
      .filter(h => !h.archived)
      .map(habit => ({
        id: habit.id,
        name: habit.name,
        color: habit.color,
        streak: getStreak(habit.id),
      }))
      .sort((a, b) => b.streak - a.streak);
  }, [habits, getStreak]);

  const totalStreakDays = useMemo(() => {
    return gardenHabits.reduce((sum, h) => sum + h.streak, 0);
  }, [gardenHabits]);

  const handleHabitClick = (habitId: string) => {
    router.push(`/habit/${habitId}`);
  };

  if (gardenHabits.length === 0) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top, paddingBottom: insets.bottom + 100 }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.dark.background} />
        <View style={styles.emptyContent}>
          <View style={styles.emptyIconContainer}>
            <Sparkles size={48} color={colors.dark.tint} />
          </View>
          <Text style={styles.emptyTitle}>Your Garden Awaits</Text>
          <Text style={styles.emptyText}>
            Create habits to grow your 3D garden. Each habit becomes a plant that grows taller with your streak!
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add')}
          >
            <Text style={styles.addButtonText}>Plant Your First Habit</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 100 }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.dark.background} />
        <View style={styles.notAvailableContainer}>
          <Info size={48} color={colors.dark.tint} />
          <Text style={styles.notAvailableTitle}>3D Garden</Text>
          <Text style={styles.notAvailableText}>
            The 3D Habit Garden is available on web only. Open this app in your browser to explore your growing garden!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.dark.background} />
      <ScrollView 
        style={[styles.scrollView, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Your Habit Garden</Text>
            <Text style={styles.subtitle}>
              {gardenHabits.length} plants • {totalStreakDays} total streak days
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Info size={20} color={colors.dark.tint} />
          <Text style={styles.infoText}>
            Each plant represents a habit. The taller it grows, the longer your streak! Click on plants to view details.
          </Text>
        </View>

        <View style={styles.gardenContainer}>
          <HabitGarden3D habits={gardenHabits} onHabitClick={handleHabitClick} />
        </View>

        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Garden Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Seedling (1-7 days)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.legendText}>Growing (8-21 days)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
              <Text style={styles.legendText}>Mature (22+ days)</Text>
            </View>
          </View>
        </View>

        <View style={styles.habitsList}>
          <Text style={styles.habitsListTitle}>Your Plants</Text>
          {gardenHabits.map((habit) => (
            <TouchableOpacity
              key={habit.id}
              style={styles.habitItem}
              onPress={() => handleHabitClick(habit.id)}
            >
              <View style={[styles.habitColor, { backgroundColor: habit.color }]} />
              <View style={styles.habitInfo}>
                <Text style={styles.habitName}>{habit.name}</Text>
                <Text style={styles.habitStreak}>{habit.streak} day streak</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500' as const,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  gardenContainer: {
    height: 400,
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  legendContainer: {
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 12,
  },
  legendItems: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  habitsList: {
    marginBottom: 20,
  },
  habitsListTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 16,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  habitColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  habitStreak: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.dark.tint,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  addButton: {
    backgroundColor: colors.dark.tint,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: colors.dark.tint,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  notAvailableContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  notAvailableTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#fff',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  notAvailableText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
  },
});
