import React, { useState, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "@/providers/HabitProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { COLORS } from "@/constants/colors";
import { ICONS } from "@/constants/icons";
import { CATEGORIES } from "@/constants/categories";
import * as Haptics from "expo-haptics";
import { Check, Bell, Edit3 } from "lucide-react-native";

export default function EditHabitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { habits, updateHabit } = useHabits();
  const { theme, colors } = useTheme();
  
  const habit = habits.find(h => h.id === id);
  
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
  
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setDescription(habit.description || "");
      setSelectedIcon(habit.icon);
      setSelectedColor(habit.color);
      setStreakGoal(habit.streakGoal.toString());
      setWeeklyGoal((habit.weeklyGoal || 7).toString());
      setSelectedDays(habit.targetDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
      setSelectedCategoryId(habit.category || 'other');
      setEnableReminders(!!(habit.reminders && habit.reminders.length > 0));
      if (habit.reminders && habit.reminders.length > 0) {
        setReminderTime(habit.reminders[0].time);
      }
    }
  }, [habit]);
  
  if (!habit) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>Habit not found</Text>
      </View>
    );
  }
  
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
    
    try {
      updateHabit(habit.id, {
        name: trimmedName,
        description: description.trim(),
        icon: selectedIcon,
        color: selectedColor,
        streakGoal: parsedStreakGoal,
        weeklyGoal: parsedWeeklyGoal,
        targetDays: selectedDays,
        category: selectedCategoryId,
        reminders: enableReminders ? [{
          id: habit.reminders?.[0]?.id || Date.now().toString(),
          habitId: habit.id,
          time: reminderTime,
          days: selectedDays,
          enabled: true,
          title: `${trimmedName} Reminder`,
          body: `Time to work on your ${trimmedName} habit!`,
        }] : [],
      });
      
      router.back();
    } catch (error) {
      console.error('Failed to update habit:', error);
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView 
        style={[styles.scrollView, { paddingTop: insets.top }]} 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: colors.card, borderColor: colors.tint }]}>
            <Edit3 size={24} color="#8B5CF6" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Habit</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Update your habit details and preferences
          </Text>
        </View>
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Morning Meditation"
          placeholderTextColor={colors.textSecondary}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={description}
          onChangeText={setDescription}
          placeholder="What's your goal with this habit?"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Streak Goal (days)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={streakGoal}
          onChangeText={setStreakGoal}
          placeholder="7"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
        />
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Weekly Goal (days)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={weeklyGoal}
          onChangeText={setWeeklyGoal}
          placeholder="7"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
        />
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Target Days</Text>
        <View style={styles.daysGrid}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                { backgroundColor: colors.card, borderColor: colors.border },
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
                { color: colors.textSecondary },
                selectedDays.includes(day) && styles.selectedDayText,
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={[styles.reminderHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.reminderHeaderLeft}>
            <Bell size={20} color={colors.textSecondary} />
            <Text style={[styles.label, { color: colors.text }]}>Reminders</Text>
          </View>
          <Switch
            value={enableReminders}
            onValueChange={setEnableReminders}
            trackColor={{ false: colors.border, true: selectedColor }}
            thumbColor={enableReminders ? '#fff' : colors.textSecondary}
          />
        </View>
        
        {enableReminders && (
          <View style={styles.reminderSettings}>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Reminder Time</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
              value={reminderTime}
              onChangeText={setReminderTime}
              placeholder="09:00"
              placeholderTextColor={colors.textSecondary}
            />
            <Text style={[styles.helpText, { color: colors.textSecondary }]}>
              You&apos;ll get notifications on your selected days at this time
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedCategoryId === cat.id && [styles.selectedCategory, { borderColor: cat.color, backgroundColor: theme === 'dark' ? colors.border : colors.card }],
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
                { color: colors.textSecondary },
                selectedCategoryId === cat.id && [styles.selectedCategoryName, { color: colors.text }],
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Icon</Text>
        <View style={styles.iconGrid}>
          {ICONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconButton,
                { backgroundColor: colors.card },
                selectedIcon === icon && [styles.selectedIcon, { borderColor: colors.tint, backgroundColor: theme === 'dark' ? colors.border : colors.card }],
              ]}
              onPress={() => selectIcon(icon)}
            >
              <Text style={styles.iconText}>{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Color</Text>
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
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
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
    paddingVertical: 20,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    borderWidth: 2,
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
    borderWidth: 2,
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
    borderRadius: 12,
    borderWidth: 1,
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
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
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
    borderWidth: 2,
  },
  selectedCategory: {
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
    fontWeight: '600',
    flex: 1,
  },
  selectedCategoryName: {},
});
