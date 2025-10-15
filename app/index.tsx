import { Redirect } from 'expo-router';
import { Platform, View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle, TrendingUp, Award, Calendar, Sparkles, ArrowRight } from 'lucide-react-native';

export default function Index() {
  const router = useRouter();

  if (Platform.OS !== 'web') {
    return <Redirect href="/habits" />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.nav}>
        <View style={styles.navContent}>
          <View style={styles.logo}>
            <Sparkles size={24} color="#8B5CF6" />
            <Text style={styles.logoText}>MomentPro</Text>
          </View>
          <View style={styles.navLinks}>
            <Text style={styles.navLink}>Features</Text>
            <Text style={styles.navLink}>Pricing</Text>
            <Text style={styles.navLink}>Blog</Text>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => router.push('/habits')}
            >
              <Text style={styles.navButtonText}>Get Started</Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.hero}>
        <TouchableOpacity 
          style={styles.badge}
          onPress={() => Linking.openURL('https://www.producthunt.com/products/momentpro')}
        >
          <Text style={styles.badgeText}>🏆 #3 Product of the Day | 280+ Upvotes</Text>
        </TouchableOpacity>
        
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            <Text style={styles.heroTitleRegular}>Build </Text>
            <Text style={styles.heroTitleItalic}>Exceptional</Text>
            {"\n"}
            <Text style={styles.heroTitleRegular}>Habits, </Text>
            <Text style={styles.heroTitleBlue}>Faster</Text>
          </Text>
          
          <Text style={styles.heroSubtitle}>
            Connect with <Text style={styles.bold}>beautiful visualizations</Text> through our AI-driven platform and{"\n"}
            start building your <Text style={styles.bold}>progress in just 24 hours.</Text>
          </Text>
          
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/habits')}
          >
            <Text style={styles.ctaText}>Get Started</Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.productHuntContainer}>
          <TouchableOpacity 
            onPress={() => Linking.openURL('https://www.producthunt.com/products/momentpro?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-momentpro')}
          >
            <img 
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1023307&theme=light&t=1760491693288" 
              alt="MomentPro - A beautiful habit tracker makes your progress look like art. | Product Hunt" 
              style={{ width: 250, height: 54 }} 
              width="250" 
              height="54" 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.previewSection}>
        <View style={styles.previewCard}>
          <View style={styles.mockupContainer}>
            <View style={styles.habitCard}>
              <View style={styles.habitHeader}>
                <View style={styles.habitIcon}>
                  <CheckCircle size={20} color="#10B981" />
                </View>
                <Text style={styles.habitName}>Morning Meditation</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '85%', backgroundColor: '#10B981' }]} />
              </View>
              <Text style={styles.habitStats}>85% Complete</Text>
            </View>
            
            <View style={styles.habitCard}>
              <View style={styles.habitHeader}>
                <View style={styles.habitIcon}>
                  <TrendingUp size={20} color="#3B82F6" />
                </View>
                <Text style={styles.habitName}>Daily Exercise</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '92%', backgroundColor: '#3B82F6' }]} />
              </View>
              <Text style={styles.habitStats}>92% Complete</Text>
            </View>
            
            <View style={styles.habitCard}>
              <View style={styles.habitHeader}>
                <View style={styles.habitIcon}>
                  <Award size={20} color="#F59E0B" />
                </View>
                <Text style={styles.habitName}>Read 30 Minutes</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '78%', backgroundColor: '#F59E0B' }]} />
              </View>
              <Text style={styles.habitStats}>78% Complete</Text>
            </View>
          </View>
        </View>
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
    backgroundColor: '#F5F5F5',
  },
  content: {
    alignItems: 'center',
  },
  nav: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 16,
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1200,
    width: '100%',
    paddingHorizontal: 24,
    marginHorizontal: 'auto' as any,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  navLink: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  navButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 80,
    maxWidth: 900,
    width: '100%',
  },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 32,
  },
  badgeText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500' as const,
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroTitle: {
    fontSize: 74,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 84,
  },
  heroTitleRegular: {
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  heroTitleItalic: {
    fontStyle: 'italic',
    fontWeight: '400' as const,
    color: '#1F2937',
  },
  heroTitleBlue: {
    fontWeight: '700' as const,
    color: '#3B82F6',
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
    maxWidth: 700,
  },
  bold: {
    fontWeight: '600' as const,
  },
  ctaButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  productHuntContainer: {
    marginTop: 32,
  },
  previewSection: {
    width: '100%',
    maxWidth: 1000,
    paddingHorizontal: 20,
    marginBottom: 80,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  mockupContainer: {
    gap: 16,
  },
  habitCard: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  habitIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  habitStats: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 1200,
    paddingHorizontal: 20,
    gap: 24,
    marginBottom: 80,
  },
  feature: {
    width: 260,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    marginTop: 40,
    marginBottom: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
