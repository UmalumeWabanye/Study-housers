import ApplicationFormModal from '@/components/ApplicationForm/ApplicationFormModal';
import { ThemedText, ThemedView } from '@/components/themed-components';
import { useTheme } from '@/hooks/use-theme';
import { AccommodationType, ENHANCED_LISTINGS, PropertyHost, PropertyListing } from '@/lib/enhancedPropertyData';
import { LikedPropertiesStorage } from '@/lib/likedPropertiesStorage';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const APPLICATIONS_STORAGE_KEY = 'user_applications';

export default function PropertyDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const params = useLocalSearchParams();
  const id = params.id as string;
  const propertyId = params.propertyId as string;
  const hostId = params.hostId as string;
  const from = params.from as string;
  
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [hasApplication, setHasApplication] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  
  // Check if user is coming from applications screen (explore.tsx)
  const isFromApplicationsScreen = from === 'applications';

  // Find the property and accommodation by ID
  let property: PropertyListing | undefined;
  let accommodation: AccommodationType | undefined;
  let host: PropertyHost | undefined;

  // First try to find by accommodation ID from search results
  if (id && propertyId && hostId) {
    property = ENHANCED_LISTINGS.find(listing => listing.id === propertyId);
    if (property) {
      accommodation = property.accommodationTypes.find((acc: AccommodationType) => acc.id === id);
      host = property.host;
    }
  } else {
    // Fallback: search all accommodations for the ID (for backward compatibility)
    for (const listing of ENHANCED_LISTINGS) {
      const foundAccommodation = listing.accommodationTypes.find((acc: AccommodationType) => acc.id === id);
      if (foundAccommodation) {
        property = listing;
        accommodation = foundAccommodation;
        host = listing.host;
        break;
      }
    }
  }

  // Check if user has already applied for this property
  const checkApplicationStatus = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(APPLICATIONS_STORAGE_KEY);
      if (stored) {
        const applications = JSON.parse(stored);
        const hasApp = applications.some((app: any) => app.propertyId === id);
        setHasApplication(hasApp);
      }
    } catch (error) {
      console.error('Failed to check application status:', error);
    }
  }, [id]);

  // Check if property is liked
  const checkLikedStatus = useCallback(async () => {
    if (property && accommodation) {
      const liked = await LikedPropertiesStorage.isPropertyLiked(accommodation.id);
      setIsLiked(liked);
    }
  }, [property, accommodation]);

  const handleLike = async () => {
    if (!property || !accommodation) return;
    
    const propertyData = {
      id: accommodation.id,
      title: accommodation.title,
      subtitle: accommodation.subtitle,
      price: accommodation.price,
      priceNumeric: accommodation.priceNumeric,
      image: accommodation.image,
      badge: accommodation.badge,
      type: accommodation.subtitle,
      university: property.university,
      location: property.location,
    };

    if (isLiked) {
      await LikedPropertiesStorage.removeLikedProperty(propertyData.id);
      setIsLiked(false);
    } else {
      await LikedPropertiesStorage.addLikedProperty(propertyData);
      setIsLiked(true);
    }
  };

  useEffect(() => {
    if (property && accommodation) {
      checkLikedStatus();
    }
  }, [property, accommodation, checkLikedStatus]);

  useFocusEffect(
    useCallback(() => {
      checkApplicationStatus();
    }, [checkApplicationStatus])
  );

  if (!property || !accommodation || !host) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <ThemedText>Property not found</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const handleChat = () => {
    // Navigate to direct message screen with the property owner
    router.push({
      pathname: '/direct-message',
      params: { 
        chatId: host.id,
        contactName: host.name,
        propertyTitle: accommodation.title,
        propertyId: property.id
      }
    });
  };

  const handleDeleteApplication = async () => {
    try {
      const stored = await AsyncStorage.getItem(APPLICATIONS_STORAGE_KEY);
      if (stored) {
        const applications = JSON.parse(stored);
        const updatedApplications = applications.filter((app: any) => app.propertyId !== id);
        await AsyncStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(updatedApplications));
        setHasApplication(false);
        setShowDeleteConfirmation(false);
      }
    } catch (error) {
      console.error('Failed to delete application:', error);
    }
  };

  const handleApply = () => {
    setShowApplicationForm(true);
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : i - 0.5 <= rating ? "star-half" : "star-outline"}
          size={14}
          color={colors.warning}
        />
      );
    }
    return stars;
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={handleLike}
          >
            <Ionicons 
              name={isLiked ? "bookmark" : "bookmark-outline"} 
              size={22} 
              color={isLiked ? colors.primary : colors.iconSecondary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Property Images */}
        <View style={styles.imageSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageCarousel}
            onScroll={({ nativeEvent }) => {
              // Could add image index tracking here
            }}
            scrollEventThrottle={16}
          >
            <Image source={accommodation.image} style={styles.propertyImage} resizeMode="cover" />
          </ScrollView>
          
          {/* Image Indicator - Single Image */}
          <View style={styles.imageIndicator}>
            {[accommodation.image].map((_, index) => (
              <View key={index} style={[styles.dot, { backgroundColor: colors.primary }]} />
            ))}
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title and Price */}
          <View style={styles.titleSection}>
            <View style={styles.titleContainer}>
              <ThemedText style={styles.title}>{accommodation.title}</ThemedText>
              <ThemedText style={styles.type}>{accommodation.subtitle}</ThemedText>
            </View>
            <View style={styles.priceContainer}>
              <ThemedText style={[styles.price, { color: colors.primary }]}>{accommodation.price}</ThemedText>
              {accommodation.badge && (
                <View style={[styles.badge, { 
                  backgroundColor: accommodation.badge === 'Popular' ? colors.success : 
                                 accommodation.badge === 'New' ? colors.primary :
                                 accommodation.badge === 'Budget' ? colors.warning :
                                 accommodation.badge === 'Premium' ? '#8B5CF6' : colors.accent 
                }]}>
                  <ThemedText style={styles.badgeText}>{accommodation.badge}</ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color={colors.iconSecondary} />
            <ThemedText variant="secondary" style={styles.location}>{property.location}</ThemedText>
            <TouchableOpacity style={styles.mapButton}>
              <ThemedText style={[styles.mapButtonText, { color: colors.primary }]}>View Map</ThemedText>
            </TouchableOpacity>
          </View>

          {/* University */}
          <View style={styles.universityRow}>
            <FontAwesome5 name="university" size={16} color={colors.iconSecondary} />
            <ThemedText variant="secondary" style={styles.university}>{property.university}</ThemedText>
          </View>

          {/* Quick Features */}
          <View style={styles.featuresRow}>
            <View style={styles.feature}>
              <MaterialIcons name="bed" size={18} color={colors.iconSecondary} />
              <ThemedText variant="tertiary" style={styles.featureText}>{accommodation.features.bedrooms} bed</ThemedText>
            </View>
            <View style={styles.feature}>
              <MaterialIcons name="bathroom" size={18} color={colors.iconSecondary} />
              <ThemedText variant="tertiary" style={styles.featureText}>{accommodation.features.bathrooms}</ThemedText>
            </View>
            {accommodation.features.furnished && (
              <View style={styles.feature}>
                <MaterialIcons name="weekend" size={18} color={colors.iconSecondary} />
                <ThemedText variant="tertiary" style={styles.featureText}>Furnished</ThemedText>
              </View>
            )}
            {accommodation.features.parking && (
              <View style={styles.feature}>
                <MaterialIcons name="local-parking" size={18} color={colors.iconSecondary} />
                <ThemedText variant="tertiary" style={styles.featureText}>Parking</ThemedText>
              </View>
            )}
          </View>

          {/* Reviews */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                  {renderStars(accommodation.reviews?.rating || 0)}
                </View>
                <ThemedText style={styles.ratingText}>
                  {accommodation.reviews?.rating || 0} ({accommodation.reviews?.count || 0} reviews)
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <ThemedText style={styles.sectionTitle}>About this place</ThemedText>
            <ThemedText variant="secondary" style={styles.description}>
              {accommodation.description}
            </ThemedText>
          </View>

          {/* Amenities */}
          <View style={styles.amenitiesSection}>
            <ThemedText style={styles.sectionTitle}>What this place offers</ThemedText>
            <View style={styles.amenitiesGrid}>
              {(showAllAmenities ? accommodation.amenities : accommodation.amenities.slice(0, 6)).map((amenity: string, index: number) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <ThemedText variant="secondary" style={styles.amenityText}>{amenity}</ThemedText>
                </View>
              ))}
            </View>
            {accommodation.amenities.length > 6 && (
              <TouchableOpacity 
                style={styles.showMoreAmenities}
                onPress={() => setShowAllAmenities(!showAllAmenities)}
              >
                <ThemedText style={[styles.showMoreText, { color: colors.primary }]}>
                  {showAllAmenities ? 'Show less' : `Show all ${accommodation.amenities.length} amenities`}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Availability */}
          <View style={styles.availabilitySection}>
            <ThemedText style={styles.sectionTitle}>Availability</ThemedText>
            <View style={styles.availabilityContainer}>
              <View style={styles.availabilityItem}>
                <ThemedText variant="secondary">Move-in Date</ThemedText>
                <ThemedText style={styles.availabilityValue}>{accommodation.availability.moveInDate}</ThemedText>
              </View>
              <View style={styles.availabilityItem}>
                <ThemedText variant="secondary">Lease Duration</ThemedText>
                <ThemedText style={styles.availabilityValue}>{accommodation.availability.leaseDuration}</ThemedText>
              </View>
            </View>
          </View>

          {/* Host Contact */}
          <View style={styles.contactSection}>
            <ThemedText style={styles.sectionTitle}>Hosted by</ThemedText>
            <View style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.contactInfo}>
                <ThemedText style={styles.contactName}>{host.name}</ThemedText>
                {host.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <ThemedText style={[styles.verifiedText, { color: colors.success }]}>Verified</ThemedText>
                  </View>
                )}
              </View>
              {/* Contact Actions */}
              <View style={styles.contactActions}>
                <TouchableOpacity 
                  style={[styles.contactButton, { backgroundColor: colors.primary }]}
                  onPress={handleChat}
                >
                  <Ionicons name="chatbubble" size={18} color="#fff" />
                  <ThemedText style={styles.contactButtonText}>Message</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.contactButton, { backgroundColor: colors.success }]}
                  onPress={() => Linking.openURL(`tel:${host.phone}`)}
                >
                  <Ionicons name="call" size={18} color="#fff" />
                  <ThemedText style={styles.contactButtonText}>Call</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Bottom padding for navigation */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { 
        backgroundColor: colors.background,
        borderTopColor: colors.border,
        paddingBottom: insets.bottom + 16 
      }]}>
        <View style={styles.bottomContent}>
          <ThemedText style={[styles.bottomPrice, { color: colors.primary }]}>{accommodation.price}</ThemedText>
          {!isFromApplicationsScreen ? (
            hasApplication ? (
              <TouchableOpacity 
                style={[styles.applyButton, { backgroundColor: colors.success }]}
                disabled={true}
              >
                <ThemedText style={styles.applyButtonText}>Already Applied</ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.applyButton, { backgroundColor: colors.primary }]}
                onPress={handleApply}
              >
                <ThemedText style={styles.applyButtonText}>Apply Now</ThemedText>
              </TouchableOpacity>
            )
          ) : (
            <TouchableOpacity 
              style={[styles.deleteButton, { backgroundColor: '#EF4444' }]}
              onPress={handleDelete}
            >
              <ThemedText style={styles.deleteButtonText}>Delete Application</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Application Form Modal */}
      <ApplicationFormModal
        visible={showApplicationForm}
        onClose={() => setShowApplicationForm(false)}
        propertyId={property.id}
        propertyTitle={accommodation.title}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirmation}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.deleteModalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <ThemedText style={styles.deleteModalTitle}>Delete Application</ThemedText>
            <ThemedText variant="secondary" style={styles.deleteModalText}>
                Are you sure you want to delete your application for {accommodation.title}? This action cannot be undone.
            </ThemedText>
            <View style={styles.deleteModalActions}>
              <TouchableOpacity 
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setShowDeleteConfirmation(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmDeleteButton, { backgroundColor: '#EF4444' }]}
                onPress={handleDeleteApplication}
              >
                <ThemedText style={styles.confirmDeleteButtonText}>Delete</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
  },
  imageCarousel: {
    width: width,
    height: 300,
  },
  propertyImage: {
    width: width,
    height: 300,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    paddingHorizontal: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 20,
    paddingBottom: 16,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    marginBottom: 4,
  },
  type: {
    fontSize: 16,
    lineHeight: 24,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  location: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  mapButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  mapButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  universityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
  },
  university: {
    marginLeft: 8,
    fontSize: 16,
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: 14,
  },
  reviewsSection: {
    paddingBottom: 24,
  },
  reviewsHeader: {
    marginBottom: 16,
  },
  ratingContainer: {
    alignItems: 'flex-start',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
  },
  descriptionSection: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  amenitiesSection: {
    paddingBottom: 24,
  },
  amenitiesGrid: {
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amenityText: {
    fontSize: 16,
  },
  showMoreAmenities: {
    marginTop: 12,
    paddingVertical: 8,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  availabilitySection: {
    paddingBottom: 24,
  },
  availabilityContainer: {
    gap: 16,
  },
  availabilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  availabilityValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactSection: {
    paddingBottom: 24,
  },
  contactCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomBar: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  bottomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  applyButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  deleteModalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  confirmDeleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});