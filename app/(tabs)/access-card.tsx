import { ThemedText, ThemedView } from '@/components/themed-components';
import { useProfile } from '@/context/ProfileContext';
import { useUserStatus } from '@/context/UserStatusContext';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Generate access permissions based on accommodation
const getAccessPermissions = (accommodation: any) => [
  { id: '1', name: 'Main Building', icon: 'business', granted: true },
  { id: '2', name: `Room ${accommodation.roomNumber}`, icon: 'key', granted: true },
  { id: '3', name: 'Study Lounge', icon: 'library', granted: true },
  { id: '4', name: 'Gym & Recreation', icon: 'fitness', granted: true },
  { id: '5', name: 'Laundry Room', icon: 'shirt', granted: true },
  { id: '6', name: 'Roof Terrace', icon: 'sunny', granted: false },
  { id: '7', name: 'Parking Garage', icon: 'car', granted: false },
  { id: '8', name: 'Conference Rooms', icon: 'people', granted: false },
];

// Generate access logs based on accommodation
const getAccessLogs = (accommodation: any) => [
  {
    id: '1',
    location: `Room ${accommodation.roomNumber}`,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    type: 'entry',
    status: 'granted',
  },
  {
    id: '2',
    location: 'Study Lounge',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    type: 'entry',
    status: 'granted',
  },
  {
    id: '3',
    location: 'Main Building',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    type: 'exit',
    status: 'granted',
  },
  {
    id: '4',
    location: 'Gym & Recreation',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    type: 'entry',
    status: 'granted',
  },
  {
    id: '5',
    location: 'Conference Rooms',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    type: 'entry',
    status: 'denied',
  },
];

export default function AccessCardScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { userName } = useProfile();
  const { approvedAccommodation } = useUserStatus();
  const [cardFlipped, setCardFlipped] = useState(false);
  const [scanAnimation] = useState(new Animated.Value(0));
  const [flipAnimation] = useState(new Animated.Value(0));
  const [isScanning, setIsScanning] = useState(false);

  // Generate dynamic data based on approved accommodation
  const accessPermissions = approvedAccommodation ? getAccessPermissions(approvedAccommodation) : [];
  const accessLogs = approvedAccommodation ? getAccessLogs(approvedAccommodation) : [];

  useEffect(() => {
    // Pulse animation for the scan button
    const pulse = () => {
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };

    pulse();
  }, [scanAnimation]);

  const handleCardFlip = () => {
    Animated.timing(flipAnimation, {
      toValue: cardFlipped ? 0 : 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    setCardFlipped(!cardFlipped);
  };

  const handleScanAccess = () => {
    if (!approvedAccommodation) return;
    
    setIsScanning(true);
    
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      Alert.alert(
        'Access Granted',
        `Welcome to Room ${approvedAccommodation.roomNumber}. Door unlocked.`,
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  const requestAccess = (permissionName: string) => {
    Alert.alert(
      'Request Access',
      `Would you like to request access to ${permissionName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request', onPress: () => {
          Alert.alert(
            'Request Submitted',
            `Your access request for ${permissionName} has been sent to building management.`
          );
        }},
      ]
    );
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const animatedOpacity = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const animatedScale = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1.05],
  });

  // Flip animation interpolations
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '0deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };



  if (!approvedAccommodation) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText>Access card not available</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[
        styles.header,
        {
          paddingTop: insets.top + 16,
          backgroundColor: colors.background,
        }
      ]}>
        <ThemedText variant="title" style={styles.headerTitle}>
          Digital Access Card
        </ThemedText>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={() => Alert.alert('Settings', 'Access card settings and preferences')}
          >
            <Ionicons name="settings-outline" size={20} color={colors.iconSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Digital Card */}
        <TouchableOpacity 
          style={styles.cardContainer} 
          onPress={handleCardFlip}
          activeOpacity={0.9}
        >
          <View style={[
            styles.accessCard,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.shadow,
              shadowOpacity: 0.3,
            }
          ]}>
            {/* Front of Card */}
            <Animated.View style={[
              styles.cardFront,
              frontAnimatedStyle,
              {
                backfaceVisibility: 'hidden',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                padding: 16,
              }
            ]}>
              <View style={styles.cardHeader}>
                <View style={styles.universityLogo}>
                  <Ionicons name="school" size={20} color="#fff" />
                </View>
                <ThemedText style={styles.universityName}>
                  {approvedAccommodation.university}
                </ThemedText>
              </View>

              <View style={styles.cardBody}>
                <ThemedText style={styles.cardTitle}>STUDENT RESIDENCE ACCESS</ThemedText>
                <ThemedText style={styles.studentName}>{userName || 'Student Name'}</ThemedText>
                <ThemedText style={styles.studentNumber}>
                  ID: STDNT123456
                </ThemedText>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.validDates}>
                  <ThemedText style={styles.validText}>VALID FROM</ThemedText>
                  <ThemedText style={styles.validDate} numberOfLines={1}>
                    {new Date(approvedAccommodation.moveInDate).toLocaleDateString()}
                  </ThemedText>
                </View>
                <View style={[styles.validDates, { alignItems: 'flex-end' }]}>
                  <ThemedText style={styles.validText}>EXPIRES</ThemedText>
                  <ThemedText style={styles.validDate} numberOfLines={1}>
                    {new Date(approvedAccommodation.leaseEndDate).toLocaleDateString()}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.tapHint}>
                <ThemedText style={styles.tapText}>Tap to flip</ThemedText>
              </View>
            </Animated.View>

            {/* Back of Card */}
            <Animated.View style={[
              styles.cardBack,
              backAnimatedStyle,
              {
                backfaceVisibility: 'hidden',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                padding: 16,
              }
            ]}>
              <View style={styles.backCardBody}>
                <View style={styles.qrCodeSection}>
                  <View style={[styles.qrCode, { backgroundColor: '#fff' }]}>
                    <View style={styles.qrPattern}>
                      {Array.from({ length: 25 }).map((_, i) => (
                        <View 
                          key={i}
                          style={[
                            styles.qrDot,
                            { backgroundColor: Math.random() > 0.5 ? '#000' : 'transparent' }
                          ]} 
                        />
                      ))}
                    </View>
                  </View>
                  <ThemedText style={styles.qrCodeText}>
                    {approvedAccommodation.accessCode}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.backCardFooter}>
                <View style={styles.accommodationInfo}>
                  <ThemedText style={styles.accommodationTitle}>ACCOMMODATION</ThemedText>
                  <ThemedText style={styles.accommodationName} numberOfLines={2}>
                    {approvedAccommodation.propertyName}
                  </ThemedText>
                  <ThemedText style={styles.accommodationRoom}>
                    Room {approvedAccommodation.roomNumber}
                  </ThemedText>
                </View>

                <View style={styles.emergencyInfo}>
                  <ThemedText style={styles.emergencyTitle}>EMERGENCY</ThemedText>
                  <ThemedText style={styles.emergencyNumber}>
                    {approvedAccommodation.emergencyContacts[0]?.phone || '+27 21 650 9111'}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.tapHint}>
                <ThemedText style={styles.tapText}>Tap to flip</ThemedText>
              </View>
            </Animated.View>
          </View>
        </TouchableOpacity>

        {/* Scan Access Button */}
        <Animated.View style={[
          styles.scanButtonContainer,
          {
            opacity: animatedOpacity,
            transform: [{ scale: animatedScale }],
          }
        ]}>
          <TouchableOpacity
            style={[
              styles.scanButton,
              {
                backgroundColor: isScanning ? colors.warning : colors.success,
                shadowColor: isScanning ? colors.warning : colors.success,
              }
            ]}
            onPress={handleScanAccess}
            disabled={isScanning}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={isScanning ? 'hourglass' : 'scan-circle'} 
              size={32} 
              color="#fff" 
            />
            <ThemedText style={styles.scanButtonText}>
              {isScanning ? 'Scanning...' : 'Scan for Access'}
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>

        {/* Access Permissions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Access Permissions</ThemedText>
          <View style={styles.permissionsGrid}>
            {accessPermissions.map((permission) => (
              <TouchableOpacity
                key={permission.id}
                style={[
                  styles.permissionCard,
                  {
                    backgroundColor: permission.granted 
                      ? `${colors.success}15` 
                      : colors.surface,
                    borderColor: permission.granted 
                      ? colors.success 
                      : colors.border,
                  }
                ]}
                onPress={() => !permission.granted && requestAccess(permission.name)}
                disabled={permission.granted}
              >
                <View style={[
                  styles.permissionIcon,
                  {
                    backgroundColor: permission.granted 
                      ? colors.success 
                      : colors.iconSecondary,
                  }
                ]}>
                  <Ionicons 
                    name={permission.icon as any} 
                    size={20} 
                    color="#fff" 
                  />
                </View>
                <ThemedText 
                  style={[
                    styles.permissionName,
                    { color: permission.granted ? colors.success : colors.textSecondary }
                  ]}
                >
                  {permission.name}
                </ThemedText>
                <Ionicons 
                  name={permission.granted ? 'checkmark-circle' : 'close-circle'} 
                  size={16} 
                  color={permission.granted ? colors.success : colors.error} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Access Log */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Recent Access Activity</ThemedText>
          <View style={styles.accessLog}>
            {accessLogs.slice(0, 4).map((log) => (
              <View 
                key={log.id}
                style={[
                  styles.logItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }
                ]}
              >
                <View style={styles.logIcon}>
                  <Ionicons 
                    name={log.type === 'entry' ? 'enter' : 'exit'} 
                    size={16} 
                    color={log.status === 'granted' ? colors.success : colors.error} 
                  />
                </View>
                <View style={styles.logDetails}>
                  <ThemedText style={styles.logLocation}>{log.location}</ThemedText>
                  <ThemedText variant="tertiary" style={styles.logTime}>
                    {log.type === 'entry' ? 'Entered' : 'Exited'} • {formatTimeAgo(log.timestamp)}
                  </ThemedText>
                </View>
                <View style={[
                  styles.logStatus,
                  { backgroundColor: log.status === 'granted' ? colors.success : colors.error }
                ]}>
                  <ThemedText style={styles.logStatusText}>
                    {log.status === 'granted' ? 'Granted' : 'Denied'}
                  </ThemedText>
                </View>
              </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cardContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  accessCard: {
    width: width - 60,
    height: 240,
    borderRadius: 16,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  cardFront: {
    flex: 1,
    flexDirection: 'column',
  },
  cardBack: {
    flex: 1,
    flexDirection: 'column',
  },
  backCardHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  backCardBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  backCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  qrCodeSection: {
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  universityLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  universityName: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.9,
    flex: 1,
    flexWrap: 'wrap',
  },
  cardBody: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
    opacity: 0.8,
    letterSpacing: 1,
    marginBottom: 4,
  },
  studentName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 1,
  },
  studentNumber: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.9,
    marginBottom: 6,
  },
  residenceName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 1,
  },
  roomNumber: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  validDates: {
    flex: 1,
    alignItems: 'flex-start',
    maxWidth: '48%',
  },
  validText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
    opacity: 0.7,
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  validDate: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    flexWrap: 'wrap',
  },
  tapHint: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  tapText: {
    color: '#fff',
    fontSize: 9,
    opacity: 0.5,
    fontStyle: 'italic',
  },
  accessCodeTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  qrCode: {
    width: 70,
    height: 70,
    borderRadius: 8,
    padding: 6,
    marginBottom: 8,
  },
  qrPattern: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  qrDot: {
    width: '20%',
    height: '20%',
  },
  qrCodeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  accommodationInfo: {
    flex: 1,
    alignItems: 'flex-start',
    marginRight: 8,
  },
  accommodationTitle: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '700',
    opacity: 0.7,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  accommodationName: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  accommodationRoom: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  emergencyInfo: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  emergencyTitle: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
    opacity: 0.7,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  emergencyNumber: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'right',
  },
  scanButtonContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 50,
    gap: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.3,
    elevation: 6,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  permissionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  permissionCard: {
    width: (width - 64) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  permissionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  accessLog: {
    gap: 8,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  logIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logDetails: {
    flex: 1,
  },
  logLocation: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  logTime: {
    fontSize: 12,
  },
  logStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  logStatusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});