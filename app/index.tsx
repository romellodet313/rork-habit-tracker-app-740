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
  Animated,
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
  Flame,
  Trophy,
  Activity,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

const { width, height } = Dimensions.get('window');
const isLargeScreen = width > 768;

export default function LandingPage() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY] = useState(new Animated.Value(0));

  useEffect(() => {
    if (Platform.OS !== 'web') {
      router.replace('/habits');
    }
  }, [router]);

  if (Platform.OS !== 'web') {
    return null;
  }

  const parallaxOffset = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

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
      <StatusBar barStyle="dark-content" backgroundColor="#E8E8E8" />
      <Animated.ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.badge}>
              <Flame size={14} color="#FF6B35" />
              <Text style={styles.badgeText}>#1 Habit Tracker | 2,500+ Active Users</Text>
            </View>
            
            <View style={styles.heroTitleContainer}>
              <Text style={styles.heroTitle} accessibilityRole="header">
                Build{' '}
                <Text style={styles.heroTitleItalic}>Exceptional</Text>
                {' '}Habits,{' '}
                <Text style={styles.heroTitleAccent}>Faster</Text>
              </Text>
              
              {isLargeScreen && (
                <>
                  <View style={[styles.typographyLabel, styles.labelTopRight]}>
                    <Text style={styles.typographyLabelText}>Instrument Serif 74px (0)</Text>
                  </View>
                  <View style={[styles.typographyLabel, styles.labelLeft]}>
                    <Text style={styles.typographyLabelText}>Geist 74px (-5)</Text>
                  </View>
                  <View style={[styles.typographyLabel, styles.labelBottomRight]}>
                    <Text style={styles.typographyLabelText}>Geist 18px (-2)</Text>
                  </View>
                </>
              )}
            </View>
            
            <Text style={styles.heroDescription}>
              Transform your daily routine with our AI-powered habit tracker and watch your progress come to life in a stunning 3D city visualization.
            </Text>

            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/habits')}
              >
                <Text style={styles.primaryButtonText}>Start Building Free</Text>
                <ArrowRight size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {Platform.OS === 'web' && (
              <View style={styles.productHuntBadge}>
                <a 
                  href="https://www.producthunt.com/products/momentpro?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-momentpro" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img 
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1023307&theme=light&t=1759692862397" 
                    alt="MomentPro - A beautiful habit tracker makes your progress look like art. | Product Hunt" 
                    style={{ width: '250px', height: '54px' }} 
                    width="250" 
                    height="54" 
                  />
                </a>
              </View>
            )}
          </View>
        </View>

        <Animated.View 
          style={[
            styles.demoSection,
            { transform: [{ translateY: parallaxOffset }] }
          ]}
        >
          <View style={styles.demoCardsContainer}>
            <View style={styles.demoCard}>
              <View style={styles.demoCardHeader}>
                <View style={styles.demoCardBadge}>
                  <Text style={styles.demoCardBadgeText}>🇺🇸 United States</Text>
                </View>
                <View style={styles.demoCardBadge}>
                  <Text style={styles.demoCardBadgeText}>⏱️ Hourly rate on request</Text>
                </View>
              </View>
              <Text style={styles.demoCardName}>Sarah Mitchell</Text>
              <Text style={styles.demoCardRole}>Fitness Coach from New York</Text>
              <View style={styles.demoCardProgress}>
                <Text style={styles.demoCardProgressLabel}>Habit Streak</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '100%', backgroundColor: '#10B981' }]} />
                </View>
                <Text style={styles.demoCardProgressValue}>100%</Text>
              </View>
              <View style={styles.demoCardSkills}>
                <Text style={styles.demoCardSkillsTitle}>Active Habits</Text>
                <View style={styles.skillTag}>
                  <Flame size={14} color="#FF6B35" />
                  <Text style={styles.skillTagText}>Morning Run</Text>
                </View>
                <View style={styles.skillTag}>
                  <Activity size={14} color="#3B82F6" />
                  <Text style={styles.skillTagText}>Meditation</Text>
                </View>
                <View style={styles.skillTag}>
                  <Trophy size={14} color="#F59E0B" />
                  <Text style={styles.skillTagText}>Reading</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.demoCardButton}>
                <Text style={styles.demoCardButtonText}>+ Add to routine</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.demoCard}>
              <View style={styles.demoCardHeader}>
                <View style={styles.demoCardBadge}>
                  <Text style={styles.demoCardBadgeText}>🇬🇧 United Kingdom</Text>
                </View>
                <View style={styles.demoCardBadge}>
                  <Text style={styles.demoCardBadgeText}>⏱️ Hourly rate on request</Text>
                </View>
              </View>
              <Text style={styles.demoCardName}>James Parker</Text>
              <Text style={styles.demoCardRole}>Developer from London</Text>
              <View style={styles.demoCardProgress}>
                <Text style={styles.demoCardProgressLabel}>Habit Streak</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '85%', backgroundColor: '#3B82F6' }]} />
                </View>
                <Text style={styles.demoCardProgressValue}>85%</Text>
              </View>
              <View style={styles.demoCardSkills}>
                <Text style={styles.demoCardSkillsTitle}>Active Habits</Text>
                <View style={styles.skillTag}>
                  <Target size={14} color="#8B5CF6" />
                  <Text style={styles.skillTagText}>Code Daily</Text>
                </View>
                <View style={styles.skillTag}>
                  <Building2 size={14} color="#10B981" />
                  <Text style={styles.skillTagText}>Exercise</Text>
                </View>
                <View style={styles.skillTag}>
                  <Star size={14} color="#F59E0B" />
                  <Text style={styles.skillTagText}>Learn</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.demoCardButton}>
                <Text style={styles.demoCardButtonText}>+ Add to routine</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.demoCard}>
              <View style={styles.demoCardHeader}>
                <View style={styles.demoCardBadge}>
                  <Text style={styles.demoCardBadgeText}>🇨🇦 Canada</Text>
                </View>
                <View style={styles.demoCardBadge}>
                  <Text style={styles.demoCardBadgeText}>⏱️ Hourly rate on request</Text>
                </View>
              </View>
              <Text style={styles.demoCardName}>Emma Chen</Text>
              <Text style={styles.demoCardRole}>Designer from Toronto</Text>
              <View style={styles.demoCardProgress}>
                <Text style={styles.demoCardProgressLabel}>Habit Streak</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '92%', backgroundColor: '#8B5CF6' }]} />
                </View>
                <Text style={styles.demoCardProgressValue}>92%</Text>
              </View>
              <View style={styles.demoCardSkills}>
                <Text style={styles.demoCardSkillsTitle}>Active Habits</Text>
                <View style={styles.skillTag}>
                  <Sparkles size={14} color="#EC4899" />
                  <Text style={styles.skillTagText}>Design</Text>
                </View>
                <View style={styles.skillTag}>
                  <Calendar size={14} color="#06B6D4" />
                  <Text style={styles.skillTagText}>Journal</Text>
                </View>
                <View style={styles.skillTag}>
                  <Award size={14} color="#F59E0B" />
                  <Text style={styles.skillTagText}>Yoga</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.demoCardButton}>
                <Text style={styles.demoCardButtonText}>+ Add to routine</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isLargeScreen && (
            <>
              <View style={[styles.floatingLabel, styles.floatingLabel1]}>
                <View style={styles.floatingLabelDot} />
                <Text style={styles.floatingLabelText}>Geist 14px (-1)</Text>
              </View>
              <View style={[styles.floatingLabel, styles.floatingLabel2]}>
                <View style={styles.floatingLabelDot} />
                <Text style={styles.floatingLabelText}>Geist 16px (-2)</Text>
              </View>
            </>
          )}
        </Animated.View>

        <View style={styles.section} nativeID="features">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} accessibilityRole="header">Everything You Need to Succeed</Text>
            <Text style={styles.sectionDescription}>
              Powerful features designed to help you build and maintain lasting habits
            </Text>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <View
                  key={index}
                  style={styles.featureCard}
                >
                  <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                    <Icon size={24} color="#fff" />
                  </View>
                  <Text style={styles.featureTitle} accessibilityRole="header">{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>2,500+</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Habits Tracked</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>95%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>4.9★</Text>
              <Text style={styles.statLabel}>User Rating</Text>
            </View>
          </View>
        </View>

        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Ready to Build Better Habits?</Text>
            <Text style={styles.ctaDescription}>
              Join thousands of people transforming their lives one habit at a time
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/habits')}
            >
              <Text style={styles.ctaButtonText}>Get Started Free</Text>
              <ArrowRight size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 MomentPro. Built with ❤️ for habit builders.</Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E8E8',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingTop: Platform.OS === 'web' ? 100 : 60,
    paddingBottom: 80,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
  },
  heroContent: {
    maxWidth: 900,
    alignItems: 'center',
    width: '100%',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#1F2937',
  },
  heroTitleContainer: {
    position: 'relative',
    marginBottom: 24,
    paddingHorizontal: isLargeScreen ? 60 : 20,
  },
  heroTitle: {
    fontSize: isLargeScreen ? 74 : 42,
    fontWeight: '800' as const,
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: isLargeScreen ? 84 : 50,
    letterSpacing: -2,
  },
  heroTitleItalic: {
    fontStyle: 'italic',
    fontWeight: '400' as const,
  },
  heroTitleAccent: {
    color: '#3B82F6',
  },
  typographyLabel: {
    position: 'absolute',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  labelTopRight: {
    top: -20,
    right: -40,
  },
  labelLeft: {
    top: '50%',
    left: -80,
  },
  labelBottomRight: {
    bottom: -20,
    right: 40,
  },
  typographyLabelText: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  heroDescription: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 28,
    maxWidth: 700,
    letterSpacing: -0.5,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  productHuntBadge: {
    marginTop: 24,
    alignItems: 'center',
  },
  demoSection: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    position: 'relative',
  },
  demoCardsContainer: {
    flexDirection: isLargeScreen ? 'row' : 'column',
    gap: 20,
    justifyContent: 'center',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  demoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    minWidth: isLargeScreen ? 280 : undefined,
    maxWidth: isLargeScreen ? 340 : undefined,
  },
  demoCardHeader: {
    gap: 8,
    marginBottom: 16,
  },
  demoCardBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  demoCardBadgeText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  demoCardName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  demoCardRole: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  demoCardProgress: {
    marginBottom: 16,
  },
  demoCardProgressLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  demoCardProgressValue: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'right',
  },
  demoCardSkills: {
    marginBottom: 16,
  },
  demoCardSkillsTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 10,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginBottom: 8,
  },
  skillTagText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500' as const,
  },
  demoCardButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoCardButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#fff',
  },
  floatingLabel: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  floatingLabel1: {
    top: 100,
    left: 40,
  },
  floatingLabel2: {
    bottom: 100,
    right: 40,
  },
  floatingLabelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  floatingLabelText: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    backgroundColor: '#E8E8E8',
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  featureCard: {
    width: isLargeScreen ? 280 : width - 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    backgroundColor: '#E8E8E8',
  },
  statsGrid: {
    flexDirection: isLargeScreen ? 'row' : 'column',
    gap: 16,
    maxWidth: 1000,
    alignSelf: 'center',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  statNumber: {
    fontSize: 42,
    fontWeight: '800' as const,
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 60,
    backgroundColor: '#E8E8E8',
  },
  ctaCard: {
    backgroundColor: '#1F2937',
    borderRadius: 24,
    padding: 48,
    alignItems: 'center',
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -1,
  },
  ctaDescription: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});