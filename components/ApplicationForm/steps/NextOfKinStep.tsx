import { ThemedText } from '@/components/themed-components';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useApplicationForm } from '../ApplicationFormContext';
import { CustomTextInput, FileUpload } from '../FormInputs';

interface Props {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const NextOfKinStep: React.FC<Props> = ({ onNext }) => {
  const { formData, updateFormData } = useApplicationForm();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="title" style={styles.stepTitle}>
          Next of Kin Information
        </ThemedText>
        <ThemedText variant="secondary" style={styles.stepDescription}>
          Provide details of your emergency contact and required documents.
        </ThemedText>
      </View>

      <View style={styles.form}>
        <CustomTextInput
          label="Next of Kin Name"
          value={formData.nextOfKinName}
          onChangeText={(text) => updateFormData({ nextOfKinName: text })}
          placeholder="Full name of emergency contact"
          required
          maxLength={100}
        />

        <CustomTextInput
          label="Next of Kin Contact Number"
          value={formData.nextOfKinContact}
          onChangeText={(text) => updateFormData({ nextOfKinContact: text.replace(/\D/g, '') })}
          placeholder="Phone number"
          keyboardType="phone-pad"
          required
          maxLength={15}
        />

        <FileUpload
          label="Next of Kin ID Upload"
          value={formData.nextOfKinIdFile}
          onFileSelect={(uri) => updateFormData({ nextOfKinIdFile: uri })}
          required
          acceptedFormats={['PDF', 'JPG', 'PNG']}
          maxSize={5}
        />

        <FileUpload
          label="Next of Kin Proof of Address"
          value={formData.nextOfKinAddressFile}
          onFileSelect={(uri) => updateFormData({ nextOfKinAddressFile: uri })}
          required
          acceptedFormats={['PDF', 'JPG', 'PNG']}
          maxSize={5}
        />
      </View>
    </View>
  );
};

export default NextOfKinStep;

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