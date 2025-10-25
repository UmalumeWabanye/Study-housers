import { ThemedText, ThemedView } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Application {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: any;
  propertyLocation: string;
  price: string;
  status: 'pending' | 'approved' | 'rejected' | 'interview';
  submittedAt: string;
  applicationReference: string;
}

const APPLICATIONS_STORAGE_KEY = 'user_applications';

// Sample applications for demonstration
const SAMPLE_APPLICATIONS: Application[] = [
  {
    id: '1',
    propertyId: 'prop-1',
    propertyTitle: 'Sunset Apartments',
    propertyImage: require('@/assets/images/react-logo.png'),
    propertyLocation: '123 Oak Street, Downtown',
    price: 'R12,000/month',
    status: 'pending',
    submittedAt: '2024-10-23T10:00:00Z',
    applicationReference: 'APP-2024-001'
  },
  {
    id: '2', 
    propertyId: 'prop-2',
    propertyTitle: 'Campus Dormitory',
    propertyImage: require('@/assets/images/react-logo.png'),
    propertyLocation: '456 University Ave, Campus',
    price: 'R8,000/month',
    status: 'rejected',
    submittedAt: '2024-10-20T14:30:00Z',
    applicationReference: 'APP-2024-002'
  },
  {
    id: '3',
    propertyId: 'prop-3', 
    propertyTitle: 'Green Valley Co-Living',
    propertyImage: require('@/assets/images/react-logo.png'),
    propertyLocation: '789 Pine Street, Midtown',
    price: 'R9,500/month',
    status: 'approved',
    submittedAt: '2024-10-18T16:45:00Z',
    applicationReference: 'APP-2024-003'
  },
  {
    id: '4',
    propertyId: 'prop-4',
    propertyTitle: 'Modern Loft Apartments',
    propertyImage: require('@/assets/images/react-logo.png'),
    propertyLocation: '321 Elm Street, Business District',
    price: 'R15,000/month',
    status: 'interview',
    submittedAt: '2024-10-22T09:15:00Z',
    applicationReference: 'APP-2024-004'
  },
  {
    id: '5',
    propertyId: 'prop-5',
    propertyTitle: 'Student Housing Complex',
    propertyImage: require('@/assets/images/react-logo.png'),
    propertyLocation: '654 College Road, Near Campus',
    price: 'R7,500/month',
    status: 'pending',
    submittedAt: '2024-10-21T11:20:00Z',
    applicationReference: 'APP-2024-005'
  },
  {
    id: '6',
    propertyId: 'prop-6',
    propertyTitle: 'Luxury Studio Apartments',
    propertyImage: require('@/assets/images/react-logo.png'),
    propertyLocation: '987 Main Street, City Center',
    price: 'R18,000/month',
    status: 'rejected',
    submittedAt: '2024-10-19T13:10:00Z',
    applicationReference: 'APP-2024-006'
  }
];

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'approved', label: 'Approved' },
];

export default function ApplicationsScreen() {
  const [activeTab, setActiveTab] = useState('pending');
  const [applications, setApplications] = useState<Application[]>(SAMPLE_APPLICATIONS);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  useEffect(() => {
    loadApplications();
  }, []);

  // Refresh applications when screen comes into focus (after successful submission)
  useFocusEffect(
    useCallback(() => {
      loadApplications();
    }, [])
  );

  const loadApplications = async () => {
    try {
      const stored = await AsyncStorage.getItem(APPLICATIONS_STORAGE_KEY);
      if (stored) {
        const parsedApplications = JSON.parse(stored);
        // Show all submitted applications - new submissions will appear here
        setApplications(parsedApplications);
      } else {
        // No submitted applications yet - show empty list
        setApplications([]);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
      // Fallback to empty list
      setApplications([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'approved':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'interview':
        return colors.primary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'interview':
        return 'calendar-outline';
      default:
        return 'help-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };
  
  // Modern, aesthetically pleasing color coordination
  const tabBackgroundColor = colors.surface;

    // Filter applications based on active tab
  const filteredApplications = applications.filter(app => {
    if (activeTab === 'approved') return app.status === 'approved' || app.status === 'interview';
    if (activeTab === 'rejected') return app.status === 'rejected';
    return app.status === 'pending';
  });

  const tabs = TABS.map(tab => ({
    ...tab,
    count: applications.filter(a => {
      if (tab.key === 'approved') return a.status === 'approved' || a.status === 'interview';
      if (tab.key === 'rejected') return a.status === 'rejected';
      return a.status === 'pending';
    }).length
  }));

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom,
          paddingHorizontal: 16,
          minHeight: '100%',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Fixed Tab Switcher - No Compression */}
        <View style={[styles.tabContainer, { backgroundColor: tabBackgroundColor }]}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton, 
                { 
                  backgroundColor: activeTab === tab.key ? colors.primary : 'transparent',
                  shadowColor: activeTab === tab.key ? colors.shadow : 'transparent',
                  shadowOpacity: activeTab === tab.key ? colors.shadowOpacity : 0,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 8,
                  elevation: activeTab === tab.key ? 3 : 0,
                }
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.tabLabel, 
                  { 
                    color: activeTab === tab.key ? colors.buttonPrimaryText : colors.textSecondary,
                    fontWeight: activeTab === tab.key ? '600' : '500'
                  }
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </ThemedText>
              {tab.count > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <ThemedText style={styles.badgeText}>{tab.count}</ThemedText>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          <View style={[
            styles.applicationsList,
            (activeTab === 'rejected' || activeTab === 'approved') && styles.applicationsListCentered
          ]}>
            {filteredApplications.map((application) => (
              <View 
                key={application.id}
                style={[styles.applicationCard, { 
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.cardBorder,
                  shadowColor: colors.shadow,
                  shadowOpacity: colors.shadowOpacity,
                }]}
              >
                <View style={styles.applicationHeader}>
                  <Image 
                    source={application.propertyImage} 
                    style={styles.propertyImage} 
                    resizeMode="cover"
                  />
                  <View style={styles.applicationInfo}>
                    <ThemedText style={styles.propertyTitle} numberOfLines={2}>
                      {application.propertyTitle}
                    </ThemedText>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color={colors.iconSecondary} />
                      <ThemedText variant="tertiary" style={styles.propertyLocation}>
                        {application.propertyLocation}
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.propertyPrice, { color: colors.primary }]}>
                      {application.price}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.applicationDetails}>
                  <View style={styles.statusRow}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) + '20' }]}>
                      <Ionicons 
                        name={getStatusIcon(application.status)} 
                        size={14} 
                        color={getStatusColor(application.status)} 
                      />
                      <ThemedText style={[styles.statusText, { color: getStatusColor(application.status) }]}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </ThemedText>
                    </View>
                    <ThemedText variant="tertiary" style={styles.submittedDate}>
                      Submitted {formatDate(application.submittedAt)}
                    </ThemedText>
                  </View>

                  <View style={styles.referenceRow}>
                    <ThemedText variant="tertiary" style={styles.referenceLabel}>
                      Reference: 
                    </ThemedText>
                    <ThemedText style={styles.referenceNumber}>
                      {application.applicationReference}
                    </ThemedText>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity 
                      style={[styles.viewPropertyButton, { backgroundColor: colors.primary }]}
                      onPress={() => router.push(`/property-details?id=${application.propertyId}&from=applications`)}
                    >
                      <ThemedText style={styles.viewPropertyButtonText}>
                        View Property
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          /* Empty State */
          <View style={styles.emptyState}>
            <Ionicons 
              name="document-text-outline" 
              size={64} 
              color={colors.iconSecondary} 
              style={styles.emptyIcon}
            />
            <ThemedText style={styles.emptyTitle}>
              {activeTab === 'pending' && 'No Pending Applications'}
              {activeTab === 'approved' && 'No Approved Applications'}
              {activeTab === 'rejected' && 'No Rejected Applications'}
            </ThemedText>
            <ThemedText variant="secondary" style={styles.emptySubtitle}>
              {activeTab === 'pending' && 'Your submitted applications will appear here'}
              {activeTab === 'approved' && 'Approved applications and interviews will appear here'}
              {activeTab === 'rejected' && 'Unfortunately rejected applications will appear here'}
            </ThemedText>
            {activeTab === 'pending' && (
              <TouchableOpacity 
                style={[styles.browseButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/')}
              >
                <ThemedText style={styles.browseButtonText}>Browse Properties</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    borderRadius: 16,
    padding: 4,
    marginHorizontal: 0,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 90,
    gap: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  applicationsList: {
    gap: 16,
  },
  applicationsListCentered: {
    alignItems: 'center',
  },
  applicationCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  applicationHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  applicationInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  propertyLocation: {
    fontSize: 14,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  applicationDetails: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submittedDate: {
    fontSize: 12,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referenceLabel: {
    fontSize: 14,
  },
  referenceNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionRow: {
    width: '100%',
  },
  viewPropertyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  viewPropertyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
