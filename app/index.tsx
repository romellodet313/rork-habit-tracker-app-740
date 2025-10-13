import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useHabits } from '@/providers/HabitProvider';

export default function Index() {
  const router = useRouter();
  const { isLoading } = useHabits();

  useEffect(() => {
    const init = async () => {
      if (!isLoading) {
        console.log('[Index] Provider ready, hiding splash and navigating');
        await SplashScreen.hideAsync();
        setTimeout(() => {
          router.replace('/habits');
        }, 100);
      }
    };
    init();
  }, [isLoading, router]);

  return null;
}

