import { useUserStatus } from '@/context/UserStatusContext';
import { useTheme } from '@/hooks/use-theme';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AccommodationOffersScreen() {
  const { accommodationOffers, acceptOffer, declineOffer } = useUserStatus();
  const { colors } = useTheme();

  const pendingOffers = accommodationOffers.filter(offer => offer.status === 'pending');
  const acceptedOffers = accommodationOffers.filter(offer => offer.status === 'accepted');
  const declinedOffers = accommodationOffers.filter(offer => offer.status === 'declined');

  const handleAcceptOffer = async (offerId: string, propertyName: string) => {
    Alert.alert(
      'Accept Offer',
      `Are you sure you want to accept the offer from ${propertyName}? This will be your confirmed accommodation.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: async () => {
            try {
              await acceptOffer(offerId);
              Alert.alert(
                'Offer Accepted!',
                `Congratulations! You have successfully accepted the offer from ${propertyName}. You now have access to the resident portal.`,
                [
                  {
                    text: 'Continue to Portal',
                    onPress: () => router.replace('/(tabs)')
                  }
                ]
              );
            } catch {
              Alert.alert('Error', 'Failed to accept offer. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleDeclineOffer = async (offerId: string, propertyName: string) => {
    Alert.alert(
      'Decline Offer',
      `Are you sure you want to decline the offer from ${propertyName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await declineOffer(offerId);
            } catch {
              Alert.alert('Error', 'Failed to decline offer. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderOfferCard = (offer: any, showActions: boolean = false) => (
    <View key={offer.id} style={[styles.offerCard, { backgroundColor: colors.surface }]}>
      <Image source={{ uri: offer.imageUrl }} style={styles.propertyImage} />
      
      <View style={styles.offerContent}>
        <Text style={[styles.propertyName, { color: colors.text }]}>
          {offer.name}
        </Text>
        <Text style={[styles.universityName, { color: colors.textSecondary }]}>
          {offer.university}
        </Text>
        <Text style={[styles.location, { color: colors.textSecondary }]}>
          📍 {offer.location}
        </Text>
        
        <View style={styles.offerDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Room Type:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{offer.roomType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Monthly Rent:</Text>
            <Text style={[styles.priceValue, { color: colors.primary }]}>R{offer.monthlyRent}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Move-in Date:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date(offer.moveInDate).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <Text style={[
            styles.statusText,
            {
              color: offer.status === 'accepted' ? '#10B981' :
                     offer.status === 'declined' ? '#EF4444' : '#F59E0B'
            }
          ]}>
            {offer.status === 'pending' ? '⏳ Pending' :
             offer.status === 'accepted' ? '✅ Accepted' : '❌ Declined'}
          </Text>
        </View>

        {showActions && offer.status === 'pending' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.declineButton, { borderColor: colors.border }]}
              onPress={() => handleDeclineOffer(offer.id, offer.name)}
            >
              <Text style={[styles.declineButtonText, { color: colors.textSecondary }]}>
                Decline
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.acceptButton, { backgroundColor: colors.primary }]}
              onPress={() => handleAcceptOffer(offer.id, offer.name)}
            >
              <Text style={styles.acceptButtonText}>Accept Offer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: colors.text }]}>
          Accommodation Offers
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Review and manage your accommodation offers
        </Text>
      </View>

      {pendingOffers.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Pending Offers ({pendingOffers.length})
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            These offers require your response
          </Text>
          {pendingOffers.map(offer => renderOfferCard(offer, true))}
        </View>
      )}

      {acceptedOffers.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Accepted Offers
          </Text>
          {acceptedOffers.map(offer => renderOfferCard(offer, false))}
        </View>
      )}

      {declinedOffers.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Declined Offers
          </Text>
          {declinedOffers.map(offer => renderOfferCard(offer, false))}
        </View>
      )}

      {accommodationOffers.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            No Offers Yet
          </Text>
          <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
            You haven&apos;t received any accommodation offers yet. Keep checking back!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  offerCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  offerContent: {
    padding: 16,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  universityName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    marginBottom: 16,
  },
  offerDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});