import { ThemedText, ThemedView } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { setDemoAuth } from '../../lib/demoAuth';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import SocialSignInButtons from '../components/SocialSignInButtons';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const { colors } = useTheme();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSignIn = async () => {
    if (!validateEmail(email) || !validatePassword(password)) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
  // On successful sign-in go straight to the app home (not phone verification)
  // mark demo auth for the auth guard so the tabs layout accepts this session
  try { setDemoAuth(true) } catch {}
  console.log('[SignIn] navigating to / (tabs) - platform:',
    typeof navigator !== 'undefined' ? (navigator as any).product : 'unknown')
  router.replace('/(tabs)');
  // Android fallback: attempt to open the app route via Linking if router fails
  try {
    const Linking = await import('expo-linking');
    const url = Linking.createURL('/');
    console.log('[SignIn] Linking fallback openURL', url);
    // don't await - it's a fallback
    Linking.openURL(url).catch(() => {});
  } catch {
    // ignore
  }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Logo removed as requested */}
      <View style={styles.content}>
        <ThemedText variant="title" style={styles.title}>Welcome back!</ThemedText>
        <ThemedText variant="secondary" style={styles.subtitle}>Sign in to your account</ThemedText>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <CustomInput
              placeholder="Email address"
              value={email}
              setValue={(text) => {
                setEmail(text);
                validateEmail(text);
              }}
            />
            {emailError ? <ThemedText variant="error" style={styles.errorText}>{emailError}</ThemedText> : null}
          </View>


          <View style={styles.inputContainer}>
            <CustomInput
              placeholder="Password"
              value={password}
              setValue={setPassword}
              isPassword
            />
            {passwordError ? <ThemedText variant="error" style={styles.errorText}>{passwordError}</ThemedText> : null}
            <TouchableOpacity onPress={() => router.push('/auth/otp')}>
              <ThemedText style={[styles.forgotPasswordLink, { color: colors.primary }]}>Forgot password?</ThemedText>
            </TouchableOpacity>
          </View>

          <CustomButton
            text="Continue"
            onPress={handleSignIn}
            isLoading={isLoading}
          />
        </View>

        <View style={styles.footer}>
          <CustomButton
            text="Don't have an account? Sign up"
            onPress={() => router.push('/auth/sign-up')}
            type="TERTIARY"
          />

          <ThemedText variant="secondary" style={styles.orText}>or continue with</ThemedText>
          
          <SocialSignInButtons />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  forgotPasswordLink: {
    fontSize: 15,
    marginTop: 8,
    marginBottom: 2,
    alignSelf: 'flex-end',
  },
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
    marginBottom: 10,
    marginTop: 50,
  },
  subtitle: {
    marginBottom: 30,
  },
  form: {
    width: '100%',
    marginVertical: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  footer: {
    width: '100%',
    marginTop: 20,
  },
  orText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
  },
});