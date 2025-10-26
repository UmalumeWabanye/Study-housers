import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserStatus = 'searching' | 'approved' | 'resident';

export interface AccommodationOffer {
  id: string;
  propertyId: string;
  accommodationId: string;
  hostId: string;
  hostName: string;
  hostPhone: string;
  propertyName: string;
  roomNumber: string;
  address: string;
  university: string;
  price: string;
  moveInDate: string;
  leaseEndDate: string;
  accessCode: string;
  emergencyContacts: {
    name: string;
    role: string;
    phone: string;
  }[];
  amenities: string[];
  houseRules: string[];
  offerDate: string;
  expiryDate: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  applicationId: string;
}

export interface ApprovedAccommodation extends Omit<AccommodationOffer, 'status' | 'offerDate' | 'expiryDate'> {
  approvalDate: string;
  acceptedDate: string;
}

// Mock accommodation offers for demo
const MOCK_ACCOMMODATION_OFFERS: AccommodationOffer[] = [
  {
    id: 'offer_1',
    propertyId: 'property_1',
    accommodationId: 'acc_1_1',
    hostId: 'host_1',
    hostName: 'Sarah Johnson',
    hostPhone: '+27 21 123 4567',
    propertyName: 'UCT Upper Campus Residence',
    roomNumber: 'B204',
    address: 'Upper Campus, Rondebosch, Cape Town',
    university: 'University of Cape Town',
    price: 'R4,500/month',
    moveInDate: '2025-02-01',
    leaseEndDate: '2025-11-30',
    accessCode: '1234#',
    emergencyContacts: [
      { name: 'Sarah Johnson', role: 'Property Manager', phone: '+27 21 123 4567' },
      { name: 'UCT Security', role: 'Campus Security', phone: '+27 21 650 9111' },
      { name: 'Emergency Services', role: 'Emergency', phone: '10111' },
    ],
    amenities: ['WiFi', '24/7 Security', 'Study Lounge', 'Laundry', 'Kitchen Access', 'Cleaning Service'],
    houseRules: [
      'Quiet hours: 10 PM - 7 AM',
      'No overnight guests without permission',
      'Keep common areas clean',
      'No smoking anywhere on premises',
      'Respect other residents',
    ],
    offerDate: '2025-10-20',
    expiryDate: '2025-10-27',
    status: 'pending',
    applicationId: 'app_1',
  },
  {
    id: 'offer_2',
    propertyId: 'property_2',
    accommodationId: 'acc_2_1',
    hostId: 'host_2',
    hostName: 'Michael Chen',
    hostPhone: '+27 21 987 6543',
    propertyName: 'Wits Student Village',
    roomNumber: 'A108',
    address: 'Braamfontein, Johannesburg',
    university: 'University of the Witwatersrand',
    price: 'R3,800/month',
    moveInDate: '2025-02-01',
    leaseEndDate: '2025-11-30',
    accessCode: '5678#',
    emergencyContacts: [
      { name: 'Michael Chen', role: 'Property Manager', phone: '+27 21 987 6543' },
      { name: 'Wits Security', role: 'Campus Security', phone: '+27 11 717 1000' },
      { name: 'Emergency Services', role: 'Emergency', phone: '10111' },
    ],
    amenities: ['WiFi', 'Gym Access', 'Pool', 'Study Areas', 'Parking', 'Meal Plan'],
    houseRules: [
      'Quiet hours: 10 PM - 6 AM',
      'Guest policy: 3 guests max',
      'No pets allowed',
      'No smoking indoors',
      'Keep common areas tidy',
    ],
    offerDate: '2025-10-21',
    expiryDate: '2025-10-28',
    status: 'pending',
    applicationId: 'app_2',
  },
  {
    id: 'offer_3',
    propertyId: 'property_3',
    accommodationId: 'acc_3_1',
    hostId: 'host_3',
    hostName: 'Amanda Williams',
    hostPhone: '+27 21 456 7890',
    propertyName: 'Stellenbosch Student Hub',
    roomNumber: 'C301',
    address: 'Stellenbosch Central, Western Cape',
    university: 'Stellenbosch University',
    price: 'R4,200/month',
    moveInDate: '2025-02-01',
    leaseEndDate: '2025-11-30',
    accessCode: '9876#',
    emergencyContacts: [
      { name: 'Amanda Williams', role: 'Property Manager', phone: '+27 21 456 7890' },
      { name: 'Maties Security', role: 'Campus Security', phone: '+27 21 808 9111' },
      { name: 'Emergency Services', role: 'Emergency', phone: '10111' },
    ],
    amenities: ['WiFi', 'Study Rooms', 'Bicycle Storage', 'Laundry', 'Common Kitchen', 'Garden Access'],
    houseRules: [
      'Quiet study hours: 2 PM - 6 PM, 8 PM - 8 AM',
      'Overnight guests allowed with notice',
      'Bicycle parking only in designated areas',
      'No loud music after 9 PM',
      'Participate in house meetings',
    ],
    offerDate: '2025-10-22',
    expiryDate: '2025-10-29',
    status: 'pending',
    applicationId: 'app_3',
  },
];

type UserStatusContextType = {
  userStatus: UserStatus;
  setUserStatus: (status: UserStatus) => void;
  approvedAccommodation: ApprovedAccommodation | null;
  setApprovedAccommodation: (accommodation: ApprovedAccommodation | null) => void;
  accommodationOffers: AccommodationOffer[];
  setAccommodationOffers: (offers: AccommodationOffer[]) => void;
  acceptOffer: (offerId: string) => Promise<void>;
  declineOffer: (offerId: string) => Promise<void>;
  simulateOffers: () => void;
  resetToSearching: () => void;
};

const UserStatusContext = createContext<UserStatusContextType | undefined>(undefined);

export const useUserStatus = (): UserStatusContextType => {
  const context = useContext(UserStatusContext);
  if (!context) {
    throw new Error('useUserStatus must be used within a UserStatusProvider');
  }
  return context;
};

type UserStatusProviderProps = {
  children: React.ReactNode;
};

export const UserStatusProvider: React.FC<UserStatusProviderProps> = ({ children }) => {
  const [userStatus, setUserStatusState] = useState<UserStatus>('searching');
  const [approvedAccommodation, setApprovedAccommodationState] = useState<ApprovedAccommodation | null>(null);
  const [accommodationOffers, setAccommodationOffersState] = useState<AccommodationOffer[]>([]);

  // Load user status from AsyncStorage on mount
  useEffect(() => {
    const loadUserStatus = async () => {
      try {
        const savedStatus = await AsyncStorage.getItem('userStatus');
        const savedAccommodation = await AsyncStorage.getItem('approvedAccommodation');
        const savedOffers = await AsyncStorage.getItem('accommodationOffers');
        
        if (savedStatus && ['searching', 'approved', 'resident'].includes(savedStatus)) {
          setUserStatusState(savedStatus as UserStatus);
        }
        
        if (savedAccommodation) {
          const parsedAccommodation = JSON.parse(savedAccommodation);
          setApprovedAccommodationState(parsedAccommodation);
        }

        if (savedOffers) {
          const parsedOffers = JSON.parse(savedOffers);
          setAccommodationOffersState(parsedOffers);
        }
      } catch (error) {
        console.error('Error loading user status:', error);
      }
    };

    loadUserStatus();
  }, []);

  // Save user status to AsyncStorage
  const setUserStatus = async (status: UserStatus) => {
    try {
      await AsyncStorage.setItem('userStatus', status);
      setUserStatusState(status);
    } catch (error) {
      console.error('Error saving user status:', error);
    }
  };

  // Save approved accommodation to AsyncStorage
  const setApprovedAccommodation = async (accommodation: ApprovedAccommodation | null) => {
    try {
      if (accommodation) {
        await AsyncStorage.setItem('approvedAccommodation', JSON.stringify(accommodation));
      } else {
        await AsyncStorage.removeItem('approvedAccommodation');
      }
      setApprovedAccommodationState(accommodation);
    } catch (error) {
      console.error('Error saving approved accommodation:', error);
    }
  };

  // Save accommodation offers to AsyncStorage
  const setAccommodationOffers = async (offers: AccommodationOffer[]) => {
    try {
      await AsyncStorage.setItem('accommodationOffers', JSON.stringify(offers));
      setAccommodationOffersState(offers);
    } catch (error) {
      console.error('Error saving accommodation offers:', error);
    }
  };

  // Accept an accommodation offer
  const acceptOffer = async (offerId: string) => {
    try {
      const offer = accommodationOffers.find(o => o.id === offerId);
      if (!offer) return;

      // Create approved accommodation from the accepted offer
      const approvedAccommodation: ApprovedAccommodation = {
        ...offer,
        approvalDate: offer.offerDate,
        acceptedDate: new Date().toISOString(),
      };

      // Update offer status to accepted
      const updatedOffers = accommodationOffers.map(o => 
        o.id === offerId ? { ...o, status: 'accepted' as const } : o
      );

      // Save the accepted accommodation and update offers
      await setApprovedAccommodation(approvedAccommodation);
      await setAccommodationOffers(updatedOffers);
      await setUserStatus('approved');
    } catch (error) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  };

  // Decline an accommodation offer
  const declineOffer = async (offerId: string) => {
    try {
      const updatedOffers = accommodationOffers.map(o => 
        o.id === offerId ? { ...o, status: 'declined' as const } : o
      );
      await setAccommodationOffers(updatedOffers);
    } catch (error) {
      console.error('Error declining offer:', error);
      throw error;
    }
  };

  // Simulate receiving accommodation offers (for demo purposes)
  const simulateOffers = async () => {
    try {
      await setAccommodationOffers(MOCK_ACCOMMODATION_OFFERS);
    } catch (error) {
      console.error('Error simulating offers:', error);
    }
  };

  // Reset to searching phase (for testing)
  const resetToSearching = async () => {
    try {
      await setApprovedAccommodation(null);
      await setAccommodationOffers([]);
      await setUserStatus('searching');
    } catch (error) {
      console.error('Error resetting to searching:', error);
    }
  };

  return (
    <UserStatusContext.Provider
      value={{
        userStatus,
        setUserStatus,
        approvedAccommodation,
        setApprovedAccommodation,
        accommodationOffers,
        setAccommodationOffers,
        resetToSearching,
        acceptOffer,
        declineOffer,
        simulateOffers,
      }}
    >
      {children}
    </UserStatusContext.Provider>
  );
};