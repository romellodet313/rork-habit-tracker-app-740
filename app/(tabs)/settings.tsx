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
import { useTheme } from "@/providers/ThemeProvider";
import { Download, Upload, Trash2, Info, Lock, Database, CheckCircle, Sun, Moon, Monitor } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { habits, importData, exportData, clearAllData } = useHabits();
  const { achievements, getUnlockedAchievements, getLockedAchievements } = useGamification();
  const { theme, themeMode, setThemeMode, colors } = useTheme();

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
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <ScrollView 
        style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]} 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
          
          <View style={styles.themeOptions}>
            <TouchableOpacity 
              style={[
                styles.themeOption,
                { backgroundColor: colors.card, borderColor: colors.border },
                themeMode === 'light' && { borderColor: colors.tint, borderWidth: 2 }
              ]} 
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setThemeMode('light');
              }}
            >
              <Sun size={24} color={themeMode === 'light' ? colors.tint : colors.textSecondary} />
              <Text style={[styles.themeOptionText, { color: themeMode === 'light' ? colors.text : colors.textSecondary }]}>Light</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.themeOption,
                { backgroundColor: colors.card, borderColor: colors.border },
                themeMode === 'dark' && { borderColor: colors.tint, borderWidth: 2 }
              ]} 
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setThemeMode('dark');
              }}
            >
              <Moon size={24} color={themeMode === 'dark' ? colors.tint : colors.textSecondary} />
              <Text style={[styles.themeOptionText, { color: themeMode === 'dark' ? colors.text : colors.textSecondary }]}>Dark</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.themeOption,
                { backgroundColor: colors.card, borderColor: colors.border },
                themeMode === 'auto' && { borderColor: colors.tint, borderWidth: 2 }
              ]} 
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setThemeMode('auto');
              }}
            >
              <Monitor size={24} color={themeMode === 'auto' ? colors.tint : colors.textSecondary} />
              <Text style={[styles.themeOptionText, { color: themeMode === 'auto' ? colors.text : colors.textSecondary }]}>Auto</Text>
            </TouchableOpacity>
          </View>
        </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <Text style={styles.sectionSubtitle}>
          {unlockedAchievements.length} of {achievements.length} unlocked
        </Text>
        
        <View style={styles.achievementsGrid}>
          {unlockedAchievements.map(achievement => (
            <View key={achievement.id} style={[styles.achievementCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <Text style={[styles.achievementName, { color: colors.text }]}>{achievement.name}</Text>
              <Text style={[styles.achievementProgress, { color: colors.textSecondary }]}>
                {achievement.progress}/{achievement.target}
              </Text>
            </View>
          ))}
          {lockedAchievements.slice(0, 6).map(achievement => (
            <View key={achievement.id} style={[styles.achievementCard, styles.lockedAchievement, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Lock size={24} color={colors.textSecondary} />
              <Text style={[styles.lockedAchievementName, { color: colors.textSecondary }]}>{achievement.name}</Text>
              <Text style={[styles.achievementProgress, { color: colors.textSecondary }]}>
                {achievement.progress}/{achievement.target}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Data Management</Text>
        
        <TouchableOpacity 
          style={[styles.option, { backgroundColor: colors.card, borderColor: colors.border }]} 
          onPress={handleExport}
        >
          <Download size={20} color={colors.tint} />
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Export Data</Text>
            <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
              Save your habits and progress as JSON
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.option, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleImport}>
          <Upload size={20} color={colors.tint} />
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>Import Data</Text>
            <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
              Restore from a previous export
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.option, styles.dangerOption, { backgroundColor: colors.card }]} onPress={handleClearAll}>
          <Trash2 size={20} color={colors.error} />
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.error }]}>Clear All Data</Text>
            <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
              Delete all habits and progress
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Storage</Text>
        
        <View style={[styles.storageCard, { backgroundColor: colors.card }]}>
          <View style={styles.storageHeader}>
            <Database size={24} color={colors.success} />
            <View style={styles.storageHeaderText}>
              <Text style={[styles.storageTitle, { color: colors.text }]}>Local Storage Active</Text>
              <View style={styles.statusBadge}>
                <CheckCircle size={14} color={colors.success} />
                <Text style={[styles.statusText, { color: colors.success }]}>All data saved locally</Text>
              </View>
            </View>
          </View>
          <Text style={[styles.storageDescription, { color: colors.textSecondary }]}>
            Your habits and progress are automatically saved to your device. Your data persists across app restarts and is available offline.
          </Text>
          <View style={[styles.storageStats, { borderTopColor: colors.border }]}>
            <View style={styles.storageStat}>
              <Text style={[styles.storageStatValue, { color: colors.success }]}>{habits.length}</Text>
              <Text style={[styles.storageStatLabel, { color: colors.textSecondary }]}>Habits Stored</Text>
            </View>
            <View style={styles.storageStat}>
              <Text style={[styles.storageStatValue, { color: colors.success }]}>
                {habits.reduce((sum, h) => sum + Object.keys(h.completions || {}).length, 0)}
              </Text>
              <Text style={[styles.storageStatLabel, { color: colors.textSecondary }]}>Completions</Text>
            </View>
            <View style={styles.storageStat}>
              <Text style={[styles.storageStatValue, { color: colors.success }]}>{achievements.length}</Text>
              <Text style={[styles.storageStatLabel, { color: colors.textSecondary }]}>Achievements</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
        
        <View style={[styles.option, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Info size={20} color={colors.tint} />
          <View style={styles.optionContent}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>MomentPro</Text>
            <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
              Version 1.0.0 • Built with React Native
            </Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.stats, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.statsTitle, { color: colors.text }]}>Statistics</Text>
        <Text style={[styles.statsText, { color: colors.textSecondary }]}>
          Total Habits: {habits.length}
        </Text>
        <Text style={[styles.statsText, { color: colors.textSecondary }]}>
          Active Habits: {habits.filter(h => !h.archived).length}
        </Text>
        <Text style={[styles.statsText, { color: colors.textSecondary }]}>
          Archived Habits: {habits.filter(h => h.archived).length}
        </Text>
      </View>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  themeOptions: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center' as const,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '31%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center' as const,
    borderWidth: 1,
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
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  lockedAchievementName: {
    fontSize: 12,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginBottom: 4,
  },
  achievementProgress: {
    fontSize: 10,
  },
  option: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
    borderWidth: 1,
  },
  dangerOption: {
    borderColor: '#EF444433',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  stats: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
    borderWidth: 1,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  statsText: {
    fontSize: 14,
    marginBottom: 4,
  },
  storageCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#10B98133',
  },
  storageHeader: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 12,
    marginBottom: 12,
  },
  storageHeaderText: {
    flex: 1,
  },
  storageTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  storageDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  storageStats: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  storageStat: {
    alignItems: 'center' as const,
  },
  storageStatValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  storageStatLabel: {
    fontSize: 12,
  },
});
