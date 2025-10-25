import { ThemedText, ThemedView } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
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

export default function Applications() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const stored = await AsyncStorage.getItem(APPLICATIONS_STORAGE_KEY);
      if (stored) {
        const parsedApplications = JSON.parse(stored);
        setApplications(parsedApplications);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
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

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'approved') return app.status === 'approved' || app.status === 'interview';
    if (activeTab === 'rejected') return app.status === 'rejected';
    return app.status === 'pending';
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const tabs = [
    { id: 'pending' as const, label: 'Pending', count: applications.filter(a => a.status === 'pending').length },
    { id: 'rejected' as const, label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length },
    { id: 'approved' as const, label: 'Approved', count: applications.filter(a => a.status === 'approved' || a.status === 'interview').length },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { 
        paddingTop: insets.top + 16,
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
      }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText variant="title" style={styles.headerTitle}>
            My Applications
          </ThemedText>
          <View style={styles.placeholder} />
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: activeTab === tab.id ? colors.primary : colors.textSecondary },
              ]}
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

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredApplications.length === 0 ? (
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
        ) : (
          <View style={styles.applicationsList}>
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
                      onPress={() => router.push(`/property-details?id=${application.propertyId}`)}
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
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
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
  applicationsList: {
    gap: 16,
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
    alignItems: 'center',
  },
  viewPropertyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
  },
  viewPropertyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});