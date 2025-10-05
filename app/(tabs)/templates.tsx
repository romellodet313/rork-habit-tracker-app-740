import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "@/providers/HabitProvider";
import { HABIT_TEMPLATES, getTemplatesByCategory, getMicroHabitTemplates } from "@/constants/habitTemplates";
import { CATEGORIES } from "@/constants/categories";
import { Sparkles, Zap, Check } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/providers/ThemeProvider";

export default function TemplatesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addHabit } = useHabits();
  const { colors, theme } = useTheme();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMicroHabits, setShowMicroHabits] = useState(false);
  
  const filteredTemplates = showMicroHabits
    ? getMicroHabitTemplates()
    : selectedCategory
    ? getTemplatesByCategory(selectedCategory)
    : HABIT_TEMPLATES;

  const handleUseTemplate = async (template: typeof HABIT_TEMPLATES[0]) => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    addHabit({
      name: template.name,
      description: template.description,
      icon: template.icon,
      color: template.color,
      streakGoal: template.streakGoal,
      weeklyGoal: template.weeklyGoal,
      targetDays: template.targetDays,
      category: template.category,
      isMicroHabit: template.isMicroHabit,
      estimatedDuration: template.estimatedDuration,
      reminders: [],
    });
    
    router.back();
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
            <Sparkles size={28} color="#F59E0B" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Habit Templates</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Start with proven habits that work
          </Text>
        </View>

        <View style={styles.filterSection}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: colors.card, borderColor: colors.border },
              showMicroHabits && { backgroundColor: colors.tint, borderColor: colors.tint }
            ]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.selectionAsync();
              }
              setShowMicroHabits(!showMicroHabits);
              setSelectedCategory(null);
            }}
          >
            <Zap size={16} color={showMicroHabits ? '#fff' : colors.textSecondary} />
            <Text style={[styles.filterChipText, { color: colors.textSecondary }, showMicroHabits && styles.filterChipTextActive]}>
              Micro-Habits
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categorySection}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                !selectedCategory && !showMicroHabits && { backgroundColor: colors.tint, borderColor: colors.tint }
              ]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.selectionAsync();
                }
                setSelectedCategory(null);
                setShowMicroHabits(false);
              }}
            >
              <Text style={[styles.categoryChipText, { color: colors.textSecondary }, !selectedCategory && !showMicroHabits && styles.categoryChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  selectedCategory === cat.id && { backgroundColor: colors.tint, borderColor: colors.tint }
                ]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.selectionAsync();
                  }
                  setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                  setShowMicroHabits(false);
                }}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={[styles.categoryChipText, { color: colors.textSecondary }, selectedCategory === cat.id && styles.categoryChipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.templatesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {filteredTemplates.length} Templates
          </Text>
          {filteredTemplates.map(template => (
            <View key={template.id} style={[styles.templateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.templateHeader}>
                <View style={[styles.templateIconContainer, { backgroundColor: template.color }]}>
                  <Text style={styles.templateIcon}>{template.icon}</Text>
                </View>
                <View style={styles.templateInfo}>
                  <Text style={[styles.templateName, { color: colors.text }]}>{template.name}</Text>
                  <Text style={[styles.templateDescription, { color: colors.textSecondary }]}>{template.description}</Text>
                  <View style={styles.templateMeta}>
                    <Text style={[styles.templateMetaText, { color: colors.textSecondary }]}>
                      {template.estimatedDuration} min • {template.weeklyGoal}x/week
                    </Text>
                    {template.isMicroHabit && (
                      <View style={styles.microBadge}>
                        <Zap size={12} color="#F59E0B" />
                        <Text style={styles.microBadgeText}>Micro</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              
              {template.tips && template.tips.length > 0 && (
                <View style={[styles.tipsSection, { borderTopColor: colors.border }]}>
                  <Text style={[styles.tipsTitle, { color: colors.text }]}>Tips:</Text>
                  {template.tips.map((tip, index) => (
                    <View key={`template-${template.id}-tip-${index}`} style={styles.tipItem}>
                      <Text style={[styles.tipBullet, { color: colors.textSecondary }]}>•</Text>
                      <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <TouchableOpacity
                style={[styles.useButton, { backgroundColor: template.color }]}
                onPress={() => handleUseTemplate(template)}
              >
                <Check size={18} color="#fff" />
                <Text style={styles.useButtonText}>Use This Template</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
    fontSize: 28,
    fontWeight: '800' as const,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  templatesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  templateCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  templateHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  templateIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  templateIcon: {
    fontSize: 28,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  templateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  templateMetaText: {
    fontSize: 12,
  },
  microBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  microBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#F59E0B',
  },
  tipsSection: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  tipBullet: {
    fontSize: 14,
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  useButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700' as const,
  },
});
