import { ThemedText } from '@/components/themed-components';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useApplicationForm } from '../ApplicationFormContext';
import { CustomDropdown, CustomTextInput } from '../FormInputs';

interface Props {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const INSTITUTIONS = [
  { label: 'University of Cape Town', value: 'UCT' },
  { label: 'University of the Witwatersrand', value: 'Wits' },
  { label: 'University of Stellenbosch', value: 'Stellenbosch' },
  { label: 'University of Pretoria', value: 'UP' },
  { label: 'Rhodes University', value: 'Rhodes' },
  { label: 'University of KwaZulu-Natal', value: 'UKZN' },
  { label: 'University of the Western Cape', value: 'UWC' },
  { label: 'North-West University', value: 'NWU' },
  { label: 'University of Johannesburg', value: 'UJ' },
  { label: 'Cape Peninsula University of Technology', value: 'CPUT' },
  { label: 'Other', value: 'Other' },
];

const CAMPUSES = {
  UCT: [
    { label: 'Upper Campus', value: 'Upper Campus' },
    { label: 'Lower Campus', value: 'Lower Campus' },
    { label: 'Medical Campus', value: 'Medical Campus' },
  ],
  Wits: [
    { label: 'East Campus', value: 'East Campus' },
    { label: 'West Campus', value: 'West Campus' },
    { label: 'Education Campus', value: 'Education Campus' },
    { label: 'Medical School', value: 'Medical School' },
  ],
  Stellenbosch: [
    { label: 'Main Campus', value: 'Main Campus' },
    { label: 'Tygerberg Campus', value: 'Tygerberg Campus' },
    { label: 'Bellville Park Campus', value: 'Bellville Park Campus' },
  ],
  UP: [
    { label: 'Hatfield Campus', value: 'Hatfield Campus' },
    { label: 'Groenkloof Campus', value: 'Groenkloof Campus' },
    { label: 'Onderstepoort Campus', value: 'Onderstepoort Campus' },
    { label: 'Prinshof Campus', value: 'Prinshof Campus' },
  ],
  Other: [
    { label: 'Other', value: 'Other' },
  ],
};

const ACADEMIC_YEARS = [
  { label: '1st Year', value: '1' },
  { label: '2nd Year', value: '2' },
  { label: '3rd Year', value: '3' },
  { label: '4th Year', value: '4' },
  { label: '5th Year', value: '5' },
  { label: 'Honours', value: 'Honours' },
  { label: 'Masters', value: 'Masters' },
  { label: 'PhD', value: 'PhD' },
  { label: 'Postgraduate Diploma', value: 'Postgrad Diploma' },
];

const StudyDetailsStep: React.FC<Props> = ({ onNext }) => {
  const { formData, updateFormData } = useApplicationForm();
  const [errors] = useState<Record<string, string>>({});

  const handleInstitutionChange = (value: string) => {
    updateFormData({ 
      institution: value, 
      campus: '', // Reset campus when institution changes
      campusOther: '' // Reset custom campus
    });
  };

  const availableCampuses = formData.institution && CAMPUSES[formData.institution as keyof typeof CAMPUSES] 
    ? CAMPUSES[formData.institution as keyof typeof CAMPUSES]
    : [{ label: 'Other', value: 'Other' }];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="title" style={styles.stepTitle}>
          Study Details
        </ThemedText>
        <ThemedText variant="secondary" style={styles.stepDescription}>
          Tell us about your academic background and current studies.
        </ThemedText>
      </View>

      <View style={styles.form}>
        <CustomTextInput
          label="Qualification"
          value={formData.qualification}
          onChangeText={(text) => updateFormData({ qualification: text })}
          placeholder="e.g., Bachelor of Commerce, BSc Computer Science"
          required
          error={errors.qualification}
          maxLength={100}
        />

        <CustomDropdown
          label="Academic Year"
          value={formData.academicYear}
          onSelect={(value) => updateFormData({ academicYear: value })}
          options={ACADEMIC_YEARS}
          placeholder="Select your current academic year"
          required
          error={errors.academicYear}
        />

        <CustomDropdown
          label="Institution"
          value={formData.institution}
          onSelect={handleInstitutionChange}
          options={INSTITUTIONS}
          placeholder="Select your institution"
          required
          error={errors.institution}
        />

        {formData.institution === 'Other' && (
          <CustomTextInput
            label="Institution Name"
            value={formData.institutionOther}
            onChangeText={(text) => updateFormData({ institutionOther: text })}
            placeholder="Enter your institution name"
            required
            error={errors.institutionOther}
            maxLength={100}
          />
        )}

        <CustomDropdown
          label="Campus"
          value={formData.campus}
          onSelect={(value) => updateFormData({ campus: value })}
          options={availableCampuses}
          placeholder="Select your campus"
          required
          error={errors.campus}
        />

        {formData.campus === 'Other' && (
          <CustomTextInput
            label="Campus Name"
            value={formData.campusOther}
            onChangeText={(text) => updateFormData({ campusOther: text })}
            placeholder="Enter your campus name"
            required
            error={errors.campusOther}
            maxLength={100}
          />
        )}
      </View>
    </View>
  );
};

export default StudyDetailsStep;

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