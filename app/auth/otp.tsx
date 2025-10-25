import { ThemedView } from '@/components/themed-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { setDemoAuth } from '../../lib/demoAuth';
import { verifyEmailOtp, verifyPhoneOtp } from '../../lib/supabase';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';

export default function OtpScreen() {
  const [otp, setOtp] = useState('');
  const [viaEmail, setViaEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const params = useLocalSearchParams();
  const router = useRouter();
  const phone = params.phone as string | undefined;
  const email = params.email as string | undefined;
  const via = (params.via as string) || undefined;

  // prefer via param if provided
  React.useEffect(() => {
    if (via === 'email') setViaEmail(true)
    if (via === 'phone') setViaEmail(false)
  }, [via])

  // Dummy auto-success for development/demo: automatically navigate to home
  // shortly after the screen mounts so you can bypass entering a real OTP.
  React.useEffect(() => {
    setIsLoading(true)
    const t = setTimeout(() => {
      // mark demo auth so the tabs layout considers us signed in for dev/demo
      try { setDemoAuth(true) } catch { /* ignore */ }
      console.log('[OTP] auto-success navigating to / (tabs)')
      router.replace('/(tabs)')
    }, 400)
    return () => clearTimeout(t)
  }, [router])

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>
        {viaEmail
          ? 'We have sent a 6-digit code to your email.'
          : 'We have sent a 6-digit code to your phone number.'}
      </Text>
      <CustomInput
        placeholder="Enter OTP"
        value={otp}
        setValue={setOtp}
        keyboardType="number-pad"
      />
      <CustomButton
        text="Verify"
        onPress={async () => {
          setIsLoading(true)
          try {
            if (viaEmail || email) {
              const targetEmail = email || ''
              const { error } = await verifyEmailOtp(targetEmail, otp)
              if (error) {
                Alert.alert('Error', (error as any)?.message || 'Invalid code')
                return
              }
              // success -> go to home
              router.replace('/(tabs)')
            } else {
              const targetPhone = phone || ''
              const { error } = await verifyPhoneOtp(targetPhone, otp)
              if (error) {
                Alert.alert('Error', (error as any)?.message || 'Invalid code')
                return
              }
              // success -> go to home
              router.replace('/(tabs)')
            }
          } finally {
            setIsLoading(false)
          }
        }}
        isLoading={isLoading}
      />
      <TouchableOpacity onPress={() => setViaEmail(!viaEmail)}>
        <Text style={styles.link}>
          {viaEmail
            ? 'Receive OTP via SMS instead'
            : 'Receive OTP via email instead'}
        </Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  link: {
    color: '#3B82F6',
    marginTop: 24,
    fontSize: 15,
    textAlign: 'center',
  },
});
