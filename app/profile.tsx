import { ThemedText, ThemedView } from '@/components/themed-components';
import { useProfile } from '@/context/ProfileContext';
import { useUserStatus } from '@/context/UserStatusContext';
import { useImagePicker } from '@/hooks/use-image-picker';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setDemoAuth } from '../lib/demoAuth';
import { signOut } from '../lib/supabase';

const MENU_SECTIONS = [
  {
    title: 'Account',
    items: [
      { id: '1', label: 'Personal information', icon: 'person-outline', screen: null },
      { id: '2', label: 'Login & security', icon: 'shield-checkmark-outline', screen: null },
      { id: '3', label: 'Payments and payouts', icon: 'card-outline', screen: null },
      { id: '4', label: 'Notifications', icon: 'notifications-outline', screen: null },
    ],
  },
  {
    title: 'Support',
    items: [
      { id: '5', label: 'Get help', icon: 'help-circle-outline', screen: null },
      { id: '6', label: 'Give us feedback', icon: 'chatbubble-outline', screen: null },
    ],
  },
  {
    title: 'Legal',
    items: [
      { id: '7', label: 'Terms of Service', icon: 'document-text-outline', screen: null },
      { id: '8', label: 'Privacy Policy', icon: 'lock-closed-outline', screen: null },
    ],
  },
];

function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { profileImage, setProfileImage, userName } = useProfile();
  const { userStatus, accommodationOffers, simulateOffers, approvedAccommodation, resetToSearching } = useUserStatus();
  const { showImagePickerOptions } = useImagePicker();
  
  // Dynamic colors that adapt to system theme
  const iconColor = colors.icon;
  const textColor = colors.text;

  const handleLogout = async () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear demo auth
              setDemoAuth(false);
              // Sign out from Supabase
              await signOut();
              // Navigate to sign-in
              router.replace('/auth/sign-in');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out');
            }
          },
        },
      ]
    );
  };

  const handleDemoOffers = () => {
    Alert.alert(
      'Demo: Simulate Accommodation Offers',
      'This will simulate receiving multiple accommodation offers from different properties. You can then review and accept/decline them.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Offers!', onPress: async () => {
          try {
            await simulateOffers();
            Alert.alert(
              'Offers Received! 📧',
              `${userName}, you've received accommodation offers! Check your offers to review and respond.`,
              [{ 
                text: 'View Offers', 
                onPress: () => router.push('/accommodation-offers')
              }]
            );
          } catch {
            Alert.alert('Error', 'Failed to simulate offers');
          }
        }},
      ]
    );
  };

  const handleViewOffers = () => {
    router.push('/accommodation-offers');
  };

  const handleResetDemo = () => {
    Alert.alert(
      'Demo Reset',
      'Reset to searching phase? (This is just for demo purposes)',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetToSearching },
      ]
    );
  };

  const handleMenuPress = (label: string) => {
    switch (label) {
      case 'Personal information':
        router.push('/personal-information');
        break;
      case 'Payments and payouts':
        if (approvedAccommodation) {
          Alert.alert(
            'Payments & Payouts',
            `Monthly Rent: ${approvedAccommodation.price}\n\nMove-in Date: ${new Date(approvedAccommodation.moveInDate).toLocaleDateString()}\nLease End: ${new Date(approvedAccommodation.leaseEndDate).toLocaleDateString()}\n\nFull payments dashboard coming soon!`
          );
        } else {
          Alert.alert('Coming Soon', `${label} feature coming soon!`);
        }
        break;
      default:
        Alert.alert('Coming Soon', `${label} feature coming soon!`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.headerBar, { 
          borderBottomColor: colors.border,
        }]}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>Profile</ThemedText>
          <View style={styles.headerSpacer} />
        </View>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity style={styles.avatar} onPress={() => {
              showImagePickerOptions({
                onImageSelected: (uri) => setProfileImage(uri),
                onError: (error) => Alert.alert('Error', error || 'Unable to pick image')
              });
            }}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <Ionicons name="person" size={48} color={iconColor} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]} onPress={() => {
              showImagePickerOptions({
                onImageSelected: (uri) => setProfileImage(uri),
                onError: (error) => Alert.alert('Error', error || 'Unable to pick image')
              });
            }}>
              <Ionicons name="pencil" size={18} color="white" />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.name}>{userName}</ThemedText>
          <ThemedText style={styles.subtitle}>
            {approvedAccommodation ? `Room ${approvedAccommodation.roomNumber}` : 'Show profile'}
          </ThemedText>
        </View>

        {/* Menu Sections */}
        {MENU_SECTIONS.map((section, sectionIdx) => (
          <View key={sectionIdx} style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
            <View
              style={[
                styles.menuList,
                { 
                  backgroundColor: colors.cardBackground,
                  shadowColor: colors.shadow,
                  borderColor: colors.cardBorder,
                  shadowOpacity: colors.shadowOpacity,
                },
              ]}
            >
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    { borderBottomColor: colors.border },
                    itemIdx === section.items.length - 1 && styles.menuItemLast,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleMenuPress(item.label)}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={colors.iconSecondary}
                  />
                  <ThemedText
                    style={styles.menuLabel}
                    variant="default"
                  >
                    {item.label}
                  </ThemedText>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.iconSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Demo Section - Only show if user is searching */}
        {userStatus === 'searching' && (
          <>
            {accommodationOffers.length > 0 ? (
              <TouchableOpacity 
                style={[
                  styles.demoButton, 
                  { 
                    backgroundColor: colors.warning,
                  }
                ]} 
                onPress={handleViewOffers}
              >
                <Ionicons name="mail" size={20} color="#fff" style={styles.demoButtonIcon} />
                <ThemedText style={styles.demoButtonText}>
                  View Offers ({accommodationOffers.filter(o => o.status === 'pending').length})
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.demoButton, 
                  { 
                    backgroundColor: colors.success,
                  }
                ]} 
                onPress={handleDemoOffers}
              >
                <Ionicons name="flash" size={20} color="#fff" style={styles.demoButtonIcon} />
                <ThemedText style={styles.demoButtonText}>Get Demo Offers</ThemedText>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Demo Reset Button - Only show if user is approved/resident */}
        {(userStatus === 'approved' || userStatus === 'resident') && (
          <TouchableOpacity 
            style={[
              styles.demoButton, 
              { 
                backgroundColor: colors.error,
              }
            ]} 
            onPress={handleResetDemo}
          >
            <Ionicons name="refresh" size={20} color="#fff" style={styles.demoButtonIcon} />
            <ThemedText style={styles.demoButtonText}>Demo: Reset to Searching</ThemedText>
          </TouchableOpacity>
        )}

        {/* Logout Button */}
        <TouchableOpacity 
          style={[
            styles.logoutButton, 
            { 
              backgroundColor: colors.cardBackground,
              shadowColor: colors.shadow,
              shadowOpacity: colors.shadowOpacity,
              borderColor: colors.cardBorder,
            }
          ]} 
          onPress={handleLogout}
        >
          <ThemedText style={styles.logoutText} variant="error">Log out</ThemedText>
        </TouchableOpacity>

        {/* Version */}
        <ThemedText style={styles.version} variant="tertiary">Version 1.0.0</ThemedText>
      </ScrollView>
    </ThemedView>
  );

}

export default ProfileScreen;

// Reminder: Run 'npx expo install expo-image-picker' and 'npm install --save-dev @types/expo-image-picker' if you haven't already.
const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginHorizontal: -20,
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginRight: 28,
  },
  headerSpacer: {
    width: 28,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#e2e8f0',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  editButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  hostCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hostCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostCardText: {
    flex: 1,
    marginLeft: 16,
  },
  hostCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  hostCardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  menuList: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  demoButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  demoButtonIcon: {
    marginRight: 8,
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  logoutButton: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
  },
});