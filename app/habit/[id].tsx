import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "@/providers/HabitProvider";
import { Calendar, Share2, Archive, Trash2, Edit, ChevronLeft, ChevronRight, Heart } from "lucide-react-native";
import { YearGrid } from "@/components/YearGrid";
import * as Haptics from "expo-haptics";
import { CATEGORIES } from "@/constants/categories";

export default function HabitDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { habits, archiveHabit, deleteHabit, getStreak, getLongestStreak, getCompletionRate, getTotalCompletions, getWeeklyProgress } = useHabits();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const habit = habits.find(h => h.id === id);
  
  const currentStreak = habit ? getStreak(habit.id) : 0;
  const longestStreak = habit ? getLongestStreak(habit.id) : 0;
  const completionRate = habit ? getCompletionRate(habit.id, 30) : 0;
  const totalCompletions = habit ? getTotalCompletions(habit.id) : 0;
  const weeklyProgress = habit ? getWeeklyProgress(habit.id) : 0;
  
  const categories = useMemo(() => {
    if (!habit) return [];
    const cats = habit.categories || (habit.category ? [habit.category] : []);
    return cats.map(catId => CATEGORIES.find(c => c.id === catId)).filter(Boolean);
  }, [habit]);
  
  if (!habit) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />
        <Text style={styles.errorText}>Habit not found</Text>
      </View>
    );
  }

  const handleArchive = async () => {
    if (!habit) return;
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    archiveHabit(habit.id);
    router.back();
  };

  const handleDelete = async () => {
    if (!habit) return;
    
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to permanently delete "${habit.name}"? This action cannot be undone.`);
      if (confirmed) {
        deleteHabit(habit.id);
        router.back();
      }
    } else {
      Alert.alert(
        'Delete Habit',
        `Are you sure you want to permanently delete "${habit.name}"? This action cannot be undone.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              deleteHabit(habit.id);
              router.back();
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: Array<{ date: Date | null; dateStr: string | null; completed: boolean }> = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, dateStr: null, completed: false });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const completed = !!habit?.completions?.[dateStr];
      days.push({ date, dateStr, completed });
    }
    
    return days;
  }, [currentMonth, habit]);
  
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />
      <ScrollView 
        style={[styles.scrollView, { paddingTop: insets.top }]} 
        contentContainerStyle={styles.content}
      >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${habit.color}20` }]}>
          <Text style={styles.icon}>{habit.icon}</Text>
        </View>
        <Text style={styles.name}>{habit.name}</Text>
        {habit.description ? (
          <Text style={styles.description}>{habit.description}</Text>
        ) : null}
        {categories.length > 0 && (
          <View style={styles.categoriesRow}>
            {categories.map((cat: any) => (
              <View key={cat.id} style={styles.categoryTag}>
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryText}>{cat.name}</Text>
              </View>
            ))}
            {habit.timeOfDay && habit.timeOfDay.length > 0 && (
              <View style={styles.timeTag}>
                <Text style={styles.timeText}>
                  {habit.timeOfDay.map(t => t === 'morning' ? '🌅' : t === 'day' ? '☀️' : '🌙').join(' ')}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: habit.color }]}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{longestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalCompletions}</Text>
          <Text style={styles.statLabel}>Total Days</Text>
        </View>
      </View>
      
      {habit.streakInterval && habit.streakInterval !== 'none' && (
        <View style={styles.goalCard}>
          <Heart size={20} color={habit.color} />
          <Text style={styles.goalText}>
            Goal: {habit.completionsPerInterval || 3} times per {habit.streakInterval === 'daily' ? 'day' : habit.streakInterval}
          </Text>
        </View>
      )}
      
      <View style={styles.gridSection}>
        <Text style={styles.sectionTitle}>Year at a Glance</Text>
        <YearGrid habit={habit} days={365} />
      </View>
      
      <View style={styles.calendarSection}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{monthName}</Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
            <ChevronRight size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.weekDaysRow}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => (
            <View key={index} style={styles.calendarDay}>
              {day.date && (
                <View style={[
                  styles.dayCircle,
                  day.completed && { backgroundColor: habit.color },
                  day.date.toDateString() === new Date().toDateString() && styles.todayCircle,
                ]}>
                  <Text style={[
                    styles.dayText,
                    day.completed && styles.completedDayText,
                    day.date.toDateString() === new Date().toDateString() && styles.todayText,
                  ]}>
                    {day.date.getDate()}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/edit/${habit.id}`)}
        >
          <Edit size={20} color="#8B5CF6" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/share/${habit.id}`)}
        >
          <Share2 size={20} color="#8B5CF6" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleArchive}
        >
          <Archive size={20} color="#F59E0B" />
          <Text style={[styles.actionText, { color: '#F59E0B' }]}>Archive</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDelete}
        >
          <Trash2 size={20} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 40,
  },
  categoriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 12,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  timeTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  timeText: {
    fontSize: 14,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1A1F3A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1A1F3A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  goalText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  progressContainer: {
    backgroundColor: '#1A1F3A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    gap: 20,
  },
  progressItem: {
    gap: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2A2F4A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'right',
  },
  gridSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1A1F3A',
    padding: 14,
    borderRadius: 12,
  },
  actionText: {
    color: '#8B5CF6',
    fontWeight: '600',
    fontSize: 14,
  },
  calendarSection: {
    marginBottom: 32,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthButton: {
    padding: 8,
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekDayText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  dayCircle: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  todayCircle: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  dayText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  completedDayText: {
    color: '#fff',
    fontWeight: '700',
  },
  todayText: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
});