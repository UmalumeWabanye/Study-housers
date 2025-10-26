import { ThemedText, ThemedView } from '@/components/themed-components';
import { useProfile } from '@/context/ProfileContext';
import { useUserStatus } from '@/context/UserStatusContext';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  {
    id: '1',
    title: 'Access Card',
    icon: 'key',
    route: '/access-card',
    color: '#3B82F6',
    description: 'Digital key to your room'
  },
  {
    id: '2',
    title: 'Transportation',
    icon: 'bus',
    route: '/transportation',
    color: '#10B981',
    description: 'Campus shuttle times'
  },
  {
    id: '3',
    title: 'Maintenance',
    icon: 'construct',
    route: '/maintenance-request',
    color: '#F59E0B',
    description: 'Report issues'
  },
  {
    id: '4',
    title: 'House Rules',
    icon: 'document-text',
    route: '/house-rules',
    color: '#8B5CF6',
    description: 'Community guidelines'
  },
];

// Generate announcements based on accommodation
const getAnnouncements = (accommodation: any) => {
  const universityShort = accommodation.university.split(' ').map((word: string) => word.charAt(0)).join('');
  
  return [
    {
      id: '1',
      title: `Welcome to ${accommodation.propertyName}!`,
      message: `Your room ${accommodation.roomNumber} is ready. Please collect your physical key from reception during office hours (8 AM - 5 PM).`,
      time: '2 hours ago',
      type: 'welcome',
      urgent: false,
    },
    {
      id: '2',
      title: 'WiFi Network Update',
      message: `New WiFi password for ${universityShort}-Student network: ${universityShort}2025!Student. Update your devices by tomorrow.`,
      time: '5 hours ago',
      type: 'info',
      urgent: true,
    },
    {
      id: '3',
      title: 'Study Lounge Maintenance',
      message: 'The study lounge will be closed for deep cleaning on Monday, 28 Oct from 9 AM - 2 PM.',
      time: '1 day ago',
      type: 'maintenance',
      urgent: false,
    },
  ];
};

export default function ApprovedHomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { profileImage, userName } = useProfile();
  const { approvedAccommodation, isFirstTimeAccess, markAsReturningUser } = useUserStatus();
  const [showResidenceCard, setShowResidenceCard] = useState(true);

  // Generate dynamic announcements based on accommodation
  const announcements = approvedAccommodation ? getAnnouncements(approvedAccommodation) : [];

  // Mark as returning user after component mounts (first visit logged)
  useEffect(() => {
    console.log('ApprovedHome: isFirstTimeAccess =', isFirstTimeAccess);
    if (isFirstTimeAccess) {
      // Give user 2 seconds to see the welcome message before marking as returning
      const timer = setTimeout(() => {
        console.log('ApprovedHome: Marking as returning user');
        markAsReturningUser();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isFirstTimeAccess, markAsReturningUser]);

  // Auto-fade residence card after 40 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResidenceCard(false);
    }, 40000); // 40 seconds = 40,000 ms

    return () => clearTimeout(timer);
  }, []);

  if (!approvedAccommodation) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText>No approved accommodation found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const handleQuickAction = (route: string) => {
    if (route.startsWith('/')) {
      router.push(route as any);
    }
  };

  const handleEmergencyContact = (phone: string, name: string) => {
    Alert.alert(
      `Call ${name}`,
      `Are you sure you want to call ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {
          // In real app, would use Linking.openURL(`tel:${phone}`)
          Alert.alert('Calling...', `Dialing ${phone}`);
        }},
      ]
    );
  };



  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.welcomeSection}>
            <ThemedText variant="secondary" style={styles.welcomeText}>
              {isFirstTimeAccess ? 'Welcome,' : 'Welcome back,'}
            </ThemedText>
            <ThemedText style={styles.welcomeTitle}>
              {userName} 👋
            </ThemedText>
            <ThemedText variant="tertiary" style={styles.venueText}>
              {approvedAccommodation.propertyName}
            </ThemedText>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push('/profile')}
            style={styles.profileButton}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.surface }]}>
                <Ionicons name="person" size={24} color={colors.iconSecondary} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Property Info Card - Auto-fades after 40 seconds */}
        {showResidenceCard && (
          <View style={[styles.propertyCard, { 
            backgroundColor: colors.cardBackground,
            borderColor: colors.cardBorder,
            shadowColor: colors.shadow,
            shadowOpacity: colors.shadowOpacity,
          }]}>
            <View style={styles.propertyHeader}>
              <View style={styles.propertyInfo}>
                <ThemedText style={styles.propertyName}>
                  {approvedAccommodation.propertyName}
                </ThemedText>
                <ThemedText variant="secondary" style={styles.propertyAddress}>
                  {approvedAccommodation.address}
                </ThemedText>
                <ThemedText variant="tertiary" style={styles.propertyDetails}>
                  Room {approvedAccommodation.roomNumber}
                </ThemedText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.success }]}>
                <ThemedText style={styles.statusText}>Approved</ThemedText>
              </View>
            </View>
            
            <View style={styles.moveInInfo}>
              <View style={styles.moveInDate}>
                <Ionicons name="calendar-outline" size={16} color={colors.iconSecondary} />
                <ThemedText variant="secondary" style={styles.moveInText}>
                  Move-in: {new Date(approvedAccommodation.moveInDate).toLocaleDateString()}
                </ThemedText>
              </View>
              <View style={styles.leaseEnd}>
                <Ionicons name="time-outline" size={16} color={colors.iconSecondary} />
                <ThemedText variant="secondary" style={styles.leaseText}>
                  Lease ends: {new Date(approvedAccommodation.leaseEndDate).toLocaleDateString()}
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.cardBorder,
                }]}
                onPress={() => handleQuickAction(action.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <ThemedText style={styles.actionTitle}>{action.title}</ThemedText>
                <ThemedText variant="tertiary" style={styles.actionDescription}>
                  {action.description}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Announcements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Announcements</ThemedText>
            <TouchableOpacity onPress={() => router.push('/news-feed')}>
              <ThemedText style={[styles.seeAllText, { color: colors.primary }]}>
                See All
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.announcementsScrollContainer}
            style={styles.announcementsScroll}
          >
            {announcements.map((announcement) => (
              <TouchableOpacity
                key={announcement.id}
                style={[styles.announcementCard, {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.cardBorder,
                  shadowColor: colors.shadow,
                  shadowOpacity: colors.shadowOpacity,
                }]}
                onPress={() => router.push('/news-feed')}
              >
                <View style={styles.announcementHeader}>
                  <ThemedText style={styles.announcementTitle} numberOfLines={2}>
                    {announcement.title}
                  </ThemedText>
                  <ThemedText variant="tertiary" style={styles.announcementTime}>
                    {announcement.time}
                  </ThemedText>
                </View>
                <ThemedText variant="secondary" style={styles.announcementMessage} numberOfLines={3}>
                  {announcement.message}
                </ThemedText>
                {announcement.urgent && (
                  <View style={[styles.urgentBadge, { backgroundColor: colors.warning }]}>
                    <ThemedText style={styles.urgentText}>Urgent</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Emergency Contacts</ThemedText>
          <View style={styles.emergencyContacts}>
            {approvedAccommodation.emergencyContacts.map((contact, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.contactCard, {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.cardBorder,
                }]}
                onPress={() => handleEmergencyContact(contact.phone, contact.name)}
              >
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactName}>{contact.name}</ThemedText>
                  <ThemedText variant="secondary" style={styles.contactRole}>
                    {contact.role}
                  </ThemedText>
                  <ThemedText variant="tertiary" style={styles.contactPhone}>
                    {contact.phone}
                  </ThemedText>
                </View>
                <MaterialIcons name="phone" size={24} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
    marginBottom: 24,
    borderBottomWidth: 1,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  venueText: {
    fontSize: 14,
  },
  profileButton: {
    marginLeft: 16,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  profileImagePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  propertyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  propertyDetails: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  moveInInfo: {
    flexDirection: 'column',
    gap: 12,
  },
  moveInDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  leaseEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  moveInText: {
    fontSize: 13,
    flex: 1,
    flexWrap: 'wrap',
  },
  leaseText: {
    fontSize: 13,
    flex: 1,
    flexWrap: 'wrap',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  announcementsScroll: {
    marginHorizontal: -20, // Negative margin to extend to screen edges
    paddingHorizontal: 20,
  },
  announcementsScrollContainer: {
    gap: 16,
    paddingRight: 20,
  },
  announcements: {
    gap: 12,
  },
  announcementCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    width: width * 0.75, // Card width as percentage of screen width
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  announcementHeader: {
    flexDirection: 'column',
    marginBottom: 12,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 24,
  },
  announcementTime: {
    fontSize: 13,
    opacity: 0.7,
  },
  announcementMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  urgentBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  urgentText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  emergencyContacts: {
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactRole: {
    fontSize: 14,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 13,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});