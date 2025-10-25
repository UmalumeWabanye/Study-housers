import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import SocialSignInButtons from '../components/SocialSignInButtons';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onSignUpPress = () => {
    router.push('/auth/phone-verification');
  };

  const onSignInPress = () => {
    router.push('/auth/sign-in');
  };

  return (
    <ThemedView style={styles.container}>
      {/* Logo removed as requested */}
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        <View style={styles.form}>
          <CustomInput
            placeholder="Email address"
            value={email}
            setValue={setEmail}
          />
          <CustomInput
            placeholder="Password"
            value={password}
            setValue={setPassword}
            isPassword
          />
          <CustomInput
            placeholder="Confirm Password"
            value={confirmPassword}
            setValue={setConfirmPassword}
            isPassword
          />

          <CustomButton
            text="Sign Up"
            onPress={onSignUpPress}
          />
        </View>

        <TouchableOpacity onPress={() => router.push('/auth/phone-verification')}>
          <Text style={styles.phoneLink}>Sign up with phone number</Text>
        </TouchableOpacity>

        <CustomButton
          text="Already have an account? Sign in"
          onPress={onSignInPress}
          type="TERTIARY"
        />

        <SocialSignInButtons />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Logo styles removed
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 50,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
  },
  form: {
    width: '100%',
    marginVertical: 20,
  },
  phoneLink: {
    color: '#3B82F6',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 10,
  },
});