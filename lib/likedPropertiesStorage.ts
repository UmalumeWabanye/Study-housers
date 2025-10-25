import AsyncStorage from '@react-native-async-storage/async-storage';

const LIKED_PROPERTIES_KEY = 'liked_properties';

export interface LikedProperty {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  priceNumeric: number;
  image: any;
  badge: string | null;
  type: string;
  university: string;
  location: string;
  likedAt: Date;
}

export class LikedPropertiesStorage {
  static async getLikedProperties(): Promise<LikedProperty[]> {
    try {
      const data = await AsyncStorage.getItem(LIKED_PROPERTIES_KEY);
      if (data) {
        const properties = JSON.parse(data);
        // Convert timestamp strings back to Date objects
        return properties.map((prop: any) => ({
          ...prop,
          likedAt: new Date(prop.likedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting liked properties:', error);
      return [];
    }
  }

  static async addLikedProperty(property: any): Promise<void> {
    try {
      const likedProperties = await this.getLikedProperties();
      
      // Check if property is already liked
      const isAlreadyLiked = likedProperties.some(p => p.id === property.id);
      if (isAlreadyLiked) {
        return; // Already liked, no need to add again
      }

      const likedProperty: LikedProperty = {
        id: property.id,
        title: property.title,
        subtitle: property.subtitle,
        price: property.price,
        priceNumeric: property.priceNumeric,
        image: property.image,
        badge: property.badge,
        type: property.type,
        university: property.university,
        location: property.location,
        likedAt: new Date(),
      };

      likedProperties.push(likedProperty);
      
      // Sort by most recently liked
      likedProperties.sort((a, b) => b.likedAt.getTime() - a.likedAt.getTime());
      
      await AsyncStorage.setItem(LIKED_PROPERTIES_KEY, JSON.stringify(likedProperties));
    } catch (error) {
      console.error('Error adding liked property:', error);
    }
  }

  static async removeLikedProperty(propertyId: string): Promise<void> {
    try {
      const likedProperties = await this.getLikedProperties();
      const filteredProperties = likedProperties.filter(p => p.id !== propertyId);
      await AsyncStorage.setItem(LIKED_PROPERTIES_KEY, JSON.stringify(filteredProperties));
    } catch (error) {
      console.error('Error removing liked property:', error);
    }
  }

  static async isPropertyLiked(propertyId: string): Promise<boolean> {
    try {
      const likedProperties = await this.getLikedProperties();
      return likedProperties.some(p => p.id === propertyId);
    } catch (error) {
      console.error('Error checking if property is liked:', error);
      return false;
    }
  }

  static async clearAllLikedProperties(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LIKED_PROPERTIES_KEY);
    } catch (error) {
      console.error('Error clearing liked properties:', error);
    }
  }
}