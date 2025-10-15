import { Redirect } from 'expo-router';
import { Platform, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, TrendingUp, Award, Calendar, Sparkles } from 'lucide-react-native';

export default function Index() {
  const router = useRouter();

  if (Platform.OS !== 'web') {
    return <Redirect href="/habits" />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.iconContainer}>
          <Sparkles size={48} color="#8B5CF6" />
        </View>
        <Text style={styles.title}>MomentPro</Text>
        <Text style={styles.subtitle}>Transform Your Habits Into Art</Text>
        <Text style={styles.description}>
          Track daily habits, build streaks, and visualize your progress with beautiful charts and 3D gardens.
        </Text>
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => router.push('/habits')}
        >
          <Text style={styles.ctaText}>Get Started</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.features}>
        <View style={styles.feature}>
          <CheckCircle size={32} color="#10B981" />
          <Text style={styles.featureTitle}>Daily Tracking</Text>
          <Text style={styles.featureText}>Mark habits complete and build powerful streaks</Text>
        </View>

        <View style={styles.feature}>
          <TrendingUp size={32} color="#3B82F6" />
          <Text style={styles.featureTitle}>Progress Visualization</Text>
          <Text style={styles.featureText}>Beautiful charts and year grids to see your journey</Text>
        </View>

        <View style={styles.feature}>
          <Award size={32} color="#F59E0B" />
          <Text style={styles.featureTitle}>Gamification</Text>
          <Text style={styles.featureText}>Earn achievements and level up your habits</Text>
        </View>

        <View style={styles.feature}>
          <Calendar size={32} color="#8B5CF6" />
          <Text style={styles.featureTitle}>Smart Routines</Text>
          <Text style={styles.featureText}>Build morning, evening, and custom routines</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 MomentPro. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 20,
    maxWidth: 600,
    marginBottom: 60,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: '#8B5CF6',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
  },
  ctaButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600' as const,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 1200,
    paddingHorizontal: 20,
    gap: 24,
  },
  feature: {
    width: 260,
    backgroundColor: '#F9FAFB',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    marginTop: 60,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
