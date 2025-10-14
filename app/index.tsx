import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useHabits } from '@/providers/HabitProvider';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isLoading } = useHabits();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      console.log('[Index] Provider ready, hiding splash');
      
      const init = async () => {
        try {
          await SplashScreen.hideAsync();
          console.log('[Index] Splash hidden successfully');
        } catch (e) {
          console.log('[Index] Splash hide error (may already be hidden):', e);
        }
        setReady(true);
      };
      
      init();
    }
  }, [isLoading]);

  if (ready) {
    console.log('[Index] Redirecting to /habits');
    return <Redirect href="/habits" />;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
