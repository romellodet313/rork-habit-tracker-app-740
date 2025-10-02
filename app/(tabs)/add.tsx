import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Switch,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "@/providers/HabitProvider";
import colors, { COLORS } from "@/constants/colors";
import { ICONS } from "@/constants/icons";
import { CATEGORIES } from "@/constants/categories";
import * as Haptics from "expo-haptics";
import { Check, Bell, Sparkles } from "lucide-react-native";

export default function AddHabitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addHabit } = useHabits();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("⭐");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [streakGoal, setStreakGoal] = useState("7");
  const [weeklyGoal, setWeeklyGoal] = useState("7");
  const [enableReminders, setEnableReminders] = useState(false);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('other');
  const [isMicroHabit, setIsMicroHabit] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState("2");
  
  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length === 0) {
      console.log("Error: Please enter a habit name");
      return;
    }
    
    
    if (trimmedName.length > 100) {
      console.log("Error: Habit name is too long (max 100 characters)");
      return;
    }
    
    const parsedStreakGoal = parseInt(streakGoal);
    const parsedWeeklyGoal = parseInt(weeklyGoal);
    
    if (isNaN(parsedStreakGoal) || parsedStreakGoal < 1 || parsedStreakGoal > 365) {
      console.log("Error: Streak goal must be between 1 and 365 days");
      return;
    }
    
    if (isNaN(parsedWeeklyGoal) || parsedWeeklyGoal < 1 || parsedWeeklyGoal > 7) {
      console.log("Error: Weekly goal must be between 1 and 7 days");
      return;
    }
    
    if (selectedDays.length === 0) {
      console.log("Error: Please select at least one target day");
      return;
    }
    
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    const parsedDuration = parseInt(estimatedDuration);
    if (isNaN(parsedDuration) || parsedDuration < 1 || parsedDuration > 120) {
      console.log("Error: Duration must be between 1 and 120 minutes");
      return;
    }
    
    try {
      addHabit({
        name: trimmedName,
        description: description.trim(),
        icon: selectedIcon,
        color: selectedColor,
        streakGoal: parsedStreakGoal,
        weeklyGoal: parsedWeeklyGoal,
        targetDays: selectedDays,
        category: selectedCategoryId,
        isMicroHabit,
        estimatedDuration: parsedDuration,
        reminders: enableReminders ? [{
          id: Date.now().toString(),
          habitId: '',
          time: reminderTime,
          days: selectedDays,
          enabled: true,
          title: `${trimmedName} Reminder`,
          body: `Time to work on your ${trimmedName} habit!`,
        }] : [],
      });
      
      router.back();
    } catch (error) {
      console.error('Failed to create habit:', error);
    }
  };
  
  const selectIcon = (icon: string) => {
    if (!icon || typeof icon !== 'string') return;
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setSelectedIcon(icon);
  };
  
  const selectColor = (color: string) => {
    if (!color || typeof color !== 'string') return;
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setSelectedColor(color);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.dark.background} />
      <ScrollView 
        style={[styles.scrollView, { paddingTop: insets.top }]} 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Sparkles size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.headerTitle}>Create New Habit</Text>
          <Text style={styles.headerSubtitle}>
            Build a habit that sticks. Start small and be consistent.
          </Text>
        </View>
      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Morning Meditation"
          placeholderTextColor="#6B7280"
          autoFocus
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="What's your goal with this habit?"
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={3}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Streak Goal (days)</Text>
        <TextInput
          style={styles.input}
          value={streakGoal}
          onChangeText={setStreakGoal}
          placeholder="7"
          placeholderTextColor="#6B7280"
          keyboardType="number-pad"
        />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Weekly Goal (days)</Text>
        <TextInput
          style={styles.input}
          value={weeklyGoal}
          onChangeText={setWeeklyGoal}
          placeholder="7"
          placeholderTextColor="#6B7280"
          keyboardType="number-pad"
        />
      </View>
      
      <View style={styles.section}>
        <View style={styles.reminderHeader}>
          <View style={styles.reminderHeaderLeft}>
            <Sparkles size={20} color="#9CA3AF" />
            <Text style={styles.label}>Micro-Habit (2-minute rule)</Text>
          </View>
          <Switch
            value={isMicroHabit}
            onValueChange={setIsMicroHabit}
            trackColor={{ false: '#4B5563', true: selectedColor }}
            thumbColor={isMicroHabit ? '#fff' : '#9CA3AF'}
          />
        </View>
        {isMicroHabit && (
          <Text style={styles.helpText}>
            Micro-habits are tiny actions that take 2 minutes or less. They&apos;re perfect for building consistency!
          </Text>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Estimated Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          value={estimatedDuration}
          onChangeText={setEstimatedDuration}
          placeholder="2"
          placeholderTextColor="#6B7280"
          keyboardType="number-pad"
        />
        <Text style={styles.helpText}>
          How long does this habit typically take? This helps with routine planning.
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Target Days</Text>
        <View style={styles.daysGrid}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDays.includes(day) && [styles.selectedDay, { backgroundColor: selectedColor }],
              ]}
              onPress={() => {
                if (selectedDays.includes(day)) {
                  setSelectedDays(selectedDays.filter(d => d !== day));
                } else {
                  setSelectedDays([...selectedDays, day]);
                }
              }}
            >
              <Text style={[
                styles.dayText,
                selectedDays.includes(day) && styles.selectedDayText,
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.reminderHeader}>
          <View style={styles.reminderHeaderLeft}>
            <Bell size={20} color="#9CA3AF" />
            <Text style={styles.label}>Reminders</Text>
          </View>
          <Switch
            value={enableReminders}
            onValueChange={setEnableReminders}
            trackColor={{ false: '#4B5563', true: selectedColor }}
            thumbColor={enableReminders ? '#fff' : '#9CA3AF'}
          />
        </View>
        
        {enableReminders && (
          <View style={styles.reminderSettings}>
            <Text style={styles.subLabel}>Reminder Time</Text>
            <TextInput
              style={styles.input}
              value={reminderTime}
              onChangeText={setReminderTime}
              placeholder="09:00"
              placeholderTextColor="#6B7280"
            />
            <Text style={styles.helpText}>
              You&apos;ll get notifications on your selected days at this time
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                selectedCategoryId === cat.id && [styles.selectedCategory, { borderColor: cat.color }],
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.selectionAsync();
                }
                setSelectedCategoryId(cat.id);
              }}
            >
              <Text style={styles.categoryEmoji}>{cat.icon}</Text>
              <Text style={[
                styles.categoryName,
                selectedCategoryId === cat.id && styles.selectedCategoryName,
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Icon</Text>
        <View style={styles.iconGrid}>
          {ICONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconButton,
                selectedIcon === icon && styles.selectedIcon,
              ]}
              onPress={() => selectIcon(icon)}
            >
              <Text style={styles.iconText}>{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.label}>Color</Text>
        <View style={styles.colorGrid}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColor,
              ]}
              onPress={() => selectColor(color)}
            >
              {selectedColor === color && (
                <Check size={20} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: selectedColor }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Create Habit</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.dark.tint,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: '#fff',
    borderWidth: 2,
    borderColor: colors.dark.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  iconButton: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedIcon: {
    borderColor: colors.dark.tint,
    backgroundColor: colors.dark.border,
    shadowColor: colors.dark.tint,
    shadowOpacity: 0.3,
  },
  iconText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  colorButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedColor: {
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  saveButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.dark.card,
    borderWidth: 2,
    borderColor: colors.dark.border,
  },
  selectedDay: {
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dayText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  reminderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderSettings: {
    marginTop: 12,
  },
  subLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.dark.card,
    borderWidth: 2,
    borderColor: colors.dark.border,
  },
  selectedCategory: {
    backgroundColor: colors.dark.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
    flex: 1,
  },
  selectedCategoryName: {
    color: '#fff',
  },
});