import { Tabs } from "expo-router";
import { Home, BarChart3, Sprout, Settings } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";

export default function TabLayout() {
  const { colors } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 88 : 68,
          display: 'flex',
          position: Platform.OS === 'web' ? 'fixed' as any : undefined,
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700' as const,
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
        name="garden"
        options={{
          title: "City",
          tabBarLabel: "City",
          tabBarIcon: ({ color, focused }) => (
            <Sprout 
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
      <Tabs.Screen
        name="add"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="templates"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}