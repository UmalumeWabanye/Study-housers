import { ThemedText } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

interface Props {
  onClose: () => void;
}

const SuccessScreen: React.FC<Props> = ({ onClose }) => {
  const { colors } = useTheme();
  const scaleAnim = useMemo(() => new Animated.Value(0), []);
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    // Animate success icon
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade in content
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // Auto-close after 3 seconds and redirect to applications
    const timer = setTimeout(() => {
      onClose();
      router.push('/(tabs)/explore');
    }, 3000);

    return () => clearTimeout(timer);
  }, [scaleAnim, fadeAnim, onClose]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              backgroundColor: colors.success,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Ionicons name="checkmark" size={48} color="#fff" />
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <ThemedText style={styles.title}>Application Submitted!</ThemedText>
          
          <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
            Thank you for your application. We&apos;ve received your information and will review it shortly.
          </ThemedText>

          <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
              You&apos;ll receive a confirmation email within 24 hours with next steps and application status updates.
            </ThemedText>
          </View>

          <TouchableOpacity
            style={[styles.doneButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              onClose();
              router.push('/(tabs)/explore');
            }}
          >
            <ThemedText style={styles.doneButtonText}>View Applications</ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  doneButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 120,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});