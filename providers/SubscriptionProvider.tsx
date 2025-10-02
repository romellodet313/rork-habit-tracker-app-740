import { useState, useEffect, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type SubscriptionTier = 'free' | 'premium' | 'lifetime';

export interface SubscriptionFeatures {
  maxHabits: number;
  unlimitedHabits: boolean;
  advancedStats: boolean;
  customThemes: boolean;
  cloudSync: boolean;
  exportData: boolean;
  prioritySupport: boolean;
  aiInsights: boolean;
  customReminders: boolean;
}

interface SubscriptionContextType {
  tier: SubscriptionTier;
  isPremium: boolean;
  isLoading: boolean;
  features: SubscriptionFeatures;
  upgradeToPremium: () => void;
  upgradeToLifetime: () => void;
  checkFeatureAccess: (feature: keyof SubscriptionFeatures) => boolean;
}

const STORAGE_KEY = '@habitkit_subscription';

const FREE_FEATURES: SubscriptionFeatures = {
  maxHabits: 5,
  unlimitedHabits: false,
  advancedStats: false,
  customThemes: false,
  cloudSync: false,
  exportData: true,
  prioritySupport: false,
  aiInsights: false,
  customReminders: false,
};

const PREMIUM_FEATURES: SubscriptionFeatures = {
  maxHabits: -1,
  unlimitedHabits: true,
  advancedStats: true,
  customThemes: true,
  cloudSync: true,
  exportData: true,
  prioritySupport: true,
  aiInsights: true,
  customReminders: true,
};

export const [SubscriptionProvider, useSubscription] = createContextHook<SubscriptionContextType>(() => {
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadSubscription = async () => {
      try {
        let stored = null;
        if (Platform.OS === 'web' && typeof Storage !== 'undefined') {
          stored = localStorage.getItem(STORAGE_KEY);
        } else {
          stored = await AsyncStorage.getItem(STORAGE_KEY);
        }
        
        if (stored && isMounted) {
          setTier(stored as SubscriptionTier);
        }
      } catch (error) {
        console.error('Failed to load subscription:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadSubscription();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const saveSubscription = async (newTier: SubscriptionTier) => {
    try {
      if (Platform.OS === 'web' && typeof Storage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newTier);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, newTier);
      }
      setTier(newTier);
    } catch (error) {
      console.error('Failed to save subscription:', error);
    }
  };

  const upgradeToPremium = useCallback(() => {
    saveSubscription('premium');
  }, []);

  const upgradeToLifetime = useCallback(() => {
    saveSubscription('lifetime');
  }, []);

  const isPremium = tier === 'premium' || tier === 'lifetime';
  const features = isPremium ? PREMIUM_FEATURES : FREE_FEATURES;

  const checkFeatureAccess = useCallback((feature: keyof SubscriptionFeatures): boolean => {
    return features[feature] as boolean;
  }, [features]);

  return {
    tier,
    isPremium,
    isLoading,
    features,
    upgradeToPremium,
    upgradeToLifetime,
    checkFeatureAccess,
  };
});
