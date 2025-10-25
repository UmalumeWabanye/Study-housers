import AdvancedSearchModal from '@/components/AdvancedSearchModal';
import { ThemedText, ThemedView } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { AccommodationType, ENHANCED_LISTINGS, PropertyListing } from '@/lib/enhancedPropertyData';
import { SearchFilters, SearchStorage } from '@/lib/searchStorage';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SearchResult {
  property: PropertyListing;
  accommodation: AccommodationType;
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  
  const [searchQuery, setSearchQuery] = useState((params.query as string) || '');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(SearchStorage.getDefaultFilters());
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load search filters from storage
  useFocusEffect(
    useCallback(() => {
      loadSavedFilters();
    }, [])
  );

  const loadSavedFilters = async () => {
    try {
      const savedFilters = await SearchStorage.getSearchFilters();
      if (savedFilters) {
        setSearchFilters(savedFilters);
      }
    } catch (error) {
      console.error('Failed to load search filters:', error);
    }
  };

  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Transform ENHANCED_LISTINGS to SearchResult format
      const allResults: SearchResult[] = [];
      ENHANCED_LISTINGS.forEach(property => {
        property.accommodationTypes.forEach(accommodation => {
          allResults.push({ property, accommodation });
        });
      });

      // Filter results based on search query
      let filteredResults = allResults;
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredResults = allResults.filter(result => {
          return (
            result.accommodation.title.toLowerCase().includes(query) ||
            result.accommodation.subtitle.toLowerCase().includes(query) ||
            result.property.location.toLowerCase().includes(query) ||
            result.property.university.toLowerCase().includes(query) ||
            result.accommodation.amenities.some(amenity => 
              amenity.toLowerCase().includes(query)
            )
          );
        });
      }

      // Apply filters
      filteredResults = applyFilters(filteredResults, searchFilters);
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchFilters]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const applyFilters = (results: SearchResult[], filters: SearchFilters): SearchResult[] => {
    return results.filter(result => {
      const { accommodation, property } = result;
      
      // Price range filter
      if (accommodation.priceNumeric < filters.priceRange.min || 
          accommodation.priceNumeric > filters.priceRange.max) {
        return false;
      }

      // Property types filter
      if (filters.propertyTypes.length > 0 && 
          !filters.propertyTypes.some(type => 
            accommodation.subtitle.toLowerCase().includes(type.toLowerCase())
          )) {
        return false;
      }

      // Location filter
      if (filters.locations.length > 0 && 
          !filters.locations.some(loc => 
            property.location.toLowerCase().includes(loc.toLowerCase())
          )) {
        return false;
      }

      // University filter
      if (filters.universities.length > 0 && 
          !filters.universities.some(uni => 
            property.university.toLowerCase().includes(uni.toLowerCase())
          )) {
        return false;
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity =>
          accommodation.amenities.some(accAmenity => 
            accAmenity.toLowerCase().includes(amenity.toLowerCase())
          )
        );
        if (!hasAllAmenities) return false;
      }

      // Furnished filter
      if (filters.furnished === 'furnished' && !accommodation.features.furnished) {
        return false;
      }
      if (filters.furnished === 'unfurnished' && accommodation.features.furnished) {
        return false;
      }

      // Parking filter
      if (filters.parking && !accommodation.features.parking) {
        return false;
      }

      return true;
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

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim()) {
      SearchStorage.addSearchToHistory(text, searchFilters);
    }
  };

  const handleApplyFilters = async (filters: SearchFilters) => {
    setSearchFilters(filters);
    setShowAdvancedSearch(false);
    try {
      await SearchStorage.saveSearchFilters(filters);
    } catch (error) {
      console.error('Failed to save search filters:', error);
    }
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

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    const { property, accommodation } = item;
    const isAvailable = accommodation.availability.available;
    
    return (
      <TouchableOpacity
        style={[styles.resultCard, {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        }]}
        onPress={() => handlePropertyPress(item)}
        activeOpacity={0.95}
      >
        {/* Property Image */}
        <View style={styles.imageContainer}>
          <Image source={accommodation.image} style={styles.propertyImage} resizeMode="cover" />
          
          {/* Badge */}
          {accommodation.badge && (
            <View style={[styles.badge, {
              backgroundColor: accommodation.badge === 'Popular' ? colors.success :
                             accommodation.badge === 'New' ? colors.primary :
                             accommodation.badge === 'Premium' ? '#8B5CF6' :
                             accommodation.badge === 'Budget' ? colors.warning : colors.accent
            }]}>
              <ThemedText style={styles.badgeText}>{accommodation.badge}</ThemedText>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {accommodation.title}
          </ThemedText>
          <ThemedText variant="secondary" style={styles.subtitle} numberOfLines={1}>
            {accommodation.subtitle}
          </ThemedText>
          <ThemedText variant="tertiary" style={styles.location}>
            {property.location} • {property.university}
          </ThemedText>
          
          <View style={styles.bottomRow}>
            <ThemedText style={[styles.price, { color: colors.primary }]}>
              {accommodation.price}
            </ThemedText>
            <View style={[styles.availabilityIndicator, {
              backgroundColor: isAvailable ? colors.success : colors.warning,
            }]}>
              <ThemedText style={styles.availabilityText}>
                {isAvailable ? 'Available' : 'Not Available'}
              </ThemedText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={80} color={colors.iconSecondary} />
      <ThemedText style={styles.emptyTitle}>
        {searchQuery ? 'No results found' : 'Start searching'}
      </ThemedText>
      <ThemedText variant="secondary" style={styles.emptySubtitle}>
        {searchQuery 
          ? 'Try adjusting your search criteria or filters to find more accommodations.'
          : 'Enter a search term to find student accommodations in your preferred area.'
        }
      </ThemedText>
      {getActiveFiltersCount() > 0 && (
        <TouchableOpacity
          style={[styles.clearFiltersButton, { backgroundColor: colors.primary }]}
          onPress={() => setSearchFilters(SearchStorage.getDefaultFilters())}
        >
          <ThemedText style={styles.clearFiltersText}>Clear Filters</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

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
        
        <ThemedText style={styles.headerTitle}>Search</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchSection, { backgroundColor: colors.background }]}>
        <View style={[styles.searchContainer, { 
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }]}>
          <Ionicons name="search" size={20} color={colors.iconSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by university, area, or property type..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus={!searchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.iconSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter Button */}
        <TouchableOpacity
          style={[styles.filterButton, { 
            backgroundColor: getActiveFiltersCount() > 0 ? colors.primary : colors.surface,
            borderColor: colors.border 
          }]}
          onPress={() => setShowAdvancedSearch(true)}
        >
          <Ionicons 
            name="options" 
            size={20} 
            color={getActiveFiltersCount() > 0 ? '#fff' : colors.iconSecondary} 
          />
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <ThemedText style={styles.filterBadgeText}>
                {getActiveFiltersCount()}
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Results Header */}
      <View style={[styles.resultsHeader, { borderBottomColor: colors.border }]}>
        {searchQuery ? (
          <ThemedText style={styles.resultsTitle}>
            Results for &ldquo;{searchQuery}&rdquo;
          </ThemedText>
        ) : null}
        <ThemedText variant="secondary" style={styles.resultsCount}>
          {loading ? 'Searching...' : `Available accommodations • ${searchResults.length} ${searchResults.length === 1 ? 'property' : 'properties'}`}
        </ThemedText>
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
        ListEmptyComponent={renderEmptyState}
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginRight: 28, // Offset back button width
  },
  headerSpacer: {
    width: 28,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 20,
  },
  clearButton: {
    padding: 2,
  },
  filterButton: {
    position: 'relative',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultsCount: {
    fontSize: 14,
  },
  resultsList: {
    padding: 20,
    gap: 16,
  },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  propertyImage: {
    width: '100%',
    height: 200,
  },
  badge: {
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  location: {
    fontSize: 12,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
  },
  availabilityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availabilityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
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
    textAlign: 'center',
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