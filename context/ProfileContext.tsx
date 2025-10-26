/**
 * Profile Context for managing user profile data across the app
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';
  nationality: string;
  idNumber: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  university: string;
  studentNumber: string;
  courseOfStudy: string;
  yearOfStudy: string;
  graduationYear: string;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
    profileVisible: boolean;
  };
}

const DEFAULT_PERSONAL_INFO: PersonalInfo = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  nationality: 'South African',
  idNumber: '',
  address: {
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'South Africa'
  },
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  },
  university: '',
  studentNumber: '',
  courseOfStudy: '',
  yearOfStudy: '',
  graduationYear: '',
  preferences: {
    emailNotifications: true,
    smsNotifications: true,
    marketingEmails: false,
    profileVisible: true
  }
};

type ProfileContextType = {
  profileImage: string | null;
  setProfileImage: (imageUri: string | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  personalInfo: PersonalInfo;
  setPersonalInfo: (info: PersonalInfo) => void;
  updatePersonalInfo: (updates: Partial<PersonalInfo>) => void;
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
  const [personalInfo, setPersonalInfoState] = useState<PersonalInfo>(DEFAULT_PERSONAL_INFO);

  // Load profile data from AsyncStorage on mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const savedProfileImage = await AsyncStorage.getItem('profileImage');
        const savedUserName = await AsyncStorage.getItem('userName');
        const savedPersonalInfo = await AsyncStorage.getItem('personalInfo');
        
        if (savedProfileImage) {
          setProfileImageState(savedProfileImage);
        }
        if (savedUserName) {
          setUserNameState(savedUserName);
          // Also update personalInfo firstName/lastName if they exist
          if (savedPersonalInfo) {
            const parsedInfo = JSON.parse(savedPersonalInfo);
            setPersonalInfoState(parsedInfo);
          } else {
            // Initialize with name from userName
            const [firstName = '', lastName = ''] = savedUserName.split(' ');
            setPersonalInfoState(prev => ({
              ...prev,
              firstName,
              lastName
            }));
          }
        } else if (savedPersonalInfo) {
          const parsedInfo = JSON.parse(savedPersonalInfo);
          setPersonalInfoState(parsedInfo);
          // Update userName from personalInfo if available
          const fullName = `${parsedInfo.firstName} ${parsedInfo.lastName}`.trim();
          if (fullName) {
            setUserNameState(fullName);
          }
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
      
      // Also update firstName/lastName in personalInfo
      const [firstName = '', lastName = ''] = name.split(' ');
      setPersonalInfoState(prev => ({
        ...prev,
        firstName,
        lastName
      }));
      
      // Save updated personalInfo to storage
      const updatedInfo = {
        ...personalInfo,
        firstName,
        lastName
      };
      await AsyncStorage.setItem('personalInfo', JSON.stringify(updatedInfo));
    } catch (error) {
      console.error('Error saving user name:', error);
    }
  };

  // Save personal info to AsyncStorage and update state
  const setPersonalInfo = async (info: PersonalInfo) => {
    try {
      await AsyncStorage.setItem('personalInfo', JSON.stringify(info));
      setPersonalInfoState(info);
      
      // Also update userName if firstName/lastName changed
      const fullName = `${info.firstName} ${info.lastName}`.trim();
      if (fullName && fullName !== userName) {
        await AsyncStorage.setItem('userName', fullName);
        setUserNameState(fullName);
      }
    } catch (error) {
      console.error('Error saving personal info:', error);
    }
  };

  // Update partial personal info
  const updatePersonalInfo = async (updates: Partial<PersonalInfo>) => {
    try {
      const updatedInfo = { ...personalInfo, ...updates };
      
      // Handle nested objects properly
      if (updates.address) {
        updatedInfo.address = { ...personalInfo.address, ...updates.address };
      }
      if (updates.emergencyContact) {
        updatedInfo.emergencyContact = { ...personalInfo.emergencyContact, ...updates.emergencyContact };
      }
      if (updates.preferences) {
        updatedInfo.preferences = { ...personalInfo.preferences, ...updates.preferences };
      }
      
      await setPersonalInfo(updatedInfo);
    } catch (error) {
      console.error('Error updating personal info:', error);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profileImage,
        setProfileImage,
        userName,
        setUserName,
        personalInfo,
        setPersonalInfo,
        updatePersonalInfo,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};