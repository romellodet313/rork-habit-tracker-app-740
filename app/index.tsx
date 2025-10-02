import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Award, 
  Zap,
  Building2,
  Calendar,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Star,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

const { width } = Dimensions.get('window');

export default function LandingPage() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      router.replace('/habits');
    }
  }, []);

  if (Platform.OS !== 'web') {
    return null;
  }

  const features = [
    {
      icon: Target,
      title: 'Track Daily Habits',
      description: 'Build better habits with simple daily tracking. Check off your habits and watch your streaks grow.',
      color: '#8B5CF6',
    },
    {
      icon: TrendingUp,
      title: 'Visualize Progress',
      description: 'See your progress with beautiful charts and statistics. Track completion rates and identify patterns.',
      color: '#10B981',
    },
    {
      icon: Building2,
      title: '3D City Builder',
      description: 'Watch your habits transform into a thriving 3D city. Each streak builds taller skyscrapers!',
      color: '#3B82F6',
    },
    {
      icon: Award,
      title: 'Gamification & Levels',
      description: 'Earn XP, level up, and unlock achievements as you build consistent habits.',
      color: '#F59E0B',
    },
  ];

  const benefits = [
    { icon: CheckCircle2, text: 'Simple & intuitive interface', color: '#10B981' },
    { icon: Zap, text: 'Works offline, syncs everywhere', color: '#F59E0B' },
    { icon: Calendar, text: 'Flexible scheduling options', color: '#8B5CF6' },
    { icon: BarChart3, text: 'Detailed analytics & insights', color: '#3B82F6' },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Fitness Enthusiast',
      text: 'This app transformed how I build habits. The 3D city feature is incredibly motivating!',
      rating: 5,
      avatar: '💪',
    },
    {
      name: 'James K.',
      role: 'Entrepreneur',
      text: 'Finally, a habit tracker that makes consistency fun. Love the gamification elements.',
      rating: 5,
      avatar: '🚀',
    },
    {
      name: 'Emily R.',
      role: 'Student',
      text: 'The visual progress tracking keeps me accountable. Best habit app I\'ve used.',
      rating: 5,
      avatar: '📚',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.dark.background} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={['#1a1f3a', '#0f1729']}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <Sparkles size={16} color="#FFD700" />
              <Text style={styles.badgeText}>Build Better Habits</Text>
            </View>
            
            <Text style={styles.heroTitle}>
              Transform Your Life,{' \n'}
              <Text style={styles.heroTitleAccent}>One Habit at a Time</Text>
            </Text>
            
            <Text style={styles.heroDescription}>
              Track habits, visualize progress, and build a thriving 3D city that grows with your consistency. Join thousands building better lives.
            </Text>

            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/habits')}
              >
                <Text style={styles.primaryButtonText}>Start Building Free</Text>
                <ArrowRight size={20} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  const element = Platform.OS === 'web' ? document.getElementById('features') : null;
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Text style={styles.secondaryButtonText}>See How It Works</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.socialProof}>
              <View style={styles.avatarGroup}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={[styles.avatar, { marginLeft: i > 1 ? -12 : 0 }]}>
                    <Text style={styles.avatarText}>👤</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.socialProofText}>
                <Text style={styles.socialProofBold}>2,500+</Text> people building better habits
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.demoSection}>
          <View style={styles.demoCard}>
            <View style={styles.demoImagePlaceholder}>
              <View style={styles.demoIconContainer}>
                <Building2 size={48} color="#8B5CF6" />
              </View>
              <Text style={styles.demoImageText}>Interactive 3D City Builder</Text>
            </View>
            <Text style={styles.demoDescription}>
              Watch your habits come to life as towering skyscrapers. The longer your streak, the taller your buildings grow!
            </Text>
          </View>
        </View>

        <View style={styles.section} nativeID="features">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>FEATURES</Text>
            <Text style={styles.sectionTitle}>Everything You Need to Succeed</Text>
            <Text style={styles.sectionDescription}>
              Powerful features designed to help you build and maintain lasting habits
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.featureCard,
                    activeFeature === index && styles.featureCardActive,
                  ]}
                  onPress={() => setActiveFeature(index)}
                >
                  <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                    <Icon size={28} color={feature.color} />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.benefitsCard}>
            <Text style={styles.benefitsTitle}>Why Choose MomentPro?</Text>
            <View style={styles.benefitsList}>
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <View key={index} style={styles.benefitItem}>
                    <View style={[styles.benefitIcon, { backgroundColor: `${benefit.color}20` }]}>
                      <Icon size={20} color={benefit.color} />
                    </View>
                    <Text style={styles.benefitText}>{benefit.text}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>TESTIMONIALS</Text>
            <Text style={styles.sectionTitle}>Loved by Habit Builders</Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsScroll}
          >
            {testimonials.map((testimonial, index) => (
              <View key={index} style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <View style={styles.testimonialAvatar}>
                    <Text style={styles.testimonialAvatarEmoji}>
                      {testimonial.avatar}
                    </Text>
                  </View>
                  <View style={styles.testimonialInfo}>
                    <Text style={styles.testimonialName}>{testimonial.name}</Text>
                    <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                  </View>
                </View>
                <View style={styles.testimonialRating}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} color="#FFD700" fill="#FFD700" />
                  ))}
                </View>
                <Text style={styles.testimonialText}>{testimonial.text}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.ctaSection}>
          <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            style={styles.ctaCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Sparkles size={48} color="#fff" />
            <Text style={styles.ctaTitle}>Ready to Build Better Habits?</Text>
            <Text style={styles.ctaDescription}>
              Join thousands of people transforming their lives one habit at a time
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/habits')}
            >
              <Text style={styles.ctaButtonText}>Get Started Free</Text>
              <ArrowRight size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 MomentPro. Built with ❤️ for habit builders.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingTop: Platform.OS === 'web' ? 80 : 60,
    paddingBottom: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: 600,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70020',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFD70040',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  heroTitle: {
    ...typography.display,
    fontSize: Platform.OS === 'web' ? 48 : 36,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: Platform.OS === 'web' ? 56 : 44,
  },
  heroTitleAccent: {
    color: '#8B5CF6',
  },
  heroDescription: {
    fontSize: 18,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 28,
  },
  heroButtons: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 16,
    marginBottom: 40,
    width: '100%',
    maxWidth: 400,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    flex: Platform.OS === 'web' ? 1 : undefined,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dark.card,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flex: Platform.OS === 'web' ? 1 : undefined,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarGroup: {
    flexDirection: 'row',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.dark.background,
  },
  avatarText: {
    fontSize: 20,
  },
  socialProofText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  socialProofBold: {
    fontWeight: '700' as const,
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#8B5CF6',
    letterSpacing: 2,
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.display,
    fontSize: 32,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: 500,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  featureCard: {
    width: Platform.OS === 'web' ? Math.min((width - 80) / 2, 280) : width - 40,
    backgroundColor: colors.dark.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.dark.border,
  },
  featureCardActive: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF610',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 22,
  },
  benefitsCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: colors.dark.border,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  benefitsTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600' as const,
  },
  testimonialsScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  testimonialCard: {
    width: 300,
    backgroundColor: colors.dark.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  testimonialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  testimonialAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialAvatarText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  testimonialAvatarEmoji: {
    fontSize: 24,
  },
  testimonialInfo: {
    flex: 1,
  },
  testimonialName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 2,
  },
  testimonialRole: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  testimonialRating: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  testimonialText: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 22,
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  ctaCard: {
    borderRadius: 24,
    padding: 48,
    alignItems: 'center',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#fff',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  ctaDescription: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
    marginBottom: 32,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#8B5CF6',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  demoSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  demoCard: {
    backgroundColor: colors.dark.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.dark.border,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  demoImagePlaceholder: {
    height: 300,
    backgroundColor: '#0a0e27',
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2d3561',
  },
  demoIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#8B5CF620',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  demoImageText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#8B5CF6',
  },
  demoDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
    textAlign: 'center',
  },
});