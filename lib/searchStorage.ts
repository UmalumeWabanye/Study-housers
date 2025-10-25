import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = 'search_history';
const SEARCH_SUGGESTIONS_KEY = 'search_suggestions';

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  filters?: SearchFilters;
}

export interface SearchFilters {
  priceRange: {
    min: number;
    max: number;
  };
  roomTypes: string[];
  locations: string[];
  universities: string[];
  amenities: string[];
  propertyTypes: string[];
  availability: 'any' | 'available' | 'soon';
  furnished: 'any' | 'furnished' | 'unfurnished';
  parking: boolean | null;
  petFriendly: boolean | null;
  moveInDate?: Date;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'location' | 'university' | 'property_type' | 'amenity' | 'general';
  frequency: number;
}

// Predefined suggestions for autocomplete
const DEFAULT_SUGGESTIONS: SearchSuggestion[] = [
  // Locations
  { id: '1', text: 'Observatory', type: 'location', frequency: 100 },
  { id: '2', text: 'Rondebosch', type: 'location', frequency: 95 },
  { id: '3', text: 'Claremont', type: 'location', frequency: 90 },
  { id: '4', text: 'Mowbray', type: 'location', frequency: 85 },
  { id: '5', text: 'Woodstock', type: 'location', frequency: 80 },
  { id: '6', text: 'Cape Town CBD', type: 'location', frequency: 75 },
  { id: '7', text: 'Bellville', type: 'location', frequency: 70 },
  { id: '8', text: 'Stellenbosch', type: 'location', frequency: 65 },
  { id: '9', text: 'Braamfontein', type: 'location', frequency: 60 },
  { id: '10', text: 'Melville', type: 'location', frequency: 55 },
  
  // Universities
  { id: '11', text: 'University of Cape Town', type: 'university', frequency: 100 },
  { id: '12', text: 'UCT', type: 'university', frequency: 98 },
  { id: '13', text: 'University of the Witwatersrand', type: 'university', frequency: 95 },
  { id: '14', text: 'Wits', type: 'university', frequency: 93 },
  { id: '15', text: 'Stellenbosch University', type: 'university', frequency: 90 },
  { id: '16', text: 'Cape Peninsula University of Technology', type: 'university', frequency: 85 },
  { id: '17', text: 'CPUT', type: 'university', frequency: 83 },
  { id: '18', text: 'University of Johannesburg', type: 'university', frequency: 80 },
  { id: '19', text: 'UJ', type: 'university', frequency: 78 },
  
  // Property Types
  { id: '20', text: 'Studio Apartment', type: 'property_type', frequency: 90 },
  { id: '21', text: 'Shared Flat', type: 'property_type', frequency: 85 },
  { id: '22', text: 'Residence Room', type: 'property_type', frequency: 95 },
  { id: '23', text: 'Co-Living Space', type: 'property_type', frequency: 75 },
  { id: '24', text: 'Traditional Digs', type: 'property_type', frequency: 70 },
  { id: '25', text: 'Bachelor Flat', type: 'property_type', frequency: 65 },
  { id: '26', text: 'One Bedroom', type: 'property_type', frequency: 80 },
  
  // Amenities
  { id: '27', text: 'WiFi included', type: 'amenity', frequency: 100 },
  { id: '28', text: 'Parking available', type: 'amenity', frequency: 85 },
  { id: '29', text: 'Gym access', type: 'amenity', frequency: 70 },
  { id: '30', text: '24/7 Security', type: 'amenity', frequency: 90 },
  { id: '31', text: 'Laundry facilities', type: 'amenity', frequency: 95 },
  { id: '32', text: 'Study areas', type: 'amenity', frequency: 80 },
  { id: '33', text: 'Kitchen access', type: 'amenity', frequency: 85 },
  { id: '34', text: 'Pet friendly', type: 'amenity', frequency: 40 },
  { id: '35', text: 'Furnished', type: 'amenity', frequency: 90 },
  { id: '36', text: 'Air conditioning', type: 'amenity', frequency: 60 },
];

export class SearchStorage {
  static async getSearchHistory(): Promise<SearchHistoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (data) {
        const history = JSON.parse(data);
        return history.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
          filters: item.filters ? {
            ...item.filters,
            moveInDate: item.filters.moveInDate ? new Date(item.filters.moveInDate) : undefined,
          } : undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  static async addSearchToHistory(query: string, filters?: SearchFilters): Promise<void> {
    try {
      if (!query.trim()) return;
      
      const history = await this.getSearchHistory();
      
      // Remove duplicate if exists
      const filteredHistory = history.filter(item => item.query.toLowerCase() !== query.toLowerCase());
      
      const newHistoryItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: new Date(),
        filters,
      };
      
      // Add to beginning and keep only last 20 searches
      const updatedHistory = [newHistoryItem, ...filteredHistory].slice(0, 20);
      
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
      
      // Update suggestions frequency
      await this.updateSuggestionFrequency(query);
    } catch (error) {
      console.error('Error adding search to history:', error);
    }
  }

  static async clearSearchHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  static async getSuggestions(): Promise<SearchSuggestion[]> {
    try {
      const data = await AsyncStorage.getItem(SEARCH_SUGGESTIONS_KEY);
      if (data) {
        const suggestions = JSON.parse(data);
        return suggestions.sort((a: SearchSuggestion, b: SearchSuggestion) => b.frequency - a.frequency);
      }
      // Initialize with default suggestions
      await AsyncStorage.setItem(SEARCH_SUGGESTIONS_KEY, JSON.stringify(DEFAULT_SUGGESTIONS));
      return DEFAULT_SUGGESTIONS.sort((a, b) => b.frequency - a.frequency);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return DEFAULT_SUGGESTIONS;
    }
  }

  static async getFilteredSuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      const allSuggestions = await this.getSuggestions();
      const searchHistory = await this.getSearchHistory();
      
      if (!query.trim()) {
        // Return recent searches and top suggestions
        const recentSearches: SearchSuggestion[] = searchHistory
          .slice(0, 5)
          .map(item => ({
            id: `history_${item.id}`,
            text: item.query,
            type: 'general' as const,
            frequency: 1000, // High frequency for recent searches
          }));
        
        const topSuggestions = allSuggestions.slice(0, 10);
        return [...recentSearches, ...topSuggestions];
      }
      
      // Filter suggestions based on query
      const filtered = allSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      );
      
      return filtered.slice(0, 8);
    } catch (error) {
      console.error('Error getting filtered suggestions:', error);
      return [];
    }
  }

  private static async updateSuggestionFrequency(query: string): Promise<void> {
    try {
      const suggestions = await this.getSuggestions();
      
      // Find if query matches any existing suggestion
      const matchingSuggestion = suggestions.find(s => 
        s.text.toLowerCase().includes(query.toLowerCase()) || 
        query.toLowerCase().includes(s.text.toLowerCase())
      );
      
      if (matchingSuggestion) {
        matchingSuggestion.frequency += 1;
        await AsyncStorage.setItem(SEARCH_SUGGESTIONS_KEY, JSON.stringify(suggestions));
      } else {
        // Add as new suggestion if it's a meaningful query (more than 2 characters)
        if (query.length > 2) {
          const newSuggestion: SearchSuggestion = {
            id: Date.now().toString(),
            text: query,
            type: 'general',
            frequency: 1,
          };
          
          suggestions.push(newSuggestion);
          
          // Keep only top 100 suggestions
          const sortedSuggestions = suggestions
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 100);
          
          await AsyncStorage.setItem(SEARCH_SUGGESTIONS_KEY, JSON.stringify(sortedSuggestions));
        }
      }
    } catch (error) {
      console.error('Error updating suggestion frequency:', error);
    }
  }

  static getDefaultFilters(): SearchFilters {
    return {
      priceRange: { min: 0, max: 20000 },
      roomTypes: [],
      locations: [],
      universities: [],
      amenities: [],
      propertyTypes: [],
      availability: 'any',
      furnished: 'any',
      parking: null,
      petFriendly: null,
    };
  }

  static async getSearchFilters(): Promise<SearchFilters> {
    try {
      const data = await AsyncStorage.getItem('search_filters');
      if (data) {
        const filters = JSON.parse(data);
        return {
          ...filters,
          moveInDate: filters.moveInDate ? new Date(filters.moveInDate) : undefined,
        };
      }
      return this.getDefaultFilters();
    } catch (error) {
      console.error('Error getting search filters:', error);
      return this.getDefaultFilters();
    }
  }

  static async saveSearchFilters(filters: SearchFilters): Promise<void> {
    try {
      await AsyncStorage.setItem('search_filters', JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving search filters:', error);
    }
  }
}