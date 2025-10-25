import { ThemedText } from '@/components/themed-components';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useApplicationForm } from '../ApplicationFormContext';
import { CustomTextInput } from '../FormInputs';

interface Props {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const PersonalDetailsStep: React.FC<Props> = ({ onNext }) => {
  const { formData, updateFormData, validateStep } = useApplicationForm();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.surname.trim()) {
      newErrors.surname = 'Surname is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = 'ID number is required';
    } else if (!isValidIdNumber(formData.idNumber)) {
      newErrors.idNumber = 'Please enter a valid ID number';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onNext();
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidIdNumber = (idNumber: string): boolean => {
    // Basic South African ID validation (13 digits)
    return /^\d{13}$/.test(idNumber);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="title" style={styles.stepTitle}>
          Personal Details
        </ThemedText>
        <ThemedText variant="secondary" style={styles.stepDescription}>
          Please provide your basic personal information. All fields marked with * are required.
        </ThemedText>
      </View>

      <View style={styles.form}>
        <CustomTextInput
          label="First Name"
          value={formData.firstName}
          onChangeText={(text) => updateFormData({ firstName: text })}
          placeholder="Enter your first name"
          required
          error={errors.firstName}
          maxLength={50}
        />

        <CustomTextInput
          label="Surname"
          value={formData.surname}
          onChangeText={(text) => updateFormData({ surname: text })}
          placeholder="Enter your surname"
          required
          error={errors.surname}
          maxLength={50}
        />

        <CustomTextInput
          label="Email Address"
          value={formData.email}
          onChangeText={(text) => updateFormData({ email: text.toLowerCase() })}
          placeholder="Enter your email address"
          keyboardType="email-address"
          required
          error={errors.email}
          maxLength={100}
        />

        <CustomTextInput
          label="ID Number"
          value={formData.idNumber}
          onChangeText={(text) => updateFormData({ idNumber: text.replace(/\D/g, '') })}
          placeholder="Enter your 13-digit ID number"
          keyboardType="numeric"
          required
          error={errors.idNumber}
          maxLength={13}
        />

        <CustomTextInput
          label="Student Number"
          value={formData.studentNumber}
          onChangeText={(text) => updateFormData({ studentNumber: text })}
          placeholder="Enter your student number (optional)"
          maxLength={20}
        />
      </View>
    </View>
  );
};

export default PersonalDetailsStep;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
});