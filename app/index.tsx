import { Redirect } from 'expo-router';
import { useHabits } from '@/providers/HabitProvider';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isLoading } = useHabits();

  console.log('[Index] isLoading:', isLoading);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return <Redirect href="/(tabs)/habits" />;
}

