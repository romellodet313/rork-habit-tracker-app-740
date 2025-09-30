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
import { Download, Upload, Trash2, Info } from "lucide-react-native";
import * as Haptics from "expo-haptics";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { habits, importData, exportData, clearAllData } = useHabits();

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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.option} onPress={handleExport}>
          <Download size={20} color="#8B5CF6" />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Export Data</Text>
            <Text style={styles.optionDescription}>
              Save your habits and progress as JSON
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.option} onPress={handleImport}>
          <Upload size={20} color="#8B5CF6" />
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
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.option}>
          <Info size={20} color="#8B5CF6" />
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>HabitKit Clone</Text>
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
    backgroundColor: '#0A0E27',
  },
  content: {
    padding: 20,
  },
  section: {
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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 16,
  },
  dangerOption: {
    borderWidth: 1,
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
    backgroundColor: '#1A1F3A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
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
});