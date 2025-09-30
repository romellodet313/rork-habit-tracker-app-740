import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Habit } from "@/types/habit";

interface HabitGridProps {
  habit: Habit;
  days?: number;
  compact?: boolean;
}

export function HabitGrid({ habit, days = 60, compact = false }: HabitGridProps) {
  const gridData = useMemo(() => {
    const today = new Date();
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const completion = habit.completions?.[dateStr];
      const isCompleted = completion === true || (typeof completion === 'object' && completion.completed);
      const isToday = i === 0;
      const isRecent = i <= 7;
      data.push({ date: dateStr, completed: isCompleted, isToday, isRecent });
    }
    
    return data;
  }, [habit.completions, days]);

  const squareSize = compact ? 6 : 10;
  const gap = compact ? 1.5 : 3;
  const borderRadius = compact ? 1 : 3;

  const calculateStreakIntensity = (index: number): number => {
    let consecutiveDays = 0;
    for (let i = index; i >= 0; i--) {
      if (gridData[i]?.completed) {
        consecutiveDays++;
      } else {
        break;
      }
    }
    if (consecutiveDays === 0) return 0;
    if (consecutiveDays <= 2) return 0.4;
    if (consecutiveDays <= 5) return 0.6;
    if (consecutiveDays <= 10) return 0.8;
    return 1;
  };

  const getSquareStyle = (day: { date: string; completed: boolean; isToday: boolean; isRecent: boolean }, index: number) => {
    let backgroundColor = '#2A2F4A';
    let opacity = 1;
    let borderWidth = 0;
    let borderColor = 'transparent';
    
    if (day.completed) {
      backgroundColor = habit.color;
      const intensity = calculateStreakIntensity(index);
      opacity = intensity;
    } else {
      opacity = day.isRecent ? 0.6 : 0.3;
    }
    
    if (day.isToday) {
      borderWidth = 2;
      borderColor = day.completed ? '#fff' : habit.color;
      opacity = day.completed ? opacity : 1;
    }
    
    return {
      width: squareSize,
      height: squareSize,
      backgroundColor,
      opacity,
      borderWidth,
      borderColor,
      borderRadius,
      marginRight: gap,
      marginBottom: gap,
    };
  };

  return (
    <View style={[styles.container, compact && styles.compact]}>
      {gridData.map((day, index) => (
        <View
          key={`${day.date}-${index}`}
          style={[
            styles.square,
            getSquareStyle(day, index),
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  compact: {
    maxWidth: 300,
  },
  square: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
});
