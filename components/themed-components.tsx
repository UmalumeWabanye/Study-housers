/**
 * Enhanced themed components that automatically adapt to system theme
 */

import { useTheme, useThemedStyles } from '@/hooks/use-theme';
import React from 'react';
import { Text, TextInput, TextInputProps, TextProps, TouchableOpacity, TouchableOpacityProps, View, ViewProps } from 'react-native';

// Enhanced ThemedView with automatic styling
export type ThemedViewProps = ViewProps & {
  variant?: 'default' | 'surface' | 'card';
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ 
  style, 
  variant = 'default',
  lightColor, 
  darkColor, 
  ...otherProps 
}: ThemedViewProps) {
  const { colors, colorScheme } = useTheme();
  const themedStyles = useThemedStyles();
  
  const backgroundColor = lightColor && darkColor 
    ? (colorScheme === 'light' ? lightColor : darkColor)
    : variant === 'surface' 
      ? colors.surface
      : variant === 'card'
        ? colors.cardBackground
        : colors.background;

  const variantStyle = variant === 'card' ? {
    ...themedStyles.card,
    shadowColor: colors.shadow,
    shadowOpacity: colors.shadowOpacity,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: colors.elevation,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
  } : {};

  return (
    <View 
      style={[
        { backgroundColor }, 
        variantStyle,
        style
      ]} 
      {...otherProps} 
    />
  );
}

// Enhanced ThemedText with more variants
export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'secondary' | 'tertiary' | 'title' | 'subtitle' | 'caption' | 'error' | 'success';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  variant = 'default',
  ...rest
}: ThemedTextProps) {
  const { colors, colorScheme } = useTheme();

  const getColorForVariant = () => {
    if (lightColor && darkColor) {
      return colorScheme === 'light' ? lightColor : darkColor;
    }
    
    switch (variant) {
      case 'secondary': return colors.textSecondary;
      case 'tertiary': return colors.textTertiary;
      case 'error': return colors.error;
      case 'success': return colors.success;
      default: return colors.text;
    }
  };

  const getStyleForVariant = () => {
    switch (variant) {
      case 'title': 
        return { fontSize: 24, fontWeight: 'bold' as const, lineHeight: 32 };
      case 'subtitle': 
        return { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 };
      case 'caption': 
        return { fontSize: 12, lineHeight: 16 };
      default: 
        return { fontSize: 16, lineHeight: 24 };
    }
  };

  return (
    <Text
      style={[
        { color: getColorForVariant() },
        getStyleForVariant(),
        style,
      ]}
      {...rest}
    />
  );
}

// Enhanced ThemedButton
export type ThemedButtonProps = TouchableOpacityProps & {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  title: string;
};

export function ThemedButton({
  style,
  variant = 'primary',
  size = 'medium',
  title,
  disabled,
  ...rest
}: ThemedButtonProps) {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.textDisabled;
    switch (variant) {
      case 'primary': return colors.buttonPrimary;
      case 'secondary': return colors.buttonSecondary;
      case 'success': return colors.success;
      case 'danger': return colors.error;
      case 'ghost': return 'transparent';
      default: return colors.buttonPrimary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textTertiary;
    switch (variant) {
      case 'primary': return colors.buttonPrimaryText;
      case 'secondary': return colors.buttonSecondaryText;
      case 'success': return colors.successText;
      case 'danger': return colors.errorText;
      case 'ghost': return colors.primary;
      default: return colors.buttonPrimaryText;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small': return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'large': return { paddingVertical: 16, paddingHorizontal: 32 };
      default: return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.6 : 1,
          shadowColor: variant === 'primary' && !disabled ? colors.primary : colors.shadow,
          shadowOpacity: variant === 'primary' && !disabled ? 0.2 : colors.shadowOpacity,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,
          elevation: variant === 'primary' && !disabled ? 3 : 1,
        },
        getSizeStyles(),
        variant === 'ghost' && { 
          borderWidth: 1.5, 
          borderColor: colors.primary,
          backgroundColor: 'transparent'
        },
        style,
      ]}
      disabled={disabled}
      {...rest}
    >
      <ThemedText 
        style={{ 
          color: getTextColor(), 
          fontWeight: '600',
          fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
          letterSpacing: 0.3,
        }}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
}

// Enhanced ThemedTextInput
export type ThemedTextInputProps = TextInputProps & {
  variant?: 'default' | 'outlined' | 'filled';
};

export function ThemedTextInput({
  style,
  variant = 'default',
  ...rest
}: ThemedTextInputProps) {
  const { colors } = useTheme();

  const getVariantStyles = () => {
    const baseStyle = {
      color: colors.text,
      fontSize: 16,
      padding: 12,
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1.5,
          borderColor: colors.inputBorder,
          borderRadius: 12,
          backgroundColor: 'transparent',
          paddingHorizontal: 16,
          paddingVertical: 14,
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: colors.inputBackground,
          borderRadius: 12,
          borderWidth: 0,
          paddingHorizontal: 16,
          paddingVertical: 14,
          shadowColor: colors.shadow,
          shadowOpacity: colors.shadowOpacity * 0.5,
          shadowOffset: { width: 0, height: 1 },
          shadowRadius: 4,
          elevation: 1,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: colors.inputBackground,
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
        };
    }
  };

  return (
    <TextInput
      style={[getVariantStyles(), style]}
      placeholderTextColor={colors.inputPlaceholder}
      {...rest}
    />
  );
}