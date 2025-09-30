import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "@/providers/HabitProvider";
import { Calendar, Share2, Archive, Trash2 } from "lucide-react-native";
import { HabitGrid } from "@/components/HabitGrid";
import * as Haptics from "expo-haptics";

export default function HabitDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { habits, archiveHabit, deleteHabit, getStreak, getLongestStreak, getCompletionRate, getTotalCompletions, getWeeklyProgress } = useHabits();
  
  const habit = habits.find(h => h.id === id);
  
  const currentStreak = habit ? getStreak(habit.id) : 0;
  const longestStreak = habit ? getLongestStreak(habit.id) : 0;
  const completionRate = habit ? getCompletionRate(habit.id, 30) : 0;
  const totalCompletions = habit ? getTotalCompletions(habit.id) : 0;
  const weeklyProgress = habit ? getWeeklyProgress(habit.id) : 0;
  
  if (!habit) {
    return (
      <View style={styles.container}>
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

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]} 
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: habit.color }]}>
          <Text style={styles.icon}>{habit.icon}</Text>
        </View>
        <Text style={styles.name}>{habit.name}</Text>
        {habit.description ? (
          <Text style={styles.description}>{habit.description}</Text>
        ) : null}
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{longestStreak}</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalCompletions}</Text>
          <Text style={styles.statLabel}>Total Days</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>30-Day Completion Rate</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completionRate}%`, backgroundColor: habit.color }]} />
          </View>
          <Text style={styles.progressText}>{completionRate}%</Text>
        </View>
        
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Weekly Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(weeklyProgress, 100)}%`, backgroundColor: habit.color }]} />
          </View>
          <Text style={styles.progressText}>{weeklyProgress}%</Text>
        </View>
      </View>
      
      <View style={styles.gridSection}>
        <Text style={styles.sectionTitle}>Last 365 Days</Text>
        <HabitGrid habit={habit} days={365} />
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/calendar/${habit.id}`)}
        >
          <Calendar size={20} color="#8B5CF6" />
          <Text style={styles.actionText}>Calendar</Text>
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
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 40,
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
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
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
});