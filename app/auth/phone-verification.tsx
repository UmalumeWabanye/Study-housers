import { ThemedView } from '@/components/themed-view';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';
import { requestEmailOtp } from '../../lib/supabase';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';

export default function PhoneVerificationScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>('US');
  const [country, setCountry] = useState<Country | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [useEmail, setUseEmail] = useState(false);
  const [email, setEmail] = useState('');

  const handleRequestOtp = async () => {
    setIsLoading(true)
    try {
        if (useEmail) {
        if (!email || !email.includes('@')) {
          Alert.alert('Invalid email', 'Please enter a valid email address')
          return
        }
        // create a redirect URL that will open the app; the layout handler will consume
        // the magic link and set the Supabase session so the user lands on the home screen.
        const redirectTo = Linking.createURL('/')
        let { data, error } = await requestEmailOtp(email, redirectTo)
        console.log('requestEmailOtp result', data, error)
        if (error) {
          // If the error mentions redirect or URI, Supabase may have rejected
          // the app deep-link as an allowed redirect. Try falling back to the
          // default web magic link (call again without redirectTo) and inform the user.
          const msg = (error as any)?.message || ''
          if (/redirect|redirect_uri|redirect url|invalid redirect/i.test(msg)) {
            const fallback = await requestEmailOtp(email)
            console.log('fallback email request', fallback)
            Alert.alert(
              'Check your email',
              'We sent a sign-in link to your email. Your project did not accept the app deep-link, so the link will open in the browser. Open the link and it should offer to open the app.'
            )
            return
          }

          Alert.alert('Error', (error as any)?.message || 'Unable to send OTP')
          return
        }
        // For email magic links we instruct the user to check their inbox. The
        // magic link will open the app and the deep-link handler will complete
        // the sign-in and navigate to the home screen automatically.
        Alert.alert('Check your email', 'We sent a sign-in link to your email. Open it and tap the link to return to the app.')
        return
      } else {
        const fullPhone = `${country?.callingCode?.[0] || '1'}${phoneNumber.replace(/[^0-9]/g, '')}`
        console.log('[PhoneVerification] fullPhone', fullPhone)
        // DEV: dummy flow — skip real SMS provider and go straight to OTP screen
        // In production remove this and call `requestPhoneOtp(fullPhone)` instead.
        router.push(`/auth/otp?phone=${encodeURIComponent(fullPhone)}&via=phone`)
        // Android fallback: open app route directly if router.push doesn't take effect
        try {
          const Linking = await import('expo-linking');
          const url = Linking.createURL('/auth/otp', { queryParams: { phone: fullPhone, via: 'phone' } });
          console.log('[PhoneVerification] Linking fallback openURL', url)
          Linking.openURL(url).catch(() => {})
        } catch {
          // ignore
        }
      }
    } catch (e) {
      console.error(e)
      Alert.alert('Error', 'Unexpected error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter your phone</Text>
        <Text style={styles.subtitle}>You will receive a 4 digit code to verify your account</Text>

        <View style={styles.form}>
                    <View style={styles.phoneInputContainer}>
            <TouchableOpacity 
              style={styles.countryPickerButton}
              onPress={() => setShowPicker(true)}
            >
              <CountryPicker
                countryCode={countryCode}
                withFlag
                withCallingCode
                withFilter
                withAlphaFilter
                onSelect={(country) => {
                  setCountryCode(country.cca2);
                  setCountry(country);
                  setShowPicker(false);
                }}
                visible={showPicker}
              />
              <Text style={styles.countryCodeText}>
                +{country?.callingCode?.[0] || '1'}
              </Text>
            </TouchableOpacity>

            <View style={styles.phoneInputWrapper}>
              <CustomInput
                placeholder="Phone number"
                value={phoneNumber}
                setValue={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {useEmail ? (
            <>
              <CustomInput
                placeholder="Email address"
                value={email}
                setValue={setEmail}
                keyboardType="email-address"
              />
              <CustomButton text="Send code" onPress={handleRequestOtp} isLoading={isLoading} />
              <TouchableOpacity onPress={() => setUseEmail(false)} style={{ marginTop: 12 }}>
                <Text style={{ color: '#0a84ff', textAlign: 'center' }}>Use phone instead</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <CustomButton text="Continue" onPress={handleRequestOtp} isLoading={isLoading} />
              <TouchableOpacity onPress={() => setUseEmail(true)} style={{ marginTop: 12 }}>
                <Text style={{ color: '#0a84ff', textAlign: 'center' }}>Use email instead</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginVertical: 20,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#DDD',
    paddingHorizontal: 16,
    height: 52, // Match CustomInput height
    minWidth: 100,
  },
  countryCodeText: {
    fontSize: 16,
    marginLeft: 5,
  },
  phoneInputWrapper: {
    flex: 1,
  },
});