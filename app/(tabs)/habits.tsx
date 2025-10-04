import React, { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Pressable,
  StatusBar,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "@/providers/HabitProvider";
import { HabitCard } from "@/components/HabitCard";
import { Plus, Settings as SettingsIcon, Sparkles, Target, Search, Filter, Zap, Grid3x3, List, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/providers/ThemeProvider";
import typography from "@/constants/typography";
import { CATEGORIES } from "@/constants/categories";

export default function HabitsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { habits, toggleHabitCompletion } = useHabits();
  const { colors, theme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'streak' | 'created'>('created');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-20)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const activeHabits = useMemo(() => {
    let filtered = habits.filter(h => h && h.id && !h.archived);
    
    const uniqueById = new Map<string, typeof filtered[0]>();
    filtered.forEach(habit => {
      if (habit.id && !uniqueById.has(habit.id)) {
        uniqueById.set(habit.id, habit);
      }
    });
    filtered = Array.from(uniqueById.values());
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(h => 
        h.name.toLowerCase().includes(query) || 
        h.description?.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(h => h.category === selectedCategory);
    }
    
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'streak') {
        const streakA = getStreakForHabit(a);
        const streakB = getStreakForHabit(b);
        return streakB - streakA;
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    return filtered;
  }, [habits, searchQuery, selectedCategory, sortBy]);
  
  const getStreakForHabit = (habit: any) => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (habit.completions?.[dateStr]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const totalCompletionsToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return activeHabits.filter(habit => habit.completions?.[today]).length;
  }, [activeHabits]);

  const handleToggleCompletion = async (habitId: string) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleHabitCompletion(habitId, new Date().toISOString().split('T')[0]);
  };

  const handleHabitPress = (habitId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    router.push(`/habit/${habitId}`);
  };

  function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  if (activeHabits.length === 0) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top, paddingBottom: insets.bottom + 100, backgroundColor: colors.background }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={styles.emptyContent}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.card, borderColor: colors.tint }]}>
            <Sparkles size={48} color={colors.tint} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Ready to build better habits?</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Start your journey to a better you. Create your first habit and watch your progress grow day by day.
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/add')}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>Create Your First Habit</Text>
          </TouchableOpacity>
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
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <Text style={[styles.greeting, { color: colors.text }]}>Good {getTimeOfDay()} 👋</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {totalCompletionsToday} of {activeHabits.length} habits completed today
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.selectionAsync();
                }
                setViewMode(viewMode === 'list' ? 'grid' : 'list');
              }}
            >
              {viewMode === 'list' ? (
                <Grid3x3 size={22} color={colors.tabIconDefault} />
              ) : (
                <List size={22} color={colors.tabIconDefault} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.card }]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={22} color={showFilters ? colors.tint : colors.tabIconDefault} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: colors.card }]}
              onPress={() => router.push('/settings')}
            >
              <SettingsIcon size={22} color={colors.tabIconDefault} />
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search habits..."
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        
        {showFilters && (
          <View style={[styles.filtersContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Sort by</Text>
              <View style={styles.sortButtons}>
                <TouchableOpacity
                  style={[styles.sortButton, { backgroundColor: colors.background, borderColor: colors.border }, sortBy === 'created' && { backgroundColor: colors.tint, borderColor: colors.tint }]}
                  onPress={() => setSortBy('created')}
                >
                  <Text style={[styles.sortButtonText, { color: colors.textSecondary }, sortBy === 'created' && { color: '#fff' }]}>Recent</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortButton, { backgroundColor: colors.background, borderColor: colors.border }, sortBy === 'name' && { backgroundColor: colors.tint, borderColor: colors.tint }]}
                  onPress={() => setSortBy('name')}
                >
                  <Text style={[styles.sortButtonText, { color: colors.textSecondary }, sortBy === 'name' && { color: '#fff' }]}>Name</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortButton, { backgroundColor: colors.background, borderColor: colors.border }, sortBy === 'streak' && { backgroundColor: colors.tint, borderColor: colors.tint }]}
                  onPress={() => setSortBy('streak')}
                >
                  <Text style={[styles.sortButtonText, { color: colors.textSecondary }, sortBy === 'streak' && { color: '#fff' }]}>Streak</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                <TouchableOpacity
                  style={[styles.categoryChip, { backgroundColor: colors.background, borderColor: colors.border }, !selectedCategory && { backgroundColor: colors.tint, borderColor: colors.tint }]}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text style={[styles.categoryChipText, { color: colors.textSecondary }, !selectedCategory && { color: '#fff' }]}>All</Text>
                </TouchableOpacity>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, { backgroundColor: colors.background, borderColor: colors.border }, selectedCategory === cat.id && { backgroundColor: colors.tint, borderColor: colors.tint }]}
                    onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={[styles.categoryChipText, { color: colors.textSecondary }, selectedCategory === cat.id && { color: '#fff' }]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
        
        {totalCompletionsToday > 0 && (
          <Animated.View 
            style={[
              styles.progressCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              {
                opacity: fadeAnim,
                transform: [{ scale: fadeAnim }],
              },
            ]}
          >
            <View style={styles.progressHeader}>
              <Target size={20} color="#10B981" />
              <Text style={[styles.progressTitle, { color: colors.text }]}>Today&apos;s Progress</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(totalCompletionsToday / activeHabits.length) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round((totalCompletionsToday / activeHabits.length) * 100)}% complete
            </Text>
          </Animated.View>
        )}
        
        <View style={styles.habitsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Habits</Text>
          {viewMode === 'list' ? (
            activeHabits.map((habit) => (
              <Pressable
                key={habit.id}
                onPress={() => handleHabitPress(habit.id)}
              >
                <HabitCard
                  habit={habit}
                  onToggleCompletion={() => handleToggleCompletion(habit.id)}
                />
              </Pressable>
            ))
          ) : (
            <View style={styles.gridContainer}>
              {activeHabits.map((habit) => (
                <Pressable
                  key={habit.id}
                  onPress={() => handleHabitPress(habit.id)}
                  style={styles.gridItem}
                >
                  <View style={[styles.gridCard, { backgroundColor: colors.card, borderColor: habit.color }]}>
                    <View style={[styles.gridIconContainer, { backgroundColor: `${habit.color}20` }]}>
                      <Text style={styles.gridIcon}>{habit.icon}</Text>
                    </View>
                    <Text style={[styles.gridName, { color: colors.text }]} numberOfLines={2}>{habit.name}</Text>
                    <TouchableOpacity
                      style={[
                        styles.gridCheckButton,
                        habit.completions?.[new Date().toISOString().split('T')[0]] && 
                        { backgroundColor: habit.color }
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleToggleCompletion(habit.id);
                      }}
                    >
                      {habit.completions?.[new Date().toISOString().split('T')[0]] ? (
                        <Check size={16} color="#fff" strokeWidth={3} />
                      ) : (
                        <Plus size={16} color={habit.color} strokeWidth={3} />
                      )}
                    </TouchableOpacity>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80, backgroundColor: colors.tint }]}
        onPress={() => {
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          router.push('/add');
        }}
      >
        <Plus size={28} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    ...typography.h1,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 12,
    borderRadius: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  filtersContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressTitle: {
    ...typography.bodyBold,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  habitsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    ...typography.bodyBold,
    color: '#fff',
  },
  bottomSpacing: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: -2,
  },
  gridItem: {
    width: '48%',
  },
  gridCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'space-between',
  },
  gridIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridIcon: {
    fontSize: 28,
  },
  gridName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    minHeight: 36,
  },
  gridCheckButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});