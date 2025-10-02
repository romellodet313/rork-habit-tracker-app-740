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
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "@/providers/HabitProvider";
import { HabitCard } from "@/components/HabitCard";
import { Plus, Settings as SettingsIcon, Sparkles, Target, Search, Filter, Zap } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import colors from "@/constants/colors";
import { CATEGORIES } from "@/constants/categories";

export default function HabitsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { habits, toggleHabitCompletion } = useHabits();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'streak' | 'created'>('created');
  const [showFilters, setShowFilters] = useState(false);
  
  const activeHabits = useMemo(() => {
    let filtered = habits.filter(h => h && h.id && !h.archived);
    
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
    
    const uniqueHabits = filtered.filter((habit, index, self) => 
      index === self.findIndex(h => h.id === habit.id)
    );
    return uniqueHabits;
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
      <View style={[styles.emptyContainer, { paddingTop: insets.top, paddingBottom: insets.bottom + 100 }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.dark.background} />
        <View style={styles.emptyContent}>
          <View style={styles.emptyIconContainer}>
            <Sparkles size={48} color={colors.dark.tint} />
          </View>
          <Text style={styles.emptyTitle}>Ready to build better habits?</Text>
          <Text style={styles.emptyText}>
            Start your journey to a better you. Create your first habit and watch your progress grow day by day.
          </Text>
          <TouchableOpacity
            style={styles.addButton}
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.dark.background} />
      <ScrollView 
        style={[styles.scrollView, { paddingTop: insets.top }]} 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
            <Text style={styles.subtitle}>
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
                router.push('/routines');
              }}
            >
              <Zap size={22} color={colors.dark.tabIconDefault} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={22} color={showFilters ? colors.dark.tint : colors.dark.tabIconDefault} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.push('/settings')}
            >
              <SettingsIcon size={22} color={colors.dark.tabIconDefault} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search habits..."
            placeholderTextColor="#6B7280"
          />
        </View>
        
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sort by</Text>
              <View style={styles.sortButtons}>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'created' && styles.sortButtonActive]}
                  onPress={() => setSortBy('created')}
                >
                  <Text style={[styles.sortButtonText, sortBy === 'created' && styles.sortButtonTextActive]}>Recent</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
                  onPress={() => setSortBy('name')}
                >
                  <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>Name</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sortButton, sortBy === 'streak' && styles.sortButtonActive]}
                  onPress={() => setSortBy('streak')}
                >
                  <Text style={[styles.sortButtonText, sortBy === 'streak' && styles.sortButtonTextActive]}>Streak</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                <TouchableOpacity
                  style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>All</Text>
                </TouchableOpacity>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
                    onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
        
        {totalCompletionsToday > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Target size={20} color="#10B981" />
              <Text style={styles.progressTitle}>Today&apos;s Progress</Text>
            </View>
            <View style={styles.progressBar}>
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
          </View>
        )}
        
        <View style={styles.habitsSection}>
          <Text style={styles.sectionTitle}>Your Habits</Text>
          {activeHabits.map((habit) => (
            <Pressable
              key={habit.id}
              onPress={() => handleHabitPress(habit.id)}
            >
              <HabitCard
                habit={habit}
                onToggleCompletion={() => handleToggleCompletion(habit.id)}
              />
            </Pressable>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.dark.card,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
  },
  filtersContainer: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
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
    backgroundColor: colors.dark.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  sortButtonActive: {
    backgroundColor: colors.dark.tint,
    borderColor: colors.dark.tint,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  sortButtonTextActive: {
    color: '#fff',
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
    backgroundColor: colors.dark.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  categoryChipActive: {
    backgroundColor: colors.dark.tint,
    borderColor: colors.dark.tint,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  progressCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.dark.border,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
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
    fontWeight: '800',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.tint,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
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
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 100,
  },
});