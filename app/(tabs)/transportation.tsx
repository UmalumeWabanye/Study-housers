import { ThemedText, ThemedView } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock timetable data - in real app, would come from API
const SHUTTLE_ROUTES = [
  {
    id: '1',
    name: 'UCT Upper Campus ↔ Main Campus',
    description: 'Direct shuttle between residence and main campus',
    color: '#3B82F6',
    frequency: '15 minutes',
    operatingHours: '6:00 AM - 10:00 PM',
    status: 'active',
  },
  {
    id: '2',
    name: 'UCT Upper Campus ↔ Medical Campus',
    description: 'Shuttle to health sciences campus',
    color: '#10B981',
    frequency: '30 minutes',
    operatingHours: '7:00 AM - 6:00 PM',
    status: 'active',
  },
  {
    id: '3',
    name: 'UCT Upper Campus ↔ V&A Waterfront',
    description: 'Weekend shopping and leisure shuttle',
    color: '#F59E0B',
    frequency: '60 minutes',
    operatingHours: 'Weekends only: 9:00 AM - 9:00 PM',
    status: 'weekend_only',
  },
];

const TIMETABLE = {
  '1': { // UCT Upper Campus ↔ Main Campus
    weekday: [
      { departure: '6:00', arrival: '6:20', notes: 'First shuttle of the day' },
      { departure: '6:15', arrival: '6:35', notes: '' },
      { departure: '6:30', arrival: '6:50', notes: '' },
      { departure: '6:45', arrival: '7:05', notes: 'Peak hour - may be crowded' },
      { departure: '7:00', arrival: '7:20', notes: 'Peak hour - may be crowded' },
      { departure: '7:15', arrival: '7:35', notes: 'Peak hour - may be crowded' },
      { departure: '7:30', arrival: '7:50', notes: 'Peak hour - may be crowded' },
      { departure: '7:45', arrival: '8:05', notes: 'Peak hour - may be crowded' },
      { departure: '8:00', arrival: '8:20', notes: 'Peak hour - may be crowded' },
      { departure: '8:15', arrival: '8:35', notes: '' },
      { departure: '8:30', arrival: '8:50', notes: '' },
      { departure: '8:45', arrival: '9:05', notes: '' },
      { departure: '9:00', arrival: '9:20', notes: '' },
      { departure: '9:15', arrival: '9:35', notes: '' },
      { departure: '9:30', arrival: '9:50', notes: '' },
      { departure: '9:45', arrival: '10:05', notes: '' },
    ],
    weekend: [
      { departure: '8:00', arrival: '8:20', notes: 'First weekend shuttle' },
      { departure: '9:00', arrival: '9:20', notes: '' },
      { departure: '10:00', arrival: '10:20', notes: '' },
      { departure: '11:00', arrival: '11:20', notes: '' },
      { departure: '12:00', arrival: '12:20', notes: '' },
      { departure: '1:00', arrival: '1:20', notes: '' },
      { departure: '2:00', arrival: '2:20', notes: '' },
      { departure: '3:00', arrival: '3:20', notes: '' },
      { departure: '4:00', arrival: '4:20', notes: '' },
      { departure: '5:00', arrival: '5:20', notes: '' },
      { departure: '6:00', arrival: '6:20', notes: '' },
      { departure: '7:00', arrival: '7:20', notes: '' },
      { departure: '8:00', arrival: '8:20', notes: 'Last weekend shuttle' },
    ],
  },
  '2': { // UCT Upper Campus ↔ Medical Campus
    weekday: [
      { departure: '7:00', arrival: '7:25', notes: 'First medical campus shuttle' },
      { departure: '7:30', arrival: '7:55', notes: '' },
      { departure: '8:00', arrival: '8:25', notes: '' },
      { departure: '8:30', arrival: '8:55', notes: '' },
      { departure: '9:00', arrival: '9:25', notes: '' },
      { departure: '9:30', arrival: '9:55', notes: '' },
      { departure: '10:00', arrival: '10:25', notes: '' },
      { departure: '10:30', arrival: '10:55', notes: '' },
      { departure: '11:00', arrival: '11:25', notes: '' },
      { departure: '11:30', arrival: '11:55', notes: '' },
    ],
    weekend: [],
  },
};

const LIVE_UPDATES = [
  {
    id: '1',
    routeId: '1',
    message: 'Shuttle delayed by 5 minutes due to traffic near main gate',
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    type: 'delay',
  },
  {
    id: '2',
    routeId: '1',
    message: 'Additional shuttle added due to high demand',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    type: 'info',
  },
];

export default function TransportationScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [selectedRoute, setSelectedRoute] = useState('1');
  const [selectedDay, setSelectedDay] = useState<'weekday' | 'weekend'>('weekday');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call for live updates
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const isUpcoming = (time: string) => {
    const currentTime = getCurrentTime();
    return time > currentTime;
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const selectedRouteData = SHUTTLE_ROUTES.find(route => route.id === selectedRoute);
  const timetableData = TIMETABLE[selectedRoute as keyof typeof TIMETABLE]?.[selectedDay] || [];
  const routeUpdates = LIVE_UPDATES.filter(update => update.routeId === selectedRoute);

  const requestShuttle = () => {
    Alert.alert(
      'Request Shuttle',
      'Would you like to request an additional shuttle for high-demand times?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Request', onPress: () => {
          Alert.alert('Request Sent', 'Your shuttle request has been submitted to transport services.');
        }},
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[
        styles.header,
        {
          paddingTop: insets.top + 16,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        }
      ]}>
        <View style={styles.headerContent}>
          <ThemedText variant="title" style={styles.headerTitle}>
            Transportation
          </ThemedText>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={requestShuttle}
          >
            <Ionicons name="add" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Live Status */}
        <View style={[styles.statusCard, { 
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIndicator, { backgroundColor: colors.success }]} />
            <ThemedText style={styles.statusText}>All services operational</ThemedText>
            <ThemedText variant="tertiary" style={styles.statusTime}>
              Updated {getCurrentTime()}
            </ThemedText>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Route Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Routes</ThemedText>
          <View style={styles.routeCards}>
            {SHUTTLE_ROUTES.map((route) => (
              <TouchableOpacity
                key={route.id}
                style={[
                  styles.routeCard,
                  {
                    backgroundColor: selectedRoute === route.id 
                      ? `${route.color}15` 
                      : colors.cardBackground,
                    borderColor: selectedRoute === route.id 
                      ? route.color 
                      : colors.cardBorder,
                    shadowColor: colors.shadow,
                    shadowOpacity: colors.shadowOpacity,
                  }
                ]}
                onPress={() => setSelectedRoute(route.id)}
              >
                <View style={styles.routeHeader}>
                  <View style={[styles.routeIcon, { backgroundColor: route.color }]}>
                    <Ionicons name="bus" size={20} color="#fff" />
                  </View>
                  <View style={styles.routeStatus}>
                    <View style={[
                      styles.statusDot, 
                      { backgroundColor: route.status === 'active' ? colors.success : colors.warning }
                    ]} />
                    <ThemedText variant="tertiary" style={styles.routeStatusText}>
                      {route.status === 'active' ? 'Active' : 'Weekend Only'}
                    </ThemedText>
                  </View>
                </View>
                
                <ThemedText style={styles.routeName}>{route.name}</ThemedText>
                <ThemedText variant="secondary" style={styles.routeDescription}>
                  {route.description}
                </ThemedText>
                
                <View style={styles.routeDetails}>
                  <View style={styles.routeDetail}>
                    <Ionicons name="time-outline" size={14} color={colors.iconSecondary} />
                    <ThemedText variant="tertiary" style={styles.routeDetailText}>
                      Every {route.frequency}
                    </ThemedText>
                  </View>
                  <View style={styles.routeDetail}>
                    <Ionicons name="calendar-outline" size={14} color={colors.iconSecondary} />
                    <ThemedText variant="tertiary" style={styles.routeDetailText}>
                      {route.operatingHours}
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Day Selection */}
        {selectedRouteData && (
          <>
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Schedule</ThemedText>
              <View style={styles.daySelector}>
                <TouchableOpacity
                  style={[
                    styles.dayButton,
                    {
                      backgroundColor: selectedDay === 'weekday' ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => setSelectedDay('weekday')}
                >
                  <ThemedText 
                    style={[
                      styles.dayButtonText,
                      { color: selectedDay === 'weekday' ? '#fff' : colors.text }
                    ]}
                  >
                    Weekdays
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.dayButton,
                    {
                      backgroundColor: selectedDay === 'weekend' ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => setSelectedDay('weekend')}
                >
                  <ThemedText 
                    style={[
                      styles.dayButtonText,
                      { color: selectedDay === 'weekend' ? '#fff' : colors.text }
                    ]}
                  >
                    Weekends
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Live Updates */}
            {routeUpdates.length > 0 && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Live Updates</ThemedText>
                {routeUpdates.map((update) => (
                  <View 
                    key={update.id}
                    style={[
                      styles.updateCard,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: update.type === 'delay' ? colors.warning : colors.primary,
                        shadowColor: colors.shadow,
                        shadowOpacity: colors.shadowOpacity,
                      }
                    ]}
                  >
                    <View style={styles.updateHeader}>
                      <Ionicons 
                        name={update.type === 'delay' ? 'warning' : 'information-circle'} 
                        size={16} 
                        color={update.type === 'delay' ? colors.warning : colors.primary} 
                      />
                      <ThemedText variant="secondary" style={styles.updateTime}>
                        {formatTimeAgo(update.timestamp)}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.updateMessage}>{update.message}</ThemedText>
                  </View>
                ))}
              </View>
            )}

            {/* Timetable */}
            <View style={styles.section}>
              <View style={styles.timetableHeader}>
                <ThemedText style={styles.sectionTitle}>
                  {selectedRouteData.name} - {selectedDay === 'weekday' ? 'Weekdays' : 'Weekends'}
                </ThemedText>
                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                    <ThemedText variant="tertiary" style={styles.legendText}>Upcoming</ThemedText>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.textSecondary }]} />
                    <ThemedText variant="tertiary" style={styles.legendText}>Departed</ThemedText>
                  </View>
                </View>
              </View>

              {timetableData.length === 0 ? (
                <View style={[styles.noServiceCard, { 
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }]}>
                  <Ionicons name="ban-outline" size={48} color={colors.iconSecondary} />
                  <ThemedText variant="secondary" style={styles.noServiceText}>
                    No service available on {selectedDay}s for this route
                  </ThemedText>
                </View>
              ) : (
                <View style={styles.timetableContainer}>
                  {timetableData.map((schedule, index) => {
                    const upcoming = isUpcoming(schedule.departure);
                    
                    return (
                      <View 
                        key={index}
                        style={[
                          styles.scheduleCard,
                          {
                            backgroundColor: upcoming 
                              ? `${colors.success}10` 
                              : colors.cardBackground,
                            borderColor: upcoming 
                              ? colors.success 
                              : colors.cardBorder,
                            shadowColor: colors.shadow,
                            shadowOpacity: upcoming ? 0.1 : colors.shadowOpacity,
                          }
                        ]}
                      >
                        <View style={styles.scheduleMain}>
                          <View style={styles.timeContainer}>
                            <ThemedText style={[
                              styles.departureTime,
                              { color: upcoming ? colors.success : colors.text }
                            ]}>
                              {schedule.departure}
                            </ThemedText>
                            <View style={styles.routeArrow}>
                              <Ionicons name="arrow-forward" size={16} color={colors.iconSecondary} />
                            </View>
                            <ThemedText style={styles.arrivalTime}>
                              {schedule.arrival}
                            </ThemedText>
                          </View>
                          
                          {upcoming && (
                            <View style={[styles.upcomingBadge, { backgroundColor: colors.success }]}>
                              <ThemedText style={styles.upcomingText}>Next</ThemedText>
                            </View>
                          )}
                        </View>
                        
                        {schedule.notes && (
                          <ThemedText variant="tertiary" style={styles.scheduleNotes}>
                            {schedule.notes}
                          </ThemedText>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </>
        )}

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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  statusTime: {
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  routeCards: {
    gap: 12,
  },
  routeCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  routeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  routeStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  routeDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  routeDetails: {
    gap: 8,
  },
  routeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeDetailText: {
    fontSize: 13,
  },
  daySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  updateCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  updateTime: {
    fontSize: 12,
  },
  updateMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  timetableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  legend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
  },
  noServiceCard: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noServiceText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  timetableContainer: {
    gap: 8,
  },
  scheduleCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  scheduleMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  departureTime: {
    fontSize: 18,
    fontWeight: '700',
  },
  routeArrow: {
    paddingHorizontal: 8,
  },
  arrivalTime: {
    fontSize: 16,
    fontWeight: '500',
  },
  upcomingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upcomingText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  scheduleNotes: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});