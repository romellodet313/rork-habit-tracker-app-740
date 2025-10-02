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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "@/providers/HabitProvider";
import { useGamification } from "@/providers/GamificationProvider";
import { Download, Upload, Trash2, Info, Lock, Database, CheckCircle } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import colors from "@/constants/colors";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { habits, importData, exportData, clearAllData } = useHabits();
  const { achievements, getUnlockedAchievements, getLockedAchievements } = useGamification();

  const unlockedAchievements = getUnlockedAchievements();
  const lockedAchievements = getLockedAchievements();

  const handleExport = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const data = exportData();
    console.log(`Export Complete: Exported ${habits.length} habits. Data:`, data);
  };

  const handleImport = async () => {
    const sampleData = '[{"id":"1","name":"Sample Habit","icon":"⭐","color":"#8B5CF6"}]';
    try {
      if (!sampleData || typeof sampleData !== 'string' || sampleData.trim().length === 0) {
        console.log('Error: Invalid data format');
        return;
      }
      importData(sampleData.trim());
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      console.log('Success: Data imported successfully!');
    } catch {
      console.log('Error: Invalid data format');
    }
  };

  const handleClearAll = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to delete all habits and progress? This action cannot be undone.');
      if (confirmed) {
        clearAllData();
      }
    } else {
      Alert.alert(
        'Clear All Data',
        'Are you sure you want to delete all habits and progress? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: async () => {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              clearAllData();
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
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <Text style={styles.sectionSubtitle}>
          {unlockedAchievements.length} of {achievements.length} unlocked
        </Text>
        
        <View style={styles.achievementsGrid}>
          {unlockedAchievements.map(achievement => (
            <View key={achievement.id} style={styles.achievementCard}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementProgress}>
                {achievement.progress}/{achievement.target}
              </Text>
            </View>
          ))}
          {lockedAchievements.slice(0, 6).map(achievement => (
            <View key={achievement.id} style={[styles.achievementCard, styles.lockedAchievement]}>
              <Lock size={24} color="#6B7280" />
              <Text style={styles.lockedAchievementName}>{achievement.name}</Text>
              <Text style={styles.achievementProgress}>
                {achievement.progress}/{achievement.target}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity 
          style={styles.option} 
          onPress={handleExport}
        >
          <Download size={20} color={colors.dark.tint} />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Export Data</Text>
            <Text style={styles.optionDescription}>
              Save your habits and progress as JSON
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={handleImport}>
          <Upload size={20} color={colors.dark.tint} />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Import Data</Text>
            <Text style={styles.optionDescription}>
              Restore from a previous export
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.option, styles.dangerOption]} onPress={handleClearAll}>
          <Trash2 size={20} color="#EF4444" />
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, styles.dangerText]}>Clear All Data</Text>
            <Text style={styles.optionDescription}>
              Delete all habits and progress
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage</Text>
        
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <Database size={24} color="#10B981" />
            <View style={styles.storageHeaderText}>
              <Text style={styles.storageTitle}>Local Storage Active</Text>
              <View style={styles.statusBadge}>
                <CheckCircle size={14} color="#10B981" />
                <Text style={styles.statusText}>All data saved locally</Text>
              </View>
            </View>
          </View>
          <Text style={styles.storageDescription}>
            Your habits and progress are automatically saved to your device. Your data persists across app restarts and is available offline.
          </Text>
          <View style={styles.storageStats}>
            <View style={styles.storageStat}>
              <Text style={styles.storageStatValue}>{habits.length}</Text>
              <Text style={styles.storageStatLabel}>Habits Stored</Text>
            </View>
            <View style={styles.storageStat}>
              <Text style={styles.storageStatValue}>
                {habits.reduce((sum, h) => sum + Object.keys(h.completions || {}).length, 0)}
              </Text>
              <Text style={styles.storageStatLabel}>Completions</Text>
            </View>
            <View style={styles.storageStat}>
              <Text style={styles.storageStatValue}>{achievements.length}</Text>
              <Text style={styles.storageStatLabel}>Achievements</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.option}>
          <Info size={20} color={colors.dark.tint} />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>MomentPro</Text>
            <Text style={styles.optionDescription}>
              Version 1.0.0 • Built with React Native
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.stats}>
        <Text style={styles.statsTitle}>Statistics</Text>
        <Text style={styles.statsText}>
          Total Habits: {habits.length}
        </Text>
        <Text style={styles.statsText}>
          Active Habits: {habits.filter(h => !h.archived).length}
        </Text>
        <Text style={styles.statsText}>
          Archived Habits: {habits.filter(h => h.archived).length}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '31%',
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  lockedAchievement: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  lockedAchievementName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementProgress: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  dangerOption: {
    borderColor: '#EF444433',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  dangerText: {
    color: '#EF4444',
  },
  stats: {
    backgroundColor: colors.dark.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  statsText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  storageCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#10B98133',
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  storageHeaderText: {
    flex: 1,
  },
  storageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  storageDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  storageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
  },
  storageStat: {
    alignItems: 'center',
  },
  storageStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  storageStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
});
