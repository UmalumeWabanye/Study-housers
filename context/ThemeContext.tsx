/**
 * Theme Context for Accommodation App
 * Provides theme state management with system preference detection and user override capability
 */

import { DarkTheme, LightTheme } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';
type Theme = typeof LightTheme;

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  colorScheme: 'light' | 'dark';
  isDark: boolean;
  isLight: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  colors: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@accommodation_app_theme_mode';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Determine the active color scheme based on theme mode and system preference
  const activeColorScheme: 'light' | 'dark' = 
    themeMode === 'system' 
      ? (systemColorScheme === 'dark' ? 'dark' : 'light')
      : themeMode === 'dark' 
        ? 'dark' 
        : 'light';

  const theme = activeColorScheme === 'dark' ? DarkTheme : LightTheme;
  const isDark = activeColorScheme === 'dark';
  const isLight = activeColorScheme === 'light';

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedThemeMode && ['light', 'dark', 'system'].includes(savedThemeMode)) {
          setThemeModeState(savedThemeMode as ThemeMode);
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Listen to system color scheme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  // Function to set theme mode with persistence
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    colorScheme: activeColorScheme,
    isDark,
    isLight,
    setThemeMode,
    colors: theme, // Alias for easier access
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for getting theme-aware styles
export function useThemedStyles() {
  const { colors } = useTheme();

  return {
    // Container styles
    container: {
      backgroundColor: colors.background,
    },
    surface: {
      backgroundColor: colors.surface,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.cardBorder,
      borderWidth: 1,
      borderRadius: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: colors.shadowOpacity,
      shadowRadius: 8,
      elevation: colors.elevation,
    },
    
    // Input styles
    input: {
      backgroundColor: colors.inputBackground,
      borderColor: colors.inputBorder,
      borderWidth: 1,
      borderRadius: 8,
      color: colors.text,
    },
    inputFocused: {
      borderColor: colors.inputFocused,
      borderWidth: 2,
    },
    
    // Button styles
    buttonPrimary: {
      backgroundColor: colors.buttonPrimary,
    },
    buttonSecondary: {
      backgroundColor: colors.buttonSecondary,
    },
    buttonAccent: {
      backgroundColor: colors.buttonAccent,
    },
    
    // Text styles
    text: {
      color: colors.text,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    textTertiary: {
      color: colors.textTertiary,
    },
    
    // Separator/border styles
    separator: {
      backgroundColor: colors.outline,
    },
    border: {
      borderColor: colors.border,
    },
  };
}