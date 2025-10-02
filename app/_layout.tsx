import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { HabitProvider } from "@/providers/HabitProvider";
import { GamificationProvider } from "@/providers/GamificationProvider";
import { RoutineProvider } from "@/providers/RoutineProvider";
import { SubscriptionProvider } from "@/providers/SubscriptionProvider";
import colors from "@/constants/colors";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack 
      screenOptions={{ 
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: colors.dark.background,
        },
        headerTintColor: colors.dark.text,
        contentStyle: {
          backgroundColor: colors.dark.background,
        }
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="habit/[id]" 
        options={{ 
          title: "Habit Details",
          presentation: "modal",
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="calendar/[habitId]" 
        options={{ 
          title: "Calendar",
          presentation: "modal",
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="share/[habitId]" 
        options={{ 
          title: "Share Habit",
          presentation: "modal",
          headerShown: true,
        }} 
      />
      <Stack.Screen 
        name="edit/[id]" 
        options={{ 
          title: "Edit Habit",
          presentation: "modal",
          headerShown: true,
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={styles.container}>
          <SubscriptionProvider>
            <HabitProvider>
              <RoutineProvider>
                <GamificationProvider>
                  <RootLayoutNav />
                </GamificationProvider>
              </RoutineProvider>
            </HabitProvider>
          </SubscriptionProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}