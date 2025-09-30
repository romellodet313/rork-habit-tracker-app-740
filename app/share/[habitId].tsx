import React, { useState, useMemo, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "@/providers/HabitProvider";
import { COLORS } from "@/constants/colors";
import { HabitGrid } from "@/components/HabitGrid";
import { Check, Share2, Camera } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

export default function ShareScreen() {
  const { habitId } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { habits, getStreak } = useHabits();
  const viewShotRef = useRef<ViewShot>(null);
  
  const habit = useMemo(() => 
    habits.find(h => h.id === habitId),
    [habits, habitId]
  );
  
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('dark');
  const [selectedColor, setSelectedColor] = useState(habit?.color || COLORS[0]);
  const [showDescription, setShowDescription] = useState(true);
  const [showIndicator, setShowIndicator] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  if (!habit) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Habit not found</Text>
      </View>
    );
  }
  
  const currentStreak = habit ? getStreak(habit.id) : 0;
  const totalCompletions = habit ? Object.keys(habit.completions || {}).length : 0;
  const createdDate = habit ? new Date(habit.createdAt).toLocaleDateString() : '';
  
  const generateImage = async () => {
    if (!viewShotRef.current || !habit) return;
    
    setIsGenerating(true);
    
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      const uri = await (viewShotRef.current as any)?.capture();
      
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.download = `${habit.name}-habit-card.png`;
        link.href = uri;
        link.click();
      } else {
        const fileName = `${habit.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_habit_card.png`;
        const newPath = `${FileSystem.documentDirectory}${fileName}`;
        
        await FileSystem.moveAsync({
          from: uri,
          to: newPath,
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(newPath, {
            mimeType: 'image/png',
            dialogTitle: 'Share your habit progress!',
          });
        } else {
          console.log('Habit card saved to your device!');
        }
      }
    } catch (error) {
      console.error('Error generating image:', error);
      console.log('Failed to generate habit card');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const shareText = async () => {
    if (!habit) return;
    
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const text = `🎯 ${habit.name}\n🔥 ${currentStreak} day streak\n📊 ${totalCompletions} total completions\n💪 Building better habits with HabitKit!`;
    
    if (Platform.OS === 'web') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'My Habit Progress',
            text: text,
          });
        } catch {
          navigator.clipboard.writeText(text);
          console.log('Habit progress copied to clipboard');
        }
      } else {
        navigator.clipboard.writeText(text);
        console.log('Habit progress copied to clipboard');
      }
    } else {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(text);
      } else {
        console.log('Share:', text);
      }
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]} 
      contentContainerStyle={styles.content}
    >
      <ViewShot 
        ref={viewShotRef} 
        style={styles.cardContainer}
        options={{ 
          fileName: `${habit.name}_habit_card`, 
          format: "png", 
          quality: 1.0 
        }}
      >
        <View style={[
          styles.preview,
          { backgroundColor: selectedTheme === 'dark' ? '#1A1F3A' : '#F3F4F6' }
        ]}>
          <View style={[styles.previewCard, { backgroundColor: selectedColor, borderColor: selectedColor }]}>
            <View style={styles.previewHeader}>
              <View style={[styles.iconContainer, { backgroundColor: selectedColor }]}>
                <Text style={styles.previewIcon}>{habit.icon}</Text>
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>{habit.name}</Text>
                {showDescription && habit.description && (
                  <Text style={styles.previewDescription}>{habit.description}</Text>
                )}
              </View>
              {showIndicator && (
                <Check size={24} color="#fff" />
              )}
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentStreak}</Text>
                <Text style={styles.statLabel}>Current Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalCompletions}</Text>
                <Text style={styles.statLabel}>Total Days</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{habit.streakGoal}</Text>
                <Text style={styles.statLabel}>Goal</Text>
              </View>
            </View>
            
            <View style={styles.gridSection}>
              <Text style={styles.gridTitle}>Last 60 Days</Text>
              <HabitGrid habit={habit} days={60} compact />
            </View>
            
            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>Started {createdDate}</Text>
              <Text style={styles.watermark}>HabitKit</Text>
            </View>
          </View>
        </View>
      </ViewShot>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={styles.themeSelector}>
          <Text style={styles.label}>Theme</Text>
          <View style={styles.themeButtons}>
            <TouchableOpacity
              style={[
                styles.themeButton,
                selectedTheme === 'light' && styles.selectedTheme,
              ]}
              onPress={() => setSelectedTheme('light')}
            >
              <Text style={styles.themeButtonText}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeButton,
                selectedTheme === 'dark' && styles.selectedTheme,
              ]}
              onPress={() => setSelectedTheme('dark')}
            >
              <Text style={styles.themeButtonText}>Dark</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.colorSection}>
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
                onPress={() => {
                  if (!color || typeof color !== 'string') return;
                  setSelectedColor(color);
                }}
              >
                {selectedColor === color && (
                  <Check size={16} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.toggleSection}>
          <View style={styles.toggle}>
            <Text style={styles.toggleLabel}>Show Completion Indicator</Text>
            <TouchableOpacity
              style={[styles.switch, showIndicator && styles.switchOn]}
              onPress={() => setShowIndicator(!showIndicator)}
            >
              <View style={[styles.switchThumb, showIndicator && styles.switchThumbOn]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.toggle}>
            <Text style={styles.toggleLabel}>Show Description</Text>
            <TouchableOpacity
              style={[styles.switch, showDescription && styles.switchOn]}
              onPress={() => setShowDescription(!showDescription)}
            >
              <View style={[styles.switchThumb, showDescription && styles.switchThumbOn]} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={generateImage}
          disabled={isGenerating}
        >
          <Camera size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>
            {isGenerating ? 'Generating...' : 'Save as Image'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={shareText}
        >
          <Share2 size={20} color="#8B5CF6" />
          <Text style={styles.secondaryButtonText}>Share Progress</Text>
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
  cardContainer: {
    marginBottom: 24,
  },
  preview: {
    borderRadius: 16,
    padding: 20,
  },
  previewCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewIcon: {
    fontSize: 24,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  gridSection: {
    marginBottom: 16,
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  watermark: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  themeSelector: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1A1F3A',
    alignItems: 'center',
  },
  selectedTheme: {
    backgroundColor: '#8B5CF6',
  },
  themeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  colorSection: {
    marginBottom: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#fff',
  },
  toggleSection: {
    gap: 16,
  },
  toggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#fff',
  },
  switch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4B5563',
    padding: 2,
  },
  switchOn: {
    backgroundColor: '#8B5CF6',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  switchThumbOn: {
    transform: [{ translateX: 22 }],
  },
  actions: {
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
});