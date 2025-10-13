import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, Component, ReactNode } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { HabitProvider, useHabits } from "@/providers/HabitProvider";
import { GamificationProvider } from "@/providers/GamificationProvider";
import { RoutineProvider } from "@/providers/RoutineProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { trpc, trpcClient } from "@/lib/trpc";
import { SEOHead } from "@/components/SEOHead";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Something went wrong</Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function RootLayoutNav() {
  const { isLoading } = useHabits();

  useEffect(() => {
    console.log('[RootLayoutNav] isLoading:', isLoading);
  }, [isLoading]);

  if (isLoading) {
    console.log('[RootLayoutNav] Still loading, returning null');
    return null;
  }

  return (
    <>
      <SEOHead />
      <Stack 
        screenOptions={{ 
          headerBackTitle: "Back",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <GestureHandlerRootView style={styles.container}>
              <HabitProvider>
                <RoutineProvider>
                  <GamificationProvider>
                    <RootLayoutNav />
                  </GamificationProvider>
                </RoutineProvider>
              </HabitProvider>
            </GestureHandlerRootView>
          </ThemeProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}