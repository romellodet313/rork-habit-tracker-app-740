import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "@/providers/HabitProvider";
import { useGamification } from "@/providers/GamificationProvider";
import { TrendingUp, Award, Target, Zap, Lock } from "lucide-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import typography from "@/constants/typography";
import { Achievement } from "@/types/habit";

const BAR_WIDTH = 8;

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const { habits } = useHabits();
  const { level, xp, xpToNextLevel, achievements, getUnlockedAchievements, getLockedAchievements } = useGamification();
  const { colors } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const [selectedTier, setSelectedTier] = React.useState<'all' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'>('all');

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

  const unlockedAchievements = useMemo(() => getUnlockedAchievements(), [achievements]);
  const lockedAchievements = useMemo(() => getLockedAchievements(), [achievements]);

  const achievementsByTier = useMemo(() => {
    const filtered = selectedTier === 'all' ? achievements : achievements.filter(a => a.tier === selectedTier);
    return {
      unlocked: filtered.filter(a => a.unlockedAt),
      locked: filtered.filter(a => !a.unlockedAt),
    };
  }, [achievements, selectedTier]);

  const tierColors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
  };

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={[styles.scrollView, { paddingTop: insets.top }]} 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Track your progress and achievements</Text>
        </View>

        <Animated.View 
          style={[
            styles.levelCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
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
              <Text style={[styles.levelTitle, { color: colors.text }]}>Level {level}</Text>
              <Text style={[styles.levelSubtitle, { color: colors.textSecondary }]}>{xpToNextLevel} XP to next level</Text>
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
          <Text style={[styles.xpText, { color: colors.textSecondary }]}>{xp % 100} / 100 XP</Text>
        </Animated.View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: '#8B5CF620' }]}>
              <Target size={24} color="#8B5CF6" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.completedToday}/{stats.totalHabits}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Today</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: '#F59E0B20' }]}>
              <TrendingUp size={24} color="#F59E0B" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.maxStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Best Streak</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
              <Award size={24} color="#10B981" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalCompletions}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
        </View>

        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Last 30 Days</Text>
          <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>Average: {stats.avgPerDay} per day</Text>
          
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
                          backgroundColor: day.completions > 0 ? colors.tint : colors.border,
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

        <View style={[styles.achievementsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.achievementsHeader}>
            <Text style={[styles.achievementsTitle, { color: colors.text }]}>Achievements</Text>
            <Text style={[styles.achievementsCount, { color: colors.textSecondary }]}>
              {unlockedAchievements.length} of {achievements.length} unlocked
            </Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tierFilters}
            contentContainerStyle={styles.tierFiltersContent}
          >
            <TouchableOpacity
              style={[
                styles.tierFilter,
                selectedTier === 'all' && styles.tierFilterActive,
                { borderColor: selectedTier === 'all' ? colors.tint : colors.border },
              ]}
              onPress={() => setSelectedTier('all')}
            >
              <Text style={[
                styles.tierFilterText,
                { color: selectedTier === 'all' ? colors.tint : colors.textSecondary },
              ]}>All</Text>
            </TouchableOpacity>
            {(['bronze', 'silver', 'gold', 'platinum', 'diamond'] as const).map(tier => (
              <TouchableOpacity
                key={tier}
                style={[
                  styles.tierFilter,
                  selectedTier === tier && styles.tierFilterActive,
                  { borderColor: selectedTier === tier ? tierColors[tier] : colors.border },
                ]}
                onPress={() => setSelectedTier(tier)}
              >
                <Text style={[
                  styles.tierFilterText,
                  { color: selectedTier === tier ? tierColors[tier] : colors.textSecondary },
                ]}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.achievementsList}>
            {achievementsByTier.unlocked.length > 0 && (
              <View style={styles.achievementSection}>
                <Text style={[styles.achievementSectionTitle, { color: colors.text }]}>Unlocked</Text>
                <View style={styles.achievementGrid}>
                  {achievementsByTier.unlocked.map(achievement => (
                    <View
                      key={achievement.id}
                      style={[
                        styles.achievementItem,
                        { 
                          backgroundColor: colors.background,
                          borderColor: tierColors[achievement.tier],
                        },
                      ]}
                    >
                      <View style={[
                        styles.achievementIconContainer,
                        { backgroundColor: `${tierColors[achievement.tier]}20` },
                      ]}>
                        <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                      </View>
                      <Text style={[styles.achievementName, { color: colors.text }]} numberOfLines={1}>
                        {achievement.name}
                      </Text>
                      <Text style={[styles.achievementDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                        {achievement.description}
                      </Text>
                      <View style={styles.achievementProgress}>
                        <Text style={[styles.achievementProgressText, { color: tierColors[achievement.tier] }]}>
                          ✓ Completed
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {achievementsByTier.locked.length > 0 && (
              <View style={styles.achievementSection}>
                <Text style={[styles.achievementSectionTitle, { color: colors.text }]}>Locked</Text>
                <View style={styles.achievementGrid}>
                  {achievementsByTier.locked.map(achievement => (
                    <View
                      key={achievement.id}
                      style={[
                        styles.achievementItem,
                        styles.achievementItemLocked,
                        { 
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={[
                        styles.achievementIconContainer,
                        { backgroundColor: `${colors.border}40` },
                      ]}>
                        <Lock size={20} color={colors.textSecondary} />
                      </View>
                      <Text style={[styles.achievementName, { color: colors.textSecondary }]} numberOfLines={1}>
                        {achievement.name}
                      </Text>
                      <Text style={[styles.achievementDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                        {achievement.description}
                      </Text>
                      <View style={styles.achievementProgress}>
                        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                          <View 
                            style={[
                              styles.progressBarFill,
                              { 
                                width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%`,
                                backgroundColor: tierColors[achievement.tier],
                              },
                            ]} 
                          />
                        </View>
                        <Text style={[styles.achievementProgressText, { color: colors.textSecondary }]}>
                          {achievement.progress}/{achievement.target}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.insightsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.insightsTitle, { color: colors.text }]}>Insights</Text>
          <View style={styles.insightItem}>
            <Text style={styles.insightIcon}>📈</Text>
            <View style={styles.insightText}>
              <Text style={[styles.insightTitle, { color: colors.text }]}>Consistency</Text>
              <Text style={[styles.insightDescription, { color: colors.textSecondary }]}>
                You&apos;ve completed {stats.totalCompletions} habits across {activeHabits.length} different habits
              </Text>
            </View>
          </View>
          
          {stats.maxStreak >= 7 && (
            <View style={styles.insightItem}>
              <Text style={styles.insightIcon}>🔥</Text>
              <View style={styles.insightText}>
                <Text style={[styles.insightTitle, { color: colors.text }]}>Streak Master</Text>
                <Text style={[styles.insightDescription, { color: colors.textSecondary }]}>
                  Your longest streak is {stats.maxStreak} days! Keep it up!
                </Text>
              </View>
            </View>
          )}

          {parseFloat(stats.avgPerDay) >= 3 && (
            <View style={styles.insightItem}>
              <Text style={styles.insightIcon}>⚡</Text>
              <View style={styles.insightText}>
                <Text style={[styles.insightTitle, { color: colors.text }]}>High Performer</Text>
                <Text style={[styles.insightDescription, { color: colors.textSecondary }]}>
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
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
  },
  levelCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
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
    marginBottom: 4,
  },
  levelSubtitle: {
    fontSize: 14,
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
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  chartCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  chartTitle: {
    ...typography.h4,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  insightsTitle: {
    ...typography.h4,
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
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  achievementsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  achievementsHeader: {
    marginBottom: 16,
  },
  achievementsTitle: {
    ...typography.h4,
    marginBottom: 4,
  },
  achievementsCount: {
    fontSize: 14,
  },
  tierFilters: {
    marginBottom: 20,
  },
  tierFiltersContent: {
    gap: 8,
  },
  tierFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  tierFilterActive: {
    borderWidth: 2,
  },
  tierFilterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  achievementsList: {
    gap: 24,
  },
  achievementSection: {
    gap: 12,
  },
  achievementSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementItem: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    gap: 8,
  },
  achievementItemLocked: {
    opacity: 0.6,
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '700',
  },
  achievementDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  achievementProgress: {
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  achievementProgressText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
