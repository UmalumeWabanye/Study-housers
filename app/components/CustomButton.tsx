import { useTheme } from '@/hooks/use-theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface CustomButtonProps {
  onPress: () => void;
  text: string;
  type?: 'PRIMARY' | 'SECONDARY' | 'TERTIARY';
  bgColor?: string;
  fgColor?: string;
  isLoading?: boolean;
}

const CustomButton = ({ 
  onPress, 
  text, 
  type = 'PRIMARY', 
  bgColor, 
  fgColor,
  isLoading 
}: CustomButtonProps) => {
  const { colors } = useTheme();
  
  const getButtonColor = () => {
    if (bgColor) return bgColor;
    switch (type) {
      case 'PRIMARY': return colors.buttonPrimary;
      case 'SECONDARY': return colors.buttonSecondary;
      default: return 'transparent';
    }
  };

  const getTextColor = () => {
    if (fgColor) return fgColor;
    switch (type) {
      case 'PRIMARY': return '#ffffff';
      case 'SECONDARY': return colors.text;
      case 'TERTIARY': return colors.textSecondary;
      default: return colors.text;
    }
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      style={[
        styles.container,
        { 
          backgroundColor: getButtonColor(),
          borderColor: type === 'SECONDARY' ? colors.outline : undefined,
          borderWidth: type === 'SECONDARY' ? 2 : 0,
        },
        isLoading && styles.container_disabled
      ]}>
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor() }
          ]}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 15,
    marginVertical: 5,
    alignItems: 'center',
    borderRadius: 10,
  },
  container_disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CustomButton;