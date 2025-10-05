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
import { useTheme } from '@/providers/ThemeProvider';
import typography from '@/constants/typography';

export default function CityBuilderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { habits, getStreak } = useHabits();
  const { colors, theme } = useTheme();

  const cityHabits = useMemo(() => {
    const uniqueHabits = habits
      .filter(h => h && h.id && !h.archived)
      .filter((habit, index, self) => 
        index === self.findIndex(h => h.id === habit.id)
      );
    
    return uniqueHabits
      .map(habit => ({
        id: habit.id,
        name: habit.name,
        color: habit.color,
        streak: getStreak(habit.id),
      }))
      .sort((a, b) => b.streak - a.streak);
  }, [habits, getStreak]);

  const totalStreakDays = useMemo(() => {
    return cityHabits.reduce((sum, h) => sum + h.streak, 0);
  }, [cityHabits]);

  const totalFloors = useMemo(() => {
    return cityHabits.reduce((sum, h) => sum + Math.min(Math.floor(h.streak / 2) + 1, 20), 0);
  }, [cityHabits]);

  const handleHabitClick = (habitId: string) => {
    router.push(`/habit/${habitId}`);
  };

  if (cityHabits.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom + 100 }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.emptyContent}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.card, borderColor: colors.tint }]}>
            <Sparkles size={48} color={colors.tint} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Build Your City</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Create habits to build your 3D city. Each habit becomes a skyscraper that grows taller with your streak!
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/add')}
          >
            <Text style={[styles.addButtonText, { color: '#fff' }]}>Build Your First Tower</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom + 100 }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.notAvailableContainer}>
          <Info size={48} color={colors.tint} />
          <Text style={[styles.notAvailableTitle, { color: colors.text }]}>3D City Builder</Text>
          <Text style={[styles.notAvailableText, { color: colors.textSecondary }]}>
            The 3D Habit City is available on web only. Open this app in your browser to explore your growing metropolis!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView 
        style={[styles.scrollView, { paddingTop: insets.top }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>Your Habit City</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {cityHabits.length} buildings • {totalFloors} floors • {totalStreakDays} total days
            </Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Info size={20} color={colors.tint} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Each building represents a habit. The taller it grows, the longer your streak! Click on buildings to view details.
          </Text>
        </View>

        <View style={styles.cityContainer}>
          <HabitGarden3D habits={cityHabits} onHabitClick={handleHabitClick} />
        </View>

        <View style={[styles.legendContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>City Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Small Building (1-9 days)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Skyscraper (10-19 days)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Mega Tower (20+ days)</Text>
            </View>
          </View>
        </View>

        <View style={styles.habitsList}>
          <Text style={[styles.habitsListTitle, { color: colors.text }]}>Your Buildings</Text>
          {cityHabits.map((habit) => {
            const floors = Math.min(Math.floor(habit.streak / 2) + 1, 20);
            return (
              <TouchableOpacity
                key={habit.id}
                style={[styles.habitItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleHabitClick(habit.id)}
              >
                <View style={[styles.habitColor, { backgroundColor: habit.color }]} />
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitName, { color: colors.text }]}>{habit.name}</Text>
                  <Text style={[styles.habitStreak, { color: colors.textSecondary }]}>{floors} floors • {habit.streak} day streak</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    ...typography.display,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  cityContainer: {
    height: 500,
    backgroundColor: '#0a0e27',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#2d3561',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  legendContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
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
  },
  habitsList: {
    marginBottom: 20,
  },
  habitsListTitle: {
    ...typography.h3,
    marginBottom: 16,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    marginBottom: 4,
  },
  habitStreak: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
  },
  emptyTitle: {
    ...typography.h1,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.body,
    marginBottom: 32,
    textAlign: 'center',
  },
  addButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
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
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  notAvailableText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
