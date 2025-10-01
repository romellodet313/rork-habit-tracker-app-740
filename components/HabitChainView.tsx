import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { Habit } from "@/types/habit";
import colors from "@/constants/colors";
import { ArrowRight, Clock } from "lucide-react-native";

interface HabitChainViewProps {
  habits: Habit[];
  title?: string;
  showDuration?: boolean;
}

export function HabitChainView({ habits, title, showDuration = true }: HabitChainViewProps) {
  const totalDuration = habits.reduce((sum, habit) => sum + (habit.estimatedDuration || 2), 0);
  
  if (habits.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {showDuration && (
            <View style={styles.durationBadge}>
              <Clock size={14} color="#9CA3AF" />
              <Text style={styles.durationText}>{totalDuration} min</Text>
            </View>
          )}
        </View>
      )}
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chainContainer}
      >
        {habits.map((habit, index) => (
          <View key={habit.id} style={styles.chainItemWrapper}>
            <View style={[styles.chainItem, { backgroundColor: habit.color }]}>
              <Text style={styles.chainIcon}>{habit.icon}</Text>
              <View style={styles.chainItemContent}>
                <Text style={styles.chainItemName} numberOfLines={1}>
                  {habit.name}
                </Text>
                {habit.isMicroHabit && (
                  <View style={styles.microBadge}>
                    <Text style={styles.microBadgeText}>2min</Text>
                  </View>
                )}
                {!habit.isMicroHabit && showDuration && (
                  <Text style={styles.chainItemDuration}>
                    {habit.estimatedDuration || 2}m
                  </Text>
                )}
              </View>
            </View>
            
            {index < habits.length - 1 && (
              <View style={styles.connector}>
                <ArrowRight size={20} color={colors.dark.border} />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function VerticalHabitChain({ habits, title }: { habits: Habit[]; title?: string }) {
  const totalDuration = habits.reduce((sum, habit) => sum + (habit.estimatedDuration || 2), 0);
  
  if (habits.length === 0) {
    return null;
  }

  return (
    <View style={styles.verticalContainer}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.durationBadge}>
            <Clock size={14} color="#9CA3AF" />
            <Text style={styles.durationText}>{totalDuration} min</Text>
          </View>
        </View>
      )}
      
      <View style={styles.verticalChain}>
        {habits.map((habit, index) => (
          <View key={habit.id}>
            <View style={[styles.verticalChainItem, { borderLeftColor: habit.color }]}>
              <View style={[styles.verticalIconContainer, { backgroundColor: habit.color }]}>
                <Text style={styles.verticalIcon}>{habit.icon}</Text>
              </View>
              <View style={styles.verticalContent}>
                <Text style={styles.verticalName}>{habit.name}</Text>
                <View style={styles.verticalMeta}>
                  {habit.isMicroHabit && (
                    <View style={styles.microBadgeSmall}>
                      <Text style={styles.microBadgeTextSmall}>Micro</Text>
                    </View>
                  )}
                  <Text style={styles.verticalDuration}>
                    {habit.estimatedDuration || 2} min
                  </Text>
                </View>
              </View>
            </View>
            
            {index < habits.length - 1 && (
              <View style={styles.verticalConnector}>
                <View style={styles.verticalLine} />
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.dark.card,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  chainContainer: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  chainItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 10,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chainIcon: {
    fontSize: 28,
  },
  chainItemContent: {
    flex: 1,
  },
  chainItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  chainItemDuration: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  microBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  microBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  connector: {
    paddingHorizontal: 8,
  },
  verticalContainer: {
    marginVertical: 16,
  },
  verticalChain: {
    paddingLeft: 8,
  },
  verticalChainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingLeft: 4,
    borderLeftWidth: 3,
  },
  verticalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  verticalIcon: {
    fontSize: 24,
  },
  verticalContent: {
    flex: 1,
  },
  verticalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  verticalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verticalDuration: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  microBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.dark.tint,
  },
  microBadgeTextSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  verticalConnector: {
    paddingLeft: 27,
    paddingVertical: 4,
  },
  verticalLine: {
    width: 2,
    height: 16,
    backgroundColor: colors.dark.border,
  },
});
