import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface FormData {
  // Personal Details
  firstName: string;
  surname: string;
  email: string;
  idNumber: string;
  studentNumber: string;

  // Study Details
  qualification: string;
  academicYear: string;
  institution: string;
  institutionOther: string;
  campus: string;
  campusOther: string;

  // Residence & Funder
  residence: string;
  funder: string;
  applicationYear: string;

  // Next of Kin
  nextOfKinName: string;
  nextOfKinContact: string;
  nextOfKinIdFile: string | null;
  nextOfKinAddressFile: string | null;

  // Documents
  idDocumentFile: string | null;
  proofOfResidenceFile: string | null;
  academicResultsFile: string | null;
  proofOfRegistrationFile: string | null;
  proofOfFundingFile: string | null;
}

interface ApplicationFormContextType {
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isSubmitted: boolean;
  setIsSubmitted: (submitted: boolean) => void;
  propertyId: string;
  propertyTitle: string;
  validateStep: (step: number) => boolean;
  resetForm: () => void;
  saveProgress: () => Promise<void>;
  loadProgress: () => Promise<void>;
  submitApplication: () => Promise<any>;
}

const initialFormData: FormData = {
  firstName: '',
  surname: '',
  email: '',
  idNumber: '',
  studentNumber: '',
  qualification: '',
  academicYear: '',
  institution: '',
  institutionOther: '',
  campus: '',
  campusOther: '',
  residence: '',
  funder: '',
  applicationYear: '',
  nextOfKinName: '',
  nextOfKinContact: '',
  nextOfKinIdFile: null,
  nextOfKinAddressFile: null,
  idDocumentFile: null,
  proofOfResidenceFile: null,
  academicResultsFile: null,
  proofOfRegistrationFile: null,
  proofOfFundingFile: null,
};

const ApplicationFormContext = createContext<ApplicationFormContextType | undefined>(undefined);

interface ApplicationFormProviderProps {
  children: React.ReactNode;
  propertyId: string;
  propertyTitle: string;
}

export const ApplicationFormProvider: React.FC<ApplicationFormProviderProps> = ({
  children,
  propertyId,
  propertyTitle,
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const storageKey = `application_form_${propertyId}`;

  const updateFormData = useCallback((data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 1: // Personal Details
        return !!(
          formData.firstName &&
          formData.surname &&
          formData.email &&
          formData.idNumber &&
          isValidEmail(formData.email)
        );
      case 2: // Study Details
        return !!(
          formData.qualification &&
          formData.academicYear &&
          formData.institution &&
          (formData.institution !== 'Other' || formData.institutionOther) &&
          formData.campus &&
          (formData.campus !== 'Other' || formData.campusOther)
        );
      case 3: // Residence & Funder
        return !!(
          formData.residence &&
          formData.funder &&
          formData.applicationYear
        );
      case 4: // Next of Kin
        return !!(
          formData.nextOfKinName &&
          formData.nextOfKinContact &&
          formData.nextOfKinIdFile &&
          formData.nextOfKinAddressFile
        );
      case 5: // Documents
        return !!(
          formData.idDocumentFile &&
          formData.proofOfResidenceFile &&
          formData.academicResultsFile &&
          formData.proofOfRegistrationFile &&
          formData.proofOfFundingFile
        );
      case 6: // Review & Submit
        return true; // Always valid as it's just review
      default:
        return false;
    }
  }, [formData]);

  const submitApplication = useCallback(async () => {
    try {
      // Generate application reference
      const timestamp = Date.now();
      const reference = `APP-${timestamp.toString().slice(-8)}`;
      
      // Create application object
      const application = {
        id: `app_${timestamp}`,
        propertyId,
        propertyTitle,
        propertyImage: require('../../assets/images/icon.png'), // You can make this dynamic
        propertyLocation: 'Location TBD', // You can pass this as a prop
        price: 'Price TBD', // You can pass this as a prop
        status: 'pending' as const,
        submittedAt: new Date().toISOString(),
        applicationReference: reference,
        formData,
      };

      // Save to applications list
      const existingApplications = await AsyncStorage.getItem('user_applications');
      const applications = existingApplications ? JSON.parse(existingApplications) : [];
      applications.push(application);
      await AsyncStorage.setItem('user_applications', JSON.stringify(applications));

      // Clear form data
      await AsyncStorage.removeItem(storageKey);
      
      return application;
    } catch (error) {
      console.error('Failed to submit application:', error);
      throw error;
    }
  }, [propertyId, propertyTitle, formData, storageKey]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setIsSubmitted(false);
    AsyncStorage.removeItem(storageKey);
  }, [storageKey]);

  const saveProgress = useCallback(async () => {
    try {
      const dataToSave = {
        formData,
        currentStep,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(storageKey, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Failed to save form progress:', error);
    }
  }, [formData, currentStep, storageKey]);

  const loadProgress = useCallback(async () => {
    try {
      const savedData = await AsyncStorage.getItem(storageKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Only load if saved within last 24 hours
        if (Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000) {
          setFormData(parsedData.formData);
          setCurrentStep(parsedData.currentStep);
        }
      }
    } catch (error) {
      console.error('Failed to load form progress:', error);
    }
  }, [storageKey]);

  // Auto-save progress when form data changes
  useEffect(() => {
    saveProgress();
  }, [formData, currentStep, saveProgress]);

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const value: ApplicationFormContextType = {
    formData,
    updateFormData,
    currentStep,
    setCurrentStep,
    isSubmitted,
    setIsSubmitted,
    propertyId,
    propertyTitle,
    validateStep,
    resetForm,
    saveProgress,
    loadProgress,
    submitApplication,
  };

  return (
    <ApplicationFormContext.Provider value={value}>
      {children}
    </ApplicationFormContext.Provider>
  );
};

export const useApplicationForm = (): ApplicationFormContextType => {
  const context = useContext(ApplicationFormContext);
  if (context === undefined) {
    throw new Error('useApplicationForm must be used within an ApplicationFormProvider');
  }
  return context;
};

// Helper functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default ApplicationFormContext;