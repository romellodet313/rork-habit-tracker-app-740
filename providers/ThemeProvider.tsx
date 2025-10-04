import { useState, useEffect, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, useColorScheme } from 'react-native';
import colors from "@/constants/colors";

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof colors.light;
}

const THEME_STORAGE_KEY = '@habitkit_theme';

export const [ThemeProvider, useTheme] = createContextHook<ThemeContextType>(() => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  
  const getEffectiveTheme = useCallback((mode: ThemeMode): 'light' | 'dark' => {
    if (mode === 'auto') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  }, [systemColorScheme]);

  const [theme, setTheme] = useState<'light' | 'dark'>(getEffectiveTheme('auto'));

  useEffect(() => {
    let isMounted = true;
    
    const loadTheme = async () => {
      try {
        let stored = null;
        if (Platform.OS === 'web' && typeof Storage !== 'undefined') {
          stored = localStorage.getItem(THEME_STORAGE_KEY);
        } else {
          stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        }
        
        if (stored && isMounted) {
          const mode = stored as ThemeMode;
          setThemeModeState(mode);
          setTheme(getEffectiveTheme(mode));
        }
      } catch (error) {
        console.error('[ThemeProvider] Failed to load theme:', error);
      }
    };
    
    loadTheme();
    
    return () => {
      isMounted = false;
    };
  }, [getEffectiveTheme]);

  useEffect(() => {
    setTheme(getEffectiveTheme(themeMode));
  }, [themeMode, systemColorScheme, getEffectiveTheme]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      if (Platform.OS === 'web' && typeof Storage !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
      } else {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      }
      setThemeModeState(mode);
      setTheme(getEffectiveTheme(mode));
    } catch (error) {
      console.error('[ThemeProvider] Failed to save theme:', error);
    }
  }, [getEffectiveTheme]);

  return {
    theme,
    themeMode,
    setThemeMode,
    colors: colors[theme],
  };
});
