import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { setDemoAuth } from '../../lib/demoAuth';
import { signInWithGoogle } from '../../lib/supabase';

const SocialSignInButtons = () => {
  const onSignInApple = () => {
    if (__DEV__) {
      try { setDemoAuth(true) } catch {}
      router.replace('/(tabs)')
      return
    }
    console.warn('Sign in with Apple');
  };

  const onSignInGoogle = () => {
    if (__DEV__) {
      try { setDemoAuth(true) } catch {}
      router.replace('/(tabs)')
      return
    }
    (async () => {
      try {
        const { data, error } = await signInWithGoogle();
        if (error) {
          Alert.alert('Error', (error as any)?.message || 'Unable to sign in with Google');
          return;
        }
        // On web or some setups the helper returns a URL to open
        // If so, open it in the browser. Otherwise OAuth should have opened.
        const url = (data as any)?.url;
        if (url) {
          Linking.openURL(url).catch(() => {
            Alert.alert('Open URL', 'Unable to open the authentication URL');
          });
        }
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Unexpected error during Google sign-in');
      }
    })();
  };

  const onSignInFacebook = () => {
    if (__DEV__) {
      try { setDemoAuth(true) } catch {}
      router.replace('/(tabs)')
      return
    }
    console.warn('Sign in with Facebook');
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: '#e3e3e3' }]}
          onPress={onSignInApple}>
          <FontAwesome name="apple" size={24} color="#000000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: '#FAE9EA' }]}
          onPress={onSignInGoogle}>
          <FontAwesome name="google" size={24} color="#DD4D44" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: '#E7EAF4' }]}
          onPress={onSignInFacebook}>
          <FontAwesome name="facebook" size={24} color="#4765A9" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default SocialSignInButtons;