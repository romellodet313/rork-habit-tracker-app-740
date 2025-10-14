import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useHabits } from '@/providers/HabitProvider';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const router = useRouter();
  const { isLoading } = useHabits();

  useEffect(() => {
    if (!isLoading) {
      console.log('[Index] Provider ready, hiding splash and navigating');
      
      const navigate = async () => {
        try {
          await SplashScreen.hideAsync();
          console.log('[Index] Splash hidden');
        } catch (e) {
          console.log('[Index] hideAsync error:', e);
        }
        
        setTimeout(() => {
          console.log('[Index] Navigating to /habits');
          router.replace('/habits');
        }, 50);
      };
      
      navigate();
    }
  }, [isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
