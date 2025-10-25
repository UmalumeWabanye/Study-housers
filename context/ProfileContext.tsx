/**
 * Profile Context for managing user profile data across the app
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type ProfileContextType = {
  profileImage: string | null;
  setProfileImage: (imageUri: string | null) => void;
  userName: string;
  setUserName: (name: string) => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

type ProfileProviderProps = {
  children: React.ReactNode;
};

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profileImage, setProfileImageState] = useState<string | null>(null);
  const [userName, setUserNameState] = useState<string>('John Doe');

  // Load profile data from AsyncStorage on mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const savedProfileImage = await AsyncStorage.getItem('profileImage');
        const savedUserName = await AsyncStorage.getItem('userName');
        
        if (savedProfileImage) {
          setProfileImageState(savedProfileImage);
        }
        if (savedUserName) {
          setUserNameState(savedUserName);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };

    loadProfileData();
  }, []);

  // Save profile image to AsyncStorage and update state
  const setProfileImage = async (imageUri: string | null) => {
    try {
      if (imageUri) {
        await AsyncStorage.setItem('profileImage', imageUri);
      } else {
        await AsyncStorage.removeItem('profileImage');
      }
      setProfileImageState(imageUri);
    } catch (error) {
      console.error('Error saving profile image:', error);
    }
  };

  // Save user name to AsyncStorage and update state
  const setUserName = async (name: string) => {
    try {
      await AsyncStorage.setItem('userName', name);
      setUserNameState(name);
    } catch (error) {
      console.error('Error saving user name:', error);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profileImage,
        setProfileImage,
        userName,
        setUserName,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};