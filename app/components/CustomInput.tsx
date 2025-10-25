import { useTheme } from '@/hooks/use-theme';
import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface CustomInputProps {
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  isPassword?: boolean;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
}

const CustomInput = ({ value, setValue, placeholder, secureTextEntry, isPassword, keyboardType = 'default' }: CustomInputProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { 
      backgroundColor: colors.inputBackground, 
      borderColor: colors.inputBorder 
    }]}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        style={[styles.input, { color: colors.text }]}
        secureTextEntry={isPassword ? !isPasswordVisible : secureTextEntry}
        placeholderTextColor={colors.inputPlaceholder}
        autoCapitalize="none"
        keyboardType={keyboardType}
      />
      {isPassword && (
        <TouchableOpacity 
          style={styles.eyeButton}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <FontAwesome 
            name={isPasswordVisible ? "eye" : "eye-slash"} 
            size={20} 
            color={colors.icon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 0.5,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 10,
    marginRight: 5,
  },
});

export default CustomInput;