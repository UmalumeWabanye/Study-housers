import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Alert, Linking } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ProfileProvider } from '@/context/ProfileContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { UserStatusProvider } from '@/context/UserStatusContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '../lib/supabase';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  React.useEffect(() => {
    let mounted = true;

    async function handleUrl(url?: string | null) {
      if (!url || !mounted) return;
      try {
        // Parse fragment or query params from the incoming URL and, if an
        // access_token is present, set the Supabase session directly.
        const parts = url.split('#');
        const fragment = parts[1] || '';
        const query = (new URL(url, 'http://localhost')).search || '';
        const params = new URLSearchParams(fragment || query);
        const access_token = params.get('access_token') || params.get('accessToken');
        const refresh_token = params.get('refresh_token') || params.get('refreshToken');

        if (access_token) {
          try {
            // set session so Supabase client is aware of the authenticated user
            // supabase.auth.setSession expects an object { access_token, refresh_token }
            if (typeof supabase?.auth?.setSession === 'function') {
              await (supabase.auth as any).setSession({ access_token, refresh_token });
            }
            router.replace('/(tabs)');
            Alert.alert('Welcome', 'You are signed in');
            return;
          } catch (e) {
            console.warn('Failed to set Supabase session from URL', e);
          }
        }

        // Fallback: if the URL contains keywords that indicate a magic link, navigate home
        if (url.includes('type=magiclink') || url.includes('token')) {
          router.replace('/(tabs)');
        }
      } catch (e) {
        console.warn('Error handling deep link', e);
      }
    }

    // handle initial URL (cold start)
    Linking.getInitialURL().then((initial) => handleUrl(initial)).catch(() => {});

    const sub = Linking.addEventListener('url', (ev) => {
      handleUrl(ev.url).catch(() => {});
    });

    return () => {
      mounted = false;
      try {
        // RN >= 0.65 uses remove
        // @ts-ignore
        sub?.remove && sub.remove();
      } catch {
        // ignore
      }
    };
  }, [router]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ProfileProvider>
          <UserStatusProvider>
            <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              </Stack>
            </NavigationThemeProvider>
          </UserStatusProvider>
        </ProfileProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
