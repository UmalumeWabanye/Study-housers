import { ThemedText, ThemedView } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';

import React, { useState } from 'react';
import {
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



// Mock news data - in real app, would come from API
const NEWS_ITEMS = [
  {
    id: '1',
    title: 'Welcome to UCT Upper Campus Residence!',
    content: 'Your accommodation has been confirmed for Room B204. Please collect your physical key from reception during office hours (8 AM - 5 PM). Welcome packages are available at the front desk.',
    category: 'welcome',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    urgent: false,
    author: 'UCT Residence Management',
    image: require('../../assets/images/react-logo.png'),
    readStatus: false,
  },
  {
    id: '2',
    title: 'Important: WiFi Network Update',
    content: 'The WiFi password for the UCT-Student network has been updated for security purposes. New password: UCT2025!Student. Please update all your devices by tomorrow (Oct 26) to avoid connectivity issues.',
    category: 'tech',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    urgent: true,
    author: 'IT Services',
    readStatus: false,
  },
  {
    id: '3',
    title: 'Study Lounge Maintenance Schedule',
    content: 'The main study lounge on Level 2 will be closed for deep cleaning and maintenance on Monday, October 28, from 9:00 AM to 2:00 PM. Alternative study spaces are available on Level 3.',
    category: 'maintenance',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    urgent: false,
    author: 'Facilities Management',
    readStatus: true,
  },
  {
    id: '4',
    title: 'Campus Shuttle Service Update',
    content: 'Due to road construction near the main campus, shuttle times may be delayed by 5-10 minutes during peak hours (7-9 AM, 4-6 PM) for the next two weeks.',
    category: 'transport',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    urgent: false,
    author: 'Transport Services',
    readStatus: true,
  },
  {
    id: '5',
    title: 'Laundry Room Schedule Change',
    content: 'Starting Monday, the laundry room will operate from 6:00 AM to 11:00 PM daily. Maintenance will occur every Wednesday from 10:00 AM to 12:00 PM.',
    category: 'facilities',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    urgent: false,
    author: 'Residence Life',
    readStatus: true,
  },
  {
    id: '6',
    title: 'Fire Safety Drill - October 30',
    content: 'A mandatory fire safety drill will be conducted on Tuesday, October 30, at 10:00 AM. All residents must participate. Meeting point: Main parking area. Expected duration: 30 minutes.',
    category: 'safety',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    urgent: true,
    author: 'Safety & Security',
    readStatus: true,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'list', color: '#3B82F6' },
  { id: 'urgent', label: 'Urgent', icon: 'warning', color: '#EF4444' },
  { id: 'welcome', label: 'Welcome', icon: 'home', color: '#10B981' },
  { id: 'tech', label: 'Tech', icon: 'wifi', color: '#8B5CF6' },
  { id: 'maintenance', label: 'Maintenance', icon: 'construct', color: '#F59E0B' },
  { id: 'transport', label: 'Transport', icon: 'bus', color: '#06B6D4' },
  { id: 'facilities', label: 'Facilities', icon: 'business', color: '#84CC16' },
  { id: 'safety', label: 'Safety', icon: 'shield-checkmark', color: '#F97316' },
];

export default function NewsFeedScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [readItems, setReadItems] = useState<Set<string>>(new Set());

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const markAsRead = (itemId: string) => {
    setReadItems(prev => new Set([...prev, itemId]));
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat ? cat.icon : 'document-text';
  };

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    return cat ? cat.color : colors.primary;
  };

  const getFilteredNews = () => {
    let filtered = NEWS_ITEMS;

    if (selectedCategory === 'urgent') {
      filtered = filtered.filter(item => item.urgent);
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    return filtered.sort((a, b) => {
      // Urgent items first, then by timestamp
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const filteredNews = getFilteredNews();

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
            News & Updates
          </ThemedText>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.surface }]}
              onPress={() => {
                // Mark all as read functionality
                const allIds = new Set(NEWS_ITEMS.map(item => item.id));
                setReadItems(allIds);
              }}
            >
              <Ionicons name="checkmark-done" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === category.id 
                    ? category.color 
                    : colors.surface,
                  borderColor: selectedCategory === category.id 
                    ? category.color 
                    : colors.border,
                }
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon as any} 
                size={16} 
                color={selectedCategory === category.id ? '#fff' : colors.iconSecondary} 
              />
              <ThemedText 
                style={[
                  styles.categoryText,
                  { 
                    color: selectedCategory === category.id 
                      ? '#fff' 
                      : colors.textSecondary 
                  }
                ]}
              >
                {category.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* News Items */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.newsContainer}>
          {filteredNews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="newspaper-outline" size={64} color={colors.iconSecondary} />
              <ThemedText variant="secondary" style={styles.emptyText}>
                No news items found for this category
              </ThemedText>
            </View>
          ) : (
            filteredNews.map((item) => {
              const isRead = readItems.has(item.id) || item.readStatus;
              
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.newsCard,
                    {
                      backgroundColor: colors.cardBackground,
                      borderColor: colors.cardBorder,
                      borderLeftColor: item.urgent ? colors.error : getCategoryColor(item.category),
                      shadowColor: colors.shadow,
                      shadowOpacity: colors.shadowOpacity,
                      opacity: isRead ? 0.7 : 1,
                    }
                  ]}
                  onPress={() => markAsRead(item.id)}
                  activeOpacity={0.8}
                >
                  {/* Urgent Badge */}
                  {item.urgent && (
                    <View style={[styles.urgentBadge, { backgroundColor: colors.error }]}>
                      <Ionicons name="warning" size={12} color="#fff" />
                      <ThemedText style={styles.urgentText}>Urgent</ThemedText>
                    </View>
                  )}

                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={[
                        styles.categoryIcon,
                        { backgroundColor: `${getCategoryColor(item.category)}15` }
                      ]}>
                        <Ionicons 
                          name={getCategoryIcon(item.category) as any} 
                          size={16} 
                          color={getCategoryColor(item.category)} 
                        />
                      </View>
                      <View style={styles.cardMeta}>
                        <ThemedText style={styles.cardAuthor} variant="secondary">
                          {item.author}
                        </ThemedText>
                        <ThemedText style={styles.cardTime} variant="tertiary">
                          {formatTimeAgo(item.timestamp)}
                        </ThemedText>
                      </View>
                    </View>
                    {!isRead && (
                      <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                    )}
                  </View>

                  {/* Card Content */}
                  <View style={styles.cardContent}>
                    <ThemedText style={styles.newsTitle}>
                      {item.title}
                    </ThemedText>
                    <ThemedText variant="secondary" style={styles.newsContent}>
                      {item.content}
                    </ThemedText>
                  </View>

                  {/* Card Image */}
                  {item.image && (
                    <View style={styles.cardImageContainer}>
                      <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
                    </View>
                  )}

                  {/* Card Actions */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="bookmark-outline" size={16} color={colors.iconSecondary} />
                      <ThemedText variant="tertiary" style={styles.actionText}>Save</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="share-outline" size={16} color={colors.iconSecondary} />
                      <ThemedText variant="tertiary" style={styles.actionText}>Share</ThemedText>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
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
  categoriesScroll: {
    marginHorizontal: -20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  newsContainer: {
    padding: 20,
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
  },
  newsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  urgentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 1,
  },
  urgentText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: {
    flex: 1,
  },
  cardAuthor: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardTime: {
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardContent: {
    marginBottom: 16,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 24,
  },
  newsContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  cardImageContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
});