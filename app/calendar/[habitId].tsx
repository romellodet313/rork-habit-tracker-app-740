import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "@/providers/HabitProvider";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function CalendarScreen() {
  const { habitId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { habits, toggleHabitCompletion } = useHabits();
  const { width } = useWindowDimensions();
  
  const habit = useMemo(() => 
    habits.find(h => h.id === habitId),
    [habits, habitId]
  );
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const calendarData = useMemo(() => {
    if (!habit) return [];
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split('T')[0];
      const isCurrentMonth = current.getMonth() === month;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const isCompleted = habit.completions?.[dateStr] || false;
      const isFuture = current > new Date();
      
      days.push({
        date: new Date(current),
        dateStr,
        day: current.getDate(),
        isCurrentMonth,
        isToday,
        isCompleted,
        isFuture,
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [habit, currentDate]);
  
  const monthStats = useMemo(() => {
    const monthDays = calendarData.filter(day => 
      day.isCurrentMonth && !day.isFuture
    );
    const completed = monthDays.filter(day => day.isCompleted).length;
    const total = monthDays.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, rate };
  }, [calendarData]);
  
  if (!habit) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Habit not found</Text>
      </View>
    );
  }
  
  const monthYear = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  const CELL_SIZE = (width - 80) / 7;
  
  const handleDayPress = async (dayData: any) => {
    if (!dayData || dayData.isFuture) return;
    
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    toggleHabitCompletion(habit.id, dayData.dateStr);
  };
  

  
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]} 
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={styles.habitInfo}>
          <Text style={styles.habitIcon}>{habit.icon}</Text>
          <Text style={styles.habitName}>{habit.name}</Text>
        </View>
        
        <View style={styles.monthStats}>
          <Text style={styles.statsText}>
            {monthStats.completed}/{monthStats.total} days ({monthStats.rate}%)
          </Text>
        </View>
      </View>
      
      <View style={styles.calendarHeader}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
        >
          <ChevronLeft size={24} color="#8B5CF6" />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {monthYear}
        </Text>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
        >
          <ChevronRight size={24} color="#8B5CF6" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.daysHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.dayLabel}>{day}</Text>
        ))}
      </View>
      
      <View style={styles.calendar}>
        {calendarData.map((day) => (
          <TouchableOpacity
            key={day.dateStr}
            style={[
              styles.dayCell,
              !day.isCurrentMonth && styles.otherMonth,
              day.isToday && styles.today,
              day.isCompleted && [styles.completed, { backgroundColor: habit.color }],
              day.isFuture && styles.future,
            ]}
            onPress={() => handleDayPress(day)}
            disabled={day.isFuture}
          >
            <Text style={[
              styles.dayText,
              !day.isCurrentMonth && styles.otherMonthText,
              day.isToday && styles.todayText,
              day.isCompleted && styles.completedText,
              day.isFuture && styles.futureText,
            ]}>
              {day.day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: habit.color }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2A2F4A' }]} />
          <Text style={styles.legendText}>Not completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#8B5CF6', opacity: 0.3 }]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
      </View>
      
      <Text style={styles.helpText}>
        Tap any past date to mark it as completed or incomplete.
        Future dates cannot be modified.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
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
    marginBottom: 24,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  habitName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  monthStats: {
    backgroundColor: '#1A1F3A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statsText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    paddingVertical: 8,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  dayCell: {
    width: `${100/7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1F3A',
    marginBottom: 2,
    borderRadius: 8,
  },
  otherMonth: {
    backgroundColor: 'transparent',
  },
  today: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  completed: {
    // backgroundColor set dynamically
  },
  future: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  otherMonthText: {
    color: '#6B7280',
  },
  todayText: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
  completedText: {
    color: '#fff',
    fontWeight: '700',
  },
  futureText: {
    color: '#6B7280',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    backgroundColor: '#1A1F3A',
    padding: 16,
    borderRadius: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  helpText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
});