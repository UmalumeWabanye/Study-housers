import AdvancedSearchModal from '@/components/AdvancedSearchModal';
import PredictiveSearch from '@/components/PredictiveSearch';
import { ThemedText, ThemedView } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { AccommodationType, ENHANCED_LISTINGS, PropertyListing } from '@/lib/enhancedPropertyData';
import { SearchFilters, SearchStorage } from '@/lib/searchStorage';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// const { width } = Dimensions.get('window'); // Currently unused

interface SearchResult {
  property: PropertyListing;
  accommodation: AccommodationType;
}

export default function SearchResultsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  
  const [searchQuery, setSearchQuery] = useState((params.query as string) || '');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(SearchStorage.getDefaultFilters());
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'rating'>('relevance');

  const applySorting = useCallback((results: SearchResult[], sort: typeof sortBy): SearchResult[] => {
    return [...results].sort((a, b) => {
      switch (sort) {
        case 'price_low':
          return a.accommodation.priceNumeric - b.accommodation.priceNumeric;
        case 'price_high':
          return b.accommodation.priceNumeric - a.accommodation.priceNumeric;
        case 'rating':
          const aRating = a.accommodation.reviews?.rating || 0;
          const bRating = b.accommodation.reviews?.rating || 0;
          return bRating - aRating;
        case 'relevance':
        default:
          // Keep default relevance sorting from PropertySearch
          return 0;
      }
    });
  }, []);

  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Transform ENHANCED_LISTINGS to SearchResult format
      const searchResults: SearchResult[] = [];
      ENHANCED_LISTINGS.forEach(property => {
        property.accommodationTypes.forEach(accommodation => {
          searchResults.push({ property, accommodation });
        });
      });

      // Filter and sort results  
      let results = searchResults.filter(result => {
        // Basic text search
        if (searchQuery) {
          const searchText = searchQuery.toLowerCase();
          return (
            result.accommodation.title.toLowerCase().includes(searchText) ||
            result.accommodation.subtitle.toLowerCase().includes(searchText) ||
            result.property.location.toLowerCase().includes(searchText) ||
            result.property.university.toLowerCase().includes(searchText)
          );
        }
        return true;
      });
      
      // Apply sorting
      results = applySorting(results, sortBy);
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, applySorting]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);



  const handleSearch = (query: string) => {
    setSearchQuery(query);
    SearchStorage.addSearchToHistory(query, searchFilters);
  };

  const handleApplyFilters = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setShowAdvancedSearch(false);
  };

  const handlePropertyPress = (result: SearchResult) => {
    router.push({
      pathname: '/property-details',
      params: { 
        id: result.accommodation.id,
        propertyId: result.property.id,
        hostId: result.property.host.id 
      }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchFilters.priceRange.min > 0 || searchFilters.priceRange.max < 20000) count++;
    if (searchFilters.propertyTypes.length > 0) count++;
    if (searchFilters.roomTypes.length > 0) count++;
    if (searchFilters.locations.length > 0) count++;
    if (searchFilters.universities.length > 0) count++;
    if (searchFilters.amenities.length > 0) count++;
    if (searchFilters.availability !== 'any') count++;
    if (searchFilters.furnished !== 'any') count++;
    if (searchFilters.parking === true) count++;
    if (searchFilters.petFriendly === true) count++;
    return count;
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    const { property, accommodation } = item;
    const isAvailable = accommodation.availability.available;
    
    return (
      <TouchableOpacity
        style={[styles.resultCard, {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
          shadowColor: colors.shadow,
          shadowOpacity: colors.shadowOpacity,
        }]}
        onPress={() => handlePropertyPress(item)}
        activeOpacity={0.9}
      >
        {/* Property Image */}
        <View style={styles.imageContainer}>
          <Image source={accommodation.image} style={styles.propertyImage} resizeMode="cover" />
          
          {/* Availability Badge */}
          <View style={[
            styles.availabilityBadge,
            { backgroundColor: isAvailable ? colors.success : colors.warning }
          ]}>
            <ThemedText style={styles.availabilityText}>
              {isAvailable ? 'Available' : 'Not Available'}
            </ThemedText>
          </View>
          
          {/* Property Badge */}
          {accommodation.badge && (
            <View style={[styles.propertyBadge, {
              backgroundColor: accommodation.badge === 'Popular' ? colors.success :
                             accommodation.badge === 'New' ? colors.primary :
                             accommodation.badge === 'Premium' ? '#8B5CF6' :
                             accommodation.badge === 'Budget' ? colors.warning : colors.accent
            }]}>
              <ThemedText style={styles.badgeText}>{accommodation.badge}</ThemedText>
            </View>
          )}
        </View>

        {/* Property Details */}
        <View style={styles.contentContainer}>
          {/* Host Info */}
          <View style={styles.hostInfo}>
            <View style={styles.hostDetails}>
              <ThemedText style={styles.hostName}>{property.host.name}</ThemedText>
              <View style={styles.hostMeta}>
                {property.host.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                    <ThemedText style={[styles.verifiedText, { color: colors.success }]}>Verified</ThemedText>
                  </View>
                )}
                {property.host.rating && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color={colors.warning} />
                    <ThemedText variant="tertiary" style={styles.ratingText}>
                      {property.host.rating}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
            <ThemedText variant="tertiary" style={styles.totalProperties}>
              {property.host.totalProperties} properties
            </ThemedText>
          </View>

          {/* Accommodation Details */}
          <View style={styles.accommodationInfo}>
            <ThemedText style={styles.accommodationTitle}>{accommodation.title}</ThemedText>
            <ThemedText variant="secondary" style={styles.accommodationSubtitle}>
              {accommodation.subtitle}
            </ThemedText>
            <ThemedText variant="tertiary" style={styles.locationText}>
              {property.location} • {property.university}
            </ThemedText>
          </View>

          {/* Features Row */}
          <View style={styles.featuresRow}>
            <View style={styles.feature}>
              <Ionicons name="bed-outline" size={14} color={colors.iconSecondary} />
              <ThemedText variant="tertiary" style={styles.featureText}>
                {accommodation.features.bedrooms} bed
              </ThemedText>
            </View>
            <View style={styles.feature}>
              <Ionicons name="water-outline" size={14} color={colors.iconSecondary} />
              <ThemedText variant="tertiary" style={styles.featureText}>
                {accommodation.features.bathrooms}
              </ThemedText>
            </View>
            {accommodation.features.parking && (
              <View style={styles.feature}>
                <Ionicons name="car-outline" size={14} color={colors.iconSecondary} />
                <ThemedText variant="tertiary" style={styles.featureText}>Parking</ThemedText>
              </View>
            )}
            {accommodation.features.furnished && (
              <View style={styles.feature}>
                <Ionicons name="home-outline" size={14} color={colors.iconSecondary} />
                <ThemedText variant="tertiary" style={styles.featureText}>Furnished</ThemedText>
              </View>
            )}
          </View>

          {/* Price and Action */}
          <View style={styles.bottomRow}>
            <View>
              <ThemedText style={[styles.price, { color: colors.primary }]}>
                {accommodation.price}
              </ThemedText>
              {accommodation.availability.availableUnits && (
                <ThemedText variant="tertiary" style={styles.availableUnits}>
                  {accommodation.availability.availableUnits} units available
                </ThemedText>
              )}
            </View>
            
            <TouchableOpacity
              style={[styles.viewButton, { borderColor: colors.primary }]}
              onPress={() => handlePropertyPress(item)}
            >
              <ThemedText style={[styles.viewButtonText, { color: colors.primary }]}>
                View Details
              </ThemedText>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={80} color={colors.iconSecondary} />
      <ThemedText style={styles.emptyTitle}>No results found</ThemedText>
      <ThemedText variant="secondary" style={styles.emptySubtitle}>
        Try adjusting your search criteria or filters to find more accommodations.
      </ThemedText>
      <TouchableOpacity
        style={[styles.clearFiltersButton, { backgroundColor: colors.primary }]}
        onPress={() => setSearchFilters(SearchStorage.getDefaultFilters())}
      >
        <ThemedText style={styles.clearFiltersText}>Clear Filters</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { 
        paddingTop: insets.top + 16,
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
      }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Search Results</ThemedText>
          <ThemedText variant="secondary" style={styles.resultsCount}>
            {loading ? 'Searching...' : `${searchResults.length} accommodations found`}
          </ThemedText>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <PredictiveSearch
          onSearch={handleSearch}
          onAdvancedSearch={() => setShowAdvancedSearch(true)}
          placeholder="Search accommodations..."
          initialQuery={searchQuery}
        />
      </View>

      {/* Filters and Sort */}
      <View style={[styles.filtersRow, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.filterButton, { 
            backgroundColor: getActiveFiltersCount() > 0 ? colors.primary : colors.surface,
            borderColor: colors.border 
          }]}
          onPress={() => setShowAdvancedSearch(true)}
        >
          <Ionicons 
            name="options" 
            size={16} 
            color={getActiveFiltersCount() > 0 ? '#fff' : colors.iconSecondary} 
          />
          <ThemedText style={[
            styles.filterButtonText,
            { color: getActiveFiltersCount() > 0 ? '#fff' : colors.text }
          ]}>
            Filters
            {getActiveFiltersCount() > 0 && ` (${getActiveFiltersCount()})`}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sortButton, { borderColor: colors.border }]}
          onPress={() => {
            // Show sort options (simplified - you could implement a proper modal)
            const nextIndex = (sortOptions.findIndex(opt => opt.value === sortBy) + 1) % sortOptions.length;
            setSortBy(sortOptions[nextIndex].value as any);
          }}
        >
          <Ionicons name="swap-vertical" size={16} color={colors.iconSecondary} />
          <ThemedText style={styles.sortButtonText}>
            {sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Results List */}
      <FlatList
        data={searchResults}
        renderItem={renderSearchResult}
        keyExtractor={(item) => `${item.property.id}_${item.accommodation.id}`}
        contentContainerStyle={[
          styles.resultsList,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        refreshing={loading}
        onRefresh={performSearch}
      />

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        visible={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={searchFilters}
      />
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultsCount: {
    fontSize: 14,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsList: {
    padding: 20,
    gap: 16,
  },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: 200,
  },
  availabilityBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availabilityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  propertyBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  contentContainer: {
    padding: 16,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  hostDetails: {
    flex: 1,
  },
  hostName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  hostMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
  },
  totalProperties: {
    fontSize: 11,
  },
  accommodationInfo: {
    marginBottom: 12,
  },
  accommodationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  accommodationSubtitle: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  locationText: {
    fontSize: 12,
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  availableUnits: {
    fontSize: 11,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
    marginBottom: 24,
  },
  clearFiltersButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  clearFiltersText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});