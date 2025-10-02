import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSubscription } from "@/providers/SubscriptionProvider";
import { 
  Crown, 
  Check, 
  Sparkles, 
  TrendingUp, 
  Palette, 
  Cloud, 
  Download, 
  Headphones,
  Brain,
  Bell
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import colors from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";

const FEATURES = [
  { icon: Sparkles, title: "Unlimited Habits", description: "Create as many habits as you want" },
  { icon: TrendingUp, title: "Advanced Statistics", description: "Deep insights into your progress" },
  { icon: Palette, title: "Custom Themes", description: "Personalize your experience" },
  { icon: Cloud, title: "Cloud Sync", description: "Access your data anywhere" },
  { icon: Download, title: "Export Data", description: "Download your habit history" },
  { icon: Headphones, title: "Priority Support", description: "Get help when you need it" },
  { icon: Brain, title: "AI Insights", description: "Smart recommendations powered by AI" },
  { icon: Bell, title: "Custom Reminders", description: "Advanced notification options" },
];

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const { tier, isPremium, upgradeToPremium, upgradeToLifetime } = useSubscription();

  const handleUpgrade = async (type: 'monthly' | 'lifetime') => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (type === 'lifetime') {
      upgradeToLifetime();
    } else {
      upgradeToPremium();
    }
  };

  if (isPremium) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView 
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        >
          <View style={styles.premiumBadge}>
            <Crown size={48} color="#FFD700" />
            <Text style={styles.premiumTitle}>You're Premium!</Text>
            <Text style={styles.premiumSubtitle}>
              {tier === 'lifetime' ? 'Lifetime Access' : 'Monthly Subscription'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Premium Features</Text>
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <View key={index} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <Icon size={20} color={colors.dark.tint} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                  <Check size={20} color="#10B981" />
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.header}>
          <Crown size={64} color="#FFD700" />
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>
            Unlock all features and take your habit tracking to the next level
          </Text>
        </View>

        <View style={styles.pricingCards}>
          <TouchableOpacity 
            style={styles.pricingCard}
            onPress={() => handleUpgrade('monthly')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8B5CF6', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pricingGradient}
            >
              <Text style={styles.pricingLabel}>Monthly</Text>
              <Text style={styles.pricingPrice}>$4.99</Text>
              <Text style={styles.pricingPeriod}>per month</Text>
              <View style={styles.pricingButton}>
                <Text style={styles.pricingButtonText}>Subscribe</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.pricingCard, styles.popularCard]}
            onPress={() => handleUpgrade('lifetime')}
            activeOpacity={0.8}
          >
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>BEST VALUE</Text>
            </View>
            <LinearGradient
              colors={['#F59E0B', '#EF4444']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pricingGradient}
            >
              <Text style={styles.pricingLabel}>Lifetime</Text>
              <Text style={styles.pricingPrice}>$29.99</Text>
              <Text style={styles.pricingPeriod}>one-time payment</Text>
              <View style={styles.pricingButton}>
                <Text style={styles.pricingButtonText}>Buy Now</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What You Get</Text>
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <View key={index} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Icon size={20} color={colors.dark.tint} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Note: This is a demo. In production, integrate with Stripe or RevenueCat for real payments.
          </Text>
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
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  pricingCards: {
    gap: 16,
    marginBottom: 32,
  },
  pricingCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  popularCard: {
    position: 'relative' as const,
  },
  popularBadge: {
    position: 'absolute' as const,
    top: 12,
    right: 12,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  pricingGradient: {
    padding: 24,
    alignItems: 'center',
  },
  pricingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
  },
  pricingPrice: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    marginTop: 8,
  },
  pricingPeriod: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 20,
  },
  pricingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  pricingButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  premiumBadge: {
    alignItems: 'center',
    backgroundColor: colors.dark.card,
    padding: 32,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  premiumTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginTop: 16,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 4,
  },
  footer: {
    backgroundColor: colors.dark.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
