import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility functions for managing user data persistence
 */
export class UserDataManager {
  // Storage keys
  private static readonly PROFILE_IMAGE_KEY = 'profileImage';
  private static readonly USER_NAME_KEY = 'userName';
  private static readonly PERSONAL_INFO_KEY = 'personalInfo';

  /**
   * Get all stored user data for debugging/testing
   */
  static async getAllUserData() {
    try {
      const [profileImage, userName, personalInfo] = await Promise.all([
        AsyncStorage.getItem(this.PROFILE_IMAGE_KEY),
        AsyncStorage.getItem(this.USER_NAME_KEY),
        AsyncStorage.getItem(this.PERSONAL_INFO_KEY),
      ]);

      return {
        profileImage,
        userName,
        personalInfo: personalInfo ? JSON.parse(personalInfo) : null,
      };
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Clear all user data (for testing or logout)
   */
  static async clearAllUserData() {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.PROFILE_IMAGE_KEY),
        AsyncStorage.removeItem(this.USER_NAME_KEY),
        AsyncStorage.removeItem(this.PERSONAL_INFO_KEY),
      ]);
      console.log('All user data cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  }

  /**
   * Export user data as JSON string (for backup/transfer)
   */
  static async exportUserData() {
    try {
      const userData = await this.getAllUserData();
      return JSON.stringify(userData, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      return null;
    }
  }

  /**
   * Import user data from JSON string (for restore)
   */
  static async importUserData(jsonData: string) {
    try {
      const userData = JSON.parse(jsonData);
      
      const operations = [];
      if (userData.profileImage) {
        operations.push(AsyncStorage.setItem(this.PROFILE_IMAGE_KEY, userData.profileImage));
      }
      if (userData.userName) {
        operations.push(AsyncStorage.setItem(this.USER_NAME_KEY, userData.userName));
      }
      if (userData.personalInfo) {
        operations.push(AsyncStorage.setItem(this.PERSONAL_INFO_KEY, JSON.stringify(userData.personalInfo)));
      }

      await Promise.all(operations);
      console.log('User data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  }

  /**
   * Validate personal info data structure
   */
  static validatePersonalInfo(personalInfo: any): boolean {
    if (!personalInfo || typeof personalInfo !== 'object') {
      return false;
    }

    // Check required nested objects
    const requiredObjects = ['address', 'emergencyContact', 'preferences'];
    for (const obj of requiredObjects) {
      if (!personalInfo[obj] || typeof personalInfo[obj] !== 'object') {
        return false;
      }
    }

    return true;
  }

  /**
   * Get storage usage statistics
   */
  static async getStorageStats() {
    try {
      const userData = await this.getAllUserData();
      const dataSize = JSON.stringify(userData).length;
      
      return {
        profileImageExists: !!userData?.profileImage,
        userNameExists: !!userData?.userName,
        personalInfoExists: !!userData?.personalInfo,
        totalDataSize: `${(dataSize / 1024).toFixed(2)} KB`,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return null;
    }
  }
}