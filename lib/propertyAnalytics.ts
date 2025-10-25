import { AccommodationType, ENHANCED_LISTINGS, PropertyListing } from './enhancedPropertyData';

export interface PriceAnalysis {
  min: number;
  max: number;
  average: number;
  median: number;
  ranges: {
    budget: { min: number; max: number; count: number };
    affordable: { min: number; max: number; count: number };
    premium: { min: number; max: number; count: number };
    luxury: { min: number; max: number; count: number };
  };
}

export interface AmenityAnalysis {
  category: string;
  amenities: {
    name: string;
    frequency: number;
    percentage: number;
    category: 'essential' | 'comfort' | 'luxury' | 'study' | 'recreation';
  }[];
}

export interface PropertyTypeAnalysis {
  type: string;
  count: number;
  percentage: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
}

export interface LocationAnalysis {
  location: string;
  university: string;
  count: number;
  averagePrice: number;
  safetyRating: number;
  transportOptions: string[];
}

export interface FeatureAnalysis {
  feature: string;
  availability: {
    total: number;
    available: number;
    percentage: number;
  };
  priceImpact: {
    withFeature: number;
    withoutFeature: number;
    difference: number;
    percentageIncrease: number;
  };
}

export class PropertyAnalytics {
  private static listings = ENHANCED_LISTINGS;

  // Get all accommodation types flattened with property context
  private static getAllAccommodations(): {
    accommodation: AccommodationType;
    property: PropertyListing;
  }[] {
    const accommodations: {
      accommodation: AccommodationType;
      property: PropertyListing;
    }[] = [];
    
    this.listings.forEach(property => {
      property.accommodationTypes.forEach(accommodation => {
        accommodations.push({ accommodation, property });
      });
    });
    
    return accommodations;
  }

  // Analyze price patterns and create intelligent price ranges
  static analyzePrices(): PriceAnalysis {
    const accommodations = this.getAllAccommodations();
    const prices = accommodations.map(item => item.accommodation.priceNumeric).sort((a, b) => a - b);
    
    if (prices.length === 0) {
      return {
        min: 0, max: 0, average: 0, median: 0,
        ranges: {
          budget: { min: 0, max: 0, count: 0 },
          affordable: { min: 0, max: 0, count: 0 },
          premium: { min: 0, max: 0, count: 0 },
          luxury: { min: 0, max: 0, count: 0 }
        }
      };
    }

    const min = prices[0];
    const max = prices[prices.length - 1];
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const median = prices[Math.floor(prices.length / 2)];
    
    // Create intelligent price ranges based on quartiles
    const q1 = prices[Math.floor(prices.length * 0.25)];
    const q3 = prices[Math.floor(prices.length * 0.75)];
    
    const ranges = {
      budget: { 
        min: min, 
        max: q1,
        count: prices.filter(p => p <= q1).length
      },
      affordable: { 
        min: q1 + 1, 
        max: median,
        count: prices.filter(p => p > q1 && p <= median).length
      },
      premium: { 
        min: median + 1, 
        max: q3,
        count: prices.filter(p => p > median && p <= q3).length
      },
      luxury: { 
        min: q3 + 1, 
        max: max,
        count: prices.filter(p => p > q3).length
      }
    };

    return { min, max, average, median, ranges };
  }

  // Categorize and analyze amenities by importance and frequency
  static analyzeAmenities(): AmenityAnalysis[] {
    const accommodations = this.getAllAccommodations();
    const amenityCount = new Map<string, number>();
    const totalAccommodations = accommodations.length;

    // Count all amenities (both accommodation and building amenities)
    accommodations.forEach(({ accommodation, property }) => {
      const allAmenities = [...accommodation.amenities, ...property.buildingAmenities];
      allAmenities.forEach(amenity => {
        amenityCount.set(amenity, (amenityCount.get(amenity) || 0) + 1);
      });
    });

    // Categorize amenities
    const categorizeAmenity = (amenity: string): 'essential' | 'comfort' | 'luxury' | 'study' | 'recreation' => {
      const lowerAmenity = amenity.toLowerCase();
      
      if (lowerAmenity.includes('wifi') || lowerAmenity.includes('internet') || 
          lowerAmenity.includes('security') || lowerAmenity.includes('bathroom')) {
        return 'essential';
      }
      
      if (lowerAmenity.includes('study') || lowerAmenity.includes('desk') || 
          lowerAmenity.includes('library') || lowerAmenity.includes('quiet')) {
        return 'study';
      }
      
      if (lowerAmenity.includes('gym') || lowerAmenity.includes('pool') || 
          lowerAmenity.includes('recreation') || lowerAmenity.includes('garden')) {
        return 'recreation';
      }
      
      if (lowerAmenity.includes('air condition') || lowerAmenity.includes('concierge') || 
          lowerAmenity.includes('elevator') || lowerAmenity.includes('premium')) {
        return 'luxury';
      }
      
      return 'comfort';
    };

    // Group amenities by category
    const categories = new Map<string, {
      name: string;
      frequency: number;
      percentage: number;
      category: 'essential' | 'comfort' | 'luxury' | 'study' | 'recreation';
    }[]>();

    amenityCount.forEach((count, amenity) => {
      const category = categorizeAmenity(amenity);
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      
      if (!categories.has(categoryName)) {
        categories.set(categoryName, []);
      }
      
      categories.get(categoryName)!.push({
        name: amenity,
        frequency: count,
        percentage: Math.round((count / totalAccommodations) * 100),
        category
      });
    });

    // Sort amenities within each category by frequency
    const result: AmenityAnalysis[] = [];
    categories.forEach((amenities, categoryName) => {
      amenities.sort((a, b) => b.frequency - a.frequency);
      result.push({
        category: categoryName,
        amenities
      });
    });

    return result.sort((a, b) => a.category.localeCompare(b.category));
  }

  // Analyze property type distribution and pricing
  static analyzePropertyTypes(): PropertyTypeAnalysis[] {
    const accommodations = this.getAllAccommodations();
    const typeCount = new Map<string, number>();
    const typePrices = new Map<string, number[]>();

    accommodations.forEach(({ accommodation }) => {
      const type = accommodation.type;
      typeCount.set(type, (typeCount.get(type) || 0) + 1);
      
      if (!typePrices.has(type)) {
        typePrices.set(type, []);
      }
      typePrices.get(type)!.push(accommodation.priceNumeric);
    });

    const totalAccommodations = accommodations.length;
    const result: PropertyTypeAnalysis[] = [];

    typeCount.forEach((count, type) => {
      const prices = typePrices.get(type)!.sort((a, b) => a - b);
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

      result.push({
        type,
        count,
        percentage: Math.round((count / totalAccommodations) * 100),
        averagePrice: Math.round(averagePrice),
        priceRange: {
          min: prices[0],
          max: prices[prices.length - 1]
        }
      });
    });

    return result.sort((a, b) => b.count - a.count);
  }

  // Analyze location patterns and characteristics
  static analyzeLocations(): LocationAnalysis[] {
    const locationMap = new Map<string, {
      properties: PropertyListing[];
      accommodations: AccommodationType[];
    }>();

    this.listings.forEach(property => {
      const location = property.location;
      if (!locationMap.has(location)) {
        locationMap.set(location, { properties: [], accommodations: [] });
      }
      
      const locationData = locationMap.get(location)!;
      locationData.properties.push(property);
      locationData.accommodations.push(...property.accommodationTypes);
    });

    const result: LocationAnalysis[] = [];

    locationMap.forEach((data, location) => {
      const property = data.properties[0]; // Get reference property for location data
      const prices = data.accommodations.map(acc => acc.priceNumeric);
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

      result.push({
        location,
        university: property.university,
        count: data.accommodations.length,
        averagePrice: Math.round(averagePrice),
        safetyRating: property.neighborhood.safety_rating,
        transportOptions: property.neighborhood.transport_access
      });
    });

    return result.sort((a, b) => b.count - a.count);
  }

  // Analyze feature impact on pricing and availability
  static analyzeFeatures(): FeatureAnalysis[] {
    const accommodations = this.getAllAccommodations();
    const features = [
      'furnished', 'parking', 'petFriendly', 'En-suite', 'Private', 
      'Air conditioning', 'Balcony', 'Garden'
    ];

    const result: FeatureAnalysis[] = [];

    features.forEach(featureName => {
      const withFeature: number[] = [];
      const withoutFeature: number[] = [];

      accommodations.forEach(({ accommodation }) => {
        const hasFeature = this.checkFeature(accommodation, featureName);
        
        if (hasFeature) {
          withFeature.push(accommodation.priceNumeric);
        } else {
          withoutFeature.push(accommodation.priceNumeric);
        }
      });

      if (withFeature.length > 0 && withoutFeature.length > 0) {
        const avgWith = withFeature.reduce((sum, price) => sum + price, 0) / withFeature.length;
        const avgWithout = withoutFeature.reduce((sum, price) => sum + price, 0) / withoutFeature.length;
        const difference = avgWith - avgWithout;
        const percentageIncrease = Math.round((difference / avgWithout) * 100);

        result.push({
          feature: featureName,
          availability: {
            total: accommodations.length,
            available: withFeature.length,
            percentage: Math.round((withFeature.length / accommodations.length) * 100)
          },
          priceImpact: {
            withFeature: Math.round(avgWith),
            withoutFeature: Math.round(avgWithout),
            difference: Math.round(difference),
            percentageIncrease
          }
        });
      }
    });

    return result.sort((a, b) => b.priceImpact.percentageIncrease - a.priceImpact.percentageIncrease);
  }

  // Helper method to check if accommodation has a specific feature
  private static checkFeature(accommodation: AccommodationType, featureName: string): boolean {
    const lowerFeature = featureName.toLowerCase();
    
    switch (lowerFeature) {
      case 'furnished':
        return accommodation.features.furnished;
      case 'parking':
        return accommodation.features.parking;
      case 'petfriendly':
        return accommodation.features.petFriendly;
      case 'en-suite':
        return accommodation.features.bathrooms.toLowerCase().includes('en-suite');
      case 'private':
        return accommodation.features.bathrooms.toLowerCase().includes('private');
      default:
        // Check in amenities
        const allAmenities = accommodation.amenities.join(' ').toLowerCase();
        return allAmenities.includes(lowerFeature);
    }
  }

  // Get smart filter suggestions based on current search query and results
  static getSmartFilterSuggestions(
    query: string, 
    currentResults?: { property: PropertyListing; accommodation: AccommodationType }[]
  ): {
    priceRanges: { label: string; min: number; max: number; count: number }[];
    popularAmenities: { name: string; count: number }[];
    locations: { name: string; count: number; avgPrice: number }[];
    propertyTypes: { name: string; count: number; avgPrice: number }[];
  } {
    const dataToAnalyze = currentResults || this.getAllAccommodations();
    
    // Analyze current result set
    const priceAnalysis = this.analyzePrices();
    
    // Generate price range suggestions
    const priceRanges = [
      { 
        label: `Budget (R${priceAnalysis.ranges.budget.min} - R${priceAnalysis.ranges.budget.max})`, 
        min: priceAnalysis.ranges.budget.min, 
        max: priceAnalysis.ranges.budget.max,
        count: priceAnalysis.ranges.budget.count
      },
      { 
        label: `Affordable (R${priceAnalysis.ranges.affordable.min} - R${priceAnalysis.ranges.affordable.max})`, 
        min: priceAnalysis.ranges.affordable.min, 
        max: priceAnalysis.ranges.affordable.max,
        count: priceAnalysis.ranges.affordable.count
      },
      { 
        label: `Premium (R${priceAnalysis.ranges.premium.min} - R${priceAnalysis.ranges.premium.max})`, 
        min: priceAnalysis.ranges.premium.min, 
        max: priceAnalysis.ranges.premium.max,
        count: priceAnalysis.ranges.premium.count
      }
    ].filter(range => range.count > 0);

    // Get popular amenities
    const amenityCount = new Map<string, number>();
    dataToAnalyze.forEach(({ accommodation, property }) => {
      [...accommodation.amenities, ...property.buildingAmenities].forEach(amenity => {
        amenityCount.set(amenity, (amenityCount.get(amenity) || 0) + 1);
      });
    });
    
    const popularAmenities = Array.from(amenityCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    // Get location distribution
    const locationCount = new Map<string, { count: number; totalPrice: number }>();
    dataToAnalyze.forEach(({ accommodation, property }) => {
      const existing = locationCount.get(property.location) || { count: 0, totalPrice: 0 };
      locationCount.set(property.location, {
        count: existing.count + 1,
        totalPrice: existing.totalPrice + accommodation.priceNumeric
      });
    });
    
    const locations = Array.from(locationCount.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgPrice: Math.round(data.totalPrice / data.count)
      }))
      .sort((a, b) => b.count - a.count);

    // Get property type distribution
    const typeCount = new Map<string, { count: number; totalPrice: number }>();
    dataToAnalyze.forEach(({ accommodation }) => {
      const existing = typeCount.get(accommodation.type) || { count: 0, totalPrice: 0 };
      typeCount.set(accommodation.type, {
        count: existing.count + 1,
        totalPrice: existing.totalPrice + accommodation.priceNumeric
      });
    });
    
    const propertyTypes = Array.from(typeCount.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgPrice: Math.round(data.totalPrice / data.count)
      }))
      .sort((a, b) => b.count - a.count);

    return {
      priceRanges,
      popularAmenities,
      locations,
      propertyTypes
    };
  }

  // Generate comprehensive analytics report
  static generateAnalyticsReport() {
    return {
      overview: {
        totalProperties: this.listings.length,
        totalAccommodations: this.getAllAccommodations().length,
        averageAccommodationsPerProperty: Math.round(
          this.getAllAccommodations().length / this.listings.length * 10
        ) / 10
      },
      pricing: this.analyzePrices(),
      amenities: this.analyzeAmenities(),
      propertyTypes: this.analyzePropertyTypes(),
      locations: this.analyzeLocations(),
      features: this.analyzeFeatures(),
      smartSuggestions: this.getSmartFilterSuggestions('')
    };
  }
}