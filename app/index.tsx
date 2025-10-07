import React, { useState, useEffect, useRef } from 'react';
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
  Users,
} from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useTheme } from '@/providers/ThemeProvider';

const { width } = Dimensions.get('window');

export default function LandingPage() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);
  const hasRedirected = useRef(false);
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (Platform.OS !== 'web' && !hasRedirected.current) {
      hasRedirected.current = true;
      const timer = setTimeout(() => {
        try {
          console.log('[LandingPage] Redirecting to habits...');
          router.replace('/habits');
        } catch (error) {
          console.error('[LandingPage] Navigation error:', error);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [router]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fadeAnim, slideAnim]);

  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.container, { backgroundColor: colors[theme].background }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors[theme].background} />
      </View>
    );
  }

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0a0e1a' : '#fafafa';
  const cardBg = isDark ? '#1a1f3a' : '#ffffff';
  const textPrimary = isDark ? '#ffffff' : '#0a0e1a';
  const textSecondary = isDark ? '#9CA3AF' : '#6B7280';
  const accentColor = '#8B5CF6';
  const borderColor = isDark ? '#2d3561' : '#e5e7eb';

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
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={bgColor} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroSection, { backgroundColor: bgColor }]}>
          <Animated.View 
            style={[
              styles.heroContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={[styles.badge, { 
              backgroundColor: isDark ? '#FFD70020' : '#FEF3C7',
              borderColor: isDark ? '#FFD70040' : '#FCD34D',
            }]}>
              <Sparkles size={14} color={isDark ? '#FFD700' : '#F59E0B'} />
              <Text style={[styles.badgeText, { color: isDark ? '#FFD700' : '#F59E0B' }]}>
                #1 Habit Tracker • 2,500+ Active Users
              </Text>
            </View>
            
            <Text style={[styles.heroTitle, { color: textPrimary }]} accessibilityRole="header">
              Build{' '}
              <Text style={[styles.heroTitleItalic, { color: accentColor }]}>Exceptional</Text>
              {' '}Habits,{' \n'}
              <Text style={styles.heroTitleAccent}>Faster</Text>
            </Text>
            
            <Text style={[styles.heroDescription, { color: textSecondary }]}>
              Transform your daily routines into{' '}
              <Text style={{ fontWeight: '600' as const }}>beautiful visual progress</Text>
              {' '}through our AI-driven platform and start building your habit city in just 24 hours.
            </Text>

            <View style={styles.heroButtons}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: accentColor }]}
                onPress={() => router.push('/habits')}
              >
                <Text style={styles.primaryButtonText}>Start Building</Text>
                <ArrowRight size={18} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.secondaryButton, { 
                  backgroundColor: 'transparent',
                  borderColor: borderColor,
                }]}
                onPress={() => {
                  const element = Platform.OS === 'web' ? document.getElementById('features') : null;
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Text style={[styles.secondaryButtonText, { color: textPrimary }]}>View Demo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Users size={20} color={accentColor} />
                <Text style={[styles.statValue, { color: textPrimary }]}>2,500+</Text>
                <Text style={[styles.statLabel, { color: textSecondary }]}>Active Users</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
              <View style={styles.statItem}>
                <Flame size={20} color="#F59E0B" />
                <Text style={[styles.statValue, { color: textPrimary }]}>98%</Text>
                <Text style={[styles.statLabel, { color: textSecondary }]}>Success Rate</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: borderColor }]} />
              <View style={styles.statItem}>
                <Trophy size={20} color="#10B981" />
                <Text style={[styles.statValue, { color: textPrimary }]}>50K+</Text>
                <Text style={[styles.statLabel, { color: textSecondary }]}>Habits Tracked</Text>
              </View>
            </View>

            {Platform.OS === 'web' && (
              <View style={styles.productHuntBadge}>
                <a 
                  href="https://www.producthunt.com/products/momentpro?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-momentpro" 
                  target="_blank"
                >
                  <img 
                    src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1023307&theme=${isDark ? 'dark' : 'light'}&t=1759692862397`}
                    alt="MomentPro - A beautiful habit tracker makes your progress look like art. | Product Hunt" 
                    style={{ width: '250px', height: '54px' }} 
                    width="250" 
                    height="54" 
                  />
                </a>
              </View>
            )}
          </Animated.View>
        </View>

        <View style={[styles.demoSection, { backgroundColor: bgColor }]}>
          <View style={[styles.demoCard, { 
            backgroundColor: cardBg,
            borderColor: borderColor,
            shadowColor: isDark ? '#000' : '#8B5CF6',
          }]}>
            <View style={[styles.demoImagePlaceholder, { 
              backgroundColor: isDark ? '#0a0e27' : '#F3F4F6',
              borderColor: borderColor,
            }]}>
              <View style={styles.mockupContainer}>
                <View style={[styles.mockupCard, { 
                  backgroundColor: cardBg,
                  borderColor: borderColor,
                  left: 20,
                  top: 20,
                }]}>
                  <View style={styles.mockupHeader}>
                    <View style={[styles.mockupAvatar, { backgroundColor: '#8B5CF6' }]} />
                    <View style={{ flex: 1 }}>
                      <View style={[styles.mockupLine, { backgroundColor: textPrimary, width: 100 }]} />
                      <View style={[styles.mockupLine, { backgroundColor: textSecondary, width: 60, marginTop: 4 }]} />
                    </View>
                  </View>
                  <View style={styles.mockupBadge}>
                    <Flame size={12} color="#F59E0B" />
                    <Text style={[styles.mockupBadgeText, { color: textPrimary }]}>30 Day Streak</Text>
                  </View>
                </View>
                
                <View style={[styles.mockupCard, { 
                  backgroundColor: cardBg,
                  borderColor: borderColor,
                  right: 20,
                  top: 100,
                }]}>
                  <View style={styles.mockupHeader}>
                    <View style={[styles.mockupAvatar, { backgroundColor: '#10B981' }]} />
                    <View style={{ flex: 1 }}>
                      <View style={[styles.mockupLine, { backgroundColor: textPrimary, width: 90 }]} />
                      <View style={[styles.mockupLine, { backgroundColor: textSecondary, width: 70, marginTop: 4 }]} />
                    </View>
                  </View>
                  <View style={styles.mockupBadge}>
                    <Trophy size={12} color="#10B981" />
                    <Text style={[styles.mockupBadgeText, { color: textPrimary }]}>Level 12</Text>
                  </View>
                </View>
                
                <View style={[styles.mockupCard, { 
                  backgroundColor: cardBg,
                  borderColor: borderColor,
                  left: 60,
                  bottom: 20,
                }]}>
                  <View style={styles.mockupHeader}>
                    <View style={[styles.mockupAvatar, { backgroundColor: '#3B82F6' }]} />
                    <View style={{ flex: 1 }}>
                      <View style={[styles.mockupLine, { backgroundColor: textPrimary, width: 110 }]} />
                      <View style={[styles.mockupLine, { backgroundColor: textSecondary, width: 50, marginTop: 4 }]} />
                    </View>
                  </View>
                  <View style={styles.mockupBadge}>
                    <CheckCircle2 size={12} color="#3B82F6" />
                    <Text style={[styles.mockupBadgeText, { color: textPrimary }]}>100% Today</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: bgColor }]} nativeID="features">
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: accentColor }]}>FEATURES</Text>
            <Text style={[styles.sectionTitle, { color: textPrimary }]} accessibilityRole="header">
              Everything You Need to Succeed
            </Text>
            <Text style={[styles.sectionDescription, { color: textSecondary }]}>
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
                    { 
                      backgroundColor: cardBg,
                      borderColor: activeFeature === index ? accentColor : borderColor,
                      shadowColor: isDark ? '#000' : feature.color,
                    },
                    activeFeature === index && { backgroundColor: isDark ? '#8B5CF610' : '#F5F3FF' },
                  ]}
                  onPress={() => setActiveFeature(index)}
                >
                  <View style={[styles.featureIcon, { backgroundColor: `${feature.color}${isDark ? '20' : '15'}` }]}>
                    <Icon size={28} color={feature.color} />
                  </View>
                  <Text style={[styles.featureTitle, { color: textPrimary }]} accessibilityRole="header">{feature.title}</Text>
                  <Text style={[styles.featureDescription, { color: textSecondary }]}>{feature.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: bgColor }]}>
          <View style={[styles.benefitsCard, { 
            backgroundColor: cardBg,
            borderColor: borderColor,
          }]}>
            <Text style={[styles.benefitsTitle, { color: textPrimary }]}>Why Choose MomentPro?</Text>
            <View style={styles.benefitsList}>
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <View key={index} style={styles.benefitItem}>
                    <View style={[styles.benefitIcon, { backgroundColor: `${benefit.color}${isDark ? '20' : '15'}` }]}>
                      <Icon size={20} color={benefit.color} />
                    </View>
                    <Text style={[styles.benefitText, { color: textPrimary }]}>{benefit.text}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: bgColor }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, { color: accentColor }]}>TESTIMONIALS</Text>
            <Text style={[styles.sectionTitle, { color: textPrimary }]} accessibilityRole="header">Loved by Habit Builders</Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsScroll}
          >
            {testimonials.map((testimonial, index) => (
              <View key={index} style={[styles.testimonialCard, { 
                backgroundColor: cardBg,
                borderColor: borderColor,
              }]}>
                <View style={styles.testimonialHeader}>
                  <View style={styles.testimonialAvatar}>
                    <Text style={styles.testimonialAvatarEmoji}>
                      {testimonial.avatar}
                    </Text>
                  </View>
                  <View style={styles.testimonialInfo}>
                    <Text style={[styles.testimonialName, { color: textPrimary }]}>{testimonial.name}</Text>
                    <Text style={[styles.testimonialRole, { color: textSecondary }]}>{testimonial.role}</Text>
                  </View>
                </View>
                <View style={styles.testimonialRating}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} color="#FFD700" fill="#FFD700" />
                  ))}
                </View>
                <Text style={[styles.testimonialText, { color: textSecondary }]}>{testimonial.text}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.ctaSection, { backgroundColor: bgColor }]}>
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

        <View style={[styles.footer, { backgroundColor: bgColor, borderTopColor: borderColor }]}>
          <Text style={[styles.footerText, { color: textSecondary }]}>© 2025 MomentPro. Built with ❤️ for habit builders.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  heroContent: {
    maxWidth: 800,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 32,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 72 : 48,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: Platform.OS === 'web' ? 80 : 56,
    letterSpacing: -1.5,
  },
  heroTitleItalic: {
    fontStyle: 'italic',
    fontWeight: '400' as const,
  },
  heroTitleAccent: {
    color: '#8B5CF6',
  },
  heroDescription: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 30,
    maxWidth: 650,
    fontWeight: '400' as const,
  },
  heroButtons: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 16,
    marginBottom: 48,
    width: '100%',
    maxWidth: 420,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    flex: Platform.OS === 'web' ? 1 : undefined,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    flex: Platform.OS === 'web' ? 1 : undefined,
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 80,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 2.5,
    marginBottom: 16,
    textTransform: 'uppercase' as const,
  },
  sectionTitle: {
    fontSize: 40,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  sectionDescription: {
    fontSize: 17,
    textAlign: 'center',
    maxWidth: 550,
    lineHeight: 26,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  featureCard: {
    width: Platform.OS === 'web' ? Math.min((width - 80) / 2, 320) : width - 40,
    borderRadius: 16,
    padding: 28,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
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
    fontSize: 19,
    fontWeight: '700' as const,
    marginBottom: 10,
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 24,
  },
  benefitsCard: {
    borderRadius: 20,
    padding: 40,
    borderWidth: 1.5,
    maxWidth: 650,
    alignSelf: 'center',
    width: '100%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  benefitsTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    marginBottom: 32,
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
    fontWeight: '500' as const,
  },
  testimonialsScroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  testimonialCard: {
    width: 320,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
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
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  testimonialRole: {
    fontSize: 13,
  },
  testimonialRating: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  testimonialText: {
    fontSize: 14,
    lineHeight: 23,
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
    paddingVertical: 32,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 14,
  },
  productHuntBadge: {
    marginTop: 24,
    alignItems: 'center',
  },
  demoSection: {
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  demoCard: {
    borderRadius: 24,
    padding: 32,
    borderWidth: 1.5,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  demoImagePlaceholder: {
    height: 400,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
  },
  mockupContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mockupCard: {
    position: 'absolute',
    width: 180,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  mockupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  mockupAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  mockupLine: {
    height: 8,
    borderRadius: 4,
  },
  mockupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#8B5CF610',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  mockupBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },

});