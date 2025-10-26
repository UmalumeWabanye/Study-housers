import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useTheme } from '@/context/ThemeContext';
import { useUserStatus } from '@/context/UserStatusContext';
import { Ionicons } from '@expo/vector-icons';
import { isDemoAuth, setDemoAuth } from '../../lib/demoAuth';
import { getUser, onAuthStateChange } from '../../lib/supabase';

export default function TabLayout() {
  const { theme } = useTheme();
  const { userStatus } = useUserStatus();
  const router = useRouter();
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    let sub: any;
    async function check() {
      setChecking(true);
      const { data, error } = await getUser();
      // If Supabase has no user, allow an in-memory demo auth flag to pass
      // during development/demo scenarios.
      if (error || !data?.user) {
        if (!isDemoAuth()) {
          // Not signed in -> redirect to auth
          router.replace('/auth/sign-in');
        }
      }
      setChecking(false);
      // subscribe to future auth changes (logout/login)
      sub = onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          // clear demo flag on sign-out
          try { setDemoAuth(false) } catch {}
          router.replace('/auth/sign-in');
        }
        if (event === 'SIGNED_IN') {
          router.replace('/(tabs)');
        }
      });
    }
    check();
    return () => {
      if (sub && typeof sub === 'object' && typeof sub.data?.subscription?.unsubscribe === 'function') {
        // supabase client returns an object; try to unsubscribe safely
        try {
          // @ts-ignore
          sub.data.subscription.unsubscribe();
        } catch {
          // ignore
        }
      }
    };
  }, [router]);

  if (checking) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  // For approved/resident users, show different tab structure
  if (userStatus === 'approved' || userStatus === 'resident') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarStyle: {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={28}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="news-feed"
          options={{
            title: 'News',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'newspaper' : 'newspaper-outline'}
                size={28}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="transportation"
          options={{
            title: 'Transport',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'bus' : 'bus-outline'}
                size={28}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="access-card"
          options={{
            title: 'Access',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'key' : 'key-outline'}
                size={28}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Support',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
                size={28}
                color={color}
              />
            ),
          }}
        />
        {/* Hide searching-only tab for approved users */}
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
      </Tabs>
    );
  }

  // For searching users, show original tab structure
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Applications',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'document' : 'document-outline'}
              size={28}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={28}
              color={color}
            />
          ),
        }}
      />
      {/* Hide Phase 2 tabs for searching users */}
      <Tabs.Screen
        name="news-feed"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="transportation"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="access-card"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
