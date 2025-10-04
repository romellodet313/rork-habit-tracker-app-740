import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Habit } from "@/types/habit";
import { useTheme } from "@/providers/ThemeProvider";

interface YearGridProps {
  habit: Habit;
  days?: number;
}

export function YearGrid({ habit, days = 365 }: YearGridProps) {
  const { colors, theme } = useTheme();
  const gridData = useMemo(() => {
    const today = new Date();
    const data: { date: string; completed: boolean }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const completed = !!habit.completions?.[dateStr];
      data.push({ date: dateStr, completed });
    }
    
    return data;
  }, [habit.completions, days]);

  const squareSize = days > 180 ? 3 : days > 90 ? 4 : 6;
  const gap = days > 180 ? 1 : days > 90 ? 1.5 : 2;

  return (
    <View style={styles.container}>
      <View style={[styles.grid, { gap }]}>
        {gridData.map((item, index) => (
          <View
            key={`${item.date}-${index}`}
            style={[
              styles.square,
              {
                width: squareSize,
                height: squareSize,
                borderRadius: squareSize / 3,
                backgroundColor: item.completed 
                  ? habit.color 
                  : theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                opacity: item.completed ? 1 : 0.3,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  square: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
});
