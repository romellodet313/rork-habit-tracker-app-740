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
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "@/providers/HabitProvider";
import colors, { COLORS } from "@/constants/colors";
import { ICONS } from "@/constants/icons";
import { CATEGORIES } from "@/constants/categories";
import * as Haptics from "expo-haptics";
import { Check, Bell, Sparkles, Lightbulb, ChevronDown } from "lucide-react-native";

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isMicroHabit, setIsMicroHabit] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState("2");
  const [streakInterval, setStreakInterval] = useState<'none' | 'daily' | 'week' | 'month'>('week');
  const [completionsPerInterval, setCompletionsPerInterval] = useState("3");
  const [trackingMode, setTrackingMode] = useState<'step-by-step' | 'custom-value'>('step-by-step');
  const [completionsPerDay, setCompletionsPerDay] = useState("1");
  const [timeOfDay, setTimeOfDay] = useState<('morning' | 'day' | 'evening')[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
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
      const parsedCompletionsPerInterval = parseInt(completionsPerInterval);
      const parsedCompletionsPerDay = parseInt(completionsPerDay);
      
      addHabit({
        name: trimmedName,
        description: description.trim(),
        icon: selectedIcon,
        color: selectedColor,
        streakGoal: parsedStreakGoal,
        weeklyGoal: parsedWeeklyGoal,
        targetDays: selectedDays,
        category: selectedCategoryId,
        categories: selectedCategories.length > 0 ? selectedCategories : [selectedCategoryId],
        isMicroHabit,
        estimatedDuration: parsedDuration,
        streakInterval,
        completionsPerInterval: parsedCompletionsPerInterval,
        trackingMode,
        completionsPerDay: parsedCompletionsPerDay,
        timeOfDay: timeOfDay.length > 0 ? timeOfDay : undefined,
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
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerIcon}>
            <Sparkles size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.headerTitle}>Create New Habit</Text>
          <Text style={styles.headerSubtitle}>
            Build a habit that sticks. Start small and be consistent.
          </Text>
        </Animated.View>
        
        <TouchableOpacity
          style={styles.templatesButton}
          onPress={() => router.push('/templates')}
        >
          <View style={styles.templatesButtonContent}>
            <View style={styles.templatesIconContainer}>
              <Lightbulb size={20} color="#F59E0B" />
            </View>
            <View style={styles.templatesTextContainer}>
              <Text style={styles.templatesButtonTitle}>Browse Templates</Text>
              <Text style={styles.templatesButtonSubtitle}>Start with proven habits</Text>
            </View>
          </View>
          <Text style={styles.templatesArrow}>→</Text>
        </TouchableOpacity>
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
      
      <TouchableOpacity
        style={styles.advancedToggle}
        onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
      >
        <Text style={styles.advancedToggleText}>Advanced Options</Text>
        <Text style={styles.advancedToggleIcon}>{showAdvancedOptions ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      
      {showAdvancedOptions && (
        <>
          <View style={styles.section}>
            <Text style={styles.label}>Streak Goal</Text>
            <View style={styles.streakGoalContainer}>
              <View style={styles.intervalButtons}>
                {(['none', 'daily', 'week', 'month'] as const).map((interval) => (
                  <TouchableOpacity
                    key={interval}
                    style={[
                      styles.intervalButton,
                      streakInterval === interval && [styles.intervalButtonActive, { backgroundColor: selectedColor }],
                    ]}
                    onPress={() => {
                      if (Platform.OS !== 'web') {
                        Haptics.selectionAsync();
                      }
                      setStreakInterval(interval);
                    }}
                  >
                    <Text style={[
                      styles.intervalButtonText,
                      streakInterval === interval && styles.intervalButtonTextActive,
                    ]}>
                      {interval === 'none' ? 'None' : interval === 'daily' ? 'Daily' : interval === 'week' ? 'Week' : 'Month'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {streakInterval !== 'none' && (
                <View style={styles.completionsInputContainer}>
                  <TextInput
                    style={styles.completionsInput}
                    value={completionsPerInterval}
                    onChangeText={setCompletionsPerInterval}
                    placeholder="3"
                    placeholderTextColor="#6B7280"
                    keyboardType="number-pad"
                  />
                  <Text style={styles.completionsLabel}>/ {streakInterval === 'daily' ? 'Day' : streakInterval === 'week' ? 'Week' : 'Month'}</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.label}>How should completions be tracked?</Text>
            <View style={styles.trackingModeButtons}>
              <TouchableOpacity
                style={[
                  styles.trackingModeButton,
                  trackingMode === 'step-by-step' && [styles.trackingModeButtonActive, { borderColor: selectedColor }],
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.selectionAsync();
                  }
                  setTrackingMode('step-by-step');
                }}
              >
                <Text style={[
                  styles.trackingModeButtonText,
                  trackingMode === 'step-by-step' && styles.trackingModeButtonTextActive,
                ]}>
                  Step By Step
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.trackingModeButton,
                  trackingMode === 'custom-value' && [styles.trackingModeButtonActive, { borderColor: selectedColor }],
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.selectionAsync();
                  }
                  setTrackingMode('custom-value');
                }}
              >
                <Text style={[
                  styles.trackingModeButtonText,
                  trackingMode === 'custom-value' && styles.trackingModeButtonTextActive,
                ]}>
                  Custom Value
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.helpText}>
              {trackingMode === 'step-by-step' 
                ? 'Increment by 1 with each completion' 
                : 'Track custom values like minutes, reps, or pages'}
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.label}>Completions Per Day</Text>
            <View style={styles.completionsPerDayContainer}>
              <TextInput
                style={styles.completionsInput}
                value={completionsPerDay}
                onChangeText={setCompletionsPerDay}
                placeholder="1"
                placeholderTextColor="#6B7280"
                keyboardType="number-pad"
              />
              <Text style={styles.completionsLabel}>/ Day</Text>
            </View>
            <View style={styles.completionPreview}>
              {Array.from({ length: Math.min(parseInt(completionsPerDay) || 1, 10) }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.completionSquare,
                    i < 2 && { backgroundColor: selectedColor },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.helpText}>
              The square will be filled completely when this number is met
            </Text>
          </View>
        </>
      )}
      
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
        <Text style={styles.label}>Categories</Text>
        <Text style={styles.subLabel}>Pick one or multiple categories that your habit fits in</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                selectedCategories.includes(cat.id) && [styles.selectedCategory, { borderColor: cat.color }],
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.selectionAsync();
                }
                if (selectedCategories.includes(cat.id)) {
                  setSelectedCategories(selectedCategories.filter(c => c !== cat.id));
                } else {
                  setSelectedCategories([...selectedCategories, cat.id]);
                }
                if (!selectedCategoryId || selectedCategoryId === 'other') {
                  setSelectedCategoryId(cat.id);
                }
              }}
            >
              <Text style={styles.categoryEmoji}>{cat.icon}</Text>
              <Text style={[
                styles.categoryName,
                selectedCategories.includes(cat.id) && styles.selectedCategoryName,
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.timeOfDaySection}>
          <Text style={styles.subLabel}>Time of Day (Optional)</Text>
          <View style={styles.timeOfDayButtons}>
            {(['morning', 'day', 'evening'] as const).map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeOfDayButton,
                  timeOfDay.includes(time) && [styles.timeOfDayButtonActive, { backgroundColor: selectedColor }],
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.selectionAsync();
                  }
                  if (timeOfDay.includes(time)) {
                    setTimeOfDay(timeOfDay.filter(t => t !== time));
                  } else {
                    setTimeOfDay([...timeOfDay, time]);
                  }
                }}
              >
                <Text style={styles.timeOfDayIcon}>
                  {time === 'morning' ? '🌅' : time === 'day' ? '☀️' : '🌙'}
                </Text>
                <Text style={[
                  styles.timeOfDayButtonText,
                  timeOfDay.includes(time) && styles.timeOfDayButtonTextActive,
                ]}>
                  {time.charAt(0).toUpperCase() + time.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
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
  templatesButton: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  templatesButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  templatesIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  templatesTextContainer: {
    flex: 1,
  },
  templatesButtonTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 2,
  },
  templatesButtonSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  templatesArrow: {
    fontSize: 20,
    color: '#F59E0B',
    fontWeight: '700' as const,
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  advancedToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  advancedToggleIcon: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  streakGoalContainer: {
    gap: 16,
  },
  intervalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  intervalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.dark.card,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.dark.border,
  },
  intervalButtonActive: {
    borderColor: 'transparent',
  },
  intervalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  intervalButtonTextActive: {
    color: '#fff',
  },
  completionsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completionsInput: {
    flex: 1,
    backgroundColor: colors.dark.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 2,
    borderColor: colors.dark.border,
  },
  completionsLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  trackingModeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  trackingModeButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.dark.card,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.dark.border,
  },
  trackingModeButtonActive: {
    backgroundColor: colors.dark.border,
  },
  trackingModeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  trackingModeButtonTextActive: {
    color: '#fff',
  },
  completionsPerDayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  completionPreview: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  completionSquare: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.dark.border,
  },
  timeOfDaySection: {
    marginTop: 20,
  },
  timeOfDayButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  timeOfDayButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.dark.card,
    borderWidth: 2,
    borderColor: colors.dark.border,
  },
  timeOfDayButtonActive: {
    borderColor: 'transparent',
  },
  timeOfDayIcon: {
    fontSize: 18,
  },
  timeOfDayButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  timeOfDayButtonTextActive: {
    color: '#fff',
  },
});