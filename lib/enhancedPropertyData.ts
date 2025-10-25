// Enhanced property data structure supporting multiple accommodation types per host
export interface PropertyHost {
  id: string;
  name: string;
  phone: string;
  email: string;
  verified: boolean;
  chatId: string;
  image?: string;
  rating?: number;
  responseTime?: string;
  totalProperties?: number;
}

export interface AccommodationType {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  priceNumeric: number;
  image: any;
  images: any[];
  badge?: string | null;
  type: string;
  roomType?: string;
  description: string;
  amenities: string[];
  features: {
    bedrooms: number | string;
    bathrooms: string;
    furnished: boolean;
    parking: boolean;
    petFriendly: boolean;
    size?: string;
    floor?: number;
  };
  availability: {
    available: boolean;
    moveInDate: string;
    leaseDuration: string;
    availableUnits?: number;
  };
  reviews?: {
    rating: number;
    count: number;
    recent: {
      name: string;
      rating: number;
      comment: string;
      date: string;
    }[];
  };
}

export interface PropertyListing {
  id: string;
  host: PropertyHost;
  location: string;
  university: string;
  coordinates: { lat: number; lng: number };
  accommodationTypes: AccommodationType[];
  buildingAmenities: string[];
  buildingFeatures: {
    yearBuilt?: number;
    floors?: number;
    totalUnits?: number;
    security: boolean;
    elevator?: boolean;
    backup_power?: boolean;
  };
  neighborhood: {
    safety_rating: number;
    transport_access: string[];
    nearby_facilities: string[];
  };
}

// Enhanced property data with multiple accommodation types per host
export const ENHANCED_LISTINGS: PropertyListing[] = [
  {
    id: 'property_1',
    host: {
      id: 'host_1',
      name: 'Sarah Johnson',
      phone: '+27 21 123 4567',
      email: 'sarah@uctres.ac.za',
      verified: true,
      chatId: 'sarah_johnson_uct',
      image: require('../assets/images/icon.png'),
      rating: 4.8,
      responseTime: 'Usually responds within 2 hours',
      totalProperties: 3,
    },
    location: 'Upper Campus, Rondebosch',
    university: 'University of Cape Town',
    coordinates: { lat: -33.9577, lng: 18.4612 },
    buildingAmenities: ['24/7 Security', 'Study Lounges', 'Laundry Facilities', 'Common Kitchen', 'WiFi Throughout', 'Cleaning Service'],
    buildingFeatures: {
      yearBuilt: 2018,
      floors: 4,
      totalUnits: 120,
      security: true,
      elevator: true,
      backup_power: true,
    },
    neighborhood: {
      safety_rating: 4.5,
      transport_access: ['UCT Shuttle', 'MyCiti Bus', 'Walking Distance to Campus'],
      nearby_facilities: ['UCT Libraries', 'Lecture Halls', 'Sports Centre', 'Medical Centre'],
    },
    accommodationTypes: [
      {
        id: 'acc_1_1',
        title: 'Standard Residence Room',
        subtitle: 'UCT Upper Campus · Shared bathroom · WiFi included',
        price: 'R4,500/month',
        priceNumeric: 4500,
        image: require('../assets/images/icon.png'),
        images: [
          require('../assets/images/icon.png'),
          require('../assets/images/react-logo.png'),
          require('../assets/images/partial-react-logo.png'),
        ],
        badge: 'Popular',
        type: 'Residence Room',
        roomType: 'Single',
        description: 'Comfortable single room in modern student residence with shared bathroom facilities. Perfect for first-year students.',
        amenities: ['High-speed WiFi', 'Shared bathroom (2:1 ratio)', 'Ergonomic study desk', 'Built-in wardrobe', 'Heating'],
        features: {
          bedrooms: 1,
          bathrooms: 'Shared',
          furnished: true,
          parking: false,
          petFriendly: false,
          size: '12m²',
          floor: 2,
        },
        availability: {
          available: true,
          moveInDate: '2025-02-01',
          leaseDuration: '12 months',
          availableUnits: 8,
        },
        reviews: {
          rating: 4.5,
          count: 23,
          recent: [
            { name: 'John D.', rating: 5, comment: 'Great location, very clean facilities!', date: '2024-09-15' },
          ],
        },
      },
      {
        id: 'acc_1_2',
        title: 'Premium Residence Room',
        subtitle: 'UCT Upper Campus · En-suite bathroom · WiFi included',
        price: 'R6,200/month',
        priceNumeric: 6200,
        image: require('../assets/images/react-logo.png'),
        images: [
          require('../assets/images/react-logo.png'),
          require('../assets/images/icon.png'),
          require('../assets/images/partial-react-logo.png'),
        ],
        badge: 'Premium',
        type: 'Residence Room',
        roomType: 'Single En-suite',
        description: 'Spacious single room with private en-suite bathroom. Features modern furnishings and additional storage space.',
        amenities: ['High-speed WiFi', 'En-suite bathroom', 'Ergonomic study desk', 'Built-in wardrobe', 'Air conditioning', 'Mini-fridge'],
        features: {
          bedrooms: 1,
          bathrooms: 'En-suite',
          furnished: true,
          parking: false,
          petFriendly: false,
          size: '16m²',
          floor: 3,
        },
        availability: {
          available: true,
          moveInDate: '2025-02-01',
          leaseDuration: '12 months',
          availableUnits: 4,
        },
        reviews: {
          rating: 4.7,
          count: 15,
          recent: [
            { name: 'Mary K.', rating: 5, comment: 'Love the private bathroom and AC!', date: '2024-09-10' },
          ],
        },
      },
    ],
  },
  {
    id: 'property_2',
    host: {
      id: 'host_2',
      name: 'Michael Chen',
      phone: '+27 82 456 7890',
      email: 'mike.chen@gmail.com',
      verified: true,
      chatId: 'michael_chen_obs',
      rating: 4.6,
      responseTime: 'Usually responds within 4 hours',
      totalProperties: 2,
    },
    location: 'Observatory, Cape Town',
    university: 'University of Cape Town',
    coordinates: { lat: -33.9352, lng: 18.4734 },
    buildingAmenities: ['High-speed WiFi', 'Washing machine', 'Full kitchen', 'Garden space', 'Secure building'],
    buildingFeatures: {
      yearBuilt: 2015,
      floors: 2,
      totalUnits: 6,
      security: true,
      elevator: false,
      backup_power: false,
    },
    neighborhood: {
      safety_rating: 4.2,
      transport_access: ['UCT Shuttle Route', 'MyCiti Bus', 'Uber/Bolt accessible'],
      nearby_facilities: ['Observatory Market', 'Cafes & Restaurants', 'Grocery Stores', 'Pharmacy'],
    },
    accommodationTypes: [
      {
        id: 'acc_2_1',
        title: 'Shared Flat - Single Room',
        subtitle: 'Observatory · 3-bedroom flat · Kitchen access',
        price: 'R5,800/month',
        priceNumeric: 5800,
        image: require('../assets/images/react-logo.png'),
        images: [
          require('../assets/images/react-logo.png'),
          require('../assets/images/icon.png'),
        ],
        badge: null,
        type: 'Shared Flat',
        roomType: 'Single in Shared Flat',
        description: 'Single room in a 3-bedroom flat shared with other students. Includes access to full kitchen and living areas.',
        amenities: ['Full kitchen access', 'Spacious living room', 'Garden space', 'High-speed WiFi', 'Washing machine'],
        features: {
          bedrooms: 1,
          bathrooms: 'Shared (2 bathrooms)',
          furnished: true,
          parking: true,
          petFriendly: true,
          size: '14m²',
          floor: 1,
        },
        availability: {
          available: true,
          moveInDate: '2025-01-15',
          leaseDuration: '12 months',
          availableUnits: 1,
        },
        reviews: {
          rating: 4.4,
          count: 18,
          recent: [
            { name: 'Alex P.', rating: 4, comment: 'Great community feel, love the kitchen!', date: '2024-08-20' },
          ],
        },
      },
      {
        id: 'acc_2_2',
        title: 'Shared Flat - Double Room',
        subtitle: 'Observatory · 3-bedroom flat · Kitchen access',
        price: 'R4,200/month',
        priceNumeric: 4200,
        image: require('../assets/images/partial-react-logo.png'),
        images: [
          require('../assets/images/partial-react-logo.png'),
          require('../assets/images/react-logo.png'),
        ],
        badge: 'Budget',
        type: 'Shared Flat',
        roomType: 'Double in Shared Flat',
        description: 'Double room in shared flat, perfect for students who want to share accommodation costs with a roommate.',
        amenities: ['Full kitchen access', 'Spacious living room', 'Garden space', 'High-speed WiFi', 'Washing machine'],
        features: {
          bedrooms: 1,
          bathrooms: 'Shared (2 bathrooms)',
          furnished: true,
          parking: true,
          petFriendly: true,
          size: '18m²',
          floor: 2,
        },
        availability: {
          available: false,
          moveInDate: '2025-03-01',
          leaseDuration: '12 months',
          availableUnits: 0,
        },
        reviews: {
          rating: 4.2,
          count: 12,
          recent: [
            { name: 'Sam T.', rating: 4, comment: 'Good value for money, friendly flatmates.', date: '2024-07-15' },
          ],
        },
      },
    ],
  },
  {
    id: 'property_3',
    host: {
      id: 'host_3',
      name: 'Emma Williams',
      phone: '+27 84 789 0123',
      email: 'emma@stellenboschstudios.co.za',
      verified: true,
      chatId: 'emma_williams_stellies',
      rating: 4.9,
      responseTime: 'Usually responds within 1 hour',
      totalProperties: 5,
    },
    location: 'Central Stellenbosch',
    university: 'Stellenbosch University',
    coordinates: { lat: -33.9321, lng: 18.8602 },
    buildingAmenities: ['24/7 Concierge', 'Gym access', 'Swimming pool', 'Study rooms', 'High-speed WiFi', 'Cleaning service'],
    buildingFeatures: {
      yearBuilt: 2020,
      floors: 8,
      totalUnits: 80,
      security: true,
      elevator: true,
      backup_power: true,
    },
    neighborhood: {
      safety_rating: 4.8,
      transport_access: ['University Shuttle', 'Metered Taxi', 'Walking Distance'],
      nearby_facilities: ['Stellenbosch University', 'Eikestad Mall', 'Medical Centre', 'Banks'],
    },
    accommodationTypes: [
      {
        id: 'acc_3_1',
        title: 'Studio Apartment',
        subtitle: 'Central Stellenbosch · Private space · Kitchenette',
        price: 'R8,900/month',
        priceNumeric: 8900,
        image: require('../assets/images/partial-react-logo.png'),
        images: [
          require('../assets/images/partial-react-logo.png'),
          require('../assets/images/react-logo.png'),
          require('../assets/images/icon.png'),
        ],
        badge: 'New',
        type: 'Studio Apartment',
        roomType: 'Studio',
        description: 'Modern studio apartment with private bathroom and kitchenette. Perfect for postgraduate students.',
        amenities: ['Kitchenette with induction stove', 'Private bathroom', 'Study nook', 'Air conditioning', 'Built-in wardrobe'],
        features: {
          bedrooms: 'Studio',
          bathrooms: 'Private',
          furnished: true,
          parking: true,
          petFriendly: false,
          size: '28m²',
          floor: 5,
        },
        availability: {
          available: true,
          moveInDate: '2025-01-01',
          leaseDuration: '12 months',
          availableUnits: 3,
        },
        reviews: {
          rating: 4.8,
          count: 25,
          recent: [
            { name: 'Lisa M.', rating: 5, comment: 'Perfect for postgrad life, very modern!', date: '2024-09-05' },
          ],
        },
      },
      {
        id: 'acc_3_2',
        title: 'One Bedroom Apartment',
        subtitle: 'Central Stellenbosch · Separate bedroom · Full kitchen',
        price: 'R11,500/month',
        priceNumeric: 11500,
        image: require('../assets/images/icon.png'),
        images: [
          require('../assets/images/icon.png'),
          require('../assets/images/react-logo.png'),
        ],
        badge: 'Premium',
        type: 'One Bedroom Apartment',
        roomType: 'One Bedroom',
        description: 'Spacious one-bedroom apartment with separate bedroom, living area, and full kitchen. Ideal for couples or mature students.',
        amenities: ['Full kitchen', 'Separate bedroom', 'Living area', 'Private bathroom', 'Balcony', 'Air conditioning'],
        features: {
          bedrooms: 1,
          bathrooms: 'Private',
          furnished: true,
          parking: true,
          petFriendly: true,
          size: '45m²',
          floor: 6,
        },
        availability: {
          available: true,
          moveInDate: '2025-02-15',
          leaseDuration: '12 months',
          availableUnits: 2,
        },
        reviews: {
          rating: 4.9,
          count: 19,
          recent: [
            { name: 'David K.', rating: 5, comment: 'Amazing space and location, worth every rand!', date: '2024-08-30' },
          ],
        },
      },
    ],
  },
];

// Helper functions for search and filtering
export class PropertySearch {
  static searchProperties(
    query: string,
    filters: any,
    listings: PropertyListing[] = ENHANCED_LISTINGS
  ): { property: PropertyListing; accommodation: AccommodationType }[] {
    const results: { property: PropertyListing; accommodation: AccommodationType }[] = [];
    
    for (const property of listings) {
      for (const accommodation of property.accommodationTypes) {
        if (this.matchesSearchCriteria(property, accommodation, query, filters)) {
          results.push({ property, accommodation });
        }
      }
    }
    
    return this.sortResults(results, query);
  }
  
  private static matchesSearchCriteria(
    property: PropertyListing,
    accommodation: AccommodationType,
    query: string,
    filters: any
  ): boolean {
    // Text search
    if (query.trim()) {
      const searchableText = [
        accommodation.title,
        accommodation.subtitle,
        accommodation.description,
        property.location,
        property.university,
        property.host.name,
        ...accommodation.amenities,
        ...property.buildingAmenities,
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query.toLowerCase())) {
        return false;
      }
    }
    
    // Price range filter
    if (filters.priceRange) {
      if (accommodation.priceNumeric < filters.priceRange.min || 
          accommodation.priceNumeric > filters.priceRange.max) {
        return false;
      }
    }
    
    // Property type filter
    if (filters.propertyTypes?.length > 0) {
      if (!filters.propertyTypes.some((type: string) => 
        accommodation.type.toLowerCase().includes(type.toLowerCase())
      )) {
        return false;
      }
    }
    
    // Room type filter
    if (filters.roomTypes?.length > 0) {
      if (!filters.roomTypes.some((type: string) => 
        accommodation.roomType?.toLowerCase().includes(type.toLowerCase()) ||
        accommodation.title.toLowerCase().includes(type.toLowerCase())
      )) {
        return false;
      }
    }
    
    // Location filter
    if (filters.locations?.length > 0) {
      if (!filters.locations.some((location: string) => 
        property.location.toLowerCase().includes(location.toLowerCase())
      )) {
        return false;
      }
    }
    
    // University filter
    if (filters.universities?.length > 0) {
      if (!filters.universities.some((university: string) => 
        property.university.toLowerCase().includes(university.toLowerCase())
      )) {
        return false;
      }
    }
    
    // Amenities filter
    if (filters.amenities?.length > 0) {
      const allAmenities = [...accommodation.amenities, ...property.buildingAmenities];
      if (!filters.amenities.some((amenity: string) => 
        allAmenities.some(a => a.toLowerCase().includes(amenity.toLowerCase()))
      )) {
        return false;
      }
    }
    
    // Availability filter
    if (filters.availability === 'available' && !accommodation.availability.available) {
      return false;
    }
    
    // Furnished filter
    if (filters.furnished === 'furnished' && !accommodation.features.furnished) {
      return false;
    } else if (filters.furnished === 'unfurnished' && accommodation.features.furnished) {
      return false;
    }
    
    // Parking filter
    if (filters.parking === true && !accommodation.features.parking) {
      return false;
    }
    
    // Pet friendly filter
    if (filters.petFriendly === true && !accommodation.features.petFriendly) {
      return false;
    }
    
    return true;
  }
  
  private static sortResults(
    results: { property: PropertyListing; accommodation: AccommodationType }[],
    query: string
  ) {
    return results.sort((a, b) => {
      // Sort by availability first
      if (a.accommodation.availability.available !== b.accommodation.availability.available) {
        return a.accommodation.availability.available ? -1 : 1;
      }
      
      // Sort by exact title matches
      if (query.trim()) {
        const aExactMatch = a.accommodation.title.toLowerCase().includes(query.toLowerCase());
        const bExactMatch = b.accommodation.title.toLowerCase().includes(query.toLowerCase());
        if (aExactMatch !== bExactMatch) {
          return aExactMatch ? -1 : 1;
        }
      }
      
      // Sort by rating
      const aRating = a.accommodation.reviews?.rating || 0;
      const bRating = b.accommodation.reviews?.rating || 0;
      if (aRating !== bRating) {
        return bRating - aRating;
      }
      
      // Sort by price (ascending)
      return a.accommodation.priceNumeric - b.accommodation.priceNumeric;
    });
  }
}