import { ThemedText, ThemedView } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { LikedPropertiesStorage, LikedProperty } from '@/lib/likedPropertiesStorage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LikedPlaces() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [likedProperties, setLikedProperties] = useState<LikedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  // Load liked properties from storage
  const loadLikedProperties = useCallback(async () => {
    try {
      setLoading(true);
      const properties = await LikedPropertiesStorage.getLikedProperties();
      setLikedProperties(properties);
    } catch (error) {
      console.error('Error loading liked properties:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLikedProperties();
    }, [loadLikedProperties])
  );

  const removeLikedProperty = async (propertyId: string) => {
    try {
      await LikedPropertiesStorage.removeLikedProperty(propertyId);
      loadLikedProperties(); // Reload the list
    } catch (error) {
      console.error('Error removing liked property:', error);
    }
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="bookmark-outline" size={80} color={colors.iconSecondary} />
      <ThemedText style={styles.emptyTitle}>No bookmarked places yet</ThemedText>
      <ThemedText variant="secondary" style={styles.emptySubtitle}>
        Start exploring properties and save your favorites by tapping the bookmark icon
      </ThemedText>
      <TouchableOpacity 
        style={[styles.exploreButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(tabs)')}
      >
        <ThemedText style={styles.exploreButtonText}>Explore Properties</ThemedText>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Bookmarked Places</ThemedText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ThemedText variant="secondary">Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { 
        paddingTop: insets.top + 16,
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
      }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Bookmarked Places</ThemedText>
        <View style={styles.placeholder} />
      </View>

      {likedProperties.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView 
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText variant="secondary" style={styles.subtitle}>
            {likedProperties.length} saved {likedProperties.length === 1 ? 'property' : 'properties'}
          </ThemedText>

          <View style={styles.propertiesList}>
            {likedProperties.map((property) => (
              <TouchableOpacity 
                key={property.id}
                style={[styles.propertyCard, {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.cardBorder,
                  shadowColor: colors.shadow,
                  shadowOpacity: colors.shadowOpacity,
                }]}
                onPress={() => router.push(`/property-details?id=${property.id}`)}
                activeOpacity={0.9}
              >
                <Image source={property.image} style={styles.propertyImage} resizeMode="cover" />
                
                {/* Remove from favorites button */}
                <TouchableOpacity 
                  style={[styles.bookmarkButton, { backgroundColor: colors.surface }]}
                  onPress={() => removeLikedProperty(property.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="bookmark" size={20} color={colors.primary} />
                </TouchableOpacity>

                <View style={styles.propertyContent}>
                  <ThemedText style={styles.propertyTitle}>{property.title}</ThemedText>
                  <ThemedText variant="tertiary" style={styles.propertySubtitle}>
                    {property.subtitle}
                  </ThemedText>
                  
                  <View style={styles.bottomRow}>
                    <View style={styles.priceContainer}>
                      <ThemedText style={[styles.propertyPrice, { color: colors.primary }]}>
                        {property.price}
                      </ThemedText>
                      {property.badge && (
                        <View style={[styles.badge, { 
                          backgroundColor: property.badge === 'Popular' ? colors.success : 
                                         property.badge === 'New' ? colors.primary :
                                         property.badge === 'Budget' ? colors.warning : colors.accent 
                        }]}>
                          <ThemedText style={styles.badgeText}>{property.badge}</ThemedText>
                        </View>
                      )}
                    </View>
                    
                    <TouchableOpacity 
                      style={[styles.viewDetailsButton, { borderColor: colors.border }]}
                      onPress={() => router.push(`/property-details?id=${property.id}`)}
                    >
                      <ThemedText style={[styles.viewDetailsText, { color: colors.primary }]}>
                        View Details
                      </ThemedText>
                      <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
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
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  propertiesList: {
    gap: 16,
  },
  propertyCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  propertyImage: {
    width: '100%',
    height: 180,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyContent: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  propertySubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '500',
  },
});