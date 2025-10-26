import AdvancedSearchModal from '@/components/AdvancedSearchModal';
import PredictiveSearch from '@/components/PredictiveSearch';
import { ThemedText, ThemedView } from '@/components/themed-components';
import { useProfile } from '@/context/ProfileContext';
import { useUserStatus } from '@/context/UserStatusContext';
import { useTheme } from '@/hooks/use-theme';
import { ENHANCED_LISTINGS } from '@/lib/enhancedPropertyData';
import { SearchFilters, SearchStorage } from '@/lib/searchStorage';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ApprovedHomeScreen from '../approved-home';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', label: 'Res Rooms', icon: 'bed' },
  { id: '2', label: 'Shared Flats', icon: 'users' },
  { id: '3', label: 'Studios', icon: 'home' },
  { id: '4', label: 'Co-Living', icon: 'building' },
  { id: '5', label: 'Digs', icon: 'university' },
];

// Extract listings from enhanced data for home screen display
const LISTINGS = ENHANCED_LISTINGS.flatMap(property => 
  property.accommodationTypes.map(accommodation => ({
    id: accommodation.id,
    propertyId: property.id,
    hostId: property.host.id,
    title: accommodation.title,
    subtitle: accommodation.subtitle,
    price: accommodation.price,
    image: accommodation.image,
    badge: accommodation.badge,
  }))
);

export default function Index() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { profileImage } = useProfile();
  const { userStatus } = useUserStatus();
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(SearchStorage.getDefaultFilters());
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // If user is approved or resident, show the approved home screen
  if (userStatus === 'approved' || userStatus === 'resident') {
    return <ApprovedHomeScreen />;
  }

  // Filter options based on badges
  const filterOptions = ['All', 'Popular', 'New', 'Budget'];
  
  // Search and filter handling
  const handleSearch = (query: string) => {
    // Navigate to dedicated search screen without setting local state
    router.push({
      pathname: '/search',
      params: { query }
    });
  };

  const handleAdvancedSearch = () => {
    setShowAdvancedSearch(true);
  };

  const handleApplyFilters = (filters: SearchFilters) => {
    setSearchFilters(filters);
    console.log('Applied filters:', filters);
  };



  // Enhanced filtering logic based on search query and advanced filters
  const getFilteredListings = () => {
    let filtered = LISTINGS;

    // Apply basic filter (badges) - keeping existing functionality
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(listing => listing.badge === selectedFilter);
    }

    // Note: Search query filtering is handled on the dedicated search screen
    // Home screen should not filter results based on search query

    // Apply advanced price range filter
    if (searchFilters.priceRange.min > 0 || searchFilters.priceRange.max < 20000) {
      filtered = filtered.filter(listing => {
        const price = parseInt(listing.price.replace(/[^\d]/g, ''));
        return price >= searchFilters.priceRange.min && price <= searchFilters.priceRange.max;
      });
    }

    // Apply property type filters
    if (searchFilters.propertyTypes.length > 0) {
      filtered = filtered.filter(listing => 
        searchFilters.propertyTypes.some(type => 
          listing.title.toLowerCase().includes(type.toLowerCase()) ||
          listing.subtitle.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    // Apply location filters
    if (searchFilters.locations.length > 0) {
      filtered = filtered.filter(listing => 
        searchFilters.locations.some(location => 
          listing.subtitle.toLowerCase().includes(location.toLowerCase())
        )
      );
    }

    // Apply university filters
    if (searchFilters.universities.length > 0) {
      filtered = filtered.filter(listing => 
        searchFilters.universities.some(university => {
          const shortNames = ['UCT', 'Wits', 'UJ', 'CPUT'];
          
          return listing.subtitle.toLowerCase().includes(university.toLowerCase()) ||
                 shortNames.some(short => university.includes(short) && listing.subtitle.includes(short));
        })
      );
    }

    // Apply amenity filters (basic implementation based on subtitle text)
    if (searchFilters.amenities.length > 0) {
      filtered = filtered.filter(listing => 
        searchFilters.amenities.some(amenity => {
          const amenityKeywords: { [key: string]: string[] } = {
            'WiFi included': ['wifi', 'internet'],
            'Parking available': ['parking'],
            'Gym access': ['gym'],
            '24/7 Security': ['security'],
            'Laundry facilities': ['laundry'],
            'Study areas': ['study'],
            'Kitchen access': ['kitchen'],
          };
          
          const keywords = amenityKeywords[amenity] || [amenity.toLowerCase()];
          return keywords.some((keyword: string) => 
            listing.subtitle.toLowerCase().includes(keyword)
          );
        })
      );
    }

    // Results are displayed in default order on home screen
    // Search-specific sorting happens on the dedicated search screen

    return filtered;
  };

  const filteredListings = getFilteredListings();
  
  return (
    <ThemedView style={styles.container}>
      {/* Fixed Header */}
      <View style={[styles.fixedHeader, { 
        paddingTop: insets.top + 16,
        backgroundColor: colors.background,
      }]}>
        <View style={styles.header}>
          <ThemedText variant="title" style={styles.headerTitle}>Find your perfect student home</ThemedText>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.likedButton} 
              activeOpacity={0.7}
              onPress={() => router.push('/liked-places')}
            >
              <Ionicons name="bookmark" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.avatar} 
              activeOpacity={0.7}
              onPress={() => router.push('/profile')}
            >
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }} 
                  style={styles.avatarImage} 
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person-circle" size={40} color={colors.icon} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        style={[styles.scrollView, { paddingTop: insets.top + 80 }]}
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <PredictiveSearch
            onSearch={handleSearch}
            onAdvancedSearch={handleAdvancedSearch}
            placeholder="Search by university, area, or property type..."
          />
        </View>

        {/* Filter Modal */}
        {showFilterModal && (
          <View style={[styles.filterModal, { 
            backgroundColor: colors.surface, 
            borderColor: colors.border,
            shadowColor: colors.shadow,
            shadowOpacity: colors.shadowOpacity,
          }]}>
            <ThemedText style={styles.filterTitle}>Filter by type</ThemedText>
            <View style={styles.filterOptions}>
              {filterOptions.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterOption,
                    { 
                      backgroundColor: selectedFilter === filter ? colors.primary : colors.cardBackground,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => {
                    setSelectedFilter(filter);
                    setShowFilterModal(false);
                  }}
                >
                  <ThemedText 
                    style={[
                      styles.filterOptionText,
                      { color: selectedFilter === filter ? '#fff' : colors.text }
                    ]}
                  >
                    {filter}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}



        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesScroll} 
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.category} activeOpacity={0.8}>
              <View style={[styles.categoryIcon, { 
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOpacity: 0.3,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 8,
                elevation: 4,
              }]}>
                <FontAwesome5 name={cat.icon} size={16} color="#fff" />
              </View>
              <ThemedText style={styles.categoryLabel} variant="secondary">{cat.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ThemedText variant="subtitle" style={styles.sectionTitle}>
          Available accommodations
        </ThemedText>

        <View style={styles.listings}>
          {filteredListings.map((l) => (
            <TouchableOpacity 
              key={l.id} 
              style={[styles.card, {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
                shadowColor: colors.shadow,
                shadowOpacity: colors.shadowOpacity,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 8,
                elevation: 3,
              }]} 
              activeOpacity={0.95}
              onPress={() => router.push({
                pathname: '/property-details',
                params: { 
                  id: l.id,
                  propertyId: l.propertyId,
                  hostId: l.hostId 
                }
              })}
            >
              <View style={styles.cardImageContainer}>
                <Image source={l.image} style={styles.cardImage} resizeMode="cover" />
                {l.badge && (
                  <View style={[styles.cardBadge, { 
                    backgroundColor: l.badge === 'Popular' ? colors.success : 
                                   l.badge === 'New' ? colors.primary :
                                   l.badge === 'Budget' ? colors.warning : colors.accent 
                  }]}>
                    <ThemedText style={styles.cardBadgeText}>{l.badge}</ThemedText>
                  </View>
                )}
              </View>
              <View style={styles.cardBody}>
                <ThemedText style={styles.cardTitle}>{l.title}</ThemedText>
                <ThemedText variant="tertiary" style={styles.cardSubtitle}>{l.subtitle}</ThemedText>
                <View style={styles.priceRow}>
                  <ThemedText style={[styles.cardPrice, { color: colors.primary }]}>{l.price}</ThemedText>
                  <View style={[styles.viewButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <ThemedText style={[styles.viewButtonText, { color: colors.primary }]}>View Details</ThemedText>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
  container: { flex: 1 },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  content: { 
    padding: 20, 
    paddingBottom: 40,
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    marginRight: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  likedButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  demoButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: 24,
    zIndex: 1000,
  },
  avatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: 'center', 
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  searchFilterRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 16, 
    gap: 12, 
    marginBottom: 20,
    marginTop: 8,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 16 },
  filterIconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesScroll: { 
    marginBottom: 24,
  },
  categoriesContent: {
    gap: 16,
    paddingHorizontal: 4,
  },
  category: { alignItems: 'center', width: 70 },
  categoryIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 8 
  },
  categoryLabel: { fontSize: 11, textAlign: 'center', fontWeight: '500' },
  sectionTitle: { marginBottom: 16 },
  listings: { gap: 16 },
  card: { 
    borderRadius: 16, 
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: { 
    width: width - 40, 
    height: 200, 
    borderTopLeftRadius: 16, 
    borderTopRightRadius: 16 
  },
  cardBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  cardBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: '600' },
  cardSubtitle: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  priceRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 12 
  },
  cardPrice: { fontSize: 16, fontWeight: '700' },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterModal: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});


