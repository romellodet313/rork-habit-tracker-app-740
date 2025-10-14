import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useHabits } from '@/providers/HabitProvider';

export default function Index() {
  const router = useRouter();
  const { isLoading } = useHabits();

  useEffect(() => {
    if (!isLoading) {
      console.log('[Index] Provider ready, hiding splash and navigating');
      
      SplashScreen.hideAsync()
        .then(() => {
          console.log('[Index] Splash hidden, navigating to /habits');
          router.replace('/habits');
        })
        .catch((e) => {
          console.log('[Index] hideAsync error:', e);
          router.replace('/habits');
        });
    }
  }, [isLoading, router]);

  return null;
}
