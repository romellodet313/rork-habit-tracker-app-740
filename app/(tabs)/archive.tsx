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
import { useTheme } from "@/providers/ThemeProvider";
import { HabitCard } from "@/components/HabitCard";
import { RotateCcw, Trash2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function ArchiveScreen() {
  const insets = useSafeAreaInsets();
  const { habits, restoreHabit, deleteHabit } = useHabits();
  const { colors, theme } = useTheme();
  
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
      <View style={[styles.emptyContainer, { paddingTop: insets.top, paddingBottom: insets.bottom + 100, backgroundColor: colors.background }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No archived habits</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Archived habits will appear here
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView 
        style={[styles.scrollView, { paddingTop: insets.top }]} 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      >
        {archivedHabits.map((habit) => (
        <View key={habit.id} style={styles.habitContainer}>
          <HabitCard habit={habit} onToggleCompletion={() => {}} disabled />
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => handleRestore(habit.id)}
            >
              <RotateCcw size={20} color={colors.success} />
              <Text style={[styles.restoreText, { color: colors.success }]}>Restore</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.card }]}
              onPress={() => handleDelete(habit.id, habit.name)}
            >
              <Trash2 size={20} color={colors.error} />
              <Text style={[styles.deleteText, { color: colors.error }]}>Delete</Text>
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
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
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
  },
  restoreText: {
    fontWeight: '600',
  },
  deleteText: {
    fontWeight: '600',
  },
});