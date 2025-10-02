import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "@/providers/HabitProvider";
import { useGamification } from "@/providers/GamificationProvider";
import { TrendingUp, Award, Target, Zap } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";

const BAR_WIDTH = 8;

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { habits } = useHabits();
  const { level, xp, xpToNextLevel } = useGamification();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const activeHabits = useMemo(() => habits.filter(h => !h.archived), [habits]);

  const last30DaysData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      let completions = 0;
      activeHabits.forEach(habit => {
        const completion = habit.completions?.[dateStr];
        if (completion === true || (typeof completion === 'object' && completion.completed)) {
          completions++;
        }
      });
      
      data.push({
        date: dateStr,
        day: date.getDate(),
        completions,
      });
    }
    
    return data;
  }, [activeHabits]);

  const maxCompletions = Math.max(...last30DaysData.map(d => d.completions), 1);

  const stats = useMemo(() => {
    const totalCompletions = activeHabits.reduce((sum, habit) => {
      return sum + Object.keys(habit.completions || {}).filter(date => {
        const completion = habit.completions[date];
        return completion === true || (typeof completion === 'object' && completion.completed);
      }).length;
    }, 0);

    const maxStreak = Math.max(...activeHabits.map(habit => {
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

    const last30Days = last30DaysData.reduce((sum, day) => sum + day.completions, 0);
    const avgPerDay = (last30Days / 30).toFixed(1);

    const today = new Date().toISOString().split('T')[0];
    const completedToday = activeHabits.filter(habit => {
      const completion = habit.completions?.[today];
      return completion === true || (typeof completion === 'object' && completion.completed);
    }).length;

    return {
      totalCompletions,
      maxStreak,
      avgPerDay,
      completedToday,
      totalHabits: activeHabits.length,
    };
  }, [activeHabits, last30DaysData]);

  return (
    <View style={styles.container}>
      <ScrollView 
        style={[styles.scrollView, { paddingTop: insets.top }]} 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Statistics</Text>
          <Text style={styles.subtitle}>Track your progress and achievements</Text>
        </View>

        <Animated.View 
          style={[
            styles.levelCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.levelHeader}>
            <View style={styles.levelBadge}>
              <Zap size={24} color="#FFD700" fill="#FFD700" />
              <Text style={styles.levelNumber}>{level}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>Level {level}</Text>
              <Text style={styles.levelSubtitle}>{xpToNextLevel} XP to next level</Text>
            </View>
          </View>
          <View style={styles.xpBar}>
            <View 
              style={[
                styles.xpFill, 
                { width: `${((xp % 100) / 100) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.xpText}>{xp % 100} / 100 XP</Text>
        </Animated.View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#8B5CF620' }]}>
              <Target size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.statValue}>{stats.completedToday}/{stats.totalHabits}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#F59E0B20' }]}>
              <TrendingUp size={24} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{stats.maxStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
              <Award size={24} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{stats.totalCompletions}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Last 30 Days</Text>
          <Text style={styles.chartSubtitle}>Average: {stats.avgPerDay} per day</Text>
          
          <View style={styles.chart}>
            <View style={styles.chartBars}>
              {last30DaysData.map((day, index) => {
                const height = (day.completions / maxCompletions) * 120;
                return (
                  <View key={day.date} style={styles.barContainer}>
                    <View 
                      style={[
                        styles.bar,
                        { 
                          height: Math.max(height, 4),
                          backgroundColor: day.completions > 0 ? colors.dark.tint : '#2A2F4A',
                        }
                      ]} 
                    />
                    {index % 5 === 0 && (
                      <Text style={styles.barLabel}>{day.day}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Insights</Text>
          <View style={styles.insightItem}>
            <Text style={styles.insightIcon}>📈</Text>
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Consistency</Text>
              <Text style={styles.insightDescription}>
                You&apos;ve completed {stats.totalCompletions} habits across {activeHabits.length} different habits
              </Text>
            </View>
          </View>
          
          {stats.maxStreak >= 7 && (
            <View style={styles.insightItem}>
              <Text style={styles.insightIcon}>🔥</Text>
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>Streak Master</Text>
                <Text style={styles.insightDescription}>
                  Your longest streak is {stats.maxStreak} days! Keep it up!
                </Text>
              </View>
            </View>
          )}

          {parseFloat(stats.avgPerDay) >= 3 && (
            <View style={styles.insightItem}>
              <Text style={styles.insightIcon}>⚡</Text>
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>High Performer</Text>
                <Text style={styles.insightDescription}>
                  You&apos;re averaging {stats.avgPerDay} completions per day this month
                </Text>
              </View>
            </View>
          )}
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
    marginBottom: 24,
  },
  title: {
    ...typography.display,
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: '#9CA3AF',
  },
  levelCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFD70040',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFD70020',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  levelNumber: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '800',
    color: '#FFD700',
    bottom: 4,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    ...typography.h2,
    color: '#fff',
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  xpBar: {
    height: 8,
    backgroundColor: '#2A2F4A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  chartTitle: {
    ...typography.h4,
    color: '#fff',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  chart: {
    height: 150,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 4,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
  },
  insightsCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  insightsTitle: {
    ...typography.h4,
    color: '#fff',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  insightIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
});
