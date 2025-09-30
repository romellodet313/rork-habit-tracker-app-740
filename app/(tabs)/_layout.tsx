import { Tabs } from "expo-router";
import { Home, Archive, Settings, Plus, BarChart3 } from "lucide-react-native";
import React from "react";
import colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.dark.tabIconSelected,
        tabBarInactiveTintColor: colors.dark.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.dark.card,
          borderTopColor: colors.dark.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: colors.dark.background,
        },
        headerTintColor: colors.dark.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="habits"
        options={{
          title: "Momentum",
          tabBarLabel: "Habits",
          tabBarIcon: ({ color, focused }) => (
            <Home 
              size={focused ? 26 : 24} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Statistics",
          tabBarLabel: "Stats",
          tabBarIcon: ({ color, focused }) => (
            <BarChart3 
              size={focused ? 26 : 24} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "New Habit",
          tabBarLabel: "Add",
          tabBarIcon: ({ color, focused }) => (
            <Plus 
              size={focused ? 26 : 24} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: "Archive",
          tabBarLabel: "Archive",
          tabBarIcon: ({ color, focused }) => (
            <Archive 
              size={focused ? 26 : 24} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <Settings 
              size={focused ? 26 : 24} 
              color={color} 
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}