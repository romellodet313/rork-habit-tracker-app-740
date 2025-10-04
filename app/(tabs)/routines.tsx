import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHabits } from "@/providers/HabitProvider";
import { useRoutines } from "@/providers/RoutineProvider";
import { Plus, Sunrise, Sunset, Clock, X, Check, Sparkles, Zap } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import colors from "@/constants/colors";
import { Habit, Routine } from "@/types/habit";

export default function RoutinesScreen() {
  const insets = useSafeAreaInsets();
  const { habits } = useHabits();
  const { routines, addRoutine, updateRoutine, deleteRoutine } = useRoutines();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [routineType, setRoutineType] = useState<'morning' | 'evening' | 'custom'>('morning');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  
  const activeHabits = habits.filter(h => !h.archived);
  const morningRoutines = routines.filter(r => r.type === 'morning');
  const eveningRoutines = routines.filter(r => r.type === 'evening');
  const customRoutines = routines.filter(r => r.type === 'custom');

  const handleCreateRoutine = () => {
    if (!routineName.trim() || selectedHabits.length === 0) return;
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    if (editingRoutineId) {
      updateRoutine(editingRoutineId, {
        name: routineName,
        type: routineType,
        habitIds: selectedHabits,
      });
    } else {
      addRoutine({
        name: routineName,
        type: routineType,
        habitIds: selectedHabits,
        enabled: true,
      });
    }
    
    setShowCreateModal(false);
    setRoutineName("");
    setSelectedHabits([]);
    setEditingRoutineId(null);
  };

  const handleEditRoutine = (routineId: string) => {
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return;
    
    setRoutineName(routine.name);
    setRoutineType(routine.type);
    setSelectedHabits(routine.habitIds);
    setEditingRoutineId(routineId);
    setShowCreateModal(true);
  };

  const toggleHabitSelection = (habitId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setSelectedHabits(prev => 
      prev.includes(habitId) 
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
  };

  const getHabitById = (habitId: string): Habit | undefined => {
    return habits.find(h => h.id === habitId);
  };

  const calculateRoutineDuration = (habitIds: string[]): number => {
    return habitIds.reduce((total, id) => {
      const habit = getHabitById(id);
      return total + (habit?.estimatedDuration || 2);
    }, 0);
  };

  const RoutineCard = ({ routine }: { routine: Routine }) => {
    const duration = calculateRoutineDuration(routine.habitIds);
    const routineHabits = routine.habitIds
      .map((id: string) => getHabitById(id))
      .filter((h): h is Habit => h !== undefined && h !== null);
    
    return (
      <View style={styles.routineCard}>
        <View style={styles.routineHeader}>
          <View style={styles.routineHeaderLeft}>
            {routine.type === 'morning' && <Sunrise size={24} color="#F59E0B" />}
            {routine.type === 'evening' && <Sunset size={24} color="#8B5CF6" />}
            {routine.type === 'custom' && <Clock size={24} color="#10B981" />}
            <View style={styles.routineInfo}>
              <Text style={styles.routineName}>{routine.name}</Text>
              <Text style={styles.routineMeta}>
                {routine.habitIds.length} habits • {duration} min
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditRoutine(routine.id)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.habitChain}>
          {routineHabits.length > 0 ? routineHabits.map((habit: Habit, index: number) => (
            <View key={`routine-${routine.id}-habit-${habit?.id || index}-${index}`} style={styles.chainItemContainer}>
              <View style={[styles.chainItem, { backgroundColor: habit.color }]}>
                <Text style={styles.chainIcon}>{habit.icon}</Text>
                <View style={styles.chainItemInfo}>
                  <Text style={styles.chainItemName} numberOfLines={1}>
                    {habit.name}
                  </Text>
                  <Text style={styles.chainItemDuration}>
                    {habit.estimatedDuration || 2} min
                  </Text>
                </View>
              </View>
              {index < routineHabits.length - 1 && (
                <View style={styles.chainConnector}>
                  <View style={styles.chainArrow} />
                </View>
              )}
            </View>
          )) : (
            <View style={styles.emptyChain}>
              <Text style={styles.emptyChainText}>No habits in this routine</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            deleteRoutine(routine.id);
          }}
        >
          <Text style={styles.deleteButtonText}>Delete Routine</Text>
        </TouchableOpacity>
      </View>
    );
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
            <Zap size={28} color="#F59E0B" />
          </View>
          <Text style={styles.headerTitle}>Routines & Stacks</Text>
          <Text style={styles.headerSubtitle}>
            Build powerful habit chains that flow naturally
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            setShowCreateModal(true);
            setEditingRoutineId(null);
            setRoutineName("");
            setSelectedHabits([]);
          }}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create New Routine</Text>
        </TouchableOpacity>

        {morningRoutines.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sunrise size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Morning Routines</Text>
            </View>
            {morningRoutines.map(routine => (
              <RoutineCard key={routine.id} routine={routine} />
            ))}
          </View>
        )}

        {eveningRoutines.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sunset size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Evening Routines</Text>
            </View>
            {eveningRoutines.map(routine => (
              <RoutineCard key={routine.id} routine={routine} />
            ))}
          </View>
        )}

        {customRoutines.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Custom Routines</Text>
            </View>
            {customRoutines.map(routine => (
              <RoutineCard key={routine.id} routine={routine} />
            ))}
          </View>
        )}

        {routines.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Sparkles size={48} color={colors.dark.tint} />
            </View>
            <Text style={styles.emptyTitle}>No routines yet</Text>
            <Text style={styles.emptyText}>
              Create your first routine to stack habits together and build powerful daily flows
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingRoutineId ? 'Edit Routine' : 'Create Routine'}
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Routine Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={routineName}
                  onChangeText={setRoutineName}
                  placeholder="e.g., Morning Power Hour"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Type</Text>
                <View style={styles.typeButtons}>
                  <TouchableOpacity
                    style={[styles.typeButton, routineType === 'morning' && styles.typeButtonActive]}
                    onPress={() => setRoutineType('morning')}
                  >
                    <Sunrise size={20} color={routineType === 'morning' ? '#fff' : '#9CA3AF'} />
                    <Text style={[styles.typeButtonText, routineType === 'morning' && styles.typeButtonTextActive]}>
                      Morning
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeButton, routineType === 'evening' && styles.typeButtonActive]}
                    onPress={() => setRoutineType('evening')}
                  >
                    <Sunset size={20} color={routineType === 'evening' ? '#fff' : '#9CA3AF'} />
                    <Text style={[styles.typeButtonText, routineType === 'evening' && styles.typeButtonTextActive]}>
                      Evening
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeButton, routineType === 'custom' && styles.typeButtonActive]}
                    onPress={() => setRoutineType('custom')}
                  >
                    <Clock size={20} color={routineType === 'custom' ? '#fff' : '#9CA3AF'} />
                    <Text style={[styles.typeButtonText, routineType === 'custom' && styles.typeButtonTextActive]}>
                      Custom
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Select Habits ({selectedHabits.length})</Text>
                <Text style={styles.modalHint}>
                  Tap to add habits to your routine. They&apos;ll be completed in order.
                </Text>
                {activeHabits.map((habit: Habit) => (
                  <TouchableOpacity
                    key={`modal-habit-${habit.id}`}
                    style={[
                      styles.habitOption,
                      selectedHabits.includes(habit.id) && styles.habitOptionSelected,
                    ]}
                    onPress={() => toggleHabitSelection(habit.id)}
                  >
                    <View style={styles.habitOptionLeft}>
                      {selectedHabits.includes(habit.id) && (
                        <View style={styles.orderBadge}>
                          <Text style={styles.orderBadgeText}>
                            {selectedHabits.indexOf(habit.id) + 1}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.habitOptionIcon}>{habit.icon}</Text>
                      <View style={styles.habitOptionInfo}>
                        <Text style={styles.habitOptionName}>{habit.name}</Text>
                        <Text style={styles.habitOptionDuration}>
                          {habit.estimatedDuration || 2} min
                        </Text>
                      </View>
                    </View>
                    {selectedHabits.includes(habit.id) && (
                      <Check size={20} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.modalSaveButton,
                (!routineName.trim() || selectedHabits.length === 0) && styles.modalSaveButtonDisabled,
              ]}
              onPress={handleCreateRoutine}
              disabled={!routineName.trim() || selectedHabits.length === 0}
            >
              <Text style={styles.modalSaveButtonText}>
                {editingRoutineId ? 'Update Routine' : 'Create Routine'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 24,
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
    borderColor: '#F59E0B',
  },
  headerTitle: {
    fontSize: 28,
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dark.tint,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 32,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  routineCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  routineHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  routineMeta: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.dark.border,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  habitChain: {
    marginBottom: 16,
  },
  chainItemContainer: {
    marginBottom: 12,
  },
  chainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  chainIcon: {
    fontSize: 24,
  },
  chainItemInfo: {
    flex: 1,
  },
  chainItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  chainItemDuration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  chainConnector: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  chainArrow: {
    width: 2,
    height: 12,
    backgroundColor: colors.dark.border,
  },
  deleteButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.dark.tint,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.dark.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  modalSection: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: colors.dark.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.dark.background,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  typeButtonActive: {
    backgroundColor: colors.dark.tint,
    borderColor: colors.dark.tint,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  modalHint: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  habitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.dark.background,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  habitOptionSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  habitOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  orderBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  habitOptionIcon: {
    fontSize: 24,
  },
  habitOptionInfo: {
    flex: 1,
  },
  habitOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  habitOptionDuration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalSaveButton: {
    backgroundColor: colors.dark.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  modalSaveButtonDisabled: {
    opacity: 0.5,
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyChain: {
    padding: 16,
    alignItems: 'center',
  },
  emptyChainText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
