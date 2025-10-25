/**
 * Accommodation App Theme System
 * Comprehensive color palette supporting light mode, dark mode, and automatic system preference detection
 */

import { Platform } from 'react-native';

// Modern, aesthetically pleasing theme inspired by 2025 design trends
export const LightTheme = {
  // Primary Brand Colors - Sophisticated blue palette
  primary: '#2563EB',        // Modern vibrant blue
  accent: '#F59E0B',         // Warm amber accent
  secondary: '#8B5CF6',      // Elegant purple secondary
  
  // Background Colors - Warm, layered surfaces
  background: '#FEFEFE',     // Slightly warm white
  surface: '#F8FAFC',       // Soft gray-blue surface
  surfaceVariant: '#F1F5F9', // Deeper surface variant
  
  // Text Colors - Rich, readable hierarchy
  text: '#0F172A',          // Rich dark blue-gray
  textSecondary: '#475569',  // Medium slate
  textTertiary: '#64748B',   // Light slate
  textDisabled: '#CBD5E1',   // Very light slate
  
  // Border and Outline Colors - Subtle, modern
  border: '#E2E8F0',        // Soft border
  outline: '#CBD5E1',       // Subtle outline
  outlineVariant: '#F1F5F9', // Ultra-light outline
  
  // Interactive Colors
  icon: '#64748B',          // Balanced icon color
  iconSecondary: '#94A3B8',  // Lighter icon variant
  tint: '#2563EB',          // Primary tint
  
  // Tab Navigation - Clean, modern
  tabIconDefault: '#94A3B8',
  tabIconSelected: '#2563EB',
  tabBackground: '#FEFEFE',
  
  // Input Colors - Glass-morphism inspired
  inputBackground: '#FFFFFF',
  inputBorder: '#E2E8F0',
  inputPlaceholder: '#94A3B8',
  inputFocused: '#2563EB',
  
  // Card Colors - Subtle elevation
  cardBackground: '#FFFFFF',
  cardBorder: '#F1F5F9',
  
  // Button Colors - Modern, accessible
  buttonPrimary: '#2563EB',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondary: '#F8FAFC',
  buttonSecondaryText: '#475569',
  buttonAccent: '#F59E0B',
  buttonAccentText: '#FFFFFF',
  
  // Semantic Colors - Modern, accessible palette
  success: '#059669',       // Modern green
  successText: '#FFFFFF',
  warning: '#D97706',       // Warm orange
  warningText: '#FFFFFF',
  error: '#DC2626',         // Clean red
  errorText: '#FFFFFF',
  info: '#0891B2',          // Fresh cyan
  infoText: '#FFFFFF',
  
  // Shadow and Elevation - Soft, natural
  shadow: '#1E293B',
  shadowOpacity: 0.08,
  elevation: 3,
};

export const DarkTheme = {
  // Primary Brand Colors - Refined dark mode palette
  primary: '#3B82F6',        // Brighter blue for dark mode
  accent: '#FBBF24',         // Warm amber, slightly lighter
  secondary: '#A78BFA',      // Lighter purple for better contrast
  
  // Background Colors - Rich, layered dark surfaces
  background: '#0F172A',     // Deep slate background
  surface: '#1E293B',       // Rich surface layer  
  surfaceVariant: '#334155', // Elevated surface variant
  
  // Text Colors - Crisp, readable dark mode hierarchy
  text: '#F8FAFC',          // Clean white text
  textSecondary: '#CBD5E1',  // Light gray text
  textTertiary: '#94A3B8',   // Medium gray text
  textDisabled: '#64748B',   // Muted gray
  
  // Border and Outline Colors - Sophisticated dark borders
  border: '#334155',        // Subtle dark border
  outline: '#475569',       // Medium contrast outline
  outlineVariant: '#1E293B', // Low contrast outline
  
  // Interactive Colors
  icon: '#CBD5E1',          // Clear icon color
  iconSecondary: '#94A3B8',  // Secondary icon color
  tint: '#3B82F6',          // Primary tint
  
  // Tab Navigation - Modern dark navigation
  tabIconDefault: '#94A3B8',
  tabIconSelected: '#3B82F6',
  tabBackground: '#1E293B',
  
  // Input Colors - Glass-morphism dark variant
  inputBackground: '#1E293B',
  inputBorder: '#334155',
  inputPlaceholder: '#64748B',
  inputFocused: '#3B82F6',
  
  // Card Colors - Elevated dark surfaces
  cardBackground: '#1E293B',
  cardBorder: '#334155',
  
  // Button Colors - High contrast, accessible
  buttonPrimary: '#3B82F6',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondary: '#334155',
  buttonSecondaryText: '#F8FAFC',
  buttonAccent: '#FBBF24',
  buttonAccentText: '#0F172A',
  
  // Semantic Colors - Refined dark mode semantics
  success: '#10B981',       // Vibrant green for dark
  successText: '#FFFFFF',
  warning: '#F59E0B',       // Bright amber warning
  warningText: '#FFFFFF',
  error: '#EF4444',         // Clean red for dark
  errorText: '#FFFFFF',
  info: '#06B6D4',          // Bright cyan
  infoText: '#FFFFFF',
  
  // Shadow and Elevation - Rich dark shadows
  shadow: '#000000',
  shadowOpacity: 0.25,
  elevation: 6,
};

// Legacy Colors object for backward compatibility
export const Colors = {
  light: LightTheme,
  dark: DarkTheme,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
