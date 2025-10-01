import React, { useMemo } from "react";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "@/providers/HabitProvider";
import { HabitCard } from "@/components/HabitCard";
import { RotateCcw, Trash2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function ArchiveScreen() {
  const insets = useSafeAreaInsets();
  const { habits, restoreHabit, deleteHabit } = useHabits();
  
  const archivedHabits = useMemo(() => {
    const filtered = habits.filter(h => h && h.id && h.archived);
    // Remove any potential duplicates by ID
    const uniqueHabits = filtered.filter((habit, index, self) => 
      index === self.findIndex(h => h.id === habit.id)
    );
    return uniqueHabits;
  }, [habits]);

  const handleRestore = async (habitId: string) => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    restoreHabit(habitId);
  };

  const handleDelete = async (habitId: string, habitName: string) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to permanently delete "${habitName}"? This action cannot be undone.`);
      if (confirmed) {
        deleteHabit(habitId);
      }
    } else {
      Alert.alert(
        'Delete Habit',
        `Are you sure you want to permanently delete "${habitName}"? This action cannot be undone.`,
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
              deleteHabit(habitId);
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  if (archivedHabits.length === 0) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top, paddingBottom: insets.bottom + 100 }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />
        <Text style={styles.emptyTitle}>No archived habits</Text>
        <Text style={styles.emptyText}>
          Archived habits will appear here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E27" />
      <ScrollView 
        style={[styles.scrollView, { paddingTop: insets.top }]} 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      >
        {archivedHabits.map((habit) => (
        <View key={habit.id} style={styles.habitContainer}>
          <HabitCard habit={habit} onToggleCompletion={() => {}} disabled />
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleRestore(habit.id)}
            >
              <RotateCcw size={20} color="#10B981" />
              <Text style={styles.restoreText}>Restore</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(habit.id, habit.name)}
            >
              <Trash2 size={20} color="#EF4444" />
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
        ))}
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
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  habitContainer: {
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1A1F3A',
  },
  restoreText: {
    color: '#10B981',
    fontWeight: '600',
  },
  deleteText: {
    color: '#EF4444',
    fontWeight: '600',
  },
});