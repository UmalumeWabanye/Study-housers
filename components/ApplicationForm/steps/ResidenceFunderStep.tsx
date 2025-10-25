import { ThemedText } from '@/components/themed-components';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useApplicationForm } from '../ApplicationFormContext';
import { CustomDropdown, CustomTextInput } from '../FormInputs';

interface Props {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const FUNDERS = [
  { label: 'NSFAS', value: 'NSFAS' },
  { label: 'Bursary', value: 'Bursary' },
  { label: 'Self-funded', value: 'Self-funded' },
  { label: 'Parent/Guardian', value: 'Parent/Guardian' },
  { label: 'Student Loan', value: 'Student Loan' },
  { label: 'Company Sponsorship', value: 'Company Sponsorship' },
  { label: 'Other', value: 'Other' },
];

const APPLICATION_YEARS = [
  { label: '2025', value: '2025' },
  { label: '2026', value: '2026' },
  { label: '2027', value: '2027' },
];

const ResidenceFunderStep: React.FC<Props> = ({ onNext }) => {
  const { formData, updateFormData, propertyTitle } = useApplicationForm();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="title" style={styles.stepTitle}>
          Residence & Funder Information
        </ThemedText>
        <ThemedText variant="secondary" style={styles.stepDescription}>
          Specify your accommodation preference and funding details.
        </ThemedText>
      </View>

      <View style={styles.form}>
        <CustomTextInput
          label="Residence"
          value={propertyTitle}
          onChangeText={() => {}} // Read-only, prefilled from property
          placeholder="Residence will be pre-filled"
          required
        />

        <CustomDropdown
          label="Funder"
          value={formData.funder}
          onSelect={(value) => updateFormData({ funder: value })}
          options={FUNDERS}
          placeholder="Select your funding source"
          required
        />

        <CustomDropdown
          label="Application Year"
          value={formData.applicationYear}
          onSelect={(value) => updateFormData({ applicationYear: value })}
          options={APPLICATION_YEARS}
          placeholder="Select application year"
          required
        />
      </View>
    </View>
  );
};

export default ResidenceFunderStep;

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