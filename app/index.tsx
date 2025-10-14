import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useHabits } from '@/providers/HabitProvider';

export default function Index() {
  const router = useRouter();
  const { isLoading } = useHabits();

  useEffect(() => {
    const run = async () => {
      if (!isLoading) {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.log('[Index] hideAsync error', e);
        }
        setTimeout(() => {
          try {
            router.replace('/(tabs)/habits');
          } catch (err) {
            console.log('[Index] router.replace error', err);
          }
        }, 100);
      }
    };
    run();
  }, [isLoading, router]);

  return null;
}
